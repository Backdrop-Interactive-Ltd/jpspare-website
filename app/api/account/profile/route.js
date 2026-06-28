import { NextResponse } from "next/server";
import { getCustomerSession } from "../../../../lib/auth/customer-session";
import { getCustomerProfileCompletion } from "../../../../lib/auth/profile-completion";
import { prisma } from "../../../../lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function jsonError(code, message, status) {
  return NextResponse.json({ ok: false, code, message }, { status });
}

function cleanText(value) {
  return String(value || "").trim();
}

function normalizeEmail(value) {
  const email = cleanText(value).toLowerCase();
  return email || null;
}

function normalizePhone(value) {
  const raw = cleanText(value);
  const compact = raw.replace(/[\s\-().]/g, "");

  if (!compact) return "";
  if (compact.startsWith("+")) return `+${compact.slice(1).replace(/\D/g, "")}`;
  if (compact.startsWith("00")) return `+${compact.slice(2).replace(/\D/g, "")}`;
  if (compact.startsWith("880")) return `+${compact.replace(/\D/g, "")}`;
  if (compact.startsWith("0")) return `+880${compact.slice(1).replace(/\D/g, "")}`;

  return compact.replace(/\D/g, "");
}

function isValidEmail(email) {
  return !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  const digits = phone.replace(/^\+/, "");
  return /^\+?\d{7,15}$/.test(phone) && digits.length >= 7 && digits.length <= 15;
}

function serializeCustomer(customer) {
  return {
    id: customer.id,
    email: customer.email,
    phone: customer.phone,
    firstName: customer.firstName,
    lastName: customer.lastName,
  };
}

export async function PATCH(request) {
  try {
    const session = await getCustomerSession();

    if (!session?.customer) {
      return jsonError("LOGIN_REQUIRED", "Please login with OTP before updating your profile.", 401);
    }

    const body = await request.json().catch(() => ({}));
    const currentCustomer = session.customer;
    const firstName = Object.hasOwn(body, "firstName") ? cleanText(body.firstName) || null : currentCustomer.firstName;
    const lastName = Object.hasOwn(body, "lastName") ? cleanText(body.lastName) || null : currentCustomer.lastName;
    const email = Object.hasOwn(body, "email") ? normalizeEmail(body.email) : currentCustomer.email;
    const phone = Object.hasOwn(body, "phone") ? normalizePhone(body.phone) : currentCustomer.phone || "";
    const hasName = Boolean(cleanText(firstName) || cleanText(lastName));

    if (!hasName) {
      return jsonError("INVALID_PROFILE", "Please provide your first name or last name.", 400);
    }

    if (!phone) {
      return jsonError("PHONE_REQUIRED", "Phone number is required.", 400);
    }

    if (!isValidPhone(phone) || !isValidEmail(email)) {
      return jsonError("INVALID_PROFILE", "Please provide a valid phone number and email address.", 400);
    }

    const conflict = await prisma.customer.findFirst({
      where: {
        id: { not: currentCustomer.id },
        OR: [{ phone }, ...(email ? [{ email }] : [])],
      },
      select: { id: true },
    });

    if (conflict) {
      return jsonError("PROFILE_CONFLICT", "This phone or email is already linked to another account.", 409);
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id: currentCustomer.id },
      data: {
        firstName,
        lastName,
        email,
        phone,
      },
      include: {
        addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] },
      },
    });
    const profileCompletion = getCustomerProfileCompletion(updatedCustomer);

    return NextResponse.json({
      ok: true,
      customer: serializeCustomer(updatedCustomer),
      profileComplete: profileCompletion.isComplete,
      profileCompletion,
    });
  } catch (error) {
    if (error?.code === "P2002") {
      return jsonError("PROFILE_CONFLICT", "This phone or email is already linked to another account.", 409);
    }

    console.error("Profile update failed", error);
    return jsonError("PROFILE_UPDATE_FAILED", "We could not update your profile right now.", 500);
  }
}
