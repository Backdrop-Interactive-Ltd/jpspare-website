const CAMPAIGN_BADGE_PRIORITY = {
  "FLASH SALE": 1,
  CLEARANCE: 2,
  "FREE SHIPPING": 3,
  BRAND: 4,
  CATEGORY: 5,
  NEW: 6,
};

let activeCampaignsPromise = null;

function cleanText(value) {
  const clean = String(value ?? "").trim();
  return clean || "";
}

function slugValue(value) {
  return cleanText(value).toLowerCase();
}

function numberValue(value) {
  const number = Number.parseFloat(value);
  return Number.isFinite(number) ? number : null;
}

function hasDiscount(product) {
  return numberValue(product?.discountPrice) !== null || numberValue(product?.oldPrice) !== null || numberValue(product?.compareAtPrice) !== null;
}

function isNewProduct(product) {
  const createdAt = product?.createdAt ? new Date(product.createdAt) : null;
  if (!createdAt || Number.isNaN(createdAt.getTime())) return false;
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  return Date.now() - createdAt.getTime() <= thirtyDaysMs;
}

function isClearanceProduct(product, campaign) {
  const stock = numberValue(product?.stock ?? product?.stockQuantity);
  const threshold = numberValue(product?.lowStockThreshold) ?? 5;
  if (stock !== null && stock <= threshold) return true;
  return campaign?.actionsJson?.clearance === true;
}

function productBrandSlug(product) {
  if (typeof product?.brand === "string") return slugValue(product.brand);
  return slugValue(product?.brand?.slug || product?.brand?.name);
}

function productCategorySlug(product) {
  if (typeof product?.category === "string") return slugValue(product.category);
  return slugValue(product?.category?.slug || product?.category?.name);
}

function campaignRuleSlug(campaign, key) {
  return slugValue(campaign?.rulesJson?.[key]);
}

function addBadge(badges, label, priorityKey = label) {
  const cleanLabel = cleanText(label);
  if (!cleanLabel || badges.some((badge) => badge.label === cleanLabel)) return;
  badges.push({
    label: cleanLabel,
    priority: CAMPAIGN_BADGE_PRIORITY[priorityKey] || 99,
  });
}

async function fetchActiveCampaigns() {
  if (activeCampaignsPromise) return activeCampaignsPromise;

  activeCampaignsPromise = fetch("/api/campaigns?limit=100", { cache: "no-store" })
    .then((response) => (response.ok ? response.json() : { items: [] }))
    .then((payload) => (Array.isArray(payload?.items) ? payload.items : []))
    .catch(() => []);

  return activeCampaignsPromise;
}

export function resolveCampaignBadges(product, campaigns = []) {
  const badges = [];
  const brandSlug = productBrandSlug(product);
  const categorySlug = productCategorySlug(product);

  for (const campaign of campaigns) {
    if (!campaign?.type) continue;

    if (campaign.type === "FLASH_SALE" && hasDiscount(product)) {
      addBadge(badges, "FLASH SALE");
    }

    if (campaign.type === "CLEARANCE" && isClearanceProduct(product, campaign)) {
      addBadge(badges, "CLEARANCE");
    }

    if (campaign.type === "FREE_SHIPPING") {
      addBadge(badges, "FREE SHIPPING");
    }

    if (campaign.type === "BRAND_CAMPAIGN" && brandSlug && campaignRuleSlug(campaign, "brandSlug") === brandSlug) {
      addBadge(badges, campaign.name, "BRAND");
    }

    if (campaign.type === "CATEGORY_CAMPAIGN" && categorySlug && campaignRuleSlug(campaign, "categorySlug") === categorySlug) {
      addBadge(badges, campaign.name, "CATEGORY");
    }

    if (campaign.type === "NEW_ARRIVAL" && isNewProduct(product)) {
      addBadge(badges, "NEW");
    }
  }

  return badges.sort((a, b) => a.priority - b.priority).slice(0, 2).map((badge) => badge.label);
}

export async function getActiveCampaignBadges(product) {
  const campaigns = await fetchActiveCampaigns();
  return resolveCampaignBadges(product, campaigns);
}
