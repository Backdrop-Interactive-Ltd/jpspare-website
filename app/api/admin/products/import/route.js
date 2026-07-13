import { apiError, json, prisma, requireAdminApi } from "../../_utils";
import { normalizeProductPayload, PRODUCT_WRITE_ROLES, replaceProductRelations, slugify, validateProductPayload } from "../../../../../lib/admin/productPayload";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_ROWS = 1000;

const COLUMN_ALIASES = new Map([
  ["sku", "sku"],
  ["name", "name"],
  ["product name", "name"],
  ["slug", "slug"],
  ["brand", "brand"],
  ["category", "category"],
  ["product type", "productType"],
  ["price", "price"],
  ["compare price", "comparePrice"],
  ["compare at price", "comparePrice"],
  ["stock quantity", "stockQuantity"],
  ["stock", "stockQuantity"],
  ["featured", "featured"],
]);

function normalizeHeader(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeLookup(value) {
  return String(value || "").trim().toLowerCase();
}

function parseBoolean(value) {
  const normalized = normalizeLookup(value);
  return ["1", "yes", "true", "y", "featured"].includes(normalized);
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (quoted) {
      if (char === '"' && next === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (char !== "\r") {
      cell += char;
    }
  }

  row.push(cell);
  rows.push(row);
  return rows.filter((item) => item.some((value) => String(value || "").trim()));
}

function numericValue(value) {
  if (value === undefined || value === null || String(value).trim() === "") return null;
  const number = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(number) ? number : null;
}

function intValue(value) {
  if (value === undefined || value === null || String(value).trim() === "") return 0;
  const number = Number.parseInt(String(value).replace(/,/g, "").trim(), 10);
  return Number.isFinite(number) ? number : null;
}

function mapRows(parsedRows) {
  const [headerRow, ...dataRows] = parsedRows;
  const headers = (headerRow || []).map((header) => COLUMN_ALIASES.get(normalizeHeader(header)) || null);

  return dataRows.map((row, index) => {
    const data = {};
    headers.forEach((key, cellIndex) => {
      if (key) data[key] = String(row[cellIndex] || "").trim();
    });
    return { rowNumber: index + 2, data };
  });
}

function mapByNameOrSlug(items) {
  const map = new Map();
  items.forEach((item) => {
    if (item.name) map.set(normalizeLookup(item.name), item);
    if (item.slug) map.set(normalizeLookup(item.slug), item);
  });
  return map;
}

function buildPayload(data, category, brand) {
  return normalizeProductPayload({
    title: data.name,
    slug: data.slug || slugify(data.name),
    sku: data.sku,
    price: data.price,
    compareAtPrice: data.comparePrice,
    stockQuantity: data.stockQuantity,
    isFeatured: parseBoolean(data.featured),
    status: "DRAFT",
    categoryId: category?.id,
    brandId: brand?.id,
  });
}

async function getLookupData() {
  const [categories, brands, productTypes, products] = await prisma.$transaction([
    prisma.category.findMany({ select: { id: true, name: true, slug: true } }),
    prisma.brand.findMany({ select: { id: true, name: true, slug: true } }),
    prisma.productType.findMany({ select: { id: true, name: true, slug: true } }),
    prisma.product.findMany({ select: { sku: true, slug: true } }),
  ]);

  return {
    categoryMap: mapByNameOrSlug(categories),
    brandMap: mapByNameOrSlug(brands),
    productTypeMap: mapByNameOrSlug(productTypes),
    existingSkus: new Set(products.map((product) => normalizeLookup(product.sku)).filter(Boolean)),
    existingSlugs: new Set(products.map((product) => normalizeLookup(product.slug)).filter(Boolean)),
  };
}

function validateRows(rows, lookup) {
  const seenSkus = new Set();
  const seenSlugs = new Set();

  return rows.map(({ rowNumber, data }) => {
    const errors = [];
    const name = String(data.name || "").trim();
    const sku = String(data.sku || "").trim();
    const slug = String(data.slug || slugify(name)).trim();
    const category = lookup.categoryMap.get(normalizeLookup(data.category));
    const brand = data.brand ? lookup.brandMap.get(normalizeLookup(data.brand)) : null;
    const productType = data.productType ? lookup.productTypeMap.get(normalizeLookup(data.productType)) : null;
    const price = numericValue(data.price);
    const comparePrice = data.comparePrice ? numericValue(data.comparePrice) : null;
    const stockQuantity = intValue(data.stockQuantity);

    if (!name) errors.push("Missing Name");
    if (!data.category) errors.push("Missing Category");
    else if (!category) errors.push("Invalid Category");
    if (data.brand && !brand) errors.push("Invalid Brand");
    if (data.productType && !productType) errors.push("Invalid Product Type");
    if (price === null) errors.push("Invalid Price");
    if (data.comparePrice && comparePrice === null) errors.push("Invalid Compare Price");
    if (stockQuantity === null) errors.push("Invalid Stock Quantity");
    if (sku) {
      const key = normalizeLookup(sku);
      if (lookup.existingSkus.has(key) || seenSkus.has(key)) errors.push("Duplicate SKU");
      seenSkus.add(key);
    }
    if (slug) {
      const key = normalizeLookup(slug);
      if (lookup.existingSlugs.has(key) || seenSlugs.has(key)) errors.push("Duplicate Slug");
      seenSlugs.add(key);
    }

    const payload = buildPayload({ ...data, slug, stockQuantity: stockQuantity ?? data.stockQuantity }, category, brand);
    const payloadError = validateProductPayload(payload);
    if (payloadError) errors.push(payloadError);

    return {
      rowNumber,
      valid: errors.length === 0,
      errors,
      product: {
        sku,
        name,
        slug,
        brand: brand?.name || data.brand || "",
        category: category?.name || data.category || "",
        productType: productType?.name || data.productType || "",
        price: price === null ? data.price || "" : price.toFixed(2),
        comparePrice: comparePrice === null ? data.comparePrice || "" : comparePrice.toFixed(2),
        stockQuantity: stockQuantity ?? data.stockQuantity ?? 0,
        featured: parseBoolean(data.featured),
      },
      payload,
    };
  });
}

async function parseImportRequest(request) {
  const form = await request.formData();
  const file = form.get("file");
  const confirm = form.get("confirm") === "true";

  if (!file || typeof file.text !== "function") {
    return { error: "CSV file is required." };
  }
  const fileName = String(file.name || "");
  const fileType = String(file.type || "");
  if (fileName && !fileName.toLowerCase().endsWith(".csv") && fileType !== "text/csv") {
    return { error: "Only UTF-8 CSV files are supported." };
  }

  const text = (await file.text()).replace(/^\uFEFF/, "");
  const parsedRows = parseCsv(text);
  if (parsedRows.length <= 1) return { error: "CSV must include a header row and at least one product row." };
  if (parsedRows.length - 1 > MAX_ROWS) return { error: `CSV cannot exceed ${MAX_ROWS} rows.` };

  return { confirm, rows: mapRows(parsedRows) };
}

export async function POST(request) {
  const auth = await requireAdminApi(PRODUCT_WRITE_ROLES);
  if (auth.response) return auth.response;

  const parsed = await parseImportRequest(request);
  if (parsed.error) return apiError(parsed.error, 422);

  const lookup = await getLookupData();
  const validatedRows = validateRows(parsed.rows, lookup);
  const validRows = validatedRows.filter((row) => row.valid);
  const invalidRows = validatedRows.filter((row) => !row.valid);

  if (!parsed.confirm) {
    return json({
      mode: "preview",
      summary: {
        totalRows: validatedRows.length,
        validRows: validRows.length,
        invalidRows: invalidRows.length,
      },
      rows: validatedRows.map(({ payload, ...row }) => row),
    });
  }

  let imported = 0;
  const failures = [];
  for (const row of validRows) {
    try {
      await prisma.$transaction(async (tx) => {
        const product = await tx.product.create({ data: row.payload.product });
        await replaceProductRelations(tx, product.id, row.payload);
      });
      imported += 1;
    } catch (error) {
      failures.push({ rowNumber: row.rowNumber, error: "Unable to import row." });
    }
  }

  return json({
    mode: "import",
    summary: {
      totalRows: validatedRows.length,
      imported,
      skipped: invalidRows.length,
      failed: failures.length,
    },
    invalidRows: invalidRows.map(({ payload, ...row }) => row),
    failures,
  });
}
