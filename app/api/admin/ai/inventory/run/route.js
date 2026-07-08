import { INVENTORY_READ_ROLES } from "../../../../../../lib/commerce/inventory";
import { createInventoryAnalysisTask } from "../../../../../../lib/ai/inventory-task-generator";
import { loadInventoryProducts } from "../../../../../../lib/ai/domain-loaders/inventory";
import { generateInventoryRecommendations } from "../../../../../../lib/ai/inventory-recommendations";
import { runAgentTask } from "../../../../../../lib/ai/agent-runner";
import { apiError, json, prisma, requireAdminApi } from "../../../_utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function cleanString(value, fallback = "") {
  if (value === null || value === undefined) return fallback;
  const stringValue = String(value).trim();
  return stringValue || fallback;
}

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.map((item) => cleanString(item)).filter(Boolean)));
}

async function parseBody(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

async function findInventoryAgent() {
  return prisma.agent.findFirst({
    where: {
      isActive: true,
      status: "ACTIVE",
      OR: [
        { slug: "inventory-ai" },
        { slug: "inventory-agent" },
        { type: "INVENTORY_AI" },
        { type: "INVENTORY" },
      ],
    },
    orderBy: [{ updatedAt: "desc" }],
  });
}

function serializeOrderItem(item) {
  return {
    quantity: item.quantity || 0,
    createdAt: item.order?.createdAt || item.createdAt || null,
    updatedAt: item.order?.updatedAt || null,
    paidAt: item.order?.paidAt || null,
    status: item.order?.status || null,
  };
}

function serializePurchase(purchase) {
  const fallbackDate = purchase.receivedAt || purchase.orderedAt || purchase.createdAt || null;

  return {
    createdAt: purchase.orderedAt || purchase.createdAt || null,
    expectedDeliveryDate: fallbackDate,
    receivedAt: purchase.receivedAt || null,
    totalAmount: toNumber(purchase.total),
    status: purchase.status || null,
  };
}

function supplierFromProduct(product) {
  const supplier = product.purchaseItems
    ?.map((item) => item.purchaseOrder?.supplier)
    .find(Boolean);

  if (!supplier) return null;

  return {
    id: supplier.id,
    name: supplier.name || supplier.companyName || "Unknown supplier",
    companyName: supplier.companyName,
    status: supplier.status,
    purchases: Array.isArray(supplier.purchases) ? supplier.purchases.map(serializePurchase) : [],
    products: [{ id: product.id }],
  };
}

function productInput(product) {
  const latestAnalytics = product.inventoryAnalytics?.[0] || {};

  return {
    id: product.id,
    name: product.title,
    sku: product.sku,
    stockQuantity: product.stockQuantity,
    reservedStock: product.reservedStock,
    lowStockThreshold: product.lowStockThreshold,
    price: toNumber(product.price),
    costPrice: toNumber(product.costPrice),
    orders: (product.orderItems || []).map(serializeOrderItem),
    inventoryMovements: product.inventoryMovements || [],
    supplier: supplierFromProduct(product),
    category: product.category,
    brand: product.brand,
    analytics: {
      salesLast7Days: latestAnalytics.salesLast7Days,
      salesLast30Days: latestAnalytics.salesLast30Days,
      salesLast90Days: latestAnalytics.salesLast90Days,
      velocityScore: latestAnalytics.velocityScore,
    },
  };
}

function flattenProductRecommendations(product) {
  const result = generateInventoryRecommendations(productInput(product));

  return result.recommendations.map((recommendation) => ({
    id: `${result.productId}:${recommendation.type}`,
    productId: result.productId,
    productName: result.productName,
    sku: result.sku,
    categoryId: product.category?.id || null,
    categoryName: product.category?.name || null,
    brandId: product.brand?.id || null,
    brandName: product.brand?.name || null,
    ...recommendation,
  }));
}

function buildTaskOptions(body, session) {
  return {
    productIds: normalizeStringArray(body.productIds),
    warehouseId: cleanString(body.warehouseId) || null,
    categoryId: cleanString(body.categoryId) || null,
    priority: cleanString(body.priority, "MEDIUM"),
    requestedBy: session?.user?.id || session?.user?.email || null,
  };
}

export async function POST(request) {
  const auth = await requireAdminApi(INVENTORY_READ_ROLES);
  if (auth.response) return auth.response;

  const agent = await findInventoryAgent();
  if (!agent) {
    return apiError("Inventory AI agent is not configured.", 422);
  }

  const body = await parseBody(request);
  const task = await createInventoryAnalysisTask({
    ...buildTaskOptions(body, auth.session),
    agentId: agent.id,
  });

  if (!task) {
    return apiError("Unable to create inventory analysis task.", 500);
  }

  const output = await runAgentTask(task, async (runningTask) => {
    const products = await loadInventoryProducts(runningTask.inputJson);
    const recommendations = products.flatMap(flattenProductRecommendations);

    return {
      recommendationCount: recommendations.length,
      recommendations,
      scannedProducts: products.length,
    };
  });

  if (!output) {
    return json({
      taskId: task.id,
      status: "FAILED",
      recommendationCount: 0,
    });
  }

  return json({
    taskId: task.id,
    status: "COMPLETED",
    recommendationCount: output.recommendationCount || 0,
  });
}
