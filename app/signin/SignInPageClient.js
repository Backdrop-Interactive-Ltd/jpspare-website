"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

function Icon({ name, className = "size-5" }) {
  const icons = {
    user: "M20 21a8 8 0 0 0-16 0m8-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
    lock: "M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z",
    mail: "M4 4h16v16H4zM4 7l8 6 8-6",
    eye: "M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
    arrowRight: "M5 12h14m-7-7 7 7-7 7",
    arrowLeft: "M19 12H5m7-7-7 7 7 7",
  };

  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={icons[name]} />
    </svg>
  );
}

function AuthInput({ id, label, type, placeholder, icon, value, onChange, rightButton }) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-2 block text-[15px] font-medium text-[#273142]">{label}</span>
      <span className="flex h-[50px] items-center rounded-[10px] border border-[#cfd6df] bg-white px-3 transition focus-within:border-[#ef3338] focus-within:shadow-[0_0_0_3px_rgba(239,51,56,0.10)]">
        <Icon name={icon} className="mr-3 size-5 text-[#98a2b3]" />
        <input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="min-w-0 flex-1 bg-transparent text-[16px] text-[#111827] outline-none placeholder:text-[#9aa3af]" />
        {rightButton}
      </span>
    </label>
  );
}

export default function SignInPageClient() {
  const router = useRouter();
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const isReset = mode === "reset";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    if (!isReset) {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        localStorage.setItem("jpspare-auth", "true");
        window.dispatchEvent(new Event("jpspare-auth-change"));
        router.push("/account");
      } else {
        const data = await response.json().catch(() => ({}));
        setMessage(data.error || "Sign in failed.");
      }
      setLoading(false);
      return;
    }
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setMessage(response.ok ? "Reset link foundation is ready. Check your email once SMTP is connected." : "Reset request failed.");
    setLoading(false);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-white text-[#111827]">
      <section className="relative mx-auto flex min-h-[820px] w-full max-w-[1500px] flex-col items-center px-4 py-20 sm:px-6 lg:px-8 xl:px-10">
        <div className="pointer-events-none absolute left-[-120px] top-[170px] size-[420px] rounded-full bg-[#f7d95f]/10 blur-[80px]" />
        <div className="pointer-events-none absolute right-[-60px] top-[360px] size-[430px] rounded-full bg-[#ef3338]/8 blur-[95px]" />

        <nav className="relative z-10 flex items-center gap-3 text-[15px]">
          <Link href="/" className="text-[#ef3338] transition hover:text-[#111827]">Home</Link>
          <span className="text-[#98a2b3]">/</span>
          {isReset ? (
            <>
              <button type="button" onClick={() => setMode("signin")} className="text-[#ef3338] transition hover:text-[#111827]">Sign In</button>
              <span className="text-[#98a2b3]">/</span>
              <span className="text-[#111827]">Reset Password</span>
            </>
          ) : (
            <span className="text-[#111827]">Sign In</span>
          )}
        </nav>

        <div className="relative z-10 mt-9 grid size-20 place-items-center rounded-full bg-[#ef4444] text-white shadow-[0_14px_28px_rgba(239,51,56,0.24)]">
          <Icon name={isReset ? "lock" : "user"} className="size-10" />
        </div>

        <div className="relative z-10 mt-7 text-center">
          {isReset ? (
            <>
              <h1 className="text-[36px] font-black leading-tight tracking-[-0.03em] text-[#111827] max-sm:text-[30px]">Reset Your Password</h1>
              <p className="mx-auto mt-5 max-w-[520px] text-[19px] leading-8 text-[#4b5563]">Enter your email address and we&apos;ll send you a link to reset your password</p>
            </>
          ) : (
            <>
              <h1 className="max-w-[520px] text-[36px] font-black leading-tight tracking-[-0.03em] text-[#111827] max-sm:text-[30px]">
                Welcome Back to <span className="text-[#df171d]">JPSPARE</span>
              </h1>
              <p className="mx-auto mt-5 max-w-[460px] text-[19px] leading-8 text-[#4b5563]">Sign in to access your orders and account settings</p>
            </>
          )}
        </div>

        <form onSubmit={handleSubmit} className="relative z-10 mt-12 w-full max-w-[400px] rounded-[10px] border border-[#dfe5ec] bg-white p-8 shadow-[0_14px_35px_rgba(15,23,42,0.04)]">
          <div className="space-y-6">
            <AuthInput id="email" label="Email Address" type="email" placeholder="Enter your email address" icon="mail" value={email} onChange={setEmail} />

            {!isReset && (
              <AuthInput
                id="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                icon="lock"
                value={password}
                onChange={setPassword}
                rightButton={
                  <button type="button" onClick={() => setShowPassword((current) => !current)} className="grid size-8 place-items-center text-[#98a2b3] transition hover:text-[#ef3338]" aria-label="Toggle password visibility">
                    <Icon name="eye" className="size-5" />
                  </button>
                }
              />
            )}
          </div>

          {message && <p className={`mt-4 rounded-[8px] px-3 py-2 text-[13px] font-semibold ${message.includes("failed") || message.includes("Invalid") ? "bg-[#fff1f1] text-[#c8191f]" : "bg-[#ecfdf3] text-[#027a48]"}`}>{message}</p>}

          {!isReset && (
            <button type="button" onClick={() => { setMode("reset"); setMessage(""); }} className="mt-6 text-[14px] font-medium text-[#ef3338] transition hover:text-[#111827]">
              Forgot your password?
            </button>
          )}

          <button disabled={loading} type="submit" className="mt-7 flex h-12 w-full items-center justify-center gap-3 rounded-[10px] bg-gradient-to-r from-[#ef4444] to-[#df171d] text-[15px] font-black text-white shadow-[0_12px_22px_rgba(239,51,56,0.16)] transition hover:from-[#111827] hover:to-[#111827] disabled:cursor-not-allowed disabled:opacity-70">
            {loading ? "Please wait..." : isReset ? "Send Reset Link" : "Sign In"}
            {!isReset && <Icon name="arrowRight" className="size-5" />}
          </button>

          {isReset ? (
            <button type="button" onClick={() => { setMode("signin"); setMessage(""); }} className="mx-auto mt-6 flex items-center justify-center gap-2 text-[15px] font-medium text-[#4b5563] transition hover:text-[#ef3338]">
              <Icon name="arrowLeft" className="size-4" />
              Back to sign in
            </button>
          ) : (
            <p className="mt-8 text-center text-[16px] text-[#4b5563]">
              Don&apos;t have an account? <Link href="/create-account" className="font-semibold text-[#ef3338] transition hover:text-[#111827]">Create one here</Link>
            </p>
          )}
        </form>
      </section>
    </main>
  );
}
