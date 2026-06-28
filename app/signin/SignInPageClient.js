"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

function Icon({ name, className = "size-5" }) {
  const icons = {
    user: "M20 21a8 8 0 0 0-16 0m8-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
    mail: "M4 4h16v16H4zM4 7l8 6 8-6",
    phone: "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.7.6 2.5a2 2 0 0 1-.5 2.1L8 9.5a16 16 0 0 0 6.5 6.5l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.6.5 2.5.6a2 2 0 0 1 1.7 2Z",
    key: "M15.5 7.5 18 5a3 3 0 1 1 1 1l-2.5 2.5M14 9l-8.5 8.5a2 2 0 0 0 0 3 2 2 0 0 0 3 0L17 12",
    arrowRight: "M5 12h14m-7-7 7 7-7 7",
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
  const [step, setStep] = useState("identifier");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [maskedIdentifier, setMaskedIdentifier] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const [loading, setLoading] = useState(false);
  const [otpRequestPending, setOtpRequestPending] = useState(false);

  const safeRedirectTarget = () => {
    const redirect = new URLSearchParams(window.location.search).get("redirect");
    if (redirect && redirect.startsWith("/") && !redirect.startsWith("//")) {
      return redirect;
    }
    return "/account";
  };

  const setErrorFromCode = (code, fallback = "Something went wrong. Please try again.") => {
    const messages = {
      IDENTIFIER_REQUIRED: "Please enter your phone or email.",
      INVALID_IDENTIFIER: "Please enter a valid phone or email.",
      OTP_COOLDOWN: "Please wait before requesting another OTP.",
      OTP_REQUIRED: "Please enter the OTP.",
      INVALID_OTP: "Invalid OTP. Please try again.",
      OTP_EXPIRED: "OTP expired. Please request a new one.",
      OTP_NOT_FOUND: "Please request a new OTP.",
      OTP_ATTEMPTS_EXCEEDED: "Too many attempts. Please request a new OTP.",
      CUSTOMER_BLOCKED: "This account is blocked. Please contact support.",
    };
    setMessage(messages[code] || fallback);
    setMessageType("error");
  };

  const requestOtp = async () => {
    if (!identifier.trim()) {
      setErrorFromCode("IDENTIFIER_REQUIRED");
      return;
    }

    setStep("otp");
    setMaskedIdentifier("your contact");
    setOtp("");
    setLoading(true);
    setOtpRequestPending(true);
    setMessage("Sending OTP...");
    setMessageType("success");
    setDevOtp("");

    try {
      const response = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ identifier }),
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok && data.ok) {
        setMaskedIdentifier(data.identifierMasked || "your contact");
        setDevOtp(data.devOtp && (data.deliverySkipped || data.deliveryErrorCode) ? data.devOtp : "");
        setMessage("OTP sent. Please check your phone or email.");
        setMessageType("success");
      } else {
        setStep("identifier");
        setOtp("");
        setMaskedIdentifier("");
        const cooldownText = data.retryAfterSeconds ? ` Try again in ${data.retryAfterSeconds}s.` : "";
        setErrorFromCode(data.code, `Unable to send OTP.${cooldownText}`);
      }
    } catch (caughtError) {
      setStep("identifier");
      setOtp("");
      setMaskedIdentifier("");
      setMessage(caughtError.message || "Unable to send OTP. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
      setOtpRequestPending(false);
    }
  };

  const verifyOtp = async () => {
    setLoading(true);
    setMessage("");

    const response = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ identifier, otp }),
    });
    const data = await response.json().catch(() => ({}));

    if (response.ok && data.ok) {
      localStorage.removeItem("jpspare-auth");
      window.dispatchEvent(new Event("jpspare-auth-change"));
      setMessage("Login successful. Redirecting...");
      setMessageType("success");
      router.push(safeRedirectTarget());
    } else {
      setErrorFromCode(data.code, "OTP verification failed.");
    }

    setLoading(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (step === "otp") {
      await verifyOtp();
      return;
    }
    await requestOtp();
  };

  const handleChangeIdentifier = () => {
    setStep("identifier");
    setOtp("");
    setMaskedIdentifier("");
    setDevOtp("");
    setMessage("");
    setOtpRequestPending(false);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-white text-[#111827]">
      <section className="relative mx-auto flex min-h-[760px] w-full max-w-[1500px] flex-col items-center px-4 py-16 sm:px-6 lg:px-8 xl:px-10">
        <div className="pointer-events-none absolute left-[-120px] top-[170px] size-[420px] rounded-full bg-[#f7d95f]/10 blur-[80px]" />
        <div className="pointer-events-none absolute right-[-60px] top-[360px] size-[430px] rounded-full bg-[#ef3338]/8 blur-[95px]" />

        <div className="relative z-10 mt-9 grid size-20 place-items-center rounded-full bg-[#ef4444] text-white shadow-[0_14px_28px_rgba(239,51,56,0.24)]">
          <Icon name="user" className="size-10" />
        </div>

        <div className="relative z-10 mt-7 text-center">
          <h1 className="max-w-[520px] text-[36px] font-black leading-tight tracking-[-0.03em] text-[#111827] max-sm:text-[30px]">
            Welcome Back to <span className="text-[#df171d]">JPSPARE</span>
          </h1>
          <p className="mx-auto mt-5 max-w-[460px] text-[19px] leading-8 text-[#4b5563]">Sign in to access your orders and account settings</p>
        </div>

        <form onSubmit={handleSubmit} className="relative z-10 mt-12 w-full max-w-[450px] rounded-[10px] border border-[#dfe5ec] bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
          <div className="mb-7 border-b border-[#cfd6df]">
            <div className="flex items-end gap-4">
              <span className="relative pb-2 text-[15px] font-bold text-[#ef3338]">
                OTP Login
                <span className="absolute bottom-[-1px] left-0 h-0.5 w-full rounded-full bg-[#ef3338]" />
              </span>
              <span className="pb-2 text-[15px] font-bold text-[#111827]">No Password</span>
            </div>
          </div>

          <div className="space-y-6">
            {step === "identifier" ? (
              <AuthInput id="identifier" label="Phone or Email" type="text" placeholder="Enter your phone or email" icon="phone" value={identifier} onChange={setIdentifier} />
            ) : (
              <>
                <div className="rounded-[10px] border border-[#ffd7d8] bg-[#fff7f7] px-4 py-3 text-[13px] font-semibold text-[#4b5563]">
                  {otpRequestPending ? "We're sending your OTP to " : "OTP sent to "}
                  <span className="text-[#111827]">{maskedIdentifier}</span>
                  <button type="button" onClick={handleChangeIdentifier} disabled={otpRequestPending} className="ml-2 font-black text-[#ef3338] hover:text-[#111827] disabled:cursor-not-allowed disabled:opacity-60">
                    Change
                  </button>
                </div>
                <AuthInput id="otp" label="Enter verification code" type="text" placeholder="6-digit OTP" icon="key" value={otp} onChange={(value) => setOtp(value.replace(/\D/g, "").slice(0, 6))} />
                {otpRequestPending ? <p className="text-center text-[12px] font-semibold text-[#667085]">We're sending your OTP. You can enter it here once it arrives.</p> : null}
                {devOtp ? <p className="rounded-[8px] bg-[#f8fafc] px-3 py-2 text-center text-[12px] font-bold text-[#667085]">Dev OTP: {devOtp}</p> : null}
              </>
            )}
          </div>

          {message && <p className={`mt-4 rounded-[8px] px-3 py-2 text-[13px] font-semibold ${messageType === "error" ? "bg-[#fff1f1] text-[#c8191f]" : "bg-[#ecfdf3] text-[#027a48]"}`}>{message}</p>}

          <button disabled={loading || (step === "otp" && otpRequestPending)} type="submit" className="mt-7 flex h-12 w-full items-center justify-center gap-3 rounded-[10px] bg-gradient-to-r from-[#ef4444] to-[#df171d] text-[15px] font-black text-white shadow-[0_12px_22px_rgba(239,51,56,0.16)] transition hover:from-[#111827] hover:to-[#111827] disabled:cursor-not-allowed disabled:opacity-70">
            {otpRequestPending ? "Sending..." : loading ? "Please wait..." : step === "otp" ? "Verify & Continue" : "Send OTP"}
            <Icon name="arrowRight" className="size-5" />
          </button>

          {step === "otp" ? (
            <button disabled={loading} type="button" onClick={requestOtp} className="mt-4 w-full text-center text-[14px] font-black text-[#ef3338] transition hover:text-[#111827] disabled:cursor-not-allowed disabled:opacity-60">
              Resend OTP
            </button>
          ) : null}

          <p className="mt-7 text-center text-[14px] leading-6 text-[#4b5563]">New customer? Your account will be created automatically after OTP verification.</p>
        </form>
      </section>
    </main>
  );
}
