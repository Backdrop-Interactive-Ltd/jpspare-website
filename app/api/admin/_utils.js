import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { getAdminSession } from "../../../lib/auth/session";
import { hasRole } from "../../../lib/auth/rbac";

export { prisma };

export function json(data, status = 200) {
  return NextResponse.json(data, { status });
}

export function apiError(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function requireAdminApi(allowedRoles = []) {
  const session = await getAdminSession();

  if (!session) {
    return { response: apiError("Unauthorized", 401) };
  }

  const user = {
    ...session.user,
    roles: session.user.roles.map((name) => ({ role: { name } })),
  };

  if (!hasRole(user, allowedRoles)) {
    return { response: apiError("Forbidden", 403) };
  }

  return { session };
}

export function pick(input, fields) {
  return fields.reduce((data, field) => {
    if (Object.prototype.hasOwnProperty.call(input, field)) {
      data[field] = input[field];
    }
    return data;
  }, {});
}

export function parseDateFields(data, fields = ["lastSyncedAt"]) {
  for (const field of fields) {
    if (data[field]) data[field] = new Date(data[field]);
  }
  return data;
}
