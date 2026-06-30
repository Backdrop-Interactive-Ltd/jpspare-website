"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

function Icon({ name, className = "size-5" }) {
  const icons = {
    user: "M20 21a8 8 0 0 0-16 0m8-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
    mail: "M4 4h16v16H4zM4 7l8 6 8-6",
    phone: "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.7.6 2.5a2 2 0 0 1-.5 2.1L8 9.5a16 16 0 0 0 6.5 6.5l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.6.5 2.5.6a2 2 0 0 1 1.7 2Z",
    key: "M15.5 7.5 18 5a3 3 0 1 1 1 1l-2.5 2.5M14 9l-8.5 8.5a2 2 0 0 0 0 3 2 2 0 0 0 3 0L17 12",
    arrowRight: "M5 12h14m-7-7 7 7-7 7",
    lock: "M7 11V7a5 5 0 0 1 10 0v4M5 11h14v10H5z",
    eye: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
    x: "M7 7l10 10M17 7 7 17",
    xCircle: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM15 9l-6 6M9 9l6 6",
    checkCircle: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM8 12l2.5 2.5L16 9",
    check: "M5 12.5 9.5 17 19 7",
    loader: "M21 12a9 9 0 1 1-6.2-8.6",
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
      <span className="mb-1.5 block text-[16px] font-black leading-5 text-[#111827]">{label}</span>
      <span className="flex h-[40px] items-center rounded-[5px] border border-[#d1d5db] bg-white px-3 transition focus-within:border-[#ef3338] focus-within:shadow-[0_0_0_3px_rgba(239,51,56,0.08)]">
        {icon ? <Icon name={icon} className="mr-3 size-4 text-[#98a2b3]" /> : null}
        <input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="signin-auth-input min-w-0 flex-1 bg-transparent text-[15px] font-extrabold text-[#111827] outline-none selection:bg-transparent selection:text-[#111827] placeholder:font-normal placeholder:text-[#9aa3af]" style={{ fontWeight: 800 }} />
        {rightButton}
      </span>
    </label>
  );
}

const STEP_SUCCESS_DELAY_MS = 650;
const WAITING_TOAST_MIN_MS = 650;
const REDIRECT_SUCCESS_DELAY_MS = 1200;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const waitForToastMinimum = (startedAt) => {
  const remainingMs = WAITING_TOAST_MIN_MS - (Date.now() - startedAt);
  return remainingMs > 0 ? wait(remainingMs) : Promise.resolve();
};

export default function SignInPageClient() {
  const router = useRouter();
  const [step, setStep] = useState("identifier");
  const [loginMethod, setLoginMethod] = useState("phone");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [passwordResetMode, setPasswordResetMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [maskedIdentifier, setMaskedIdentifier] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [otpRequestPending, setOtpRequestPending] = useState(false);
  const submitLockRef = useRef(false);
  const toastTimersRef = useRef(new Map());
  const waitingToastIdRef = useRef(null);
  const historyNavigationRef = useRef(false);

  useEffect(() => {
    return () => {
      toastTimersRef.current.forEach((timer) => clearTimeout(timer));
      toastTimersRef.current.clear();
    };
  }, []);

  useEffect(() => {
    const currentState = window.history.state || {};
    window.history.replaceState(
      {
        ...currentState,
        jpspareSignin: true,
        signinStep: step,
        signinLoginMethod: loginMethod,
      },
      "",
      window.location.href
    );

    const handlePopState = (event) => {
      if (!event.state?.jpspareSignin) {
        return;
      }

      historyNavigationRef.current = true;
      const nextStep = event.state.signinStep || "identifier";
      const nextLoginMethod = event.state.signinLoginMethod || "phone";

      setStep(nextStep);
      setLoginMethod(nextLoginMethod);
      setMessage("");
      setDevOtp("");
      setShowPassword(false);

      if (nextStep === "identifier") {
        setOtp("");
        setPassword("");
        setPasswordResetMode(false);
        setMaskedIdentifier("");
        setOtpRequestPending(false);
      }

      window.setTimeout(() => {
        historyNavigationRef.current = false;
      }, 0);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (historyNavigationRef.current) {
      return;
    }

    const currentState = window.history.state || {};
    if (currentState.jpspareSignin && currentState.signinStep === step && currentState.signinLoginMethod === loginMethod) {
      return;
    }

    window.history.pushState(
      {
        ...currentState,
        jpspareSignin: true,
        signinStep: step,
        signinLoginMethod: loginMethod,
      },
      "",
      window.location.href
    );
  }, [step, loginMethod]);

  const safeRedirectTarget = () => {
    const redirect = new URLSearchParams(window.location.search).get("redirect");
    if (redirect && redirect.startsWith("/") && !redirect.startsWith("//")) {
      return redirect;
    }
    return "/account";
  };

  const dismissToast = (toastId) => {
    const timer = toastTimersRef.current.get(toastId);
    if (timer) {
      clearTimeout(timer);
      toastTimersRef.current.delete(toastId);
    }
    if (waitingToastIdRef.current === toastId) {
      waitingToastIdRef.current = null;
    }
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== toastId));
  };

  const showToast = (text, type = "error") => {
    const toastId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const waitingToastId = waitingToastIdRef.current;
    waitingToastIdRef.current = null;
    setToasts((currentToasts) => [{ id: toastId, text, type }, ...currentToasts.filter((toast) => toast.id !== waitingToastId)].slice(0, 6));
    const timer = setTimeout(() => dismissToast(toastId), type === "success" ? 2400 : 2200);
    toastTimersRef.current.set(toastId, timer);
  };

  const showWaitingToast = (text = "Please wait...") => {
    const existingWaitingToastId = waitingToastIdRef.current;
    if (existingWaitingToastId) {
      setToasts((currentToasts) => {
        const waitingToast = currentToasts.find((toast) => toast.id === existingWaitingToastId);
        const otherToasts = currentToasts.filter((toast) => toast.id !== existingWaitingToastId);
        return [{ ...(waitingToast || { id: existingWaitingToastId }), text, type: "waiting" }, ...otherToasts].slice(0, 6);
      });
      return;
    }

    const toastId = `waiting-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    waitingToastIdRef.current = toastId;
    setToasts((currentToasts) => [{ id: toastId, text, type: "waiting" }, ...currentToasts].slice(0, 6));
  };

  const clearWaitingToast = () => {
    if (waitingToastIdRef.current) {
      const toastId = waitingToastIdRef.current;
      waitingToastIdRef.current = null;
      setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== toastId));
    }
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
      PASSWORD_REQUIRED: "Please enter your password.",
      INVALID_PASSWORD: "Password is incorrect. Please try again.",
      PASSWORD_RECOVERY_REQUIRED: "Too many incorrect password attempts. Please verify with OTP to continue.",
      PASSWORD_LOGIN_UNAVAILABLE: "Please login with OTP.",
      LOGIN_METHOD_FAILED: "Unable to check your account. Please try again.",
    };
    setMessage(messages[code] || fallback);
    setMessageType("error");

    if (code === "INVALID_PASSWORD" || code === "INVALID_OTP") {
      showToast("Client verified Unsuccess", "error");
    }
  };

  const identifierPayload = () => (loginMethod === "phone" ? { phone: identifier } : { email: identifier });

  const checkLoginMethod = async () => {
    if (!identifier.trim()) {
      setErrorFromCode("IDENTIFIER_REQUIRED");
      return;
    }

    setLoading(true);
    setMessage("");
    const waitingStartedAt = Date.now();
    showWaitingToast();

    try {
      const response = await fetch("/api/auth/login-method", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(identifierPayload()),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.ok) {
        await waitForToastMinimum(waitingStartedAt);
        clearWaitingToast();
        setErrorFromCode(data.code, "Unable to check your account. Please try again.");
        return;
      }

      await waitForToastMinimum(waitingStartedAt);
      setMaskedIdentifier(data.identifierMasked || "your contact");

      if (data.passwordLoginRequired) {
        showToast("User verified", "success");
        await wait(STEP_SUCCESS_DELAY_MS);
        setStep("password");
        setPassword("");
        setMessage("");
        return;
      }

      setPasswordResetMode(false);
      await requestOtp();
    } catch (caughtError) {
      clearWaitingToast();
      setMessage(caughtError.message || "Unable to check your account. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const requestOtp = async ({ waitingText = "Please wait...", rollbackOnFailure = true } = {}) => {
    if (!identifier.trim()) {
      setErrorFromCode("IDENTIFIER_REQUIRED");
      return;
    }

    setStep("otp");
    setMaskedIdentifier("your contact");
    setOtp("");
    setPassword("");
    setLoading(true);
    setOtpRequestPending(true);
    setMessage("Sending OTP...");
    setMessageType("success");
    setDevOtp("");
    const waitingStartedAt = Date.now();
    showWaitingToast(waitingText);

    try {
      const response = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(identifierPayload()),
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok && data.ok) {
        await waitForToastMinimum(waitingStartedAt);
        clearWaitingToast();
        setMaskedIdentifier(data.identifierMasked || "your contact");
        setDevOtp(data.devOtp && (data.deliverySkipped || data.deliveryErrorCode) ? data.devOtp : "");
        setMessage("OTP sent. Please check your phone or email.");
        setMessageType("success");
        showToast(isEmailMethod ? "Verification email sent" : "Verification code sent", "success");
      } else {
        await waitForToastMinimum(waitingStartedAt);
        clearWaitingToast();
        setStep(rollbackOnFailure ? "identifier" : "otp");
        setOtp("");
        setMaskedIdentifier(rollbackOnFailure ? "" : maskedIdentifier || "your contact");
        const cooldownText = data.retryAfterSeconds ? ` Try again in ${data.retryAfterSeconds}s.` : "";
        setErrorFromCode(data.code, `Unable to send OTP.${cooldownText}`);
      }
    } catch (caughtError) {
      clearWaitingToast();
      setStep(rollbackOnFailure ? "identifier" : "otp");
      setOtp("");
      setMaskedIdentifier(rollbackOnFailure ? "" : maskedIdentifier || "your contact");
      setMessage(caughtError.message || "Unable to send OTP. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
      setOtpRequestPending(false);
    }
  };

  const handleForgotPassword = async () => {
    setPasswordResetMode(true);
    setPassword("");
    setShowPassword(false);
    await requestOtp();
  };

  const handlePasswordLoginError = async (data) => {
    clearWaitingToast();

    if (data.code === "INVALID_PASSWORD") {
      const attemptsRemaining = Number.isInteger(data.attemptsRemaining) ? data.attemptsRemaining : null;
      const text =
        attemptsRemaining !== null
          ? `Incorrect password. You have ${attemptsRemaining} attempt(s) left.`
          : "Incorrect password. Please try again.";

      setMessage(text);
      setMessageType("error");
      setStep("password");
      showToast("Client verified Unsuccess", "error");
      return;
    }

    if (data.code === "PASSWORD_RECOVERY_REQUIRED") {
      const text = "Too many incorrect password attempts. Please verify with OTP to continue.";
      setMessage(text);
      setMessageType("error");
      setPasswordResetMode(true);
      setPassword("");
      setShowPassword(false);
      showToast(text, "error");
      await requestOtp({ waitingText: text, rollbackOnFailure: false });
      return;
    }

    setErrorFromCode(data.code, "Password login failed.");
  };

  const loginWithPassword = async () => {
    if (!password) {
      setErrorFromCode("PASSWORD_REQUIRED");
      return;
    }

    setLoading(true);
    setMessage("");
    showWaitingToast();

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...identifierPayload(), password }),
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok && data.ok) {
        localStorage.removeItem("jpspare-auth");
        window.dispatchEvent(new Event("jpspare-auth-change"));
        showToast("Client verified successfully. Happy shopping!", "success");
        setMessage("Login successful. Redirecting...");
        setMessageType("success");
        await wait(REDIRECT_SUCCESS_DELAY_MS);
        router.push(safeRedirectTarget());
      } else {
        await handlePasswordLoginError(data);
      }
    } catch (caughtError) {
      clearWaitingToast();
      setMessage(caughtError.message || "Password login failed. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    const cleanOtp = otp.trim();
    if (!cleanOtp) {
      setErrorFromCode("OTP_REQUIRED");
      return;
    }
    if (!/^\d{6}$/.test(cleanOtp)) {
      setErrorFromCode("INVALID_OTP");
      return;
    }

    setLoading(true);
    setMessage("");
    showWaitingToast();

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...identifierPayload(), otp: cleanOtp, ...(password ? { password } : {}), ...(passwordResetMode ? { resetPassword: true } : {}) }),
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok && data.ok) {
        localStorage.removeItem("jpspare-auth");
        window.dispatchEvent(new Event("jpspare-auth-change"));
        showToast("Client verified successfully. Happy shopping!", "success");
        setMessage("Login successful. Redirecting...");
        setMessageType("success");
        await wait(REDIRECT_SUCCESS_DELAY_MS);
        router.push(safeRedirectTarget());
      } else {
        clearWaitingToast();
        setErrorFromCode(data.code, "OTP verification failed.");
      }
    } catch (caughtError) {
      clearWaitingToast();
      setMessage(caughtError.message || "OTP verification failed. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitLockRef.current || loading || otpRequestPending) {
      return;
    }
    submitLockRef.current = true;
    try {
      if (step === "otp") {
        await verifyOtp();
        return;
      }
      if (step === "password") {
        await loginWithPassword();
        return;
      }
      await checkLoginMethod();
    } finally {
      submitLockRef.current = false;
    }
  };

  const handleChangeIdentifier = () => {
    setStep("identifier");
    setOtp("");
    setPassword("");
    setPasswordResetMode(false);
    setShowPassword(false);
    setMaskedIdentifier("");
    setDevOtp("");
    setMessage("");
    setOtpRequestPending(false);
  };

  const switchLoginMethod = (method) => {
    if (loading || otpRequestPending) return;
    setLoginMethod(method);
    setIdentifier("");
    setOtp("");
    setPassword("");
    setPasswordResetMode(false);
    setShowPassword(false);
    setStep("identifier");
    setMaskedIdentifier("");
    setDevOtp("");
    setMessage("");
  };

  const methodTabs = [
    { value: "phone", label: "Phone Number" },
    { value: "email", label: "Email Address" },
  ];
  const isEmailMethod = loginMethod === "email";
  const helperText =
    step === "otp"
      ? `${isEmailMethod ? "E-Mail" : "SMS"} এ প্রাপ্ত ৬-সংখ্যার কোডটি প্রবেশ করান এবং পাসওয়ার্ড সেট করুন। পরবর্তীতে ব্যবহারের জন্য পাসওয়ার্ডটি সংরক্ষণ করুন।`
      : isEmailMethod
        ? "এখানে আপনার ইমেইল দিয়ে লগিন করুন"
        : "এখানে আপনার মোবাইল নাম্বার দিয়ে লগিন করুন";

  return (
    <main className="min-h-screen overflow-hidden bg-white text-[#111827]">
      {toasts.length ? (
        <div className="pointer-events-none fixed left-1/2 top-[154px] z-[2147483647] flex w-[min(360px,calc(100vw-32px))] -translate-x-1/2 flex-col gap-2" role="status" aria-live="polite">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`signin-toast-card w-full animate-[signinToastEnter_0.34s_cubic-bezier(0.2,0.9,0.2,1.12)] rounded-[5px] border px-3.5 py-2 ${toast.type === "error" ? "border-[#fff200] bg-[#fff200] text-[#111827] shadow-[0_14px_28px_rgba(255,242,0,0.24)]" : "border-[#ef3338] bg-[#ef3338] text-white shadow-[0_14px_28px_rgba(239,51,56,0.24)]"}`}
            >
              <div className="flex items-center gap-2 text-[14px] font-semibold leading-5">
                <span className={`signin-toast-icon signin-toast-icon-${toast.type}`}>
                  <Icon name={toast.type === "success" ? "check" : toast.type === "waiting" ? "loader" : "x"} className={`size-4 shrink-0 text-white ${toast.type === "waiting" ? "animate-spin" : toast.type === "success" ? "signin-toast-check-mark" : toast.type === "error" ? "signin-toast-x-mark" : ""}`} />
                </span>
                <span>{toast.text}</span>
              </div>
            </div>
          ))}
        </div>
      ) : null}
      <style jsx global>{`
        .signin-toast-card {
          transform-origin: top center;
          transition: transform 0.26s ease, opacity 0.26s ease, margin 0.26s ease;
        }
        @keyframes signinToastEnter {
          from {
            opacity: 0;
            transform: translateY(-14px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .signin-toast-icon {
          display: inline-flex;
          height: 18px;
          width: 18px;
          flex: 0 0 auto;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.16);
          transform-origin: center;
        }
        .signin-toast-icon-success {
          height: 20px;
          width: 20px;
          background: #00c900;
          box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.16), 0 8px 18px rgba(0, 201, 0, 0.26);
          animation: signinToastSuccessIcon 0.58s cubic-bezier(0.2, 1.45, 0.35, 1) both;
        }
        .signin-toast-check-mark {
          stroke-width: 3.2;
          animation: signinToastCheckMark 0.42s ease-out 0.12s both;
        }
        .signin-toast-icon-error {
          height: 21px;
          width: 21px;
          background: #ef3338;
          box-shadow: inset 0 1px 4px rgba(255, 255, 255, 0.32), inset 0 -3px 7px rgba(170, 0, 6, 0.2), 0 8px 18px rgba(239, 51, 56, 0.28);
          animation: signinToastErrorIcon 0.58s cubic-bezier(0.2, 1.45, 0.35, 1) both;
        }
        .signin-toast-x-mark {
          stroke-width: 3.4;
          animation: signinToastXMark 0.42s ease-out 0.1s both;
        }
        .signin-toast-icon-waiting {
          background: rgba(255, 255, 255, 0.12);
          animation: signinToastWaitingIcon 0.7s ease-in-out both;
        }
        .signin-auth-input::selection {
          background: transparent;
          color: #111827;
        }
        .signin-auth-input::-moz-selection {
          background: transparent;
          color: #111827;
        }
        .signin-auth-input:-webkit-autofill,
        .signin-auth-input:-webkit-autofill:hover,
        .signin-auth-input:-webkit-autofill:focus {
          -webkit-text-fill-color: #111827;
          box-shadow: 0 0 0 1000px #ffffff inset;
          transition: background-color 9999s ease-out;
        }
        @keyframes signinToastSuccessIcon {
          0% {
            opacity: 0;
            transform: scale(0.25);
            box-shadow: 0 0 0 0 rgba(0, 201, 0, 0.18), 0 0 0 0 rgba(255, 255, 255, 0.12);
          }
          52% {
            opacity: 1;
            transform: scale(1.34);
            box-shadow: 0 0 0 9px rgba(0, 201, 0, 0.16), 0 8px 18px rgba(0, 201, 0, 0.28);
          }
          100% {
            opacity: 1;
            transform: scale(1);
            box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.16), 0 8px 18px rgba(0, 201, 0, 0.26);
          }
        }
        @keyframes signinToastCheckMark {
          0% {
            opacity: 0;
            transform: scale(0.52) rotate(-10deg);
          }
          68% {
            opacity: 1;
            transform: scale(1.12) rotate(0deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }
        @keyframes signinToastErrorIcon {
          0% {
            opacity: 0;
            transform: scale(0.2) rotate(-18deg);
          }
          38% {
            opacity: 1;
            transform: scale(1.28) rotate(7deg);
          }
          58% {
            transform: scale(0.98) rotate(-5deg);
          }
          78% {
            transform: scale(1.04) rotate(3deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }
        @keyframes signinToastXMark {
          0% {
            opacity: 0;
            transform: scale(0.38) rotate(-20deg);
          }
          60% {
            opacity: 1;
            transform: scale(1.16) rotate(0deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }
        @keyframes signinToastWaitingIcon {
          0% {
            opacity: 0;
            transform: scale(0.78);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
      <section className="relative mx-auto flex min-h-[720px] w-full max-w-[1500px] flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8 xl:px-10">
        <div className="pointer-events-none absolute left-[-120px] top-[170px] size-[420px] rounded-full bg-[#f7d95f]/10 blur-[80px]" />
        <div className="pointer-events-none absolute right-[-60px] top-[360px] size-[430px] rounded-full bg-[#ef3338]/8 blur-[95px]" />

        <form onSubmit={handleSubmit} className="relative z-10 w-full max-w-[450px] rounded-[8px] border border-[#edf0f4] bg-[#f9fafb] px-6 py-6 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
          <div className="flex justify-center">
            <img src="/jpspare-logo-wide-clean.png" alt="JPSPARE" className="h-auto w-[245px] max-w-full [filter:brightness(0)_saturate(100%)_invert(31%)_sepia(83%)_saturate(2590%)_hue-rotate(336deg)_brightness(98%)_contrast(91%)]" />
          </div>
          <p className="mt-5 text-center text-[14px] font-medium leading-5 text-[#111827]">{helperText}</p>

          <div className="mt-6 border-b border-[#9ca3af]">
            <div className="flex items-end gap-3">
              {methodTabs.map((tab) => (
                <button key={tab.value} type="button" onClick={() => switchLoginMethod(tab.value)} disabled={loading || otpRequestPending} className={`relative pb-1.5 text-[15px] transition disabled:cursor-not-allowed disabled:opacity-60 ${loginMethod === tab.value ? "font-[800] text-[#ef3338]" : "font-[600] text-[#111827]"}`}>
                  {tab.label}
                  {loginMethod === tab.value ? <span className="absolute bottom-[-1px] left-0 h-0.5 w-full bg-[#ef3338]" /> : null}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {step === "identifier" ? (
              <AuthInput
                id="identifier"
                label={isEmailMethod ? "ইমেইল" : "মোবাইল নাম্বার"}
                type={isEmailMethod ? "email" : "tel"}
                placeholder={isEmailMethod ? "আপনার ইমেইল দিন" : "আপনার ফোন নাম্বার দিন"}
                value={identifier}
                onChange={setIdentifier}
              />
            ) : step === "otp" ? (
              <>
                <AuthInput
                  id="otp-identifier"
                  label={isEmailMethod ? "ইমেইল" : "মোবাইল নাম্বার"}
                  type={isEmailMethod ? "email" : "tel"}
                  placeholder={isEmailMethod ? "আপনার ইমেইল দিন" : "আপনার ফোন নাম্বার দিন"}
                  value={identifier}
                  onChange={setIdentifier}
                />
                <AuthInput id="otp" label="OTP" type="text" placeholder="OTP দিন" value={otp} onChange={(value) => setOtp(value.replace(/\D/g, "").slice(0, 6))} />
                <AuthInput
                  id="setup-password"
                  label="পাসওয়ার্ড (পরবর্তীতে ব্যবহারের জন্য)"
                  type={showPassword ? "text" : "password"}
                  placeholder="পাসওয়ার্ড দিন"
                  value={password}
                  onChange={setPassword}
                  rightButton={
                    <button type="button" onClick={() => setShowPassword((current) => !current)} className="ml-3 text-[#7b8494] transition hover:text-[#ef3338]" aria-label={showPassword ? "Hide password" : "Show password"}>
                      <Icon name="eye" className="size-[18px]" />
                    </button>
                  }
                />
              </>
            ) : (
              <>
                <AuthInput
                  id="password-identifier"
                  label={isEmailMethod ? "ইমেইল" : "মোবাইল নাম্বার"}
                  type={isEmailMethod ? "email" : "tel"}
                  placeholder={isEmailMethod ? "আপনার ইমেইল দিন" : "আপনার ফোন নাম্বার দিন"}
                  value={identifier}
                  onChange={setIdentifier}
                />
                <AuthInput
                  id="password"
                  label="পাসওয়ার্ড"
                  type={showPassword ? "text" : "password"}
                  placeholder="পাসওয়ার্ড দিন"
                  value={password}
                  onChange={setPassword}
                  rightButton={
                    <button type="button" onClick={() => setShowPassword((current) => !current)} className="ml-3 text-[#7b8494] transition hover:text-[#ef3338]" aria-label={showPassword ? "Hide password" : "Show password"}>
                      <Icon name="eye" className="size-[18px]" />
                    </button>
                  }
                />
                <div className="-mt-1 text-right">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={loading}
                    className="text-[9px] font-normal leading-none text-[#ef3338] transition hover:text-[#111827] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Forgot Password?
                  </button>
                </div>
              </>
            )}
          </div>

          <button disabled={loading || (step === "otp" && otpRequestPending)} type="submit" className="mt-4 flex h-11 w-full items-center justify-center gap-3 rounded-[7px] bg-gradient-to-r from-[#ef3338] to-[#df171d] text-[16px] font-black text-white shadow-[0_12px_22px_rgba(239,51,56,0.16)] transition hover:from-[#d92329] hover:to-[#c9141a] disabled:cursor-not-allowed disabled:opacity-70">
            {otpRequestPending ? "পাঠানো হচ্ছে..." : loading ? "অপেক্ষা করুন..." : "সাবমিট করুন"}
          </button>

        </form>
      </section>
    </main>
  );
}
