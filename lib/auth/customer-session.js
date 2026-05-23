import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "../db";

export const CUSTOMER_SESSION_COOKIE = "jpspare_customer_session";
const CUSTOMER_SESSION_MAX_AGE = 60 * 60 * 24 * 30;

function getCustomerSecret() {
  const secret = process.env.CUSTOMER_SESSION_SECRET || process.env.AUTH_SECRET || process.env.ADMIN_SESSION_SECRET;

  if (!secret) {
    throw new Error("CUSTOMER_SESSION_SECRET, AUTH_SECRET, or ADMIN_SESSION_SECRET is required.");
  }

  return new TextEncoder().encode(secret);
}

export async function createCustomerSessionToken(customer) {
  return new SignJWT({
    email: customer.email,
    name: [customer.firstName, customer.lastName].filter(Boolean).join(" ") || customer.email,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(customer.id)
    .setIssuedAt()
    .setExpirationTime(`${CUSTOMER_SESSION_MAX_AGE}s`)
    .sign(getCustomerSecret());
}

export async function setCustomerSession(customer) {
  const token = await createCustomerSessionToken(customer);
  const cookieStore = await cookies();

  cookieStore.set(CUSTOMER_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: CUSTOMER_SESSION_MAX_AGE,
    path: "/",
  });
}

export async function clearCustomerSession() {
  const cookieStore = await cookies();
  cookieStore.delete(CUSTOMER_SESSION_COOKIE);
}

export async function getCustomerSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getCustomerSecret());
    const customer = await prisma.customer.findUnique({
      where: { id: payload.sub },
      include: {
        addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] },
        vehicles: { orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] },
      },
    });

    if (!customer || customer.status !== "ACTIVE") {
      return null;
    }

    return {
      customer,
      token: {
        id: customer.id,
        email: customer.email,
        name: [customer.firstName, customer.lastName].filter(Boolean).join(" ") || customer.email,
      },
    };
  } catch {
    return null;
  }
}

