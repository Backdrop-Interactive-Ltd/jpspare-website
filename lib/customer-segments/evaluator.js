const SUPPORTED_RULE_KEYS = new Set([
  "status",
  "registeredBefore",
  "registeredAfter",
  "lastLoginBefore",
  "lastLoginAfter",
  "hasOrders",
  "minOrders",
  "minSpend",
  "hasVehicles",
]);

function decimalNumber(value) {
  if (value === undefined || value === null) return 0;
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function positiveNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

function positiveInteger(value) {
  const number = Number.parseInt(value, 10);
  return Number.isInteger(number) && number > 0 ? number : null;
}

function dateValue(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function normalizeRules(rules) {
  const input = rules && typeof rules === "object" && !Array.isArray(rules) ? rules : {};
  const normalized = {};

  if (typeof input.status === "string" && input.status.trim()) {
    normalized.status = input.status.trim().toUpperCase();
  }

  const registeredBefore = dateValue(input.registeredBefore);
  if (registeredBefore) normalized.registeredBefore = registeredBefore;

  const registeredAfter = dateValue(input.registeredAfter);
  if (registeredAfter) normalized.registeredAfter = registeredAfter;

  const lastLoginBefore = dateValue(input.lastLoginBefore);
  if (lastLoginBefore) normalized.lastLoginBefore = lastLoginBefore;

  const lastLoginAfter = dateValue(input.lastLoginAfter);
  if (lastLoginAfter) normalized.lastLoginAfter = lastLoginAfter;

  if (typeof input.hasOrders === "boolean") {
    normalized.hasOrders = input.hasOrders;
  }

  const minOrders = positiveInteger(input.minOrders);
  if (minOrders !== null) {
    normalized.minOrders = minOrders;
  }

  const minSpend = positiveNumber(input.minSpend);
  if (minSpend !== null) {
    normalized.minSpend = minSpend;
  }

  if (typeof input.hasVehicles === "boolean") {
    normalized.hasVehicles = input.hasVehicles;
  }

  return normalized;
}

function dateWhere(before, after) {
  return {
    ...(before ? { lt: before } : {}),
    ...(after ? { gt: after } : {}),
  };
}

export function getUnsupportedSegmentRules(rules) {
  const input = rules && typeof rules === "object" && !Array.isArray(rules) ? rules : {};
  return Object.keys(input).filter((key) => !SUPPORTED_RULE_KEYS.has(key));
}

export function buildCustomerSegmentWhere(rules) {
  const normalized = normalizeRules(rules);
  const createdAt = dateWhere(normalized.registeredBefore, normalized.registeredAfter);
  const lastLoginAt = dateWhere(normalized.lastLoginBefore, normalized.lastLoginAfter);

  return {
    ...(normalized.status ? { status: normalized.status } : {}),
    ...(Object.keys(createdAt).length ? { createdAt } : {}),
    ...(Object.keys(lastLoginAt).length ? { lastLoginAt } : {}),
    ...(normalized.hasVehicles === true ? { vehicles: { some: {} } } : {}),
    ...(normalized.hasVehicles === false ? { vehicles: { none: {} } } : {}),
    ...(normalized.hasOrders === true ? { orders: { some: {} } } : {}),
    ...(normalized.hasOrders === false ? { orders: { none: {} } } : {}),
  };
}

export function customerSegmentMetrics(customer) {
  const orders = Array.isArray(customer?.orders) ? customer.orders : [];
  const totalOrders = orders.length;
  const totalSpend = orders.reduce((sum, order) => sum + decimalNumber(order.total), 0);
  const averageOrderValue = totalOrders ? totalSpend / totalOrders : 0;

  return {
    totalOrders,
    totalSpend,
    averageOrderValue,
    vehicleCount: Array.isArray(customer?.vehicles) ? customer.vehicles.length : 0,
  };
}

export function evaluateCustomerSegmentRule(customer, rules) {
  const normalized = normalizeRules(rules);
  const createdAt = dateValue(customer?.createdAt);
  const lastLoginAt = dateValue(customer?.lastLoginAt);
  const metrics = customerSegmentMetrics(customer);

  if (normalized.status && customer?.status !== normalized.status) return false;
  if (normalized.registeredBefore && (!createdAt || createdAt >= normalized.registeredBefore)) return false;
  if (normalized.registeredAfter && (!createdAt || createdAt <= normalized.registeredAfter)) return false;
  if (normalized.lastLoginBefore && (!lastLoginAt || lastLoginAt >= normalized.lastLoginBefore)) return false;
  if (normalized.lastLoginAfter && (!lastLoginAt || lastLoginAt <= normalized.lastLoginAfter)) return false;
  if (normalized.hasOrders === true && metrics.totalOrders < 1) return false;
  if (normalized.hasOrders === false && metrics.totalOrders > 0) return false;
  if (normalized.minOrders !== undefined && metrics.totalOrders < normalized.minOrders) return false;
  if (normalized.minSpend !== undefined && metrics.totalSpend < normalized.minSpend) return false;
  if (normalized.hasVehicles === true && metrics.vehicleCount < 1) return false;
  if (normalized.hasVehicles === false && metrics.vehicleCount > 0) return false;

  return true;
}
