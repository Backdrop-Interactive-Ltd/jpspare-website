import { notFound } from "next/navigation";
import { prisma } from "../../../../../lib/db";
import { CATALOG_MANAGE_ROLES } from "../../../../../lib/admin/catalogPayload";
import { requireAdminPage } from "../../../../../lib/auth/admin";
import { hasRole } from "../../../../../lib/auth/rbac";
import CouponForm from "../CouponForm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function serializeCoupon(coupon) {
  if (!coupon) return null;
  return {
    ...coupon,
    discountValue: coupon.discountValue?.toString?.() ?? coupon.discountValue,
    minOrderValue: coupon.minOrderValue?.toString?.() ?? coupon.minOrderValue,
    maxDiscount: coupon.maxDiscount?.toString?.() ?? coupon.maxDiscount,
    startsAt: coupon.startsAt?.toISOString?.() ?? coupon.startsAt,
    endsAt: coupon.endsAt?.toISOString?.() ?? coupon.endsAt,
    createdAt: coupon.createdAt?.toISOString?.() ?? coupon.createdAt,
    updatedAt: coupon.updatedAt?.toISOString?.() ?? coupon.updatedAt,
  };
}

export default async function EditCouponPage({ params }) {
  const session = await requireAdminPage();
  const user = { roles: session.user.roles.map((name) => ({ role: { name } })) };
  const canManage = hasRole(user, CATALOG_MANAGE_ROLES);
  const { id } = await params;

  const coupon = await prisma.coupon.findUnique({
    where: { id },
    include: { _count: { select: { orders: true, redemptions: true } } },
  });
  if (!coupon) notFound();

  return <CouponForm mode="edit" coupon={serializeCoupon(coupon)} canManage={canManage} />;
}
