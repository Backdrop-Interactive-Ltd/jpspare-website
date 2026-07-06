import { createAgentTask } from "./agent-tasks";

const DEFAULT_PRIORITY = "MEDIUM";
const VALID_PRIORITIES = new Set(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);

function cleanString(value, fallback = "") {
  if (value === null || value === undefined) return fallback;
  const stringValue = String(value).trim();
  return stringValue || fallback;
}

function normalizePriority(value) {
  const priority = cleanString(value, DEFAULT_PRIORITY).toUpperCase();
  return VALID_PRIORITIES.has(priority) ? priority : DEFAULT_PRIORITY;
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) return [];
  return Array.from(
    new Set(
      value
        .map((item) => cleanString(item))
        .filter(Boolean)
    )
  );
}

function normalizeDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function buildInputJson(options = {}) {
  return {
    filters: {
      supplierIds: normalizeStringArray(options.supplierIds),
      productIds: normalizeStringArray(options.productIds),
      warehouseId: cleanString(options.warehouseId) || null,
      categoryId: cleanString(options.categoryId) || null,
    },
    requestedBy: cleanString(options.requestedBy) || null,
  };
}

async function createPurchasingTask(taskType, options = {}) {
  try {
    const agentId = cleanString(options.agentId);
    if (!agentId) return null;

    return await createAgentTask({
      agentId,
      taskType,
      priority: normalizePriority(options.priority),
      inputJson: buildInputJson(options),
      scheduledFor: normalizeDate(options.scheduledFor),
    });
  } catch {
    return null;
  }
}

export function createPurchasingAnalysisTask(options = {}) {
  return createPurchasingTask("PURCHASING_ANALYSIS", options);
}

export function createSupplierRiskScanTask(options = {}) {
  return createPurchasingTask("SUPPLIER_RISK_SCAN", options);
}

export function createPurchaseUrgencyTask(options = {}) {
  return createPurchasingTask("PURCHASE_URGENCY", options);
}

export function createCostOptimizationTask(options = {}) {
  return createPurchasingTask("COST_OPTIMIZATION", options);
}

export function createLeadTimeAnalysisTask(options = {}) {
  return createPurchasingTask("LEAD_TIME_ANALYSIS", options);
}
