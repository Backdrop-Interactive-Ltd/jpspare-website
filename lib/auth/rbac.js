export const ADMIN_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "PRODUCT_MANAGER",
  "CONTENT_EDITOR",
  "ORDER_MANAGER",
  "SUPPORT_STAFF",
];

export const ROLE_PERMISSIONS = {
  SUPER_ADMIN: ["*"],
  ADMIN: ["products:*", "content:*", "orders:*", "support:*", "settings:*"],
  PRODUCT_MANAGER: ["products:*", "media:read"],
  CONTENT_EDITOR: ["content:*", "media:*", "settings:read"],
  ORDER_MANAGER: ["orders:*", "products:read"],
  SUPPORT_STAFF: ["support:*", "orders:read"],
};

export function getRoleNames(user) {
  return (user?.roles || []).map((assignment) => assignment.role?.name || assignment.name).filter(Boolean);
}

export function hasRole(user, allowedRoles = []) {
  if (!allowedRoles.length) return true;
  const roles = getRoleNames(user);
  return roles.includes("SUPER_ADMIN") || roles.some((role) => allowedRoles.includes(role));
}

export function canAccess(user, permission) {
  const roles = getRoleNames(user);
  return roles.some((role) => {
    const permissions = ROLE_PERMISSIONS[role] || [];
    return permissions.includes("*") || permissions.includes(permission) || permissions.includes(`${permission.split(":")[0]}:*`);
  });
}
