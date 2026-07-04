"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const statuses = ["DRAFT", "PUBLISHED", "ARCHIVED"];

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function emptyBlogPost() {
  return {
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featuredImage: "",
    categoryId: "",
    authorName: "",
    tags: [],
    status: "DRAFT",
    featured: false,
    publishedAt: "",
    seoTitle: "",
    seoDescription: "",
  };
}

function dateInputValue(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}

function normalizeBlogPost(post) {
  if (!post) return emptyBlogPost();
  return {
    ...emptyBlogPost(),
    ...post,
    categoryId: post.categoryId || "",
    tags: Array.isArray(post.tags) ? post.tags : [],
    publishedAt: dateInputValue(post.publishedAt),
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

export default function BlogPostForm({ mode, post, categories, canManage }) {
  const router = useRouter();
  const [form, setForm] = useState(() => normalizeBlogPost(post));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const readOnly = !canManage;

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function setTitle(value) {
    setForm((current) => ({ ...current, title: value, slug: current.slug ? current.slug : slugify(value) }));
  }

  function payload() {
    return {
      ...form,
      slug: form.slug || slugify(form.title),
      tags: String(form.tags || "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      publishedAt: form.publishedAt || null,
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (readOnly) return;
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(mode === "edit" ? `/api/admin/blog-posts/${form.id}` : "/api/admin/blog-posts", {
        method: mode === "edit" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload()),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to save blog post");
      router.push("/admin/blog-posts");
      router.refresh();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (readOnly || mode !== "edit" || !window.confirm("Delete this blog post?")) return;
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/blog-posts/${form.id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Unable to delete blog post");
      }
      router.push("/admin/blog-posts");
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
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ef3338]">{mode === "edit" ? "Edit Blog Post" : "Add Blog Post"}</p>
            <h2 className="mt-1 text-2xl font-black text-[#111827]">{mode === "edit" ? form.title : "Create editorial post"}</h2>
            {!canManage ? <p className="mt-2 text-sm font-bold text-[#ef3338]">Read-only mode. Your role can view blog posts but cannot save changes.</p> : null}
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => router.push("/admin/blog-posts")} className="h-11 rounded-xl border border-[#d0d5dd] bg-white px-5 text-sm font-black text-[#344054]">
              Cancel
            </button>
            {mode === "edit" && canManage ? (
              <button type="button" onClick={handleDelete} disabled={saving} className="h-11 rounded-xl border border-red-200 bg-red-50 px-5 text-sm font-black text-[#ef3338] disabled:opacity-60">
                Delete
              </button>
            ) : null}
            {canManage ? (
              <button type="submit" disabled={saving} className="h-11 rounded-xl bg-[#ef3338] px-6 text-sm font-black text-white shadow-[0_12px_24px_rgba(239,51,56,0.22)] disabled:opacity-60">
                {saving ? "Saving..." : "Save Blog Post"}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {message ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-[#b42318]">{message}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
          <h3 className="text-lg font-black text-[#111827]">Post Content</h3>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <Field label="Title">
              <input value={form.title || ""} onChange={(event) => setTitle(event.target.value)} disabled={readOnly} className={inputClass(readOnly)} required />
            </Field>
            <Field label="Slug">
              <input value={form.slug || ""} onChange={(event) => setField("slug", slugify(event.target.value))} disabled={readOnly} className={inputClass(readOnly)} required />
            </Field>
            <Field label="Author name">
              <input value={form.authorName || ""} onChange={(event) => setField("authorName", event.target.value)} disabled={readOnly} className={inputClass(readOnly)} />
            </Field>
            <Field label="Featured image URL">
              <input value={form.featuredImage || ""} onChange={(event) => setField("featuredImage", event.target.value)} disabled={readOnly} className={inputClass(readOnly)} placeholder="/image.webp" />
            </Field>
          </div>
          <div className="mt-5">
            <Field label="Excerpt">
              <textarea value={form.excerpt || ""} onChange={(event) => setField("excerpt", event.target.value)} disabled={readOnly} className={`${inputClass(readOnly)} h-28 py-3`} />
            </Field>
          </div>
          <div className="mt-5">
            <Field label="Content" hint="Plain textarea for now. Rich editor can be added later.">
              <textarea value={form.content || ""} onChange={(event) => setField("content", event.target.value)} disabled={readOnly} className={`${inputClass(readOnly)} h-[360px] py-3 font-mono leading-6`} />
            </Field>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
            <h3 className="text-lg font-black text-[#111827]">Publishing</h3>
            <div className="mt-5 space-y-4">
              <Field label="Status">
                <select value={form.status || "DRAFT"} onChange={(event) => setField("status", event.target.value)} disabled={readOnly} className={inputClass(readOnly)}>
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Publish date">
                <input type="datetime-local" value={form.publishedAt || ""} onChange={(event) => setField("publishedAt", event.target.value)} disabled={readOnly} className={inputClass(readOnly)} />
              </Field>
              <Toggle label="Featured post" checked={Boolean(form.featured)} disabled={readOnly} onChange={(value) => setField("featured", value)} />
            </div>
          </section>

          <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
            <h3 className="text-lg font-black text-[#111827]">Taxonomy</h3>
            <div className="mt-5 space-y-4">
              <Field label="Category">
                <select value={form.categoryId || ""} onChange={(event) => setField("categoryId", event.target.value)} disabled={readOnly} className={inputClass(readOnly)}>
                  <option value="">No category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Tags" hint="Comma separated, for example: Maintenance, Brake Parts">
                <input value={Array.isArray(form.tags) ? form.tags.join(", ") : form.tags || ""} onChange={(event) => setField("tags", event.target.value)} disabled={readOnly} className={inputClass(readOnly)} />
              </Field>
            </div>
          </section>
        </aside>
      </div>

      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <h3 className="text-lg font-black text-[#111827]">SEO</h3>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Field label="SEO title">
            <input value={form.seoTitle || ""} onChange={(event) => setField("seoTitle", event.target.value)} disabled={readOnly} className={inputClass(readOnly)} />
          </Field>
          <Field label="SEO description">
            <textarea value={form.seoDescription || ""} onChange={(event) => setField("seoDescription", event.target.value)} disabled={readOnly} className={`${inputClass(readOnly)} h-28 py-3`} />
          </Field>
        </div>
      </section>
    </form>
  );
}
