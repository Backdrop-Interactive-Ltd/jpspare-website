"use client";

import { useMemo, useState } from "react";
import MediaPicker from "../components/MediaPicker";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
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

function textareaClass(readOnly) {
  return `min-h-[110px] w-full rounded-xl border border-[#d0d5dd] bg-white px-4 py-3 text-sm font-semibold text-[#111827] outline-none transition focus:border-[#ef3338] focus:ring-4 focus:ring-red-100 ${
    readOnly ? "cursor-not-allowed bg-[#f2f4f7] text-[#667085]" : ""
  }`;
}

function Toggle({ label, checked, onChange, disabled }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`flex h-12 items-center justify-between rounded-xl border px-4 text-sm font-black transition ${
        checked ? "border-red-200 bg-red-50 text-[#ef3338]" : "border-[#d0d5dd] bg-white text-[#344054]"
      } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
    >
      <span>{label}</span>
      <span className={`h-6 w-11 rounded-full p-1 transition ${checked ? "bg-[#ef3338]" : "bg-[#d0d5dd]"}`}>
        <span className={`block size-4 rounded-full bg-white transition ${checked ? "translate-x-5" : ""}`} />
      </span>
    </button>
  );
}

function SectionCard({ eyebrow, title, description, children }) {
  return (
    <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">{eyebrow}</p>
          <h3 className="mt-1 text-xl font-black text-[#111827]">{title}</h3>
          {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-[#667085]">{description}</p> : null}
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function ImageField({ label, value, folder, readOnly, onSelect }) {
  return (
    <div>
      <span className="text-sm font-black text-[#344054]">{label}</span>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <div className="grid size-24 place-items-center overflow-hidden rounded-2xl border border-[#e5e7eb] bg-[#f8fafc]">
          {value ? <img src={value} alt={label} className="h-full w-full object-cover" /> : <span className="text-xs font-bold text-[#98a2b3]">No image</span>}
        </div>
        <div className="min-w-[220px] flex-1">
          <input value={value || ""} onChange={(event) => onSelect(event.target.value)} disabled={readOnly} className={inputClass(readOnly)} placeholder="/uploads/general/image.png" />
          <div className="mt-2">
            <MediaPicker
              label="Choose from Media Library"
              folder={folder}
              disabled={readOnly}
              onSelect={(item) => onSelect(item.url)}
              triggerClassName="!py-2.5"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function OptionPicker({ label, options, selectedIds, disabled, placeholder, onAdd, onRemove, getName = (item) => item.name || item.title }) {
  const available = options.filter((item) => !selectedIds.includes(item.id));
  const selected = selectedIds.map((id) => options.find((item) => item.id === id)).filter(Boolean);

  return (
    <div>
      <span className="text-sm font-black text-[#344054]">{label}</span>
      <div className="mt-2 flex gap-3 max-sm:flex-col">
        <select disabled={disabled} className={inputClass(disabled)} onChange={(event) => event.target.value && onAdd(event.target.value)} value="">
          <option value="">{placeholder}</option>
          {available.map((item) => (
            <option key={item.id} value={item.id}>
              {getName(item)}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {selected.map((item) => (
          <span key={item.id} className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-black text-[#ef3338]">
            {getName(item)}
            {!disabled ? (
              <button type="button" onClick={() => onRemove(item.id)} className="text-[#b42318]">
                x
              </button>
            ) : null}
          </span>
        ))}
        {!selected.length ? <span className="text-sm font-semibold text-[#98a2b3]">No items selected yet.</span> : null}
      </div>
    </div>
  );
}

function linesToArray(value) {
  return String(value || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function arrayToLines(value) {
  return Array.isArray(value) ? value.join("\n") : "";
}

function newSlide() {
  return {
    id: `slide-${Date.now()}`,
    desktopImage: "",
    mobileImage: "",
    alt: "JPSPARE hero banner",
    heading: "",
    subheading: "",
    ctaText: "Shop Now",
    ctaLink: "/",
    active: true,
  };
}

function newPromo() {
  return {
    id: `promo-${Date.now()}`,
    image: "",
    title: "",
    subtitle: "",
    ctaText: "Shop Now",
    ctaLink: "/",
    active: true,
  };
}

export default function HomepageCmsClient({ initialCms, options, canManage }) {
  const [cms, setCms] = useState(() => clone(initialCms));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const readOnly = !canManage;

  const placeholderLines = useMemo(() => arrayToLines(cms.header.searchPlaceholders), [cms.header.searchPlaceholders]);

  function setSection(section, value) {
    setCms((current) => ({ ...current, [section]: { ...current[section], ...value } }));
  }

  function setNested(section, field, value) {
    setSection(section, { [field]: value });
  }

  function setFooterContact(field, value) {
    setCms((current) => ({
      ...current,
      footer: { ...current.footer, contact: { ...current.footer.contact, [field]: value } },
    }));
  }

  function setFooterSocial(field, value) {
    setCms((current) => ({
      ...current,
      footer: { ...current.footer, socialLinks: { ...current.footer.socialLinks, [field]: value } },
    }));
  }

  function updateSlide(index, patch) {
    setCms((current) => ({
      ...current,
      heroSlider: {
        ...current.heroSlider,
        slides: current.heroSlider.slides.map((slide, itemIndex) => (itemIndex === index ? { ...slide, ...patch } : slide)),
      },
    }));
  }

  function moveSlide(index, direction) {
    setCms((current) => {
      const slides = [...current.heroSlider.slides];
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= slides.length) return current;
      [slides[index], slides[nextIndex]] = [slides[nextIndex], slides[index]];
      return { ...current, heroSlider: { ...current.heroSlider, slides } };
    });
  }

  function removeSlide(index) {
    setCms((current) => ({
      ...current,
      heroSlider: { ...current.heroSlider, slides: current.heroSlider.slides.filter((_, itemIndex) => itemIndex !== index) },
    }));
  }

  function updatePromo(index, patch) {
    setCms((current) => ({
      ...current,
      promoBanners: {
        ...current.promoBanners,
        banners: current.promoBanners.banners.map((banner, itemIndex) => (itemIndex === index ? { ...banner, ...patch } : banner)),
      },
    }));
  }

  async function saveCms() {
    if (readOnly) return;
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/homepage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cms),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to save homepage CMS");
      setCms(payload.cms);
      setMessage("Homepage CMS saved successfully.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-[#e5e7eb] bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#ef3338]">Phase 2.5</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#111827]">Dynamic Homepage CMS</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#667085]">
              Manage homepage content, media, SEO, and public display settings from one API-first CMS surface.
            </p>
            {!canManage ? <p className="mt-3 text-sm font-black text-[#ef3338]">Read-only mode for your role.</p> : null}
          </div>
          <button
            type="button"
            onClick={saveCms}
            disabled={saving || readOnly}
            className="h-12 rounded-xl bg-[#ef3338] px-6 text-sm font-black text-white shadow-[0_12px_24px_rgba(239,51,56,0.22)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Homepage"}
          </button>
        </div>
        {message ? <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-[#b42318]">{message}</p> : null}
      </div>

      <SectionCard eyebrow="Announcement" title="Top Announcement Bar" description="Controls the rotating promo bar above the storefront header.">
        <div className="grid gap-5 lg:grid-cols-2">
          <Toggle label="Enable announcement bar" checked={cms.announcement.enabled !== false} disabled={readOnly} onChange={(value) => setNested("announcement", "enabled", value)} />
          <Field label="Primary text">
            <input value={cms.announcement.text || ""} disabled={readOnly} onChange={(event) => setNested("announcement", "text", event.target.value)} className={inputClass(readOnly)} />
          </Field>
          <Field label="Secondary rotating text">
            <input value={cms.announcement.secondaryText || ""} disabled={readOnly} onChange={(event) => setNested("announcement", "secondaryText", event.target.value)} className={inputClass(readOnly)} />
          </Field>
          <Field label="Button text">
            <input value={cms.announcement.buttonText || ""} disabled={readOnly} onChange={(event) => setNested("announcement", "buttonText", event.target.value)} className={inputClass(readOnly)} placeholder="Optional" />
          </Field>
          <Field label="Button link">
            <input value={cms.announcement.buttonLink || ""} disabled={readOnly} onChange={(event) => setNested("announcement", "buttonLink", event.target.value)} className={inputClass(readOnly)} />
          </Field>
        </div>
      </SectionCard>

      <SectionCard eyebrow="Header" title="Header Settings" description="Logo, contact, search rotation texts, and sticky behavior settings.">
        <div className="grid gap-5 lg:grid-cols-2">
          <ImageField label="Header logo" value={cms.header.logo} folder="general" readOnly={readOnly} onSelect={(url) => setNested("header", "logo", url)} />
          <Field label="Contact number">
            <input value={cms.header.contactNumber || ""} disabled={readOnly} onChange={(event) => setNested("header", "contactNumber", event.target.value)} className={inputClass(readOnly)} />
          </Field>
          <Field label="Search placeholder rotating texts" hint="One search phrase per line.">
            <textarea
              value={placeholderLines}
              disabled={readOnly}
              onChange={(event) => setNested("header", "searchPlaceholders", linesToArray(event.target.value))}
              className={textareaClass(readOnly)}
            />
          </Field>
          <div className="space-y-3">
            <Toggle label="Sticky search header" checked={cms.header.stickySearchHeader !== false} disabled={readOnly} onChange={(value) => setNested("header", "stickySearchHeader", value)} />
            <Toggle label="Sticky category header" checked={cms.header.stickyCategoryHeader === true} disabled={readOnly} onChange={(value) => setNested("header", "stickyCategoryHeader", value)} />
          </div>
        </div>
      </SectionCard>

      <SectionCard eyebrow="Hero" title="Hero Banner Slider" description="Create, reorder, and activate responsive homepage slides.">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Toggle label="Enable hero slider" checked={cms.heroSlider.enabled !== false} disabled={readOnly} onChange={(value) => setNested("heroSlider", "enabled", value)} />
          <button
            type="button"
            disabled={readOnly}
            onClick={() => setSection("heroSlider", { slides: [...cms.heroSlider.slides, newSlide()] })}
            className="h-11 rounded-xl border border-red-200 bg-red-50 px-5 text-sm font-black text-[#ef3338] disabled:opacity-60"
          >
            Add Slide
          </button>
        </div>
        <div className="space-y-4">
          {cms.heroSlider.slides.map((slide, index) => (
            <div key={slide.id || index} className="rounded-2xl border border-[#e5e7eb] bg-[#f8fafc] p-4">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-black text-[#111827]">Slide {index + 1}</p>
                <div className="flex gap-2">
                  <button type="button" disabled={readOnly} onClick={() => moveSlide(index, -1)} className="h-9 rounded-lg border border-[#d0d5dd] px-3 text-xs font-black">Up</button>
                  <button type="button" disabled={readOnly} onClick={() => moveSlide(index, 1)} className="h-9 rounded-lg border border-[#d0d5dd] px-3 text-xs font-black">Down</button>
                  <button type="button" disabled={readOnly} onClick={() => removeSlide(index)} className="h-9 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-black text-[#ef3338]">Delete</button>
                </div>
              </div>
              <div className="grid gap-5 lg:grid-cols-2">
                <ImageField label="Desktop image" value={slide.desktopImage} folder="general" readOnly={readOnly} onSelect={(url) => updateSlide(index, { desktopImage: url })} />
                <ImageField label="Mobile image" value={slide.mobileImage} folder="general" readOnly={readOnly} onSelect={(url) => updateSlide(index, { mobileImage: url })} />
                {["heading", "subheading", "ctaText", "ctaLink", "alt"].map((field) => (
                  <Field key={field} label={field.replace(/([A-Z])/g, " $1")}>
                    <input value={slide[field] || ""} disabled={readOnly} onChange={(event) => updateSlide(index, { [field]: event.target.value })} className={inputClass(readOnly)} />
                  </Field>
                ))}
                <Toggle label="Active slide" checked={slide.active !== false} disabled={readOnly} onChange={(value) => updateSlide(index, { active: value })} />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard eyebrow="Categories" title="Featured Categories Section">
          <div className="space-y-5">
            <Toggle label="Enable featured categories" checked={cms.featuredCategories.enabled !== false} disabled={readOnly} onChange={(value) => setNested("featuredCategories", "enabled", value)} />
            <OptionPicker
              label="Selected categories"
              options={options.categories}
              selectedIds={cms.featuredCategories.categoryIds || []}
              disabled={readOnly}
              placeholder="Add category"
              onAdd={(id) => setNested("featuredCategories", "categoryIds", [...(cms.featuredCategories.categoryIds || []), id])}
              onRemove={(id) => setNested("featuredCategories", "categoryIds", (cms.featuredCategories.categoryIds || []).filter((item) => item !== id))}
            />
          </div>
        </SectionCard>

        <SectionCard eyebrow="Products" title="Featured Products Section">
          <div className="space-y-5">
            <Toggle label="Enable featured products" checked={cms.featuredProducts.enabled !== false} disabled={readOnly} onChange={(value) => setNested("featuredProducts", "enabled", value)} />
            <Toggle label="Prefer featured products" checked={cms.featuredProducts.featuredOnly !== false} disabled={readOnly} onChange={(value) => setNested("featuredProducts", "featuredOnly", value)} />
            <Field label="Product limit">
              <input type="number" min="1" max="60" value={cms.featuredProducts.limit || 20} disabled={readOnly} onChange={(event) => setNested("featuredProducts", "limit", event.target.value)} className={inputClass(readOnly)} />
            </Field>
            <OptionPicker
              label="Manual product picks"
              options={options.products}
              selectedIds={cms.featuredProducts.productIds || []}
              disabled={readOnly}
              placeholder="Add product"
              getName={(item) => item.title}
              onAdd={(id) => setNested("featuredProducts", "productIds", [...(cms.featuredProducts.productIds || []), id])}
              onRemove={(id) => setNested("featuredProducts", "productIds", (cms.featuredProducts.productIds || []).filter((item) => item !== id))}
            />
          </div>
        </SectionCard>
      </div>

      <SectionCard eyebrow="Promos" title="Promo Banner Section" description="Upload promotional banners with CTA links.">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Toggle label="Enable promo banners" checked={cms.promoBanners.enabled !== false} disabled={readOnly} onChange={(value) => setNested("promoBanners", "enabled", value)} />
          <button
            type="button"
            disabled={readOnly}
            onClick={() => setSection("promoBanners", { banners: [...(cms.promoBanners.banners || []), newPromo()] })}
            className="h-11 rounded-xl border border-red-200 bg-red-50 px-5 text-sm font-black text-[#ef3338] disabled:opacity-60"
          >
            Add Banner
          </button>
        </div>
        <div className="space-y-4">
          {(cms.promoBanners.banners || []).map((banner, index) => (
            <div key={banner.id || index} className="rounded-2xl border border-[#e5e7eb] bg-[#f8fafc] p-4">
              <div className="mb-4 flex justify-between">
                <p className="text-sm font-black text-[#111827]">Promo {index + 1}</p>
                <button type="button" disabled={readOnly} onClick={() => setSection("promoBanners", { banners: cms.promoBanners.banners.filter((_, itemIndex) => itemIndex !== index) })} className="text-xs font-black text-[#ef3338]">
                  Delete
                </button>
              </div>
              <div className="grid gap-5 lg:grid-cols-2">
                <ImageField label="Banner image" value={banner.image} folder="general" readOnly={readOnly} onSelect={(url) => updatePromo(index, { image: url })} />
                {["title", "subtitle", "ctaText", "ctaLink"].map((field) => (
                  <Field key={field} label={field.replace(/([A-Z])/g, " $1")}>
                    <input value={banner[field] || ""} disabled={readOnly} onChange={(event) => updatePromo(index, { [field]: event.target.value })} className={inputClass(readOnly)} />
                  </Field>
                ))}
                <Toggle label="Active banner" checked={banner.active !== false} disabled={readOnly} onChange={(value) => updatePromo(index, { active: value })} />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard eyebrow="Brands" title="Brand Showcase">
        <div className="space-y-5">
          <Toggle label="Enable brand showcase" checked={cms.brandShowcase.enabled !== false} disabled={readOnly} onChange={(value) => setNested("brandShowcase", "enabled", value)} />
          <Toggle label="Auto slider ready" checked={cms.brandShowcase.autoSlider !== false} disabled={readOnly} onChange={(value) => setNested("brandShowcase", "autoSlider", value)} />
          <OptionPicker
            label="Featured brands"
            options={options.brands}
            selectedIds={cms.brandShowcase.brandIds || []}
            disabled={readOnly}
            placeholder="Add brand"
            onAdd={(id) => setNested("brandShowcase", "brandIds", [...(cms.brandShowcase.brandIds || []), id])}
            onRemove={(id) => setNested("brandShowcase", "brandIds", (cms.brandShowcase.brandIds || []).filter((item) => item !== id))}
          />
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard eyebrow="SEO" title="Homepage SEO">
          <div className="space-y-5">
            <Field label="Meta title">
              <input value={cms.seo.metaTitle || ""} disabled={readOnly} onChange={(event) => setNested("seo", "metaTitle", event.target.value)} className={inputClass(readOnly)} />
            </Field>
            <Field label="Meta description">
              <textarea value={cms.seo.metaDescription || ""} disabled={readOnly} onChange={(event) => setNested("seo", "metaDescription", event.target.value)} className={textareaClass(readOnly)} />
            </Field>
            <Field label="Keywords">
              <input value={cms.seo.keywords || ""} disabled={readOnly} onChange={(event) => setNested("seo", "keywords", event.target.value)} className={inputClass(readOnly)} />
            </Field>
            <ImageField label="OG image" value={cms.seo.ogImage} folder="general" readOnly={readOnly} onSelect={(url) => setNested("seo", "ogImage", url)} />
          </div>
        </SectionCard>

        <SectionCard eyebrow="Footer" title="Footer CMS">
          <div className="space-y-5">
            <ImageField label="Footer logo" value={cms.footer.footerLogo} folder="general" readOnly={readOnly} onSelect={(url) => setNested("footer", "footerLogo", url)} />
            <Field label="About text">
              <textarea value={cms.footer.aboutText || ""} disabled={readOnly} onChange={(event) => setNested("footer", "aboutText", event.target.value)} className={textareaClass(readOnly)} />
            </Field>
            <Field label="Copyright text">
              <input value={cms.footer.copyrightText || ""} disabled={readOnly} onChange={(event) => setNested("footer", "copyrightText", event.target.value)} className={inputClass(readOnly)} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Phone">
                <input value={cms.footer.contact?.phone || ""} disabled={readOnly} onChange={(event) => setFooterContact("phone", event.target.value)} className={inputClass(readOnly)} />
              </Field>
              <Field label="Email">
                <input value={cms.footer.contact?.email || ""} disabled={readOnly} onChange={(event) => setFooterContact("email", event.target.value)} className={inputClass(readOnly)} />
              </Field>
              <Field label="Address">
                <input value={cms.footer.contact?.address || ""} disabled={readOnly} onChange={(event) => setFooterContact("address", event.target.value)} className={inputClass(readOnly)} />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {["facebook", "instagram", "youtube"].map((field) => (
                <Field key={field} label={field}>
                  <input value={cms.footer.socialLinks?.[field] || ""} disabled={readOnly} onChange={(event) => setFooterSocial(field, event.target.value)} className={inputClass(readOnly)} />
                </Field>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
