"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import MediaPicker from "../components/MediaPicker";

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function emptyProduct() {
  return {
    title: "",
    slug: "",
    shortDescription: "",
    fullDescription: "",
    sku: "",
    barcode: "",
    brandId: "",
    categoryId: "",
    price: "",
    discountPrice: "",
    costPrice: "",
    compareAtPrice: "",
    stockQuantity: 0,
    reservedStock: 0,
    lowStockThreshold: 5,
    stockStatus: "IN_STOCK",
    warehouseId: "",
    externalStockId: "",
    isFeatured: false,
    status: "DRAFT",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    tags: [],
    images: [],
    specifications: [],
  };
}

function normalizeInitialProduct(product) {
  if (!product) return emptyProduct();

  return {
    ...emptyProduct(),
    ...product,
    brandId: product.brandId || "",
    categoryId: product.categoryId || "",
    price: product.price || "",
    discountPrice: product.discountPrice || "",
    costPrice: product.costPrice || "",
    compareAtPrice: product.compareAtPrice || "",
    tags: product.tags?.map((tag) => tag.name) || [],
    images: product.images || [],
    specifications: product.specifications || [],
  };
}

function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="text-sm font-black text-[#344054]">{label}</span>
      <div className="mt-2">{children}</div>
      {hint ? <span className="mt-1 block text-xs font-semibold text-[#98a2b3]">{hint}</span> : null}
    </label>
  );
}

function inputClass(readOnly) {
  return `h-12 w-full rounded-xl border border-[#d0d5dd] bg-white px-4 text-sm font-semibold text-[#111827] outline-none transition focus:border-[#ef3338] focus:ring-4 focus:ring-red-100 ${
    readOnly ? "cursor-not-allowed bg-[#f2f4f7] text-[#667085]" : ""
  }`;
}

export default function ProductForm({ mode, product, categories, brands, canManage }) {
  const router = useRouter();
  const [form, setForm] = useState(() => normalizeInitialProduct(product));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const readOnly = !canManage;

  const tagsValue = useMemo(() => form.tags.join(", "), [form.tags]);

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function setTitle(value) {
    setForm((current) => ({ ...current, title: value, slug: current.slug ? current.slug : slugify(value) }));
  }

  async function uploadFiles(files, thumbnail = false) {
    if (readOnly || !files?.length) return;
    setUploading(true);
    setMessage("");

    try {
      const data = new FormData();
      data.append("folder", "products");
      Array.from(files).forEach((file) => data.append("files", file));
      const response = await fetch("/api/admin/media/upload", { method: "POST", body: data });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Upload failed");

      setForm((current) => {
        const uploaded = payload.items.map((item, index) => ({
          url: item.url,
          mediaId: item.id,
          alt: current.title || item.filename,
          sortOrder: current.images.length + index,
          isThumbnail: thumbnail && index === 0,
        }));
        const existing = thumbnail ? current.images.map((image) => ({ ...image, isThumbnail: false })) : current.images;
        return { ...current, images: [...existing, ...uploaded] };
      });
    } catch (error) {
      setMessage(error.message);
    } finally {
      setUploading(false);
    }
  }

  function addPickedMedia(selection, thumbnail = false) {
    const picked = Array.isArray(selection) ? selection : [selection];
    if (!picked.length) return;

    setForm((current) => {
      const uploaded = picked.map((item, index) => ({
        url: item.url,
        mediaId: item.id,
        alt: current.title || item.alt || item.originalName || item.fileName,
        sortOrder: current.images.length + index,
        isThumbnail: thumbnail && index === 0,
      }));
      const existing = thumbnail ? current.images.map((image) => ({ ...image, isThumbnail: false })) : current.images;
      return { ...current, images: [...existing, ...uploaded] };
    });
  }

  function removeImage(index) {
    setForm((current) => ({ ...current, images: current.images.filter((_, itemIndex) => itemIndex !== index) }));
  }

  function markThumbnail(index) {
    setForm((current) => ({
      ...current,
      images: current.images.map((image, itemIndex) => ({ ...image, isThumbnail: itemIndex === index })),
    }));
  }

  function updateSpec(index, field, value) {
    setForm((current) => ({
      ...current,
      specifications: current.specifications.map((spec, itemIndex) => (itemIndex === index ? { ...spec, [field]: value } : spec)),
    }));
  }

  function addSpec() {
    setForm((current) => ({
      ...current,
      specifications: [...current.specifications, { name: "", value: "", sortOrder: current.specifications.length }],
    }));
  }

  function removeSpec(index) {
    setForm((current) => ({
      ...current,
      specifications: current.specifications.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (readOnly) return;
    setSaving(true);
    setMessage("");

    const payload = {
      ...form,
      slug: form.slug || slugify(form.title),
      tags: tagsValue
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      images: form.images.map((image, index) => ({ ...image, sortOrder: index })),
      specifications: form.specifications.map((spec, index) => ({ ...spec, sortOrder: index })),
    };

    try {
      const response = await fetch(mode === "edit" ? `/api/admin/products/${form.id}` : "/api/admin/products", {
        method: mode === "edit" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to save product");
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (readOnly || mode !== "edit" || !window.confirm("Move this product to trash?")) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/products/${form.id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Unable to delete product");
      }
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">{mode === "edit" ? "Edit Product" : "Add Product"}</p>
            <h2 className="mt-1 text-2xl font-black text-[#111827]">{mode === "edit" ? form.title : "Create catalog product"}</h2>
            {!canManage ? <p className="mt-2 text-sm font-bold text-[#ef3338]">Read-only mode. Only SUPER_ADMIN and PRODUCT_MANAGER can save product changes.</p> : null}
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => router.push("/admin/products")} className="h-11 rounded-xl border border-[#d0d5dd] bg-white px-5 text-sm font-black text-[#344054]">
              Cancel
            </button>
            {mode === "edit" && canManage ? (
              <button type="button" onClick={handleDelete} className="h-11 rounded-xl border border-red-200 bg-red-50 px-5 text-sm font-black text-[#ef3338]">
                Archive
              </button>
            ) : null}
            {canManage ? (
              <button type="submit" disabled={saving} className="h-11 rounded-xl bg-[#ef3338] px-6 text-sm font-black text-white shadow-[0_12px_24px_rgba(239,51,56,0.22)] disabled:opacity-60">
                {saving ? "Saving..." : "Save Product"}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {message ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-[#b42318]">{message}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
            <h3 className="text-lg font-black text-[#111827]">Product Information</h3>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <Field label="Product title">
                <input value={form.title || ""} onChange={(event) => setTitle(event.target.value)} disabled={readOnly} className={inputClass(readOnly)} required />
              </Field>
              <Field label="Slug">
                <input value={form.slug || ""} onChange={(event) => setField("slug", slugify(event.target.value))} disabled={readOnly} className={inputClass(readOnly)} required />
              </Field>
              <Field label="SKU">
                <input value={form.sku || ""} onChange={(event) => setField("sku", event.target.value)} disabled={readOnly} className={inputClass(readOnly)} />
              </Field>
              <Field label="Barcode">
                <input value={form.barcode || ""} onChange={(event) => setField("barcode", event.target.value)} disabled={readOnly} className={inputClass(readOnly)} />
              </Field>
            </div>
            <div className="mt-5 space-y-5">
              <Field label="Short description">
                <textarea value={form.shortDescription || ""} onChange={(event) => setField("shortDescription", event.target.value)} disabled={readOnly} className={`${inputClass(readOnly)} h-24 py-3`} />
              </Field>
              <Field label="Full description">
                <textarea value={form.fullDescription || ""} onChange={(event) => setField("fullDescription", event.target.value)} disabled={readOnly} className={`${inputClass(readOnly)} h-40 py-3`} />
              </Field>
            </div>
          </section>

          <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
            <h3 className="text-lg font-black text-[#111827]">Pricing & Inventory</h3>
            <div className="mt-5 grid gap-5 md:grid-cols-3">
              <Field label="Price">
                <input type="number" step="0.01" value={form.price || ""} onChange={(event) => setField("price", event.target.value)} disabled={readOnly} className={inputClass(readOnly)} required />
              </Field>
              <Field label="Discount price">
                <input type="number" step="0.01" value={form.discountPrice || ""} onChange={(event) => setField("discountPrice", event.target.value)} disabled={readOnly} className={inputClass(readOnly)} />
              </Field>
              <Field label="Cost price">
                <input type="number" step="0.01" value={form.costPrice || ""} onChange={(event) => setField("costPrice", event.target.value)} disabled={readOnly} className={inputClass(readOnly)} />
              </Field>
              <Field label="Compare at price">
                <input type="number" step="0.01" value={form.compareAtPrice || ""} onChange={(event) => setField("compareAtPrice", event.target.value)} disabled={readOnly} className={inputClass(readOnly)} />
              </Field>
              <Field label="Stock quantity">
                <input type="number" value={form.stockQuantity ?? 0} onChange={(event) => setField("stockQuantity", event.target.value)} disabled={readOnly} className={inputClass(readOnly)} />
              </Field>
              <Field label="Reserved stock" hint="Managed automatically by checkout and order status changes.">
                <input type="number" value={form.reservedStock ?? 0} disabled className={inputClass(true)} />
              </Field>
              <Field label="Low stock threshold">
                <input type="number" value={form.lowStockThreshold ?? 5} onChange={(event) => setField("lowStockThreshold", event.target.value)} disabled={readOnly} className={inputClass(readOnly)} />
              </Field>
              <Field label="Warehouse ID">
                <input value={form.warehouseId || ""} onChange={(event) => setField("warehouseId", event.target.value)} disabled={readOnly} className={inputClass(readOnly)} />
              </Field>
              <Field label="External stock ID">
                <input value={form.externalStockId || ""} onChange={(event) => setField("externalStockId", event.target.value)} disabled={readOnly} className={inputClass(readOnly)} />
              </Field>
              <Field label="Status">
                <select value={form.status || "DRAFT"} onChange={(event) => setField("status", event.target.value)} disabled={readOnly} className={inputClass(readOnly)}>
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </Field>
            </div>
            <label className="mt-5 flex items-center gap-3 rounded-2xl border border-[#e5e7eb] bg-[#f8fafc] px-4 py-3 text-sm font-black text-[#344054]">
              <input type="checkbox" checked={Boolean(form.isFeatured)} onChange={(event) => setField("isFeatured", event.target.checked)} disabled={readOnly} className="size-4 accent-[#ef3338]" />
              Featured product
            </label>
          </section>

          <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-[#111827]">Specifications</h3>
              {!readOnly ? (
                <button type="button" onClick={addSpec} className="h-10 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-black text-[#ef3338]">
                  Add Row
                </button>
              ) : null}
            </div>
            <div className="mt-5 space-y-3">
              {form.specifications.length ? (
                form.specifications.map((spec, index) => (
                  <div key={index} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                    <input value={spec.name || ""} onChange={(event) => updateSpec(index, "name", event.target.value)} disabled={readOnly} placeholder="Specification name" className={inputClass(readOnly)} />
                    <input value={spec.value || ""} onChange={(event) => updateSpec(index, "value", event.target.value)} disabled={readOnly} placeholder="Specification value" className={inputClass(readOnly)} />
                    {!readOnly ? (
                      <button type="button" onClick={() => removeSpec(index)} className="h-12 rounded-xl border border-[#d0d5dd] px-4 text-sm font-black text-[#667085]">
                        Remove
                      </button>
                    ) : null}
                  </div>
                ))
              ) : (
                <p className="rounded-2xl bg-[#f8fafc] p-4 text-sm font-semibold text-[#667085]">No specifications added yet.</p>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
            <h3 className="text-lg font-black text-[#111827]">Organization</h3>
            <div className="mt-5 space-y-5">
              <Field label="Brand">
                <select value={form.brandId || ""} onChange={(event) => setField("brandId", event.target.value)} disabled={readOnly} className={inputClass(readOnly)}>
                  <option value="">Select brand</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Category">
                <select value={form.categoryId || ""} onChange={(event) => setField("categoryId", event.target.value)} disabled={readOnly} className={inputClass(readOnly)}>
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Tags" hint="Separate tags with commas">
                <input value={tagsValue} onChange={(event) => setField("tags", event.target.value.split(",").map((tag) => tag.trim()))} disabled={readOnly} className={inputClass(readOnly)} />
              </Field>
            </div>
          </section>

          <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
            <h3 className="text-lg font-black text-[#111827]">Media</h3>
            <div className="mt-5 space-y-4">
              <Field label="Thumbnail image">
                <div className="grid gap-3">
                  <MediaPicker label="Choose Thumbnail" folder="products" disabled={readOnly || uploading} onSelect={(item) => addPickedMedia(item, true)} triggerClassName="w-full" />
                  <input type="file" accept=".jpg,.jpeg,.png,.webp,.svg" disabled={readOnly || uploading} onChange={(event) => uploadFiles(event.target.files, true)} className="w-full rounded-xl border border-dashed border-[#d0d5dd] bg-[#f8fafc] p-4 text-sm font-bold text-[#667085]" />
                </div>
              </Field>
              <Field label="Gallery images">
                <div className="grid gap-3">
                  <MediaPicker label="Choose Gallery Images" folder="products" multiple disabled={readOnly || uploading} onSelect={(items) => addPickedMedia(items, false)} triggerClassName="w-full" />
                  <input type="file" multiple accept=".jpg,.jpeg,.png,.webp,.svg" disabled={readOnly || uploading} onChange={(event) => uploadFiles(event.target.files, false)} className="w-full rounded-xl border border-dashed border-[#d0d5dd] bg-[#f8fafc] p-4 text-sm font-bold text-[#667085]" />
                </div>
              </Field>
              {uploading ? <p className="text-sm font-bold text-[#ef3338]">Uploading media...</p> : null}
              <div className="grid grid-cols-2 gap-3">
                {form.images.map((image, index) => (
                  <div key={`${image.url}-${index}`} className={`rounded-2xl border p-2 ${image.isThumbnail ? "border-[#ef3338] bg-red-50" : "border-[#e5e7eb]"}`}>
                    <img src={image.url} alt={image.alt || form.title || "Product"} className="aspect-square w-full rounded-xl object-cover" />
                    <div className="mt-2 flex gap-2">
                      {!readOnly ? (
                        <>
                          <button type="button" onClick={() => markThumbnail(index)} className="flex-1 rounded-lg bg-[#111827] px-2 py-2 text-xs font-black text-white">
                            Thumb
                          </button>
                          <button type="button" onClick={() => removeImage(index)} className="rounded-lg border border-red-200 px-2 py-2 text-xs font-black text-[#ef3338]">
                            Remove
                          </button>
                        </>
                      ) : (
                        <span className="text-xs font-bold text-[#667085]">{image.isThumbnail ? "Thumbnail" : "Gallery"}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
            <h3 className="text-lg font-black text-[#111827]">SEO</h3>
            <div className="mt-5 space-y-5">
              <Field label="SEO title">
                <input value={form.seoTitle || ""} onChange={(event) => setField("seoTitle", event.target.value)} disabled={readOnly} className={inputClass(readOnly)} />
              </Field>
              <Field label="SEO description">
                <textarea value={form.seoDescription || ""} onChange={(event) => setField("seoDescription", event.target.value)} disabled={readOnly} className={`${inputClass(readOnly)} h-24 py-3`} />
              </Field>
              <Field label="SEO keywords">
                <input value={form.seoKeywords || ""} onChange={(event) => setField("seoKeywords", event.target.value)} disabled={readOnly} className={inputClass(readOnly)} />
              </Field>
            </div>
          </section>
        </aside>
      </div>
    </form>
  );
}
