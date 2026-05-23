import { notFound } from "next/navigation";
import PurchaseForm from "../PurchaseForm";
import { prisma } from "../../../../../lib/db";
import { requireAdminPage } from "../../../../../lib/auth/admin";
import { hasRole } from "../../../../../lib/auth/rbac";
import { PURCHASE_MANAGE_ROLES, PURCHASE_READ_ROLES, purchaseInclude, serializePurchase } from "../../../../../lib/admin/purchasePayload";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function serializeProduct(product) {
  return {
    ...product,
    costPrice: product.costPrice?.toString?.() || "0.00",
  };
}

export default async function AdminPurchaseDetailPage({ params }) {
  const session = await requireAdminPage();
  const user = { roles: session.user.roles.map((name) => ({ role: { name } })) };
  const canRead = hasRole(user, PURCHASE_READ_ROLES);
  const canManage = hasRole(user, PURCHASE_MANAGE_ROLES);
  const { id } = await params;

  if (!canRead) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8">
        <h1 className="text-2xl font-black text-[#111827]">Purchase Order</h1>
        <p className="mt-2 text-sm font-bold text-[#ef3338]">You do not have permission to view this purchase order.</p>
      </div>
    );
  }

  const [purchaseRaw, suppliers, productsRaw] = await prisma.$transaction([
    prisma.purchaseOrder.findUnique({ where: { id }, include: purchaseInclude() }),
    prisma.supplier.findMany({
      select: { id: true, name: true, companyName: true },
      orderBy: { name: "asc" },
    }),
    prisma.product.findMany({
      select: { id: true, title: true, sku: true, costPrice: true, stockQuantity: true },
      orderBy: { title: "asc" },
      take: 500,
    }),
  ]);

  if (!purchaseRaw) notFound();

  return (
    <PurchaseForm
      mode="edit"
      purchase={serializePurchase(purchaseRaw)}
      suppliers={suppliers}
      products={productsRaw.map(serializeProduct)}
      canManage={canManage}
    />
  );
}
