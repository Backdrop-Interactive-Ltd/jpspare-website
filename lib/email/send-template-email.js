import nodemailer from "nodemailer";
import { prisma } from "../db.js";
import { decryptSecretJson } from "../security/secret-encryption.js";

const BRAND_NAME = "JPSPARE";
const DEFAULT_TIMEOUT_MS = 10000;

function createEmailError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function getTimeoutMs(provider) {
  const timeoutMs = Number(provider?.timeoutMs || DEFAULT_TIMEOUT_MS);
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1000) return DEFAULT_TIMEOUT_MS;
  return timeoutMs;
}

function readSecretJson(provider) {
  if (!provider?.secretJsonEncrypted) return {};
  return decryptSecretJson(provider.secretJsonEncrypted);
}

function validateSmtpProvider(provider) {
  if (!provider) {
    throw createEmailError("SMTP_PROVIDER_NOT_CONFIGURED", "SMTP provider is not configured.");
  }

  if (!provider.isActive) {
    throw createEmailError("SMTP_PROVIDER_INACTIVE", "SMTP provider is inactive.");
  }

  if (provider.channel !== "EMAIL" || provider.providerType !== "SMTP") {
    throw createEmailError("SMTP_PROVIDER_UNSUPPORTED", "Configured provider is not an SMTP email provider.");
  }

  const config = provider.configJson || {};
  const secrets = readSecretJson(provider);
  const port = Number(config.port);

  if (!config.host || !Number.isInteger(port) || port <= 0 || !provider.fromEmail || !secrets.username || !secrets.password) {
    throw createEmailError("SMTP_PROVIDER_INVALID", "SMTP provider configuration is incomplete.");
  }

  return { config, secrets, port };
}

export async function getActiveSmtpEmailProvider() {
  const provider = await prisma.otpProvider.findFirst({
    where: {
      channel: "EMAIL",
      providerType: "SMTP",
      isActive: true,
    },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return provider;
}

export async function sendRenderedEmailWithSmtpProvider({ to, subject, html, text }) {
  const provider = await getActiveSmtpEmailProvider();
  const { config, secrets, port } = validateSmtpProvider(provider);
  const transporter = nodemailer.createTransport({
    host: config.host,
    port,
    secure: Boolean(config.secure),
    auth: {
      user: secrets.username,
      pass: secrets.password,
    },
    connectionTimeout: getTimeoutMs(provider),
    greetingTimeout: getTimeoutMs(provider),
    socketTimeout: getTimeoutMs(provider),
  });
  const fromName = provider.fromName || BRAND_NAME;

  const info = await transporter.sendMail({
    from: `${fromName} <${provider.fromEmail}>`,
    to,
    subject,
    html,
    ...(text ? { text } : {}),
  });

  return {
    ok: true,
    providerId: provider.id,
    providerName: provider.name,
    messageId: info.messageId || null,
  };
}
