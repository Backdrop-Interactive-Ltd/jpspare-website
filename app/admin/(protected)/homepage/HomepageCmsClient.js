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
  return `h-12 w-full rounded-xl border border-[#d0d5dd] bg-white px-4 text-sm font-semibold text-[#111827] outline-none transition hover:border-[#ff6268] focus:border-[#ff6268] focus:ring-0 ${
    readOnly ? "cursor-not-allowed bg-[#f2f4f7] text-[#667085]" : ""
  }`;
}

function textareaClass(readOnly) {
  return `min-h-[110px] w-full rounded-xl border border-[#d0d5dd] bg-white px-4 py-3 text-sm font-semibold text-[#111827] outline-none transition hover:border-[#ff6268] focus:border-[#ff6268] focus:ring-0 ${
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

function SectionCard({ eyebrow, title, description, action, children }) {
  return (
    <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">{eyebrow}</p>
          <h3 className="mt-1 text-xl font-black text-[#111827]">{title}</h3>
          {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-[#667085]">{description}</p> : null}
        </div>
        {action}
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

function newNavItem() {
  return {
    label: "New Link",
    href: "/",
    enabled: true,
    hasMenu: false,
    sortOrder: 999,
  };
}

function newFooterLink() {
  return {
    label: "New Link",
    href: "/",
    enabled: true,
    sortOrder: 999,
  };
}

function newMegaMenuFeature() {
  return {
    icon: "tag",
    title: "New Feature",
    subtitle: "",
    enabled: true,
    sortOrder: 999,
  };
}

function newMegaMenuBrand() {
  return {
    label: "New Brand",
    href: "/brands",
    logo: "",
    enabled: true,
    sortOrder: 999,
  };
}

function newMegaMenuCategoryRailItem() {
  return {
    key: `category-${Date.now()}`,
    label: "New Category",
    icon: "package",
    enabled: true,
    sortOrder: 999,
  };
}

function newAboutStat() {
  return {
    value: "New",
    label: "New stat",
    enabled: true,
    sortOrder: 999,
  };
}

function newAboutMilestone() {
  return {
    number: "2026",
    title: "New milestone",
    body: "",
    enabled: true,
    sortOrder: 999,
  };
}

function newAboutValue() {
  return {
    title: "New value",
    body: "",
    icon: "shield",
    enabled: true,
    sortOrder: 999,
  };
}

function newPrivacyStat() {
  return {
    value: "New",
    label: "New stat",
    enabled: true,
    sortOrder: 999,
  };
}

function newPrivacyPolicyCard() {
  return {
    title: "New policy section",
    body: "",
    bullets: [],
    enabled: true,
    sortOrder: 999,
  };
}

function newPrivacyPrinciple() {
  return {
    title: "New principle",
    description: "",
    icon: "shield",
    enabled: true,
    sortOrder: 999,
  };
}

function FooterLinksEditor({ title, items, readOnly, onAdd, onUpdate, onRemove, onMove }) {
  const links = Array.isArray(items) ? items : [];

  return (
    <div className="rounded-2xl border border-[#eef0f3] bg-[#fafbfc] p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#ef3338]">{title}</p>
        <button
          type="button"
          disabled={readOnly}
          onClick={onAdd}
          className="h-9 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-black text-[#ef3338] disabled:opacity-60"
        >
          Add Item
        </button>
      </div>
      <div className="space-y-3">
        {links.map((item, index) => (
          <div key={`${title}-${item.label}-${index}`} className="rounded-xl border border-[#e5e7eb] bg-white p-3">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-black text-[#667085]">Link {index + 1}</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" disabled={readOnly || index === 0} onClick={() => onMove(index, -1)} className="h-8 rounded-lg border border-[#d0d5dd] px-3 text-xs font-black disabled:opacity-50">
                  Up
                </button>
                <button type="button" disabled={readOnly || index === links.length - 1} onClick={() => onMove(index, 1)} className="h-8 rounded-lg border border-[#d0d5dd] px-3 text-xs font-black disabled:opacity-50">
                  Down
                </button>
                <button type="button" disabled={readOnly} onClick={() => onRemove(index)} className="h-8 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-black text-[#ef3338] disabled:opacity-50">
                  Delete
                </button>
              </div>
            </div>
            <div className="grid gap-3 lg:grid-cols-[1fr_1.4fr_120px]">
              <Field label="Label">
                <input value={item.label || ""} disabled={readOnly} onChange={(event) => onUpdate(index, { label: event.target.value })} className={inputClass(readOnly)} />
              </Field>
              <Field label="Link">
                <input value={item.href || ""} disabled={readOnly} onChange={(event) => onUpdate(index, { href: event.target.value })} className={inputClass(readOnly)} />
              </Field>
              <Field label="Sort order">
                <input type="number" value={item.sortOrder ?? (index + 1) * 10} disabled={readOnly} onChange={(event) => onUpdate(index, { sortOrder: Number(event.target.value) })} className={inputClass(readOnly)} />
              </Field>
            </div>
            <div className="mt-3">
              <Toggle label="Enabled" checked={item.enabled !== false} disabled={readOnly} onChange={(value) => onUpdate(index, { enabled: value })} />
            </div>
          </div>
        ))}
        {!links.length ? <p className="rounded-xl border border-dashed border-[#d0d5dd] bg-white p-4 text-sm font-bold text-[#667085]">No links yet.</p> : null}
      </div>
    </div>
  );
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

  function setFooterBranding(field, value) {
    const legacyFieldMap = {
      logo: "footerLogo",
      about: "aboutText",
      copyright: "copyrightText",
    };
    const legacyField = legacyFieldMap[field];

    setCms((current) => ({
      ...current,
      footer: {
        ...current.footer,
        [field]: value,
        ...(legacyField ? { [legacyField]: value } : {}),
      },
    }));
  }

  function setFooterContact(field, value) {
    setCms((current) => ({
      ...current,
      footer: {
        ...current.footer,
        contacts: { ...current.footer.contacts, [field]: value },
        contact: { ...current.footer.contact, [field]: value },
      },
    }));
  }

  function setFooterSocial(field, value) {
    setCms((current) => ({
      ...current,
      footer: {
        ...current.footer,
        socials: { ...current.footer.socials, [field]: value },
        socialLinks: { ...current.footer.socialLinks, [field]: value },
      },
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

  function updateNavItem(index, patch) {
    setCms((current) => ({
      ...current,
      navigation: {
        ...current.navigation,
        main: (current.navigation?.main || []).map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
      },
    }));
  }

  function addNavItem() {
    setCms((current) => ({
      ...current,
      navigation: {
        ...current.navigation,
        main: [...(current.navigation?.main || []), newNavItem()],
      },
    }));
  }

  function removeNavItem(index) {
    setCms((current) => ({
      ...current,
      navigation: {
        ...current.navigation,
        main: (current.navigation?.main || []).filter((_, itemIndex) => itemIndex !== index),
      },
    }));
  }

  function moveNavItem(index, direction) {
    setCms((current) => {
      const items = [...(current.navigation?.main || [])];
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= items.length) return current;
      [items[index], items[nextIndex]] = [items[nextIndex], items[index]];
      const reordered = items.map((item, itemIndex) => ({ ...item, sortOrder: (itemIndex + 1) * 10 }));
      return {
        ...current,
        navigation: {
          ...current.navigation,
          main: reordered,
        },
      };
    });
  }

  function updateMegaMenuSection(section, patch) {
    setCms((current) => ({
      ...current,
      navigation: {
        ...current.navigation,
        megaMenu: {
          ...current.navigation?.megaMenu,
          [section]: {
            ...current.navigation?.megaMenu?.[section],
            ...patch,
          },
        },
      },
    }));
  }

  function updateMegaMenuFeature(index, patch) {
    setCms((current) => ({
      ...current,
      navigation: {
        ...current.navigation,
        megaMenu: {
          ...current.navigation?.megaMenu,
          featureCards: (current.navigation?.megaMenu?.featureCards || []).map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
        },
      },
    }));
  }

  function addMegaMenuFeature() {
    setCms((current) => ({
      ...current,
      navigation: {
        ...current.navigation,
        megaMenu: {
          ...current.navigation?.megaMenu,
          featureCards: [...(current.navigation?.megaMenu?.featureCards || []), newMegaMenuFeature()],
        },
      },
    }));
  }

  function removeMegaMenuFeature(index) {
    setCms((current) => ({
      ...current,
      navigation: {
        ...current.navigation,
        megaMenu: {
          ...current.navigation?.megaMenu,
          featureCards: (current.navigation?.megaMenu?.featureCards || []).filter((_, itemIndex) => itemIndex !== index),
        },
      },
    }));
  }

  function moveMegaMenuFeature(index, direction) {
    setCms((current) => {
      const items = [...(current.navigation?.megaMenu?.featureCards || [])];
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= items.length) return current;
      [items[index], items[nextIndex]] = [items[nextIndex], items[index]];
      const reordered = items.map((item, itemIndex) => ({ ...item, sortOrder: (itemIndex + 1) * 10 }));
      return {
        ...current,
        navigation: {
          ...current.navigation,
          megaMenu: {
            ...current.navigation?.megaMenu,
            featureCards: reordered,
          },
        },
      };
    });
  }

  function updateMegaMenuBrand(index, patch) {
    setCms((current) => ({
      ...current,
      navigation: {
        ...current.navigation,
        megaMenu: {
          ...current.navigation?.megaMenu,
          featuredBrands: (current.navigation?.megaMenu?.featuredBrands || []).map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
        },
      },
    }));
  }

  function addMegaMenuBrand() {
    setCms((current) => ({
      ...current,
      navigation: {
        ...current.navigation,
        megaMenu: {
          ...current.navigation?.megaMenu,
          featuredBrands: [...(current.navigation?.megaMenu?.featuredBrands || []), newMegaMenuBrand()],
        },
      },
    }));
  }

  function removeMegaMenuBrand(index) {
    setCms((current) => ({
      ...current,
      navigation: {
        ...current.navigation,
        megaMenu: {
          ...current.navigation?.megaMenu,
          featuredBrands: (current.navigation?.megaMenu?.featuredBrands || []).filter((_, itemIndex) => itemIndex !== index),
        },
      },
    }));
  }

  function moveMegaMenuBrand(index, direction) {
    setCms((current) => {
      const items = [...(current.navigation?.megaMenu?.featuredBrands || [])];
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= items.length) return current;
      [items[index], items[nextIndex]] = [items[nextIndex], items[index]];
      const reordered = items.map((item, itemIndex) => ({ ...item, sortOrder: (itemIndex + 1) * 10 }));
      return {
        ...current,
        navigation: {
          ...current.navigation,
          megaMenu: {
            ...current.navigation?.megaMenu,
            featuredBrands: reordered,
          },
        },
      };
    });
  }

  function updateMegaMenuCategoryRailItem(index, patch) {
    setCms((current) => ({
      ...current,
      navigation: {
        ...current.navigation,
        megaMenu: {
          ...current.navigation?.megaMenu,
          categoryRail: (current.navigation?.megaMenu?.categoryRail || []).map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
        },
      },
    }));
  }

  function addMegaMenuCategoryRailItem() {
    setCms((current) => ({
      ...current,
      navigation: {
        ...current.navigation,
        megaMenu: {
          ...current.navigation?.megaMenu,
          categoryRail: [...(current.navigation?.megaMenu?.categoryRail || []), newMegaMenuCategoryRailItem()],
        },
      },
    }));
  }

  function removeMegaMenuCategoryRailItem(index) {
    setCms((current) => ({
      ...current,
      navigation: {
        ...current.navigation,
        megaMenu: {
          ...current.navigation?.megaMenu,
          categoryRail: (current.navigation?.megaMenu?.categoryRail || []).filter((_, itemIndex) => itemIndex !== index),
        },
      },
    }));
  }

  function moveMegaMenuCategoryRailItem(index, direction) {
    setCms((current) => {
      const items = [...(current.navigation?.megaMenu?.categoryRail || [])];
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= items.length) return current;
      [items[index], items[nextIndex]] = [items[nextIndex], items[index]];
      const reordered = items.map((item, itemIndex) => ({ ...item, sortOrder: (itemIndex + 1) * 10 }));
      return {
        ...current,
        navigation: {
          ...current.navigation,
          megaMenu: {
            ...current.navigation?.megaMenu,
            categoryRail: reordered,
          },
        },
      };
    });
  }

  function updateFooterLink(group, index, patch) {
    setCms((current) => ({
      ...current,
      footer: {
        ...current.footer,
        [group]: (current.footer?.[group] || []).map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
      },
    }));
  }

  function addFooterLink(group) {
    setCms((current) => ({
      ...current,
      footer: {
        ...current.footer,
        [group]: [...(current.footer?.[group] || []), newFooterLink()],
      },
    }));
  }

  function removeFooterLink(group, index) {
    setCms((current) => ({
      ...current,
      footer: {
        ...current.footer,
        [group]: (current.footer?.[group] || []).filter((_, itemIndex) => itemIndex !== index),
      },
    }));
  }

  function moveFooterLink(group, index, direction) {
    setCms((current) => {
      const items = [...(current.footer?.[group] || [])];
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= items.length) return current;
      [items[index], items[nextIndex]] = [items[nextIndex], items[index]];
      const reordered = items.map((item, itemIndex) => ({ ...item, sortOrder: (itemIndex + 1) * 10 }));
      return {
        ...current,
        footer: {
          ...current.footer,
          [group]: reordered,
        },
      };
    });
  }

  function updateAboutSection(section, patch) {
    setCms((current) => ({
      ...current,
      sitePages: {
        ...current.sitePages,
        about: {
          ...current.sitePages?.about,
          [section]: {
            ...current.sitePages?.about?.[section],
            ...patch,
          },
        },
      },
    }));
  }

  function updateAboutStat(index, patch) {
    setCms((current) => ({
      ...current,
      sitePages: {
        ...current.sitePages,
        about: {
          ...current.sitePages?.about,
          stats: (current.sitePages?.about?.stats || []).map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
        },
      },
    }));
  }

  function addAboutStat() {
    setCms((current) => ({
      ...current,
      sitePages: {
        ...current.sitePages,
        about: {
          ...current.sitePages?.about,
          stats: [...(current.sitePages?.about?.stats || []), newAboutStat()],
        },
      },
    }));
  }

  function removeAboutStat(index) {
    setCms((current) => ({
      ...current,
      sitePages: {
        ...current.sitePages,
        about: {
          ...current.sitePages?.about,
          stats: (current.sitePages?.about?.stats || []).filter((_, itemIndex) => itemIndex !== index),
        },
      },
    }));
  }

  function moveAboutStat(index, direction) {
    setCms((current) => {
      const items = [...(current.sitePages?.about?.stats || [])];
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= items.length) return current;
      [items[index], items[nextIndex]] = [items[nextIndex], items[index]];
      const reordered = items.map((item, itemIndex) => ({ ...item, sortOrder: (itemIndex + 1) * 10 }));
      return {
        ...current,
        sitePages: {
          ...current.sitePages,
          about: {
            ...current.sitePages?.about,
            stats: reordered,
          },
        },
      };
    });
  }

  function updateAboutMilestone(index, patch) {
    setCms((current) => ({
      ...current,
      sitePages: {
        ...current.sitePages,
        about: {
          ...current.sitePages?.about,
          story: {
            ...current.sitePages?.about?.story,
            milestones: (current.sitePages?.about?.story?.milestones || []).map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
          },
        },
      },
    }));
  }

  function addAboutMilestone() {
    setCms((current) => ({
      ...current,
      sitePages: {
        ...current.sitePages,
        about: {
          ...current.sitePages?.about,
          story: {
            ...current.sitePages?.about?.story,
            milestones: [...(current.sitePages?.about?.story?.milestones || []), newAboutMilestone()],
          },
        },
      },
    }));
  }

  function removeAboutMilestone(index) {
    setCms((current) => ({
      ...current,
      sitePages: {
        ...current.sitePages,
        about: {
          ...current.sitePages?.about,
          story: {
            ...current.sitePages?.about?.story,
            milestones: (current.sitePages?.about?.story?.milestones || []).filter((_, itemIndex) => itemIndex !== index),
          },
        },
      },
    }));
  }

  function moveAboutMilestone(index, direction) {
    setCms((current) => {
      const items = [...(current.sitePages?.about?.story?.milestones || [])];
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= items.length) return current;
      [items[index], items[nextIndex]] = [items[nextIndex], items[index]];
      const reordered = items.map((item, itemIndex) => ({ ...item, sortOrder: (itemIndex + 1) * 10 }));
      return {
        ...current,
        sitePages: {
          ...current.sitePages,
          about: {
            ...current.sitePages?.about,
            story: {
              ...current.sitePages?.about?.story,
              milestones: reordered,
            },
          },
        },
      };
    });
  }

  function updateAboutValue(index, patch) {
    setCms((current) => ({
      ...current,
      sitePages: {
        ...current.sitePages,
        about: {
          ...current.sitePages?.about,
          values: (current.sitePages?.about?.values || []).map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
        },
      },
    }));
  }

  function addAboutValue() {
    setCms((current) => ({
      ...current,
      sitePages: {
        ...current.sitePages,
        about: {
          ...current.sitePages?.about,
          values: [...(current.sitePages?.about?.values || []), newAboutValue()],
        },
      },
    }));
  }

  function removeAboutValue(index) {
    setCms((current) => ({
      ...current,
      sitePages: {
        ...current.sitePages,
        about: {
          ...current.sitePages?.about,
          values: (current.sitePages?.about?.values || []).filter((_, itemIndex) => itemIndex !== index),
        },
      },
    }));
  }

  function moveAboutValue(index, direction) {
    setCms((current) => {
      const items = [...(current.sitePages?.about?.values || [])];
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= items.length) return current;
      [items[index], items[nextIndex]] = [items[nextIndex], items[index]];
      const reordered = items.map((item, itemIndex) => ({ ...item, sortOrder: (itemIndex + 1) * 10 }));
      return {
        ...current,
        sitePages: {
          ...current.sitePages,
          about: {
            ...current.sitePages?.about,
            values: reordered,
          },
        },
      };
    });
  }

  function updatePrivacySection(section, patch) {
    setCms((current) => ({
      ...current,
      sitePages: {
        ...current.sitePages,
        privacyPolicy: {
          ...current.sitePages?.privacyPolicy,
          [section]: {
            ...current.sitePages?.privacyPolicy?.[section],
            ...patch,
          },
        },
      },
    }));
  }

  function updatePrivacyPrinciplesSection(patch) {
    updatePrivacySection("principles", patch);
  }

  function updatePrivacyStat(index, patch) {
    setCms((current) => ({
      ...current,
      sitePages: {
        ...current.sitePages,
        privacyPolicy: {
          ...current.sitePages?.privacyPolicy,
          stats: (current.sitePages?.privacyPolicy?.stats || []).map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
        },
      },
    }));
  }

  function addPrivacyStat() {
    setCms((current) => ({
      ...current,
      sitePages: {
        ...current.sitePages,
        privacyPolicy: {
          ...current.sitePages?.privacyPolicy,
          stats: [...(current.sitePages?.privacyPolicy?.stats || []), newPrivacyStat()],
        },
      },
    }));
  }

  function removePrivacyStat(index) {
    setCms((current) => ({
      ...current,
      sitePages: {
        ...current.sitePages,
        privacyPolicy: {
          ...current.sitePages?.privacyPolicy,
          stats: (current.sitePages?.privacyPolicy?.stats || []).filter((_, itemIndex) => itemIndex !== index),
        },
      },
    }));
  }

  function movePrivacyStat(index, direction) {
    setCms((current) => {
      const items = [...(current.sitePages?.privacyPolicy?.stats || [])];
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= items.length) return current;
      [items[index], items[nextIndex]] = [items[nextIndex], items[index]];
      const reordered = items.map((item, itemIndex) => ({ ...item, sortOrder: (itemIndex + 1) * 10 }));
      return {
        ...current,
        sitePages: {
          ...current.sitePages,
          privacyPolicy: {
            ...current.sitePages?.privacyPolicy,
            stats: reordered,
          },
        },
      };
    });
  }

  function updatePrivacyPolicyCard(index, patch) {
    setCms((current) => ({
      ...current,
      sitePages: {
        ...current.sitePages,
        privacyPolicy: {
          ...current.sitePages?.privacyPolicy,
          policyCards: (current.sitePages?.privacyPolicy?.policyCards || []).map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
        },
      },
    }));
  }

  function addPrivacyPolicyCard() {
    setCms((current) => ({
      ...current,
      sitePages: {
        ...current.sitePages,
        privacyPolicy: {
          ...current.sitePages?.privacyPolicy,
          policyCards: [...(current.sitePages?.privacyPolicy?.policyCards || []), newPrivacyPolicyCard()],
        },
      },
    }));
  }

  function removePrivacyPolicyCard(index) {
    setCms((current) => ({
      ...current,
      sitePages: {
        ...current.sitePages,
        privacyPolicy: {
          ...current.sitePages?.privacyPolicy,
          policyCards: (current.sitePages?.privacyPolicy?.policyCards || []).filter((_, itemIndex) => itemIndex !== index),
        },
      },
    }));
  }

  function movePrivacyPolicyCard(index, direction) {
    setCms((current) => {
      const items = [...(current.sitePages?.privacyPolicy?.policyCards || [])];
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= items.length) return current;
      [items[index], items[nextIndex]] = [items[nextIndex], items[index]];
      const reordered = items.map((item, itemIndex) => ({ ...item, sortOrder: (itemIndex + 1) * 10 }));
      return {
        ...current,
        sitePages: {
          ...current.sitePages,
          privacyPolicy: {
            ...current.sitePages?.privacyPolicy,
            policyCards: reordered,
          },
        },
      };
    });
  }

  function updatePrivacyPrinciple(index, patch) {
    setCms((current) => ({
      ...current,
      sitePages: {
        ...current.sitePages,
        privacyPolicy: {
          ...current.sitePages?.privacyPolicy,
          principles: {
            ...current.sitePages?.privacyPolicy?.principles,
            items: (current.sitePages?.privacyPolicy?.principles?.items || []).map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
          },
        },
      },
    }));
  }

  function addPrivacyPrinciple() {
    setCms((current) => ({
      ...current,
      sitePages: {
        ...current.sitePages,
        privacyPolicy: {
          ...current.sitePages?.privacyPolicy,
          principles: {
            ...current.sitePages?.privacyPolicy?.principles,
            items: [...(current.sitePages?.privacyPolicy?.principles?.items || []), newPrivacyPrinciple()],
          },
        },
      },
    }));
  }

  function removePrivacyPrinciple(index) {
    setCms((current) => ({
      ...current,
      sitePages: {
        ...current.sitePages,
        privacyPolicy: {
          ...current.sitePages?.privacyPolicy,
          principles: {
            ...current.sitePages?.privacyPolicy?.principles,
            items: (current.sitePages?.privacyPolicy?.principles?.items || []).filter((_, itemIndex) => itemIndex !== index),
          },
        },
      },
    }));
  }

  function movePrivacyPrinciple(index, direction) {
    setCms((current) => {
      const items = [...(current.sitePages?.privacyPolicy?.principles?.items || [])];
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= items.length) return current;
      [items[index], items[nextIndex]] = [items[nextIndex], items[index]];
      const reordered = items.map((item, itemIndex) => ({ ...item, sortOrder: (itemIndex + 1) * 10 }));
      return {
        ...current,
        sitePages: {
          ...current.sitePages,
          privacyPolicy: {
            ...current.sitePages?.privacyPolicy,
            principles: {
              ...current.sitePages?.privacyPolicy?.principles,
              items: reordered,
            },
          },
        },
      };
    });
  }

  async function saveCms(label = "Homepage CMS") {
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
      setMessage(`${label} saved successfully.`);
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
        </div>
        {message ? <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-[#b42318]">{message}</p> : null}
      </div>

      <SectionCard
        eyebrow="Announcement"
        title="Top Deal Header"
        description="Controls the rotating promo bar above the storefront header."
        action={
          <button
            type="button"
            onClick={() => saveCms("Top Deal Header")}
            disabled={saving || readOnly}
            className="h-11 rounded-xl bg-[#ef3338] px-5 text-sm font-black text-white shadow-[0_12px_24px_rgba(239,51,56,0.22)] transition hover:bg-[#d71920] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Top Header"}
          </button>
        }
      >
        <div className="rounded-2xl border border-[#eef0f3] bg-[#fafbfc] p-4">
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr_220px]">
            <Field label="Primary text">
              <input value={cms.announcement.text || ""} disabled={readOnly} onChange={(event) => setNested("announcement", "text", event.target.value)} className={inputClass(readOnly)} />
            </Field>
            <Field label="Secondary rotating text">
              <input value={cms.announcement.secondaryText || ""} disabled={readOnly} onChange={(event) => setNested("announcement", "secondaryText", event.target.value)} className={inputClass(readOnly)} />
            </Field>
            <Field label="Time interval">
              <div className={`flex h-12 overflow-hidden rounded-xl border border-[#d0d5dd] bg-white transition hover:border-[#ff6268] focus-within:border-[#ff6268] ${readOnly ? "bg-[#f2f4f7]" : ""}`}>
                <input
                  type="number"
                  min="2.5"
                  max="30"
                  step="0.5"
                  value={(Number(cms.announcement.rotationIntervalMs) || 10450) / 1000}
                  disabled={readOnly}
                  onChange={(event) => setNested("announcement", "rotationIntervalMs", Math.round(Number(event.target.value) * 1000))}
                  className="h-full min-w-0 flex-1 bg-transparent px-4 text-sm font-semibold text-[#111827] outline-none disabled:cursor-not-allowed disabled:text-[#667085]"
                />
                <span className="grid w-12 place-items-center border-l border-[#d0d5dd] bg-[#f8fafc] text-xs font-black text-[#667085]">sec</span>
              </div>
            </Field>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
            <Field label="Button text">
              <input value={cms.announcement.buttonText || ""} disabled={readOnly} onChange={(event) => setNested("announcement", "buttonText", event.target.value)} className={inputClass(readOnly)} placeholder="Optional" />
            </Field>
            <Field label="Button link">
              <input value={cms.announcement.buttonLink || ""} disabled={readOnly} onChange={(event) => setNested("announcement", "buttonLink", event.target.value)} className={inputClass(readOnly)} />
            </Field>
            <Toggle label="Enabled" checked={cms.announcement.enabled !== false} disabled={readOnly} onChange={(value) => setNested("announcement", "enabled", value)} />
          </div>
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

      <SectionCard
        eyebrow="Navigation"
        title="Main Navigation"
        description="Manage the header navigation data saved in CMS. Storefront rendering will be connected in a later task."
        action={
          <button
            type="button"
            onClick={() => saveCms("Main Navigation")}
            disabled={saving || readOnly}
            className="h-11 rounded-xl bg-[#ef3338] px-5 text-sm font-black text-white shadow-[0_12px_24px_rgba(239,51,56,0.22)] transition hover:bg-[#d71920] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Navigation"}
          </button>
        }
      >
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-[#667085]">
            Edit label, link, visibility, menu flag, and display order for main header nav items.
          </p>
          <button
            type="button"
            disabled={readOnly}
            onClick={addNavItem}
            className="h-11 rounded-xl border border-red-200 bg-red-50 px-5 text-sm font-black text-[#ef3338] disabled:opacity-60"
          >
            Add Nav Item
          </button>
        </div>
        <div className="space-y-4">
          {(cms.navigation?.main || []).map((item, index) => (
            <div key={`${item.label}-${index}`} className="rounded-2xl border border-[#e5e7eb] bg-[#f8fafc] p-4">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-black text-[#111827]">Nav Item {index + 1}</p>
                <div className="flex flex-wrap gap-2">
                  <button type="button" disabled={readOnly || index === 0} onClick={() => moveNavItem(index, -1)} className="h-9 rounded-lg border border-[#d0d5dd] px-3 text-xs font-black disabled:opacity-50">
                    Up
                  </button>
                  <button type="button" disabled={readOnly || index === (cms.navigation?.main || []).length - 1} onClick={() => moveNavItem(index, 1)} className="h-9 rounded-lg border border-[#d0d5dd] px-3 text-xs font-black disabled:opacity-50">
                    Down
                  </button>
                  <button type="button" disabled={readOnly} onClick={() => removeNavItem(index)} className="h-9 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-black text-[#ef3338] disabled:opacity-50">
                    Delete
                  </button>
                </div>
              </div>
              <div className="grid gap-4 lg:grid-cols-[1.1fr_1.6fr_140px]">
                <Field label="Label">
                  <input value={item.label || ""} disabled={readOnly} onChange={(event) => updateNavItem(index, { label: event.target.value })} className={inputClass(readOnly)} />
                </Field>
                <Field label="Link">
                  <input value={item.href || ""} disabled={readOnly} onChange={(event) => updateNavItem(index, { href: event.target.value })} className={inputClass(readOnly)} />
                </Field>
                <Field label="Sort order">
                  <input type="number" value={item.sortOrder ?? (index + 1) * 10} disabled={readOnly} onChange={(event) => updateNavItem(index, { sortOrder: Number(event.target.value) })} className={inputClass(readOnly)} />
                </Field>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Toggle label="Enabled" checked={item.enabled !== false} disabled={readOnly} onChange={(value) => updateNavItem(index, { enabled: value })} />
                <Toggle label="Has mega menu" checked={item.hasMenu === true} disabled={readOnly} onChange={(value) => updateNavItem(index, { hasMenu: value })} />
              </div>
            </div>
          ))}
          {!(cms.navigation?.main || []).length ? (
            <p className="rounded-2xl border border-dashed border-[#d0d5dd] bg-[#f8fafc] p-5 text-sm font-bold text-[#667085]">
              No navigation items yet. Add one to start configuring the header menu.
            </p>
          ) : null}
        </div>
      </SectionCard>

      <SectionCard
        eyebrow="Mega Menu"
        title="Mega Menu CMS"
        description="Manage stored mega menu promo, help, and feature content. Storefront rendering is not wired in this task."
        action={
          <button
            type="button"
            onClick={() => saveCms("Mega Menu CMS")}
            disabled={saving || readOnly}
            className="h-11 rounded-xl bg-[#ef3338] px-5 text-sm font-black text-white shadow-[0_12px_24px_rgba(239,51,56,0.22)] transition hover:bg-[#d71920] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Mega Menu"}
          </button>
        }
      >
        <div className="space-y-5">
          <div className="rounded-2xl border border-[#eef0f3] bg-[#fafbfc] p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#ef3338]">Mega Menu Promo Card</p>
              <Toggle
                label="Enabled"
                checked={cms.navigation?.megaMenu?.promoCard?.enabled !== false}
                disabled={readOnly}
                onChange={(value) => updateMegaMenuSection("promoCard", { enabled: value })}
              />
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <Field label="Eyebrow">
                <input value={cms.navigation?.megaMenu?.promoCard?.eyebrow || ""} disabled={readOnly} onChange={(event) => updateMegaMenuSection("promoCard", { eyebrow: event.target.value })} className={inputClass(readOnly)} />
              </Field>
              <Field label="Title">
                <input value={cms.navigation?.megaMenu?.promoCard?.title || ""} disabled={readOnly} onChange={(event) => updateMegaMenuSection("promoCard", { title: event.target.value })} className={inputClass(readOnly)} />
              </Field>
              <Field label="Subtitle">
                <input value={cms.navigation?.megaMenu?.promoCard?.subtitle || ""} disabled={readOnly} onChange={(event) => updateMegaMenuSection("promoCard", { subtitle: event.target.value })} className={inputClass(readOnly)} />
              </Field>
              <Field label="Button text">
                <input value={cms.navigation?.megaMenu?.promoCard?.buttonText || ""} disabled={readOnly} onChange={(event) => updateMegaMenuSection("promoCard", { buttonText: event.target.value })} className={inputClass(readOnly)} />
              </Field>
              <Field label="Button link">
                <input value={cms.navigation?.megaMenu?.promoCard?.buttonLink || ""} disabled={readOnly} onChange={(event) => updateMegaMenuSection("promoCard", { buttonLink: event.target.value })} className={inputClass(readOnly)} />
              </Field>
              <ImageField
                label="Promo image"
                value={cms.navigation?.megaMenu?.promoCard?.image || ""}
                folder="general"
                readOnly={readOnly}
                onSelect={(url) => updateMegaMenuSection("promoCard", { image: url })}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-[#eef0f3] bg-[#fafbfc] p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#ef3338]">Mega Menu Help Bar</p>
              <Toggle
                label="Enabled"
                checked={cms.navigation?.megaMenu?.helpBar?.enabled !== false}
                disabled={readOnly}
                onChange={(value) => updateMegaMenuSection("helpBar", { enabled: value })}
              />
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <Field label="Title">
                <input value={cms.navigation?.megaMenu?.helpBar?.title || ""} disabled={readOnly} onChange={(event) => updateMegaMenuSection("helpBar", { title: event.target.value })} className={inputClass(readOnly)} />
              </Field>
              <Field label="Subtitle">
                <input value={cms.navigation?.megaMenu?.helpBar?.subtitle || ""} disabled={readOnly} onChange={(event) => updateMegaMenuSection("helpBar", { subtitle: event.target.value })} className={inputClass(readOnly)} />
              </Field>
              <Field label="Call label">
                <input value={cms.navigation?.megaMenu?.helpBar?.callLabel || ""} disabled={readOnly} onChange={(event) => updateMegaMenuSection("helpBar", { callLabel: event.target.value })} className={inputClass(readOnly)} />
              </Field>
              <Field label="Phone">
                <input
                  value={cms.navigation?.megaMenu?.helpBar?.phone || cms.navigation?.megaMenu?.helpBar?.callNumber || ""}
                  disabled={readOnly}
                  onChange={(event) => updateMegaMenuSection("helpBar", { phone: event.target.value, callNumber: event.target.value })}
                  className={inputClass(readOnly)}
                />
              </Field>
              <Field label="Chat label">
                <input value={cms.navigation?.megaMenu?.helpBar?.chatLabel || ""} disabled={readOnly} onChange={(event) => updateMegaMenuSection("helpBar", { chatLabel: event.target.value })} className={inputClass(readOnly)} />
              </Field>
              <Field label="Chat link">
                <input value={cms.navigation?.megaMenu?.helpBar?.chatLink || ""} disabled={readOnly} onChange={(event) => updateMegaMenuSection("helpBar", { chatLink: event.target.value })} className={inputClass(readOnly)} />
              </Field>
            </div>
          </div>

          <div className="rounded-2xl border border-[#eef0f3] bg-[#fafbfc] p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#ef3338]">Mega Menu Feature Cards</p>
              <button
                type="button"
                disabled={readOnly}
                onClick={addMegaMenuFeature}
                className="h-9 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-black text-[#ef3338] disabled:opacity-60"
              >
                Add Feature
              </button>
            </div>
            <div className="space-y-3">
              {(cms.navigation?.megaMenu?.featureCards || []).map((item, index) => (
                <div key={`${item.title}-${index}`} className="rounded-xl border border-[#e5e7eb] bg-white p-3">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-black text-[#667085]">Feature {index + 1}</p>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" disabled={readOnly || index === 0} onClick={() => moveMegaMenuFeature(index, -1)} className="h-8 rounded-lg border border-[#d0d5dd] px-3 text-xs font-black disabled:opacity-50">
                        Up
                      </button>
                      <button type="button" disabled={readOnly || index === (cms.navigation?.megaMenu?.featureCards || []).length - 1} onClick={() => moveMegaMenuFeature(index, 1)} className="h-8 rounded-lg border border-[#d0d5dd] px-3 text-xs font-black disabled:opacity-50">
                        Down
                      </button>
                      <button type="button" disabled={readOnly} onClick={() => removeMegaMenuFeature(index)} className="h-8 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-black text-[#ef3338] disabled:opacity-50">
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="grid gap-3 lg:grid-cols-[140px_1fr_1.4fr_120px]">
                    <Field label="Icon">
                      <input value={item.icon || ""} disabled={readOnly} onChange={(event) => updateMegaMenuFeature(index, { icon: event.target.value })} className={inputClass(readOnly)} />
                    </Field>
                    <Field label="Title">
                      <input value={item.title || ""} disabled={readOnly} onChange={(event) => updateMegaMenuFeature(index, { title: event.target.value })} className={inputClass(readOnly)} />
                    </Field>
                    <Field label="Subtitle">
                      <input value={item.subtitle || ""} disabled={readOnly} onChange={(event) => updateMegaMenuFeature(index, { subtitle: event.target.value })} className={inputClass(readOnly)} />
                    </Field>
                    <Field label="Sort order">
                      <input type="number" value={item.sortOrder ?? (index + 1) * 10} disabled={readOnly} onChange={(event) => updateMegaMenuFeature(index, { sortOrder: Number(event.target.value) })} className={inputClass(readOnly)} />
                    </Field>
                  </div>
                  <div className="mt-3">
                    <Toggle label="Enabled" checked={item.enabled !== false} disabled={readOnly} onChange={(value) => updateMegaMenuFeature(index, { enabled: value })} />
                  </div>
                </div>
              ))}
              {!(cms.navigation?.megaMenu?.featureCards || []).length ? (
                <p className="rounded-xl border border-dashed border-[#d0d5dd] bg-white p-4 text-sm font-bold text-[#667085]">No mega menu feature cards yet.</p>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-[#eef0f3] bg-[#fafbfc] p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#ef3338]">Mega Menu Featured Brands</p>
              <button
                type="button"
                disabled={readOnly}
                onClick={addMegaMenuBrand}
                className="h-9 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-black text-[#ef3338] disabled:opacity-60"
              >
                Add Brand
              </button>
            </div>
            <div className="space-y-3">
              {(cms.navigation?.megaMenu?.featuredBrands || []).map((item, index) => (
                <div key={`${item.label}-${index}`} className="rounded-xl border border-[#e5e7eb] bg-white p-3">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-black text-[#667085]">Brand {index + 1}</p>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" disabled={readOnly || index === 0} onClick={() => moveMegaMenuBrand(index, -1)} className="h-8 rounded-lg border border-[#d0d5dd] px-3 text-xs font-black disabled:opacity-50">
                        Up
                      </button>
                      <button type="button" disabled={readOnly || index === (cms.navigation?.megaMenu?.featuredBrands || []).length - 1} onClick={() => moveMegaMenuBrand(index, 1)} className="h-8 rounded-lg border border-[#d0d5dd] px-3 text-xs font-black disabled:opacity-50">
                        Down
                      </button>
                      <button type="button" disabled={readOnly} onClick={() => removeMegaMenuBrand(index)} className="h-8 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-black text-[#ef3338] disabled:opacity-50">
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="grid gap-3 lg:grid-cols-[1fr_1.4fr_1.2fr_120px]">
                    <Field label="Label">
                      <input value={item.label || ""} disabled={readOnly} onChange={(event) => updateMegaMenuBrand(index, { label: event.target.value })} className={inputClass(readOnly)} />
                    </Field>
                    <Field label="Link">
                      <input value={item.href || ""} disabled={readOnly} onChange={(event) => updateMegaMenuBrand(index, { href: event.target.value })} className={inputClass(readOnly)} />
                    </Field>
                    <Field label="Logo URL or text">
                      <input value={item.logo || ""} disabled={readOnly} onChange={(event) => updateMegaMenuBrand(index, { logo: event.target.value })} className={inputClass(readOnly)} />
                    </Field>
                    <Field label="Sort order">
                      <input type="number" value={item.sortOrder ?? (index + 1) * 10} disabled={readOnly} onChange={(event) => updateMegaMenuBrand(index, { sortOrder: Number(event.target.value) })} className={inputClass(readOnly)} />
                    </Field>
                  </div>
                  <div className="mt-3">
                    <Toggle label="Enabled" checked={item.enabled !== false} disabled={readOnly} onChange={(value) => updateMegaMenuBrand(index, { enabled: value })} />
                  </div>
                </div>
              ))}
              {!(cms.navigation?.megaMenu?.featuredBrands || []).length ? (
                <p className="rounded-xl border border-dashed border-[#d0d5dd] bg-white p-4 text-sm font-bold text-[#667085]">No mega menu featured brands yet.</p>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-[#eef0f3] bg-[#fafbfc] p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#ef3338]">Mega Menu Category Rail</p>
              <button
                type="button"
                disabled={readOnly}
                onClick={addMegaMenuCategoryRailItem}
                className="h-9 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-black text-[#ef3338] disabled:opacity-60"
              >
                Add Category
              </button>
            </div>
            <div className="space-y-3">
              {(cms.navigation?.megaMenu?.categoryRail || []).map((item, index) => (
                <div key={`${item.key}-${index}`} className="rounded-xl border border-[#e5e7eb] bg-white p-3">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-black text-[#667085]">Category {index + 1}</p>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" disabled={readOnly || index === 0} onClick={() => moveMegaMenuCategoryRailItem(index, -1)} className="h-8 rounded-lg border border-[#d0d5dd] px-3 text-xs font-black disabled:opacity-50">
                        Up
                      </button>
                      <button type="button" disabled={readOnly || index === (cms.navigation?.megaMenu?.categoryRail || []).length - 1} onClick={() => moveMegaMenuCategoryRailItem(index, 1)} className="h-8 rounded-lg border border-[#d0d5dd] px-3 text-xs font-black disabled:opacity-50">
                        Down
                      </button>
                      <button type="button" disabled={readOnly} onClick={() => removeMegaMenuCategoryRailItem(index)} className="h-8 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-black text-[#ef3338] disabled:opacity-50">
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_120px]">
                    <Field label="Key">
                      <input value={item.key || ""} disabled={readOnly} onChange={(event) => updateMegaMenuCategoryRailItem(index, { key: event.target.value })} className={inputClass(readOnly)} />
                    </Field>
                    <Field label="Label">
                      <input value={item.label || ""} disabled={readOnly} onChange={(event) => updateMegaMenuCategoryRailItem(index, { label: event.target.value })} className={inputClass(readOnly)} />
                    </Field>
                    <Field label="Icon">
                      <input value={item.icon || ""} disabled={readOnly} onChange={(event) => updateMegaMenuCategoryRailItem(index, { icon: event.target.value })} className={inputClass(readOnly)} />
                    </Field>
                    <Field label="Sort order">
                      <input type="number" value={item.sortOrder ?? (index + 1) * 10} disabled={readOnly} onChange={(event) => updateMegaMenuCategoryRailItem(index, { sortOrder: Number(event.target.value) })} className={inputClass(readOnly)} />
                    </Field>
                  </div>
                  <div className="mt-3">
                    <Toggle label="Enabled" checked={item.enabled !== false} disabled={readOnly} onChange={(value) => updateMegaMenuCategoryRailItem(index, { enabled: value })} />
                  </div>
                </div>
              ))}
              {!(cms.navigation?.megaMenu?.categoryRail || []).length ? (
                <p className="rounded-xl border border-dashed border-[#d0d5dd] bg-white p-4 text-sm font-bold text-[#667085]">No mega menu category rail items yet.</p>
              ) : null}
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        eyebrow="Static Pages"
        title="About Page CMS"
        description="Edit the saved About page content foundation. Public /about rendering is not wired in this task."
        action={
          <button
            type="button"
            onClick={() => saveCms("About Page CMS")}
            disabled={saving || readOnly}
            className="h-11 rounded-xl bg-[#ef3338] px-5 text-sm font-black text-white shadow-[0_12px_24px_rgba(239,51,56,0.22)] transition hover:bg-[#d71920] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save About Page"}
          </button>
        }
      >
        <div className="space-y-5">
          <div className="rounded-2xl border border-[#eef0f3] bg-[#fafbfc] p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#ef3338]">Hero</p>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <Field label="SEO Title">
                <input value={cms.sitePages?.about?.seo?.metaTitle || ""} disabled={readOnly} onChange={(event) => updateAboutSection("seo", { metaTitle: event.target.value })} className={inputClass(readOnly)} />
              </Field>
              <Field label="SEO Description">
                <input value={cms.sitePages?.about?.seo?.metaDescription || ""} disabled={readOnly} onChange={(event) => updateAboutSection("seo", { metaDescription: event.target.value })} className={inputClass(readOnly)} />
              </Field>
              <Field label="Hero Title">
                <input value={cms.sitePages?.about?.hero?.title || ""} disabled={readOnly} onChange={(event) => updateAboutSection("hero", { title: event.target.value })} className={inputClass(readOnly)} />
              </Field>
              <Field label="Hero Subtitle">
                <input value={cms.sitePages?.about?.hero?.eyebrow || ""} disabled={readOnly} onChange={(event) => updateAboutSection("hero", { eyebrow: event.target.value })} className={inputClass(readOnly)} />
              </Field>
              <Field label="Hero Description">
                <textarea value={cms.sitePages?.about?.hero?.description || ""} disabled={readOnly} onChange={(event) => updateAboutSection("hero", { description: event.target.value })} className={textareaClass(readOnly)} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Primary CTA text">
                  <input value={cms.sitePages?.about?.hero?.primaryCtaText || ""} disabled={readOnly} onChange={(event) => updateAboutSection("hero", { primaryCtaText: event.target.value })} className={inputClass(readOnly)} />
                </Field>
                <Field label="Primary CTA link">
                  <input value={cms.sitePages?.about?.hero?.primaryCtaLink || ""} disabled={readOnly} onChange={(event) => updateAboutSection("hero", { primaryCtaLink: event.target.value })} className={inputClass(readOnly)} />
                </Field>
                <Field label="Secondary CTA text">
                  <input value={cms.sitePages?.about?.hero?.secondaryCtaText || ""} disabled={readOnly} onChange={(event) => updateAboutSection("hero", { secondaryCtaText: event.target.value })} className={inputClass(readOnly)} />
                </Field>
                <Field label="Secondary CTA link">
                  <input value={cms.sitePages?.about?.hero?.secondaryCtaLink || ""} disabled={readOnly} onChange={(event) => updateAboutSection("hero", { secondaryCtaLink: event.target.value })} className={inputClass(readOnly)} />
                </Field>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#eef0f3] bg-[#fafbfc] p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#ef3338]">Stats</p>
              <button type="button" disabled={readOnly} onClick={addAboutStat} className="h-9 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-black text-[#ef3338] disabled:opacity-60">
                Add Stat
              </button>
            </div>
            <div className="space-y-3">
              {(cms.sitePages?.about?.stats || []).map((item, index) => (
                <div key={`about-stat-${index}`} className="rounded-xl border border-[#e5e7eb] bg-white p-3">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-black text-[#667085]">Stat {index + 1}</p>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" disabled={readOnly || index === 0} onClick={() => moveAboutStat(index, -1)} className="h-8 rounded-lg border border-[#d0d5dd] px-3 text-xs font-black disabled:opacity-50">Up</button>
                      <button type="button" disabled={readOnly || index === (cms.sitePages?.about?.stats || []).length - 1} onClick={() => moveAboutStat(index, 1)} className="h-8 rounded-lg border border-[#d0d5dd] px-3 text-xs font-black disabled:opacity-50">Down</button>
                      <button type="button" disabled={readOnly} onClick={() => removeAboutStat(index)} className="h-8 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-black text-[#ef3338] disabled:opacity-50">Delete</button>
                    </div>
                  </div>
                  <div className="grid gap-3 lg:grid-cols-[1fr_1.4fr_120px]">
                    <Field label="Value">
                      <input value={item.value || ""} disabled={readOnly} onChange={(event) => updateAboutStat(index, { value: event.target.value })} className={inputClass(readOnly)} />
                    </Field>
                    <Field label="Label">
                      <input value={item.label || ""} disabled={readOnly} onChange={(event) => updateAboutStat(index, { label: event.target.value })} className={inputClass(readOnly)} />
                    </Field>
                    <Field label="Sort order">
                      <input type="number" value={item.sortOrder ?? (index + 1) * 10} disabled={readOnly} onChange={(event) => updateAboutStat(index, { sortOrder: Number(event.target.value) })} className={inputClass(readOnly)} />
                    </Field>
                  </div>
                </div>
              ))}
              {!(cms.sitePages?.about?.stats || []).length ? (
                <p className="rounded-xl border border-dashed border-[#d0d5dd] bg-white p-4 text-sm font-bold text-[#667085]">No About page stats yet.</p>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-[#eef0f3] bg-[#fafbfc] p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#ef3338]">Story Milestones</p>
              <button type="button" disabled={readOnly} onClick={addAboutMilestone} className="h-9 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-black text-[#ef3338] disabled:opacity-60">
                Add Milestone
              </button>
            </div>
            <div className="space-y-3">
              {(cms.sitePages?.about?.story?.milestones || []).map((item, index) => (
                <div key={`about-milestone-${index}`} className="rounded-xl border border-[#e5e7eb] bg-white p-3">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-black text-[#667085]">Milestone {index + 1}</p>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" disabled={readOnly || index === 0} onClick={() => moveAboutMilestone(index, -1)} className="h-8 rounded-lg border border-[#d0d5dd] px-3 text-xs font-black disabled:opacity-50">Up</button>
                      <button type="button" disabled={readOnly || index === (cms.sitePages?.about?.story?.milestones || []).length - 1} onClick={() => moveAboutMilestone(index, 1)} className="h-8 rounded-lg border border-[#d0d5dd] px-3 text-xs font-black disabled:opacity-50">Down</button>
                      <button type="button" disabled={readOnly} onClick={() => removeAboutMilestone(index)} className="h-8 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-black text-[#ef3338] disabled:opacity-50">Delete</button>
                    </div>
                  </div>
                  <div className="grid gap-3 lg:grid-cols-[130px_1fr_1.6fr_120px]">
                    <Field label="Year">
                      <input value={item.number || item.year || ""} disabled={readOnly} onChange={(event) => updateAboutMilestone(index, { number: event.target.value })} className={inputClass(readOnly)} />
                    </Field>
                    <Field label="Title">
                      <input value={item.title || ""} disabled={readOnly} onChange={(event) => updateAboutMilestone(index, { title: event.target.value })} className={inputClass(readOnly)} />
                    </Field>
                    <Field label="Description">
                      <input value={item.body || item.description || ""} disabled={readOnly} onChange={(event) => updateAboutMilestone(index, { body: event.target.value })} className={inputClass(readOnly)} />
                    </Field>
                    <Field label="Sort order">
                      <input type="number" value={item.sortOrder ?? (index + 1) * 10} disabled={readOnly} onChange={(event) => updateAboutMilestone(index, { sortOrder: Number(event.target.value) })} className={inputClass(readOnly)} />
                    </Field>
                  </div>
                </div>
              ))}
              {!(cms.sitePages?.about?.story?.milestones || []).length ? (
                <p className="rounded-xl border border-dashed border-[#d0d5dd] bg-white p-4 text-sm font-bold text-[#667085]">No About page milestones yet.</p>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-[#eef0f3] bg-[#fafbfc] p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#ef3338]">Values</p>
              <button type="button" disabled={readOnly} onClick={addAboutValue} className="h-9 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-black text-[#ef3338] disabled:opacity-60">
                Add Value
              </button>
            </div>
            <div className="space-y-3">
              {(cms.sitePages?.about?.values || []).map((item, index) => (
                <div key={`about-value-${index}`} className="rounded-xl border border-[#e5e7eb] bg-white p-3">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-black text-[#667085]">Value {index + 1}</p>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" disabled={readOnly || index === 0} onClick={() => moveAboutValue(index, -1)} className="h-8 rounded-lg border border-[#d0d5dd] px-3 text-xs font-black disabled:opacity-50">Up</button>
                      <button type="button" disabled={readOnly || index === (cms.sitePages?.about?.values || []).length - 1} onClick={() => moveAboutValue(index, 1)} className="h-8 rounded-lg border border-[#d0d5dd] px-3 text-xs font-black disabled:opacity-50">Down</button>
                      <button type="button" disabled={readOnly} onClick={() => removeAboutValue(index)} className="h-8 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-black text-[#ef3338] disabled:opacity-50">Delete</button>
                    </div>
                  </div>
                  <div className="grid gap-3 lg:grid-cols-[1fr_1.7fr_140px_120px]">
                    <Field label="Title">
                      <input value={item.title || ""} disabled={readOnly} onChange={(event) => updateAboutValue(index, { title: event.target.value })} className={inputClass(readOnly)} />
                    </Field>
                    <Field label="Description">
                      <input value={item.body || item.description || ""} disabled={readOnly} onChange={(event) => updateAboutValue(index, { body: event.target.value })} className={inputClass(readOnly)} />
                    </Field>
                    <Field label="Icon">
                      <input value={item.icon || ""} disabled={readOnly} onChange={(event) => updateAboutValue(index, { icon: event.target.value })} className={inputClass(readOnly)} />
                    </Field>
                    <Field label="Sort order">
                      <input type="number" value={item.sortOrder ?? (index + 1) * 10} disabled={readOnly} onChange={(event) => updateAboutValue(index, { sortOrder: Number(event.target.value) })} className={inputClass(readOnly)} />
                    </Field>
                  </div>
                </div>
              ))}
              {!(cms.sitePages?.about?.values || []).length ? (
                <p className="rounded-xl border border-dashed border-[#d0d5dd] bg-white p-4 text-sm font-bold text-[#667085]">No About page values yet.</p>
              ) : null}
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        eyebrow="Static Pages"
        title="Privacy Policy CMS"
        description="Edit saved Privacy Policy content foundation. Public /privacy-policy rendering is not wired in this task."
        action={
          <button
            type="button"
            onClick={() => saveCms("Privacy Policy CMS")}
            disabled={saving || readOnly}
            className="h-11 rounded-xl bg-[#ef3338] px-5 text-sm font-black text-white shadow-[0_12px_24px_rgba(239,51,56,0.22)] transition hover:bg-[#d71920] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Privacy Policy"}
          </button>
        }
      >
        <div className="space-y-5">
          <div className="rounded-2xl border border-[#eef0f3] bg-[#fafbfc] p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#ef3338]">SEO</p>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <Field label="SEO Title">
                <input value={cms.sitePages?.privacyPolicy?.seo?.metaTitle || ""} disabled={readOnly} onChange={(event) => updatePrivacySection("seo", { metaTitle: event.target.value })} className={inputClass(readOnly)} />
              </Field>
              <Field label="SEO Description">
                <input value={cms.sitePages?.privacyPolicy?.seo?.metaDescription || ""} disabled={readOnly} onChange={(event) => updatePrivacySection("seo", { metaDescription: event.target.value })} className={inputClass(readOnly)} />
              </Field>
            </div>
          </div>

          <div className="rounded-2xl border border-[#eef0f3] bg-[#fafbfc] p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#ef3338]">Hero</p>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <Field label="Title">
                <input value={cms.sitePages?.privacyPolicy?.hero?.title || ""} disabled={readOnly} onChange={(event) => updatePrivacySection("hero", { title: event.target.value })} className={inputClass(readOnly)} />
              </Field>
              <Field label="Subtitle">
                <input value={cms.sitePages?.privacyPolicy?.hero?.eyebrow || ""} disabled={readOnly} onChange={(event) => updatePrivacySection("hero", { eyebrow: event.target.value })} className={inputClass(readOnly)} />
              </Field>
              <Field label="Description">
                <textarea value={cms.sitePages?.privacyPolicy?.hero?.description || ""} disabled={readOnly} onChange={(event) => updatePrivacySection("hero", { description: event.target.value })} className={textareaClass(readOnly)} />
              </Field>
            </div>
          </div>

          <div className="rounded-2xl border border-[#eef0f3] bg-[#fafbfc] p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#ef3338]">Hero Stats</p>
              <button type="button" disabled={readOnly} onClick={addPrivacyStat} className="h-9 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-black text-[#ef3338] disabled:opacity-60">
                Add Stat
              </button>
            </div>
            <div className="space-y-3">
              {(cms.sitePages?.privacyPolicy?.stats || []).map((item, index) => (
                <div key={`privacy-stat-${index}`} className="rounded-xl border border-[#e5e7eb] bg-white p-3">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-black text-[#667085]">Stat {index + 1}</p>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" disabled={readOnly || index === 0} onClick={() => movePrivacyStat(index, -1)} className="h-8 rounded-lg border border-[#d0d5dd] px-3 text-xs font-black disabled:opacity-50">Up</button>
                      <button type="button" disabled={readOnly || index === (cms.sitePages?.privacyPolicy?.stats || []).length - 1} onClick={() => movePrivacyStat(index, 1)} className="h-8 rounded-lg border border-[#d0d5dd] px-3 text-xs font-black disabled:opacity-50">Down</button>
                      <button type="button" disabled={readOnly} onClick={() => removePrivacyStat(index)} className="h-8 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-black text-[#ef3338] disabled:opacity-50">Delete</button>
                    </div>
                  </div>
                  <div className="grid gap-3 lg:grid-cols-[1fr_1.3fr_120px]">
                    <Field label="Value">
                      <input value={item.value || ""} disabled={readOnly} onChange={(event) => updatePrivacyStat(index, { value: event.target.value })} className={inputClass(readOnly)} />
                    </Field>
                    <Field label="Label">
                      <input value={item.label || ""} disabled={readOnly} onChange={(event) => updatePrivacyStat(index, { label: event.target.value })} className={inputClass(readOnly)} />
                    </Field>
                    <Field label="Sort order">
                      <input type="number" value={item.sortOrder ?? (index + 1) * 10} disabled={readOnly} onChange={(event) => updatePrivacyStat(index, { sortOrder: Number(event.target.value) })} className={inputClass(readOnly)} />
                    </Field>
                  </div>
                  <div className="mt-3">
                    <Toggle label="Enabled" checked={item.enabled !== false} disabled={readOnly} onChange={(value) => updatePrivacyStat(index, { enabled: value })} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#eef0f3] bg-[#fafbfc] p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#ef3338]">Policy Cards</p>
              <button type="button" disabled={readOnly} onClick={addPrivacyPolicyCard} className="h-9 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-black text-[#ef3338] disabled:opacity-60">
                Add Card
              </button>
            </div>
            <div className="space-y-3">
              {(cms.sitePages?.privacyPolicy?.policyCards || []).map((item, index) => (
                <div key={`privacy-card-${index}`} className="rounded-xl border border-[#e5e7eb] bg-white p-3">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-black text-[#667085]">Card {index + 1}</p>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" disabled={readOnly || index === 0} onClick={() => movePrivacyPolicyCard(index, -1)} className="h-8 rounded-lg border border-[#d0d5dd] px-3 text-xs font-black disabled:opacity-50">Up</button>
                      <button type="button" disabled={readOnly || index === (cms.sitePages?.privacyPolicy?.policyCards || []).length - 1} onClick={() => movePrivacyPolicyCard(index, 1)} className="h-8 rounded-lg border border-[#d0d5dd] px-3 text-xs font-black disabled:opacity-50">Down</button>
                      <button type="button" disabled={readOnly} onClick={() => removePrivacyPolicyCard(index)} className="h-8 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-black text-[#ef3338] disabled:opacity-50">Delete</button>
                    </div>
                  </div>
                  <div className="grid gap-3 lg:grid-cols-[1fr_1.8fr_120px]">
                    <Field label="Title">
                      <input value={item.title || ""} disabled={readOnly} onChange={(event) => updatePrivacyPolicyCard(index, { title: event.target.value })} className={inputClass(readOnly)} />
                    </Field>
                    <Field label="Description">
                      <input value={item.body || item.description || ""} disabled={readOnly} onChange={(event) => updatePrivacyPolicyCard(index, { body: event.target.value, description: event.target.value })} className={inputClass(readOnly)} />
                    </Field>
                    <Field label="Sort order">
                      <input type="number" value={item.sortOrder ?? (index + 1) * 10} disabled={readOnly} onChange={(event) => updatePrivacyPolicyCard(index, { sortOrder: Number(event.target.value) })} className={inputClass(readOnly)} />
                    </Field>
                    <Field label="Bullets">
                      <textarea value={arrayToLines(item.bullets)} disabled={readOnly} onChange={(event) => updatePrivacyPolicyCard(index, { bullets: linesToArray(event.target.value) })} className={textareaClass(readOnly)} />
                    </Field>
                  </div>
                  <div className="mt-3">
                    <Toggle label="Enabled" checked={item.enabled !== false} disabled={readOnly} onChange={(value) => updatePrivacyPolicyCard(index, { enabled: value })} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#eef0f3] bg-[#fafbfc] p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#ef3338]">Privacy Principles</p>
              <button type="button" disabled={readOnly} onClick={addPrivacyPrinciple} className="h-9 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-black text-[#ef3338] disabled:opacity-60">
                Add Principle
              </button>
            </div>
            <div className="mb-4 grid gap-4 lg:grid-cols-2">
              <Field label="Principles heading">
                <input value={cms.sitePages?.privacyPolicy?.principles?.title || ""} disabled={readOnly} onChange={(event) => updatePrivacyPrinciplesSection({ title: event.target.value })} className={inputClass(readOnly)} />
              </Field>
              <Field label="Principles description">
                <input value={cms.sitePages?.privacyPolicy?.principles?.description || ""} disabled={readOnly} onChange={(event) => updatePrivacyPrinciplesSection({ description: event.target.value })} className={inputClass(readOnly)} />
              </Field>
            </div>
            <div className="space-y-3">
              {(cms.sitePages?.privacyPolicy?.principles?.items || []).map((item, index) => (
                <div key={`privacy-principle-${index}`} className="rounded-xl border border-[#e5e7eb] bg-white p-3">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-black text-[#667085]">Principle {index + 1}</p>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" disabled={readOnly || index === 0} onClick={() => movePrivacyPrinciple(index, -1)} className="h-8 rounded-lg border border-[#d0d5dd] px-3 text-xs font-black disabled:opacity-50">Up</button>
                      <button type="button" disabled={readOnly || index === (cms.sitePages?.privacyPolicy?.principles?.items || []).length - 1} onClick={() => movePrivacyPrinciple(index, 1)} className="h-8 rounded-lg border border-[#d0d5dd] px-3 text-xs font-black disabled:opacity-50">Down</button>
                      <button type="button" disabled={readOnly} onClick={() => removePrivacyPrinciple(index)} className="h-8 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-black text-[#ef3338] disabled:opacity-50">Delete</button>
                    </div>
                  </div>
                  <div className="grid gap-3 lg:grid-cols-[1fr_1.6fr_140px_120px]">
                    <Field label="Title">
                      <input value={item.title || item.label || ""} disabled={readOnly} onChange={(event) => updatePrivacyPrinciple(index, { title: event.target.value, label: event.target.value })} className={inputClass(readOnly)} />
                    </Field>
                    <Field label="Description">
                      <input value={item.description || ""} disabled={readOnly} onChange={(event) => updatePrivacyPrinciple(index, { description: event.target.value })} className={inputClass(readOnly)} />
                    </Field>
                    <Field label="Icon">
                      <input value={item.icon || ""} disabled={readOnly} onChange={(event) => updatePrivacyPrinciple(index, { icon: event.target.value })} className={inputClass(readOnly)} />
                    </Field>
                    <Field label="Sort order">
                      <input type="number" value={item.sortOrder ?? (index + 1) * 10} disabled={readOnly} onChange={(event) => updatePrivacyPrinciple(index, { sortOrder: Number(event.target.value) })} className={inputClass(readOnly)} />
                    </Field>
                  </div>
                  <div className="mt-3">
                    <Toggle label="Enabled" checked={item.enabled !== false} disabled={readOnly} onChange={(value) => updatePrivacyPrinciple(index, { enabled: value })} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#eef0f3] bg-[#fafbfc] p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#ef3338]">Contact / CTA</p>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <Field label="Heading">
                <input value={cms.sitePages?.privacyPolicy?.cta?.title || ""} disabled={readOnly} onChange={(event) => updatePrivacySection("cta", { title: event.target.value })} className={inputClass(readOnly)} />
              </Field>
              <Field label="Description">
                <input value={cms.sitePages?.privacyPolicy?.cta?.description || ""} disabled={readOnly} onChange={(event) => updatePrivacySection("cta", { description: event.target.value })} className={inputClass(readOnly)} />
              </Field>
              <Field label="Email">
                <input value={cms.sitePages?.privacyPolicy?.contact?.email || ""} disabled={readOnly} onChange={(event) => updatePrivacySection("contact", { email: event.target.value })} className={inputClass(readOnly)} />
              </Field>
              <Field label="Phone">
                <input value={cms.sitePages?.privacyPolicy?.contact?.phone || ""} disabled={readOnly} onChange={(event) => updatePrivacySection("contact", { phone: event.target.value })} className={inputClass(readOnly)} />
              </Field>
              <Field label="Button text">
                <input value={cms.sitePages?.privacyPolicy?.cta?.buttonText || ""} disabled={readOnly} onChange={(event) => updatePrivacySection("cta", { buttonText: event.target.value })} className={inputClass(readOnly)} />
              </Field>
              <Field label="Button link">
                <input value={cms.sitePages?.privacyPolicy?.cta?.buttonLink || ""} disabled={readOnly} onChange={(event) => updatePrivacySection("cta", { buttonLink: event.target.value })} className={inputClass(readOnly)} />
              </Field>
            </div>
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
          <div className="space-y-6">
            <div className="rounded-2xl border border-[#eef0f3] bg-[#fafbfc] p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#ef3338]">Footer Branding</p>
              <div className="mt-4 space-y-5">
                <ImageField label="Footer Logo URL" value={cms.footer.logo || cms.footer.footerLogo} folder="general" readOnly={readOnly} onSelect={(url) => setFooterBranding("logo", url)} />
                <Field label="About Text">
                  <textarea value={cms.footer.about || cms.footer.aboutText || ""} disabled={readOnly} onChange={(event) => setFooterBranding("about", event.target.value)} className={textareaClass(readOnly)} />
                </Field>
                <Field label="Copyright Text">
                  <input value={cms.footer.copyright || cms.footer.copyrightText || ""} disabled={readOnly} onChange={(event) => setFooterBranding("copyright", event.target.value)} className={inputClass(readOnly)} />
                </Field>
              </div>
            </div>

            <div className="rounded-2xl border border-[#eef0f3] bg-[#fafbfc] p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#ef3338]">Contact Information</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Primary Phone">
                  <input value={cms.footer.contacts?.phone || cms.footer.contact?.phone || ""} disabled={readOnly} onChange={(event) => setFooterContact("phone", event.target.value)} className={inputClass(readOnly)} />
                </Field>
                <Field label="Secondary Phone">
                  <input value={cms.footer.contacts?.secondaryPhone || cms.footer.contact?.secondaryPhone || ""} disabled={readOnly} onChange={(event) => setFooterContact("secondaryPhone", event.target.value)} className={inputClass(readOnly)} />
                </Field>
                <Field label="Email">
                  <input value={cms.footer.contacts?.email || cms.footer.contact?.email || ""} disabled={readOnly} onChange={(event) => setFooterContact("email", event.target.value)} className={inputClass(readOnly)} />
                </Field>
                <Field label="Address">
                  <input value={cms.footer.contacts?.address || cms.footer.contact?.address || ""} disabled={readOnly} onChange={(event) => setFooterContact("address", event.target.value)} className={inputClass(readOnly)} />
                </Field>
              </div>
            </div>

            <div className="rounded-2xl border border-[#eef0f3] bg-[#fafbfc] p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#ef3338]">Social Media</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {["facebook", "instagram", "youtube", "tiktok"].map((field) => (
                  <Field key={field} label={field}>
                    <input value={cms.footer.socials?.[field] || cms.footer.socialLinks?.[field] || ""} disabled={readOnly} onChange={(event) => setFooterSocial(field, event.target.value)} className={inputClass(readOnly)} />
                  </Field>
                ))}
              </div>
            </div>

            <FooterLinksEditor
              title="Quick Links"
              items={cms.footer.quickLinks}
              readOnly={readOnly}
              onAdd={() => addFooterLink("quickLinks")}
              onUpdate={(index, patch) => updateFooterLink("quickLinks", index, patch)}
              onRemove={(index) => removeFooterLink("quickLinks", index)}
              onMove={(index, direction) => moveFooterLink("quickLinks", index, direction)}
            />
            <FooterLinksEditor
              title="Customer Service"
              items={cms.footer.customerLinks}
              readOnly={readOnly}
              onAdd={() => addFooterLink("customerLinks")}
              onUpdate={(index, patch) => updateFooterLink("customerLinks", index, patch)}
              onRemove={(index) => removeFooterLink("customerLinks", index)}
              onMove={(index, direction) => moveFooterLink("customerLinks", index, direction)}
            />
            <FooterLinksEditor
              title="Account Links"
              items={cms.footer.accountLinks}
              readOnly={readOnly}
              onAdd={() => addFooterLink("accountLinks")}
              onUpdate={(index, patch) => updateFooterLink("accountLinks", index, patch)}
              onRemove={(index) => removeFooterLink("accountLinks", index)}
              onMove={(index, direction) => moveFooterLink("accountLinks", index, direction)}
            />
            <FooterLinksEditor
              title="Company Links"
              items={cms.footer.companyLinks}
              readOnly={readOnly}
              onAdd={() => addFooterLink("companyLinks")}
              onUpdate={(index, patch) => updateFooterLink("companyLinks", index, patch)}
              onRemove={(index) => removeFooterLink("companyLinks", index)}
              onMove={(index, direction) => moveFooterLink("companyLinks", index, direction)}
            />
            <div>
              <button
                type="button"
                onClick={() => saveCms("Footer CMS")}
                disabled={saving || readOnly}
                className="h-11 rounded-xl bg-[#ef3338] px-5 text-sm font-black text-white shadow-[0_12px_24px_rgba(239,51,56,0.22)] transition hover:bg-[#d71920] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Footer"}
              </button>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
