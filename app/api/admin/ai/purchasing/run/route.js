import { PURCHASE_READ_ROLES } from "../../../../../../lib/admin/purchasePayload";
import { createPurchasingAnalysisTask } from "../../../../../../lib/ai/purchasing-task-generator";
import { loadPurchasingProducts } from "../../../../../../lib/ai/domain-loaders/purchasing";
import { generatePurchasingRecommendations } from "../../../../../../lib/ai/purchasing-recommendations";
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

async function findPurchasingAgent() {
  return prisma.agent.findFirst({
    where: {
      isActive: true,
      status: "ACTIVE",
      OR: [
        { slug: "purchasing-ai" },
        { slug: "purchasing-agent" },
        { type: "PURCHASING_AI" },
        { type: "PURCHASING" },
      ],
    },
    orderBy: [{ updatedAt: "desc" }],
  });
}

function serializePurchaseOrder(purchaseOrder, productId) {
  if (!purchaseOrder) return null;
  const supplier = purchaseOrder.supplier || null;

  return {
    id: purchaseOrder.id,
    supplierId: supplier?.id || purchaseOrder.supplierId || null,
    supplier: supplier
      ? {
          id: supplier.id,
          name: supplier.name || supplier.companyName || "Unknown supplier",
        }
      : null,
    status: purchaseOrder.status,
    total: toNumber(purchaseOrder.total),
    orderedAt: purchaseOrder.orderedAt,
    receivedAt: purchaseOrder.receivedAt,
    createdAt: purchaseOrder.createdAt,
    items: (purchaseOrder.items || [])
      .filter((item) => !productId || item.productId === productId)
      .map((item) => ({
        productId: item.productId,
        productTitle: item.productTitle,
        sku: item.sku,
        quantity: item.quantity,
        receivedQuantity: item.receivedQuantity,
        costPrice: toNumber(item.costPrice),
        total: toNumber(item.total),
        createdAt: item.createdAt,
        purchaseOrder,
      })),
  };
}

function supplierFromPurchaseOrder(purchaseOrder, productId) {
  const supplier = purchaseOrder?.supplier;
  if (!supplier) return null;

  return {
    id: supplier.id,
    name: supplier.name || supplier.companyName || "Unknown supplier",
    companyName: supplier.companyName,
    status: supplier.status,
    purchases: (supplier.purchases || []).map((purchase) => ({
      createdAt: purchase.orderedAt || purchase.createdAt,
      expectedDeliveryDate: purchase.receivedAt || purchase.orderedAt || purchase.createdAt,
      receivedAt: purchase.receivedAt,
      totalAmount: toNumber(purchase.total),
      status: purchase.status,
    })),
    products: [{ id: productId }],
  };
}

function uniqueById(items) {
  const byId = new Map();
  for (const item of items) {
    if (item?.id && !byId.has(item.id)) byId.set(item.id, item);
  }
  return Array.from(byId.values());
}

function purchasingInput(product) {
  const purchaseOrders = (product.purchaseItems || [])
    .map((item) => serializePurchaseOrder(item.purchaseOrder, product.id))
    .filter(Boolean);
  const suppliers = uniqueById(
    (product.purchaseItems || [])
      .map((item) => supplierFromPurchaseOrder(item.purchaseOrder, product.id))
      .filter(Boolean)
  );

  return {
    product: {
      id: product.id,
      name: product.title,
      sku: product.sku,
      costPrice: toNumber(product.costPrice),
      stockQuantity: product.stockQuantity,
      reservedStock: product.reservedStock,
    },
    suppliers,
    purchases: purchaseOrders,
    reorderSuggestion: product.reorderSuggestions?.[0] || null,
    demandForecast: product.demandForecasts?.[0] || null,
    warehouseStock: product.warehouseStocks || [],
  };
}

function recommendedSupplierFor(recommendation, product) {
  const metadataSupplier = recommendation.metadata?.supplier;
  if (metadataSupplier?.id || metadataSupplier?.name) {
    return {
      id: metadataSupplier.id || null,
      name: metadataSupplier.name || "Unknown supplier",
    };
  }

  const supplier = product.purchaseItems?.map((item) => item.purchaseOrder?.supplier).find(Boolean);
  if (!supplier) return null;

  return {
    id: supplier.id,
    name: supplier.name || supplier.companyName || "Unknown supplier",
  };
}

function flattenProductRecommendations(product) {
  const result = generatePurchasingRecommendations(purchasingInput(product));

  return result.recommendations.map((recommendation) => {
    const recommendedSupplier = recommendedSupplierFor(recommendation, product);

    return {
      id: `${result.productId}:${recommendation.type}`,
      productId: result.productId,
      productName: result.productName,
      sku: result.sku,
      categoryId: product.category?.id || null,
      categoryName: product.category?.name || null,
      brandId: product.brand?.id || null,
      brandName: product.brand?.name || null,
      recommendedSupplierId: recommendedSupplier?.id || null,
      recommendedSupplierName: recommendedSupplier?.name || null,
      ...recommendation,
    };
  });
}

function buildTaskOptions(body, session) {
  return {
    supplierIds: normalizeStringArray(body.supplierIds),
    productIds: normalizeStringArray(body.productIds),
    warehouseId: cleanString(body.warehouseId) || null,
    categoryId: cleanString(body.categoryId) || null,
    priority: cleanString(body.priority, "MEDIUM"),
    requestedBy: session?.user?.id || session?.user?.email || null,
  };
}

export async function POST(request) {
  const auth = await requireAdminApi(PURCHASE_READ_ROLES);
  if (auth.response) return auth.response;

  const agent = await findPurchasingAgent();
  if (!agent) {
    return apiError("Purchasing AI agent is not configured.", 422);
  }

  const body = await parseBody(request);
  const task = await createPurchasingAnalysisTask({
    ...buildTaskOptions(body, auth.session),
    agentId: agent.id,
  });

  if (!task) {
    return apiError("Unable to create purchasing analysis task.", 500);
  }

  const output = await runAgentTask(task, async (runningTask) => {
    const products = await loadPurchasingProducts(runningTask.inputJson);
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
