const DAY_MS = 24 * 60 * 60 * 1000;
const COMPLETED_STATUSES = new Set(["COMPLETED", "DELIVERED", "RECEIVED", "CLOSED"]);

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function toDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isCompletedPurchase(purchase) {
  const status = purchase?.status;
  if (!status) return Boolean(purchase?.receivedAt);
  return COMPLETED_STATUSES.has(String(status).toUpperCase());
}

function purchaseAmount(purchase) {
  return Math.max(0, toNumber(purchase?.totalAmount));
}

export function calculateOnTimeDeliveryRate(purchases = []) {
  if (!Array.isArray(purchases) || !purchases.length) return 0;

  const completed = purchases.filter((purchase) => isCompletedPurchase(purchase) && toDate(purchase.receivedAt));
  if (!completed.length) return 0;

  const onTime = completed.filter((purchase) => {
    const expected = toDate(purchase.expectedDeliveryDate);
    const received = toDate(purchase.receivedAt);
    if (!expected || !received) return false;
    return received.getTime() <= expected.getTime();
  }).length;

  return Math.round((onTime / completed.length) * 100);
}

export function calculateAverageLeadTime(purchases = []) {
  if (!Array.isArray(purchases) || !purchases.length) return 0;

  const leadTimes = purchases
    .map((purchase) => {
      const created = toDate(purchase.createdAt);
      const received = toDate(purchase.receivedAt);
      if (!created || !received || received.getTime() < created.getTime()) return null;
      return Math.round((received.getTime() - created.getTime()) / DAY_MS);
    })
    .filter((value) => value !== null);

  if (!leadTimes.length) return 0;
  return Math.round(leadTimes.reduce((sum, value) => sum + value, 0) / leadTimes.length);
}

export function determineSupplierTier(score = 0) {
  const normalizedScore = Math.max(0, Math.min(100, toNumber(score)));

  if (normalizedScore >= 90) return "PLATINUM";
  if (normalizedScore >= 75) return "GOLD";
  if (normalizedScore >= 60) return "SILVER";
  return "BRONZE";
}

function reliabilityScoreFor(onTimeDeliveryRate) {
  const rate = toNumber(onTimeDeliveryRate);

  if (rate >= 95) return 1;
  if (rate >= 85) return 0.8;
  if (rate >= 70) return 0.6;
  return 0.4;
}

export function analyzeSupplierPerformance(supplier = {}) {
  const purchases = Array.isArray(supplier.purchases) ? supplier.purchases : [];
  const products = Array.isArray(supplier.products) ? supplier.products : [];
  const totalPurchases = purchases.length;
  const completedPurchases = purchases.filter(isCompletedPurchase).length;
  const completionRate = totalPurchases ? completedPurchases / totalPurchases : 0;
  const onTimeDeliveryRate = calculateOnTimeDeliveryRate(purchases);
  const reliabilityScore = reliabilityScoreFor(onTimeDeliveryRate);
  const performanceScore = Math.round(((reliabilityScore * 0.6) + (completionRate * 0.4)) * 100);
  const totalSpend = purchases.reduce((sum, purchase) => sum + purchaseAmount(purchase), 0);
  const supplierTier = determineSupplierTier(performanceScore);
  const flags = [];

  if (onTimeDeliveryRate < 85 && completedPurchases > 0) flags.push("LATE_DELIVERIES");
  if (completionRate < 0.75 && totalPurchases > 0) flags.push("LOW_COMPLETION_RATE");
  if (performanceScore >= 90) flags.push("HIGH_PERFORMER");
  if (totalSpend >= 100000 || products.length >= 20) flags.push("STRATEGIC_SUPPLIER");

  return {
    performanceScore,
    reliabilityScore,
    onTimeDeliveryRate,
    averageLeadTimeDays: calculateAverageLeadTime(purchases),
    totalPurchases,
    completedPurchases,
    totalSpend,
    supplierTier,
    flags,
  };
}
