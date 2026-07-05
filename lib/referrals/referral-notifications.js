import { prisma } from "../db";
import { renderEmailTemplate } from "../email/render-template";
import { sendRenderedEmailWithSmtpProvider } from "../email/send-template-email";
import { sendNotification } from "../notifications/send-notification";

const REWARD_TEMPLATE_SLUG = "referral-reward-earned";
const QUALIFIED_TEMPLATE_SLUG = "referral-friend-qualified";

function cleanString(value) {
  return String(value || "").trim();
}

function customerName(customer, fallback = "Customer") {
  const name = [customer?.firstName, customer?.lastName].filter(Boolean).join(" ").trim();
  return name || customer?.email || customer?.phone || fallback;
}

function safeErrorMessage(error, fallback) {
  return error?.code || error?.message || fallback;
}

async function safeSendNotification(payload, fallbackErrorCode) {
  try {
    return await sendNotification(payload);
  } catch (error) {
    return {
      sent: false,
      error: safeErrorMessage(error, fallbackErrorCode),
    };
  }
}

async function sendReferralEmail({ recipientEmail, variables }) {
  const email = cleanString(recipientEmail).toLowerCase();

  if (!email) {
    return { skipped: true, reason: "MISSING_RECIPIENT_EMAIL" };
  }

  try {
    const template = await prisma.emailTemplate.findUnique({
      where: { slug: REWARD_TEMPLATE_SLUG },
    });

    if (!template || !template.isActive) {
      return { skipped: true, reason: "EMAIL_TEMPLATE_MISSING_OR_INACTIVE" };
    }

    const rendered = renderEmailTemplate(template, variables);
    const log = await prisma.emailDeliveryLog.create({
      data: {
        template: { connect: { id: template.id } },
        recipientEmail: email,
        subject: rendered.subject,
        status: "PENDING",
      },
    });

    try {
      const result = await sendRenderedEmailWithSmtpProvider({
        to: email,
        subject: rendered.subject,
        html: rendered.htmlBody,
        text: rendered.textBody,
      });

      await prisma.emailDeliveryLog.update({
        where: { id: log.id },
        data: {
          status: "SENT",
          provider: result.providerName,
          providerMessageId: result.messageId,
          sentAt: new Date(),
        },
      });

      return { sent: true, logId: log.id };
    } catch (error) {
      await prisma.emailDeliveryLog.update({
        where: { id: log.id },
        data: {
          status: "FAILED",
          errorMessage: safeErrorMessage(error, "REFERRAL_REWARD_EMAIL_FAILED"),
        },
      });

      return { sent: false, logId: log.id, error: safeErrorMessage(error, "REFERRAL_REWARD_EMAIL_FAILED") };
    }
  } catch (error) {
    return { skipped: true, reason: safeErrorMessage(error, "REFERRAL_REWARD_EMAIL_FAILED") };
  }
}

export async function sendReferralRewardNotifications(payload = {}) {
  const referrer = payload.referrerCustomer;
  const referred = payload.referredCustomer;
  const variables = {
    customerName: customerName(referrer),
    rewardPoints: payload.rewardPoints || 0,
    referredCustomerName: customerName(referred, "Your friend"),
    orderNumber: cleanString(payload.orderNumber),
    referralCode: cleanString(payload.referralCode),
  };
  const customerId = cleanString(referrer?.id);
  const email = cleanString(referrer?.email);

  const results = [];

  results.push(await sendReferralEmail({ recipientEmail: email, variables }));

  if (customerId) {
    results.push(
      await safeSendNotification(
        {
          channel: "IN_APP",
          recipient: customerId,
          customerId,
          templateSlug: REWARD_TEMPLATE_SLUG,
          variables,
          actionUrl: "/account/referrals",
        },
        "REFERRAL_REWARD_IN_APP_FAILED",
      ),
    );
  }

  return { event: "REFERRAL_REWARD_EARNED", results };
}

export async function sendReferralQualificationNotifications(payload = {}) {
  const referred = payload.referredCustomer;
  const referrer = payload.referrerCustomer;
  const customerId = cleanString(referred?.id);

  if (!customerId) {
    return { skipped: true, reason: "MISSING_REFERRED_CUSTOMER" };
  }

  const result = await safeSendNotification(
    {
      channel: "IN_APP",
      recipient: customerId,
      customerId,
      templateSlug: QUALIFIED_TEMPLATE_SLUG,
      variables: {
        referrerName: customerName(referrer, "Your referrer"),
        orderNumber: cleanString(payload.orderNumber),
      },
      actionUrl: "/account/referrals",
    },
    "REFERRAL_QUALIFICATION_IN_APP_FAILED",
  );

  return { event: "REFERRAL_FRIEND_QUALIFIED", results: [result] };
}
