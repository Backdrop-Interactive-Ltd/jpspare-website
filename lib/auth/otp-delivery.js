import { prisma } from "../db.js";
import { decryptSecretJson } from "../security/secret-encryption.js";
import nodemailer from "nodemailer";

const BRAND_NAME = "JPSPARE";
const OTP_LOGIN_PURPOSE = "OTP_LOGIN";
const DEFAULT_TIMEOUT_MS = 10000;
const DEFAULT_SMS_MESSAGE = "Your JPSPARE OTP is {{otp}}. It will expire in 5 minutes.";
const DEFAULT_EMAIL_SUBJECT = "Your JPSPARE login OTP";
const DEFAULT_EMAIL_MESSAGE = "Your JPSPARE OTP is {{otp}}. It will expire in 5 minutes.";

function createOtpError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function normalizeChannel(channel) {
  const normalized = String(channel || "").trim().toUpperCase();
  if (normalized === "PHONE" || normalized === "EMAIL") return normalized;
  throw createOtpError("OTP_CHANNEL_INVALID", "OTP channel must be PHONE or EMAIL.");
}

function safeString(value) {
  if (value === undefined || value === null) return "";
  return String(value);
}

function createTemplateVariables({ channel, otp, identifier, provider, subject, message, secrets = {} }) {
  const normalizedChannel = normalizeChannel(channel);

  return {
    ...secrets,
    otp: safeString(otp),
    identifier: safeString(identifier),
    phone: normalizedChannel === "PHONE" ? safeString(identifier) : "",
    email: normalizedChannel === "EMAIL" ? safeString(identifier) : "",
    message: safeString(message),
    subject: safeString(subject),
    senderId: safeString(provider?.senderId),
    fromEmail: safeString(provider?.fromEmail),
    fromName: safeString(provider?.fromName),
    brandName: BRAND_NAME,
  };
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

function appendQueryParams(url, queryValue) {
  if (!queryValue || typeof queryValue !== "object" || Array.isArray(queryValue)) return url;

  for (const [key, value] of Object.entries(queryValue)) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== undefined && item !== null && item !== "") url.searchParams.append(key, safeString(item));
      }
    } else {
      url.searchParams.set(key, safeString(value));
    }
  }

  return url;
}

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export async function getActiveOtpProvider(channel) {
  const normalizedChannel = normalizeChannel(channel);
  const providers = await prisma.otpProvider.findMany({
    where: {
      channel: normalizedChannel,
      isActive: true,
    },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  const provider = providers[0];
  if (!provider) {
    throw createOtpError("OTP_PROVIDER_NOT_CONFIGURED", "OTP provider not configured.");
  }

  return provider;
}

export function renderTemplateString(template, variables) {
  return safeString(template).replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => safeString(variables?.[key]));
}

export function renderTemplateValue(value, variables) {
  if (typeof value === "string") return renderTemplateString(value, variables);
  if (Array.isArray(value)) return value.map((item) => renderTemplateValue(item, variables));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, renderTemplateValue(item, variables)]));
  }
  return value;
}

export async function renderOtpTemplate({ channel, otp, identifier, provider }) {
  const normalizedChannel = normalizeChannel(channel);
  const template = await prisma.otpTemplate.findFirst({
    where: {
      channel: normalizedChannel,
      purpose: OTP_LOGIN_PURPOSE,
      isActive: true,
    },
    orderBy: { updatedAt: "desc" },
  });
  const fallbackSubject = normalizedChannel === "EMAIL" ? DEFAULT_EMAIL_SUBJECT : null;
  const fallbackMessage = normalizedChannel === "PHONE" ? DEFAULT_SMS_MESSAGE : DEFAULT_EMAIL_MESSAGE;
  const subjectTemplate = template?.subject || fallbackSubject;
  const messageTemplate = template?.message || fallbackMessage;
  const variables = createTemplateVariables({
    channel: normalizedChannel,
    otp,
    identifier,
    provider,
    subject: subjectTemplate,
    message: messageTemplate,
  });
  const subject = subjectTemplate ? renderTemplateString(subjectTemplate, variables) : null;
  const message = renderTemplateString(messageTemplate, {
    ...variables,
    subject: subject || "",
  });

  return { subject, message };
}

export async function sendSmsOtp({ provider, identifier, otp, message }) {
  if (!provider || provider.channel !== "PHONE" || provider.providerType !== "GENERIC_HTTP") {
    throw createOtpError("OTP_PROVIDER_TYPE_UNSUPPORTED", "OTP SMS provider type is unsupported.");
  }

  if (!provider.baseUrl) {
    throw createOtpError("OTP_SMS_PROVIDER_INVALID", "OTP SMS provider URL is missing.");
  }

  const method = String(provider.method || "POST").toUpperCase();
  const config = provider.configJson || {};
  const secrets = readSecretJson(provider);
  const timeoutMs = getTimeoutMs(provider);
  const variables = createTemplateVariables({
    channel: "PHONE",
    otp,
    identifier,
    provider,
    message,
    secrets,
  });
  const headers = renderTemplateValue(config.headers || {}, variables);
  const bodyTemplate = renderTemplateValue(config.bodyTemplate || {}, variables);
  const queryTemplate = renderTemplateValue(config.queryTemplate || {}, variables);
  const url = appendQueryParams(new URL(provider.baseUrl), queryTemplate);
  const options = {
    method,
    headers,
  };

  if (method !== "GET") {
    options.headers = {
      "Content-Type": "application/json",
      ...headers,
    };
    options.body = JSON.stringify(bodyTemplate);
  }

  const response = await fetchWithTimeout(url, options, timeoutMs).catch((error) => {
    if (error?.name === "AbortError") {
      throw createOtpError("OTP_SMS_DELIVERY_FAILED", "OTP SMS delivery timed out.");
    }
    throw createOtpError("OTP_SMS_DELIVERY_FAILED", "OTP SMS delivery failed.");
  });

  if (!response.ok) {
    throw createOtpError("OTP_SMS_DELIVERY_FAILED", "OTP SMS delivery failed.");
  }

  return {
    ok: true,
    channel: "PHONE",
    providerId: provider.id,
    providerName: provider.name,
    statusCode: response.status,
  };
}

export async function sendEmailOtp({ provider, identifier, otp, subject, message }) {
  if (!provider || provider.channel !== "EMAIL" || provider.providerType !== "SMTP") {
    throw createOtpError("OTP_PROVIDER_TYPE_UNSUPPORTED", "OTP email provider type is unsupported.");
  }

  const config = provider.configJson || {};
  const secrets = readSecretJson(provider);
  const port = Number(config.port);
  const fromEmail = provider.fromEmail;

  if (!config.host || !Number.isInteger(port) || port <= 0 || !fromEmail || !secrets.username || !secrets.password) {
    throw createOtpError("OTP_EMAIL_PROVIDER_INVALID", "OTP email provider SMTP config is missing.");
  }

  const emailSubject = renderTemplateString(subject || DEFAULT_EMAIL_SUBJECT, {
    otp,
    identifier,
    email: identifier,
    brandName: BRAND_NAME,
  });
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

  await transporter.sendMail({
    from: `${fromName} <${fromEmail}>`,
    to: identifier,
    subject: emailSubject,
    text: message,
  });

  return {
    ok: true,
    channel: "EMAIL",
    providerId: provider.id,
    providerName: provider.name,
  };
}

export async function sendOtp({ channel, identifier, otp }) {
  const normalizedChannel = normalizeChannel(channel);
  const provider = await getActiveOtpProvider(normalizedChannel);
  const template = await renderOtpTemplate({
    channel: normalizedChannel,
    otp,
    identifier,
    provider,
  });

  if (normalizedChannel === "PHONE" && provider.providerType === "GENERIC_HTTP") {
    return sendSmsOtp({ provider, identifier, otp, message: template.message });
  }

  if (normalizedChannel === "EMAIL" && provider.providerType === "SMTP") {
    return sendEmailOtp({ provider, identifier, otp, subject: template.subject, message: template.message });
  }

  throw createOtpError("OTP_PROVIDER_TYPE_UNSUPPORTED", "OTP provider type is unsupported.");
}
