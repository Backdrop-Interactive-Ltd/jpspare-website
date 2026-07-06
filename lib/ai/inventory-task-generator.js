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
      productIds: normalizeStringArray(options.productIds),
      warehouseId: cleanString(options.warehouseId) || null,
      categoryId: cleanString(options.categoryId) || null,
    },
    requestedBy: cleanString(options.requestedBy) || null,
  };
}

async function createInventoryTask(taskType, options = {}) {
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

export function createInventoryAnalysisTask(options = {}) {
  return createInventoryTask("INVENTORY_ANALYSIS", options);
}

export function createLowStockScanTask(options = {}) {
  return createInventoryTask("LOW_STOCK_SCAN", options);
}

export function createDeadStockScanTask(options = {}) {
  return createInventoryTask("DEAD_STOCK_SCAN", options);
}

export function createDemandForecastTask(options = {}) {
  return createInventoryTask("DEMAND_FORECAST", options);
}

export function createSupplierRiskTask(options = {}) {
  return createInventoryTask("SUPPLIER_RISK_ANALYSIS", options);
}
