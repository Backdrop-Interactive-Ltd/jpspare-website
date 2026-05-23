import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "../db";

export const ADMIN_SESSION_COOKIE = "jpspare_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function getSecretKey() {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.AUTH_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET must be set and at least 32 characters long.");
  }

  return new TextEncoder().encode(secret);
}

export async function createSessionToken(user) {
  const roles = user.roles?.map((assignment) => assignment.role.name) || [];

  return new SignJWT({
    email: user.email,
    name: user.name,
    roles,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(token) {
  const { payload } = await jwtVerify(token, getSecretKey());
  return payload;
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!token) return null;

  try {
    const payload = await verifySessionToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: { roles: { include: { role: true } } },
    });

    if (!user || !user.isActive) return null;

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles.map((assignment) => assignment.role.name),
      },
    };
  } catch {
    return null;
  }
}

export async function setAdminSession(token) {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}
