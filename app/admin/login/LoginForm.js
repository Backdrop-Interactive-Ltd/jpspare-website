"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed.");
        return;
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Unable to sign in right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-10 w-full rounded-2xl border border-[#e5e7eb] bg-white p-7 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
      <label className="block text-sm font-bold text-[#344054]">
        Email Address
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className="mt-2 h-12 w-full rounded-xl border border-[#d0d5dd] px-4 text-sm outline-none transition focus:border-[#ef3338] focus:ring-4 focus:ring-red-100"
          placeholder="admin@jpspare.com"
        />
      </label>
      <label className="mt-5 block text-sm font-bold text-[#344054]">
        Password
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          className="mt-2 h-12 w-full rounded-xl border border-[#d0d5dd] px-4 text-sm outline-none transition focus:border-[#ef3338] focus:ring-4 focus:ring-red-100"
          placeholder="Enter admin password"
        />
      </label>
      {error ? <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-[#dc2626]">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="mt-6 h-12 w-full rounded-xl bg-[#ef3338] text-sm font-black text-white shadow-[0_12px_24px_rgba(220,38,38,0.22)] transition hover:bg-[#d91f25] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
