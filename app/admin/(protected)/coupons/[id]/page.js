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

function serializeRedemption(redemption) {
  if (!redemption) return null;
  return {
    id: redemption.id,
    orderId: redemption.orderId,
    customerId: redemption.customerId,
    customerName: redemption.customer?.name || null,
    email: redemption.email || redemption.customer?.email || null,
    phone: redemption.phone || redemption.customer?.phone || null,
    discountAmount: redemption.discountAmount?.toString?.() ?? redemption.discountAmount,
    status: redemption.status,
    redeemedAt: redemption.redeemedAt?.toISOString?.() ?? redemption.redeemedAt,
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
  const [analytics, latestRedemptions] = await Promise.all([
    prisma.couponRedemption.aggregate({
      where: { couponId: coupon.id },
      _count: { _all: true },
      _sum: { discountAmount: true },
    }),
    prisma.couponRedemption.findMany({
      where: { couponId: coupon.id },
      include: { customer: { select: { id: true, name: true, email: true, phone: true } } },
      orderBy: { redeemedAt: "desc" },
      take: 10,
    }),
  ]);

  return (
    <CouponForm
      mode="edit"
      coupon={{
        ...serializeCoupon(coupon),
        analytics: {
          totalRedemptions: analytics._count?._all || 0,
          totalDiscountGiven: analytics._sum?.discountAmount?.toString?.() ?? analytics._sum?.discountAmount ?? "0",
          latestRedemptions: latestRedemptions.map(serializeRedemption),
        },
      }}
      canManage={canManage}
    />
  );
}
