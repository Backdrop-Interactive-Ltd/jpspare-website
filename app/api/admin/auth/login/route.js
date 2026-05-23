import { prisma } from "../../_utils";
import { apiError, json } from "../../_utils";
import { verifyPassword } from "../../../../../lib/auth/password";
import { createSessionToken, setAdminSession } from "../../../../../lib/auth/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return apiError("Email and password are required.", 422);
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { roles: { include: { role: true } } },
  });

  if (!user || !user.isActive) {
    return apiError("Invalid credentials.", 401);
  }

  const isValid = await verifyPassword(password, user.passwordHash);

  if (!isValid) {
    return apiError("Invalid credentials.", 401);
  }

  const token = await createSessionToken(user);
  await setAdminSession(token);

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  return json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles.map((assignment) => assignment.role.name),
    },
  });
}
