const SUPPORTED_RULE_KEYS = new Set(["status", "hasOrders", "minOrders", "minSpend", "hasVehicles"]);

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

export function normalizeSegmentRules(rulesJson) {
  const rules = rulesJson && typeof rulesJson === "object" && !Array.isArray(rulesJson) ? rulesJson : {};
  const normalized = {};

  if (typeof rules.status === "string" && rules.status.trim()) {
    normalized.status = rules.status.trim().toUpperCase();
  }

  if (typeof rules.hasOrders === "boolean") {
    normalized.hasOrders = rules.hasOrders;
  }

  const minOrders = positiveInteger(rules.minOrders);
  if (minOrders !== null) {
    normalized.minOrders = minOrders;
  }

  const minSpend = positiveNumber(rules.minSpend);
  if (minSpend !== null) {
    normalized.minSpend = minSpend;
  }

  if (typeof rules.hasVehicles === "boolean") {
    normalized.hasVehicles = rules.hasVehicles;
  }

  return {
    normalized,
    unsupportedKeys: Object.keys(rules).filter((key) => !SUPPORTED_RULE_KEYS.has(key)),
  };
}

function buildBaseWhere(rules) {
  return {
    ...(rules.status ? { status: rules.status } : {}),
    ...(rules.hasVehicles === true ? { vehicles: { some: {} } } : {}),
    ...(rules.hasVehicles === false ? { vehicles: { none: {} } } : {}),
    ...(rules.hasOrders === true ? { orders: { some: {} } } : {}),
    ...(rules.hasOrders === false ? { orders: { none: {} } } : {}),
  };
}

function customerMetrics(customer) {
  const orders = Array.isArray(customer.orders) ? customer.orders : [];
  const totalOrders = orders.length;
  const totalSpend = orders.reduce((sum, order) => sum + decimalNumber(order.total), 0);
  const averageOrderValue = totalOrders ? totalSpend / totalOrders : 0;

  return {
    totalOrders,
    totalSpend,
    averageOrderValue,
    vehicleCount: Array.isArray(customer.vehicles) ? customer.vehicles.length : 0,
  };
}

function matchesAggregateRules(customer, rules) {
  const metrics = customerMetrics(customer);
  if (rules.minOrders !== undefined && metrics.totalOrders < rules.minOrders) return false;
  if (rules.minSpend !== undefined && metrics.totalSpend < rules.minSpend) return false;
  return true;
}

function serializeCustomer(customer) {
  const metrics = customerMetrics(customer);

  return {
    id: customer.id,
    email: customer.email,
    phone: customer.phone,
    firstName: customer.firstName,
    lastName: customer.lastName,
    status: customer.status,
    lastLoginAt: customer.lastLoginAt?.toISOString?.() ?? customer.lastLoginAt,
    createdAt: customer.createdAt?.toISOString?.() ?? customer.createdAt,
    metrics,
  };
}

export async function previewCustomerSegment({ prisma, rulesJson, page = 1, limit = 20 }) {
  const { normalized: rules, unsupportedKeys } = normalizeSegmentRules(rulesJson);
  const safePage = Math.max(Number.parseInt(page, 10) || 1, 1);
  const safeLimit = Math.min(Math.max(Number.parseInt(limit, 10) || 20, 1), 100);

  const customers = await prisma.customer.findMany({
    where: buildBaseWhere(rules),
    orderBy: [{ createdAt: "desc" }],
    select: {
      id: true,
      email: true,
      phone: true,
      firstName: true,
      lastName: true,
      status: true,
      lastLoginAt: true,
      createdAt: true,
      orders: {
        select: {
          id: true,
          total: true,
        },
      },
      vehicles: {
        select: {
          id: true,
        },
      },
    },
  });

  const matched = customers.filter((customer) => matchesAggregateRules(customer, rules));
  const start = (safePage - 1) * safeLimit;
  const items = matched.slice(start, start + safeLimit).map(serializeCustomer);

  return {
    rules,
    unsupportedKeys,
    items,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total: matched.length,
      totalPages: Math.max(Math.ceil(matched.length / safeLimit), 1),
    },
  };
}
