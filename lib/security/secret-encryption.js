import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const VERSION = "v1";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const MIN_SECRET_LENGTH = 32;

function getRawEncryptionKey() {
  const key = process.env.OTP_SECRET_KEY;

  if (!key) {
    const message = "OTP_SECRET_KEY is required to encrypt OTP provider credentials.";
    throw new Error(process.env.NODE_ENV === "production" ? message : `${message} Add it to your local env before using OTP provider encryption.`);
  }

  if (key.length < MIN_SECRET_LENGTH) {
    throw new Error("OTP_SECRET_KEY must be at least 32 characters long.");
  }

  return key;
}

function getEncryptionKey() {
  return crypto.createHash("sha256").update(getRawEncryptionKey()).digest();
}

function encodePart(value) {
  return value.toString("base64url");
}

function decodePart(value) {
  return Buffer.from(value, "base64url");
}

export function hasEncryptionKey() {
  return Boolean(process.env.OTP_SECRET_KEY && process.env.OTP_SECRET_KEY.length >= MIN_SECRET_LENGTH);
}

export function encryptSecretJson(value) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv, { authTagLength: AUTH_TAG_LENGTH });
  const plaintext = JSON.stringify(value ?? {});
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [VERSION, encodePart(iv), encodePart(authTag), encodePart(ciphertext)].join(":");
}

export function decryptSecretJson(encryptedValue) {
  if (!encryptedValue || typeof encryptedValue !== "string") {
    return {};
  }

  const [version, ivPart, authTagPart, ciphertextPart] = encryptedValue.split(":");

  if (version !== VERSION || !ivPart || !authTagPart || !ciphertextPart) {
    throw new Error("Invalid encrypted secret payload.");
  }

  const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), decodePart(ivPart), { authTagLength: AUTH_TAG_LENGTH });
  decipher.setAuthTag(decodePart(authTagPart));

  const plaintext = Buffer.concat([decipher.update(decodePart(ciphertextPart)), decipher.final()]).toString("utf8");
  return JSON.parse(plaintext);
}

export function maskSecretValue(value) {
  const text = String(value || "");

  if (!text) {
    return "";
  }

  if (text.length <= 4) {
    return "••••";
  }

  return `••••••${text.slice(-4)}`;
}

export function maskSecretJson(value) {
  if (Array.isArray(value)) {
    return value.map((item) => maskSecretJson(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, maskSecretJson(item)]));
  }

  if (typeof value === "string") {
    return maskSecretValue(value);
  }

  return value;
}
