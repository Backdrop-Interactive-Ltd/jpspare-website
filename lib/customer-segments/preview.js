import {
  buildCustomerSegmentWhere,
  customerSegmentMetrics,
  evaluateCustomerSegmentRule,
  getUnsupportedSegmentRules,
} from "./evaluator";

function serializeRuleValue(value) {
  if (value instanceof Date) return value.toISOString();
  return value;
}

function serializeRules(rules) {
  return Object.fromEntries(Object.entries(rules || {}).map(([key, value]) => [key, serializeRuleValue(value)]));
}

function parseRules(rulesJson) {
  return rulesJson && typeof rulesJson === "object" && !Array.isArray(rulesJson) ? rulesJson : {};
}

function serializeCustomer(customer) {
  return {
    id: customer.id,
    email: customer.email,
    phone: customer.phone,
    firstName: customer.firstName,
    lastName: customer.lastName,
    status: customer.status,
    lastLoginAt: customer.lastLoginAt?.toISOString?.() ?? customer.lastLoginAt,
    createdAt: customer.createdAt?.toISOString?.() ?? customer.createdAt,
    metrics: customerSegmentMetrics(customer),
  };
}

export async function previewCustomerSegment({ prisma, rulesJson, page = 1, limit = 20 }) {
  const rules = parseRules(rulesJson);
  const safePage = Math.max(Number.parseInt(page, 10) || 1, 1);
  const safeLimit = Math.min(Math.max(Number.parseInt(limit, 10) || 20, 1), 100);

  const customers = await prisma.customer.findMany({
    where: buildCustomerSegmentWhere(rules),
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

  const matched = customers.filter((customer) => evaluateCustomerSegmentRule(customer, rules));
  const start = (safePage - 1) * safeLimit;
  const items = matched.slice(start, start + safeLimit).map(serializeCustomer);

  return {
    rules: serializeRules(rules),
    unsupportedKeys: getUnsupportedSegmentRules(rules),
    items,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total: matched.length,
      totalPages: Math.max(Math.ceil(matched.length / safeLimit), 1),
    },
  };
}
