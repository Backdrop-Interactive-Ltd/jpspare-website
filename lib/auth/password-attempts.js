import { prisma } from "../db";

const MAX_PASSWORD_ATTEMPTS = 5;
const PASSWORD_LOCK_MS = 15 * 60 * 1000;

export function getPasswordAttemptClientInfo(request) {
  return {
    ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
    userAgent: request.headers.get("user-agent") || null,
  };
}

export async function getActivePasswordLock(identifier, channel) {
  const attempt = await prisma.customerPasswordAttempt.findUnique({
    where: { identifier_channel: { identifier, channel } },
  });

  if (!attempt?.lockedUntil) {
    return null;
  }

  if (attempt.lockedUntil.getTime() > Date.now()) {
    return attempt.lockedUntil;
  }

  await prisma.customerPasswordAttempt.update({
    where: { identifier_channel: { identifier, channel } },
    data: { attempts: 0, lockedUntil: null },
  });

  return null;
}

export async function recordFailedPasswordAttempt({ identifier, channel, ipAddress, userAgent }) {
  const existing = await prisma.customerPasswordAttempt.findUnique({
    where: { identifier_channel: { identifier, channel } },
  });

  const currentAttempts = existing?.lockedUntil && existing.lockedUntil.getTime() <= Date.now() ? 0 : existing?.attempts || 0;
  const attempts = currentAttempts + 1;
  const lockedUntil = attempts >= MAX_PASSWORD_ATTEMPTS ? new Date(Date.now() + PASSWORD_LOCK_MS) : null;

  await prisma.customerPasswordAttempt.upsert({
    where: { identifier_channel: { identifier, channel } },
    create: {
      identifier,
      channel,
      attempts,
      lockedUntil,
      lastAttemptAt: new Date(),
      ipAddress,
      userAgent,
    },
    update: {
      attempts,
      lockedUntil,
      lastAttemptAt: new Date(),
      ipAddress,
      userAgent,
    },
  });

  return {
    attempts,
    attemptsRemaining: Math.max(0, MAX_PASSWORD_ATTEMPTS - attempts),
    lockedUntil,
  };
}

export function resetPasswordAttempts(identifier, channel, client = prisma) {
  return client.customerPasswordAttempt.deleteMany({
    where: { identifier, channel },
  });
}
