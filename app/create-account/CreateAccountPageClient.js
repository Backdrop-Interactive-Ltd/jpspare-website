"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

function Icon({ name, className = "size-5" }) {
  const icons = {
    user: "M20 21a8 8 0 0 0-16 0m8-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
    lock: "M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z",
    mail: "M4 4h16v16H4zM4 7l8 6 8-6",
    phone: "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.7.6 2.5a2 2 0 0 1-.5 2.1L8 9.5a16 16 0 0 0 6.5 6.5l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.6.5 2.5.6a2 2 0 0 1 1.7 2Z",
    eye: "M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
    arrowRight: "M5 12h14m-7-7 7 7-7 7",
    shield: "M12 3 19 6v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3Z",
  };

  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={icons[name]} />
    </svg>
  );
}

function Field({ id, label, type = "text", placeholder, icon, value, onChange, rightButton }) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-2 block text-[14px] font-medium text-[#273142]">{label}</span>
      <span className="flex h-[50px] items-center rounded-[10px] border border-[#cfd6df] bg-white px-3 transition focus-within:border-[#ef3338] focus-within:shadow-[0_0_0_3px_rgba(239,51,56,0.10)]">
        <Icon name={icon} className="mr-3 size-5 text-[#98a2b3]" />
        <input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="min-w-0 flex-1 bg-transparent text-[16px] text-[#111827] outline-none placeholder:text-[#9aa3af]" />
        {rightButton}
      </span>
    </label>
  );
}

export default function CreateAccountPageClient() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (field) => (value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (form.password && form.confirmPassword && form.password !== form.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }
    setLoading(true);
    setMessage("");
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(form),
    });
    if (response.ok) {
      localStorage.removeItem("jpspare-auth");
      window.dispatchEvent(new Event("jpspare-auth-change"));
      router.push("/account");
    } else {
      const data = await response.json().catch(() => ({}));
      setMessage(data.error || "Account creation failed.");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-white text-[#111827]">
      <section className="relative mx-auto flex min-h-[980px] w-full max-w-[1500px] flex-col items-center px-4 py-20 sm:px-6 lg:px-8 xl:px-10">
        <div className="pointer-events-none absolute left-[-120px] top-[190px] size-[430px] rounded-full bg-[#f7d95f]/10 blur-[84px]" />
        <div className="pointer-events-none absolute right-[-60px] top-[430px] size-[460px] rounded-full bg-[#ef3338]/8 blur-[100px]" />

        <nav className="relative z-10 flex items-center gap-3 text-[15px]">
          <Link href="/" className="text-[#ef3338] transition hover:text-[#111827]">Home</Link>
          <span className="text-[#98a2b3]">/</span>
          <span className="text-[#111827]">Create Account</span>
        </nav>

        <div className="relative z-10 mt-9 grid size-20 place-items-center rounded-full bg-[#ef4444] text-white shadow-[0_14px_28px_rgba(239,51,56,0.24)]">
          <Icon name="user" className="size-10" />
        </div>

        <div className="relative z-10 mt-7 text-center">
          <h1 className="text-[36px] font-black leading-tight tracking-[-0.03em] text-[#111827] max-sm:text-[30px]">
            Join <span className="text-[#df171d]">JPSPARE</span>
          </h1>
          <p className="mx-auto mt-5 max-w-[470px] text-[19px] leading-8 text-[#4b5563]">Create your account to access exclusive deals and track your orders</p>
        </div>

        <form onSubmit={handleSubmit} className="relative z-10 mt-12 w-full max-w-[400px] rounded-[10px] border border-[#dfe5ec] bg-white p-8 shadow-[0_18px_36px_rgba(15,23,42,0.10)]">
          <div className="grid grid-cols-2 gap-4">
            <Field id="first-name" label="First Name" placeholder="First name" icon="user" value={form.firstName} onChange={updateField("firstName")} />
            <Field id="last-name" label="Last Name" placeholder="Last name" icon="user" value={form.lastName} onChange={updateField("lastName")} />
          </div>

          <div className="mt-6 space-y-6">
            <Field id="email" label="Email address" type="email" placeholder="Enter your email" icon="mail" value={form.email} onChange={updateField("email")} />
            <Field id="phone" label="Phone Number (Optional)" type="tel" placeholder="Enter your phone number" icon="phone" value={form.phone} onChange={updateField("phone")} />
            <Field
              id="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              icon="lock"
              value={form.password}
              onChange={updateField("password")}
              rightButton={
                <button type="button" onClick={() => setShowPassword((current) => !current)} className="grid size-8 place-items-center text-[#98a2b3] transition hover:text-[#ef3338]" aria-label="Toggle password visibility">
                  <Icon name="eye" className="size-5" />
                </button>
              }
            />
            <Field
              id="confirm-password"
              label="Confirm Password"
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm your password"
              icon="lock"
              value={form.confirmPassword}
              onChange={updateField("confirmPassword")}
              rightButton={
                <button type="button" onClick={() => setShowConfirm((current) => !current)} className="grid size-8 place-items-center text-[#98a2b3] transition hover:text-[#ef3338]" aria-label="Toggle confirm password visibility">
                  <Icon name="eye" className="size-5" />
                </button>
              }
            />
          </div>

          {message && <p className={`mt-4 rounded-[8px] px-3 py-2 text-[13px] font-semibold ${message.includes("not") ? "bg-[#fff1f1] text-[#c8191f]" : "bg-[#ecfdf3] text-[#027a48]"}`}>{message}</p>}

          <button disabled={loading} type="submit" className="mt-7 flex h-12 w-full items-center justify-center gap-3 rounded-[10px] bg-gradient-to-r from-[#ef4444] to-[#df171d] text-[15px] font-black text-white shadow-[0_12px_22px_rgba(239,51,56,0.16)] transition hover:from-[#111827] hover:to-[#111827] disabled:cursor-not-allowed disabled:opacity-70">
            {loading ? "Creating..." : "Create Account"}
            <Icon name="arrowRight" className="size-5" />
          </button>

          <p className="mt-8 text-center text-[15px] text-[#4b5563]">
            Already have an account? <Link href="/signin" className="font-semibold text-[#ef3338] transition hover:text-[#111827]">Sign in here</Link>
          </p>
        </form>

        <div className="relative z-10 mt-8 inline-flex items-center gap-2 rounded-full border border-[#edf0f4] bg-white px-7 py-3 text-[14px] text-[#667085] shadow-[0_14px_30px_rgba(15,23,42,0.06)]">
          <Icon name="shield" className="size-4 text-[#10b981]" />
          Your data is protected with SSL encryption
        </div>
      </section>
    </main>
  );
}
