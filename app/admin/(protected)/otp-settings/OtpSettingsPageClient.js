"use client";

import { useMemo, useState } from "react";

const SMS_EMPTY_FORM = {
  name: "",
  isActive: true,
  isDefault: false,
  baseUrl: "",
  method: "POST",
  senderId: "JPSPARE",
  timeoutMs: "10000",
  headersJson: '{\n  "Content-Type": "application/json"\n}',
  bodyTemplateJson: '{\n  "to": "{{identifier}}",\n  "message": "{{message}}",\n  "sender": "{{senderId}}"\n}',
  queryTemplateJson: "{}",
  apiKey: "",
  username: "",
  password: "",
  token: "",
};

const EMAIL_EMPTY_FORM = {
  name: "",
  isActive: true,
  isDefault: false,
  fromEmail: "",
  fromName: "JPSPARE",
  timeoutMs: "10000",
  host: "",
  port: "587",
  secure: false,
  username: "",
  password: "",
};

function formatDate(value) {
  if (!value) return "Never";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function parseJsonField(value, label) {
  try {
    return JSON.parse(value || "{}");
  } catch {
    throw new Error(`${label} must be valid JSON.`);
  }
}

function stringifyJson(value, fallback = {}) {
  return JSON.stringify(value || fallback, null, 2);
}

function getApiError(data, fallback) {
  return data?.message || data?.error || fallback;
}

function getApiErrorWithCode(data, fallback) {
  const message = getApiError(data, fallback);
  return data?.code ? `${data.code}: ${message}` : message;
}

function statusTone(provider) {
  if (!provider.isActive) return "bg-gray-100 text-gray-700 ring-gray-200";
  if (provider.isDefault) return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  return "bg-blue-50 text-blue-700 ring-blue-200";
}

function fieldClass() {
  return "mt-2 h-11 w-full rounded-xl border border-[#d0d5dd] bg-white px-4 text-sm font-bold text-[#111827] outline-none transition focus:border-[#ef3338] focus:ring-4 focus:ring-red-100 disabled:bg-[#f3f4f6]";
}

function textAreaClass() {
  return "mt-2 min-h-28 w-full rounded-xl border border-[#d0d5dd] bg-white px-4 py-3 font-mono text-xs font-bold text-[#111827] outline-none transition focus:border-[#ef3338] focus:ring-4 focus:ring-red-100 disabled:bg-[#f3f4f6]";
}

function Label({ label, children, hint }) {
  return (
    <label className="block">
      <span className="text-sm font-black text-[#344054]">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs font-semibold text-[#667085]">{hint}</span> : null}
    </label>
  );
}

function ToggleField({ label, checked, onChange, disabled }) {
  return (
    <label className="flex min-h-12 items-center justify-between gap-4 rounded-2xl border border-[#e5e7eb] bg-[#f8fafc] px-4">
      <span className="text-sm font-black text-[#344054]">{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} disabled={disabled} className="size-5 accent-[#ef3338]" />
    </label>
  );
}

function createSmsForm(provider) {
  if (!provider) return { ...SMS_EMPTY_FORM };
  const config = provider.configJson || {};
  return {
    ...SMS_EMPTY_FORM,
    name: provider.name || "",
    isActive: Boolean(provider.isActive),
    isDefault: Boolean(provider.isDefault),
    baseUrl: provider.baseUrl || "",
    method: provider.method || "POST",
    senderId: provider.senderId || "",
    timeoutMs: String(provider.timeoutMs || 10000),
    headersJson: stringifyJson(config.headers),
    bodyTemplateJson: stringifyJson(config.bodyTemplate),
    queryTemplateJson: stringifyJson(config.queryTemplate),
  };
}

function createEmailForm(provider) {
  if (!provider) return { ...EMAIL_EMPTY_FORM };
  const config = provider.configJson || {};
  return {
    ...EMAIL_EMPTY_FORM,
    name: provider.name || "",
    isActive: Boolean(provider.isActive),
    isDefault: Boolean(provider.isDefault),
    fromEmail: provider.fromEmail || "",
    fromName: provider.fromName || "",
    timeoutMs: String(provider.timeoutMs || 10000),
    host: config.host || "",
    port: String(config.port || 587),
    secure: Boolean(config.secure),
  };
}

export default function OtpSettingsPageClient({ initialProviders, canManage }) {
  const [providers, setProviders] = useState(initialProviders || []);
  const [activeTab, setActiveTab] = useState("PHONE");
  const [selectedId, setSelectedId] = useState("");
  const [smsForm, setSmsForm] = useState(() => createSmsForm());
  const [emailForm, setEmailForm] = useState(() => createEmailForm());
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [testIdentifier, setTestIdentifier] = useState("");
  const [testOtp, setTestOtp] = useState("");
  const [testNotice, setTestNotice] = useState("");
  const [testError, setTestError] = useState("");
  const [testBusy, setTestBusy] = useState(false);

  const channelProviders = useMemo(() => providers.filter((provider) => provider.channel === activeTab), [providers, activeTab]);
  const selectedProvider = useMemo(() => providers.find((provider) => provider.id === selectedId) || null, [providers, selectedId]);
  const activeCount = useMemo(() => providers.filter((provider) => provider.isActive).length, [providers]);
  const defaultCount = useMemo(() => providers.filter((provider) => provider.isDefault).length, [providers]);
  const currentForm = activeTab === "PHONE" ? smsForm : emailForm;

  function updateSmsForm(field, value) {
    setSmsForm((current) => ({ ...current, [field]: value }));
  }

  function updateEmailForm(field, value) {
    setEmailForm((current) => ({ ...current, [field]: value }));
  }

  function switchTab(channel) {
    setActiveTab(channel);
    setSelectedId("");
    setNotice("");
    setError("");
    setTestNotice("");
    setTestError("");
    setTestIdentifier("");
    setTestOtp("");
    setSmsForm(createSmsForm());
    setEmailForm(createEmailForm());
  }

  function selectProvider(provider) {
    setActiveTab(provider.channel);
    setSelectedId(provider.id);
    setNotice("");
    setError("");
    setTestNotice("");
    setTestError("");
    if (provider.channel === "PHONE") setSmsForm(createSmsForm(provider));
    else setEmailForm(createEmailForm(provider));
  }

  function resetForm() {
    setSelectedId("");
    setNotice("");
    setError("");
    setTestNotice("");
    setTestError("");
    setTestIdentifier("");
    setTestOtp("");
    if (activeTab === "PHONE") setSmsForm(createSmsForm());
    else setEmailForm(createEmailForm());
  }

  async function refetchProviders() {
    const response = await fetch("/api/admin/otp-providers", { credentials: "include" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(getApiError(data, "Could not refresh OTP providers."));
    setProviders(data.items || []);
  }

  function buildSmsPayload() {
    const configJson = {
      headers: parseJsonField(smsForm.headersJson, "Headers JSON"),
      bodyTemplate: parseJsonField(smsForm.bodyTemplateJson, "Body Template JSON"),
      queryTemplate: parseJsonField(smsForm.queryTemplateJson, "Query Template JSON"),
    };
    const secretJson = {};

    for (const key of ["apiKey", "username", "password", "token"]) {
      if (smsForm[key]?.trim()) secretJson[key] = smsForm[key].trim();
    }

    return {
      name: smsForm.name,
      channel: "PHONE",
      providerType: "GENERIC_HTTP",
      isActive: smsForm.isActive,
      isDefault: smsForm.isDefault,
      baseUrl: smsForm.baseUrl,
      method: smsForm.method,
      senderId: smsForm.senderId,
      timeoutMs: Number(smsForm.timeoutMs || 10000),
      configJson,
      ...(Object.keys(secretJson).length ? { secretJson } : {}),
    };
  }

  function buildEmailPayload() {
    const secretJson = {};
    if (emailForm.username.trim()) secretJson.username = emailForm.username.trim();
    if (emailForm.password.trim()) secretJson.password = emailForm.password.trim();

    return {
      name: emailForm.name,
      channel: "EMAIL",
      providerType: "SMTP",
      isActive: emailForm.isActive,
      isDefault: emailForm.isDefault,
      fromEmail: emailForm.fromEmail,
      fromName: emailForm.fromName,
      timeoutMs: Number(emailForm.timeoutMs || 10000),
      configJson: {
        host: emailForm.host,
        port: Number(emailForm.port || 587),
        secure: emailForm.secure,
      },
      ...(Object.keys(secretJson).length ? { secretJson } : {}),
    };
  }

  async function saveProvider(event) {
    event.preventDefault();
    if (!canManage) return;

    setBusy(true);
    setError("");
    setNotice("");

    try {
      const payload = activeTab === "PHONE" ? buildSmsPayload() : buildEmailPayload();
      const endpoint = selectedId ? `/api/admin/otp-providers/${selectedId}` : "/api/admin/otp-providers";
      const response = await fetch(endpoint, {
        method: selectedId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(getApiError(data, "Could not save OTP provider."));
        setBusy(false);
        return;
      }

      await refetchProviders();
      setSelectedId(data.item?.id || "");
      if (data.item?.channel === "PHONE") setSmsForm(createSmsForm(data.item));
      if (data.item?.channel === "EMAIL") setEmailForm(createEmailForm(data.item));
      setNotice(selectedId ? "OTP provider updated." : "OTP provider created.");
    } catch (caughtError) {
      setError(caughtError.message || "Could not save OTP provider.");
    } finally {
      setBusy(false);
    }
  }

  async function testProviderDelivery(event) {
    event.preventDefault();
    if (!canManage || !selectedProvider || testBusy) return;

    const identifier = testIdentifier.trim();
    const otp = testOtp.trim();

    setTestNotice("");
    setTestError("");

    if (!identifier) {
      setTestError("Please enter a test identifier.");
      return;
    }

    if (otp && !/^\d{4,8}$/.test(otp)) {
      setTestError("Optional Test OTP must be 4 to 8 digits.");
      return;
    }

    setTestBusy(true);

    try {
      const response = await fetch(`/api/admin/otp-providers/${selectedProvider.id}/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          identifier,
          ...(otp ? { otp } : {}),
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setTestError(getApiErrorWithCode(data, "Could not send test OTP."));
        return;
      }

      setTestNotice(`Test OTP delivery sent successfully.${data.identifierMasked ? ` Sent to: ${data.identifierMasked}` : ""}`);
    } catch (caughtError) {
      setTestError(caughtError.message || "Could not send test OTP.");
    } finally {
      setTestBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#ef3338]">Login OTP Delivery</p>
            <h1 className="mt-1 text-3xl font-black tracking-[-0.04em] text-[#111827]">OTP Settings</h1>
            <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-[#667085]">
              Configure SMS and Email providers for customer login OTP delivery.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex h-11 items-center rounded-xl bg-red-50 px-4 text-sm font-black text-[#ef3338] ring-1 ring-red-100">
              {providers.length} providers
            </span>
            <span className="inline-flex h-11 items-center rounded-xl bg-emerald-50 px-4 text-sm font-black text-emerald-700 ring-1 ring-emerald-100">
              {activeCount} active
            </span>
            <span className="inline-flex h-11 items-center rounded-xl bg-[#111827] px-4 text-sm font-black text-white">
              {defaultCount} default
            </span>
          </div>
        </div>
      </section>

      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">{error}</div> : null}
      {notice ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-700">{notice}</div> : null}

      <section className="rounded-3xl border border-[#e5e7eb] bg-white p-2 shadow-sm">
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            ["PHONE", "SMS OTP Gateway", "Generic HTTP gateway for phone OTP"],
            ["EMAIL", "Email OTP Gateway", "SMTP gateway for email OTP"],
          ].map(([channel, title, subtitle]) => (
            <button
              key={channel}
              type="button"
              onClick={() => switchTab(channel)}
              className={`rounded-2xl px-5 py-4 text-left transition ${
                activeTab === channel ? "bg-[#111827] text-white shadow-[0_14px_28px_rgba(17,24,39,0.18)]" : "bg-[#f8fafc] text-[#344054] hover:bg-red-50"
              }`}
            >
              <span className="text-sm font-black">{title}</span>
              <span className={`mt-1 block text-xs font-bold ${activeTab === channel ? "text-white/70" : "text-[#667085]"}`}>{subtitle}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.2fr]">
        <div className="space-y-6">
          <section className="overflow-hidden rounded-3xl border border-[#e5e7eb] bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-[#eef0f3] px-5 py-4">
              <div>
                <h2 className="text-xl font-black text-[#111827]">{activeTab === "PHONE" ? "SMS Providers" : "Email Providers"}</h2>
                <p className="mt-1 text-sm font-semibold text-[#667085]">Select a provider to edit or create a new one.</p>
              </div>
              <button type="button" onClick={resetForm} className="h-10 rounded-xl border border-[#d0d5dd] px-4 text-sm font-black text-[#344054] transition hover:border-[#ef3338] hover:text-[#ef3338]">
                New
              </button>
            </div>

            <div className="divide-y divide-[#eef0f3]">
              {channelProviders.map((provider) => (
                <button
                  key={provider.id}
                  type="button"
                  onClick={() => selectProvider(provider)}
                  className={`block w-full px-5 py-4 text-left transition hover:bg-red-50/50 ${selectedId === provider.id ? "bg-red-50/70" : "bg-white"}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-black text-[#111827]">{provider.name}</p>
                      <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-[#667085]">
                        {provider.channel} / {provider.providerType}
                      </p>
                    </div>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ring-1 ${statusTone(provider)}`}>
                      {provider.isDefault ? "Default" : provider.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-2 text-xs font-bold text-[#667085] sm:grid-cols-2">
                    <span>Secret: {provider.hasSecret ? "Configured" : "Not set"}</span>
                    <span>Updated: {formatDate(provider.updatedAt)}</span>
                  </div>
                </button>
              ))}

              {!channelProviders.length ? (
                <div className="px-5 py-12 text-center">
                  <p className="text-lg font-black text-[#111827]">No provider configured</p>
                  <p className="mt-2 text-sm font-semibold text-[#667085]">Create the first {activeTab === "PHONE" ? "SMS" : "Email"} OTP provider from the form.</p>
                </div>
              ) : null}
            </div>
          </section>

          <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">Delivery Test</p>
            <h2 className="mt-2 text-xl font-black text-[#111827]">Test Delivery</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#667085]">
              {selectedProvider
                ? `Send a safe test login OTP through ${selectedProvider.name}.`
                : "Select a provider first to test delivery."}
            </p>
            <form onSubmit={testProviderDelivery} className="mt-4 space-y-4">
              <Label label="Test Identifier" hint={activeTab === "PHONE" ? "Example: 01700000000" : "Example: customer@example.com"}>
                <input
                  value={testIdentifier}
                  onChange={(event) => {
                    setTestIdentifier(event.target.value);
                    setTestNotice("");
                    setTestError("");
                  }}
                  disabled={!canManage || !selectedProvider || testBusy}
                  className={fieldClass()}
                  placeholder={activeTab === "PHONE" ? "Enter test phone number" : "Enter test email address"}
                />
              </Label>
              <Label label="Optional Test OTP" hint="Leave blank to let the backend generate a test OTP.">
                <input
                  value={testOtp}
                  onChange={(event) => {
                    setTestOtp(event.target.value);
                    setTestNotice("");
                    setTestError("");
                  }}
                  disabled={!canManage || !selectedProvider || testBusy}
                  className={fieldClass()}
                  inputMode="numeric"
                  placeholder="4-8 digit OTP"
                />
              </Label>
              {testError ? <div className="rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm font-bold text-red-700">{testError}</div> : null}
              {testNotice ? <div className="rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm font-bold text-emerald-700">{testNotice}</div> : null}
              <button
                type="submit"
                disabled={!canManage || !selectedProvider || testBusy || !testIdentifier.trim()}
                className="h-11 rounded-xl bg-[#ef3338] px-5 text-sm font-black text-white shadow-[0_12px_22px_rgba(239,51,56,0.2)] transition hover:bg-[#dc2626] disabled:cursor-not-allowed disabled:bg-[#d0d5dd] disabled:shadow-none"
              >
                {testBusy ? "Sending..." : "Send Test OTP"}
              </button>
              {!canManage ? <p className="text-xs font-bold text-[#667085]">Only SUPER_ADMIN can send provider test delivery.</p> : null}
            </form>
          </section>
        </div>

        <form onSubmit={saveProvider} className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-[#111827]">{selectedId ? "Update Provider" : "Create Provider"}</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#667085]">
                {activeTab === "PHONE" ? "Configure a Generic HTTP SMS gateway for phone OTP." : "Configure an SMTP gateway for email OTP."}
              </p>
            </div>
            <span className="rounded-full bg-[#111827] px-4 py-2 text-xs font-black text-white">{activeTab === "PHONE" ? "PHONE" : "EMAIL"}</span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Label label="Provider Name">
              <input value={currentForm.name} onChange={(event) => (activeTab === "PHONE" ? updateSmsForm("name", event.target.value) : updateEmailForm("name", event.target.value))} disabled={!canManage} className={fieldClass()} placeholder={activeTab === "PHONE" ? "Bulk SMS BD" : "SMTP Provider"} />
            </Label>
            <Label label="Timeout MS">
              <input type="number" min="1000" max="60000" value={currentForm.timeoutMs} onChange={(event) => (activeTab === "PHONE" ? updateSmsForm("timeoutMs", event.target.value) : updateEmailForm("timeoutMs", event.target.value))} disabled={!canManage} className={fieldClass()} />
            </Label>
            <ToggleField label="Active" checked={currentForm.isActive} onChange={(value) => (activeTab === "PHONE" ? updateSmsForm("isActive", value) : updateEmailForm("isActive", value))} disabled={!canManage} />
            <ToggleField label="Default Provider" checked={currentForm.isDefault} onChange={(value) => (activeTab === "PHONE" ? updateSmsForm("isDefault", value) : updateEmailForm("isDefault", value))} disabled={!canManage} />
          </div>

          {activeTab === "PHONE" ? (
            <div className="mt-6 space-y-5">
              <div className="grid gap-4 md:grid-cols-[1.4fr_0.6fr]">
                <Label label="API URL">
                  <input value={smsForm.baseUrl} onChange={(event) => updateSmsForm("baseUrl", event.target.value)} disabled={!canManage} className={fieldClass()} placeholder="https://sms-provider.example/api/send" />
                </Label>
                <Label label="HTTP Method">
                  <select value={smsForm.method} onChange={(event) => updateSmsForm("method", event.target.value)} disabled={!canManage} className={fieldClass()}>
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                  </select>
                </Label>
              </div>
              <Label label="Sender ID">
                <input value={smsForm.senderId} onChange={(event) => updateSmsForm("senderId", event.target.value)} disabled={!canManage} className={fieldClass()} placeholder="JPSPARE" />
              </Label>

              <div className="grid gap-4 md:grid-cols-2">
                <Label label="Headers JSON">
                  <textarea value={smsForm.headersJson} onChange={(event) => updateSmsForm("headersJson", event.target.value)} disabled={!canManage} className={textAreaClass()} />
                </Label>
                <Label label="Query Template JSON / optional">
                  <textarea value={smsForm.queryTemplateJson} onChange={(event) => updateSmsForm("queryTemplateJson", event.target.value)} disabled={!canManage} className={textAreaClass()} />
                </Label>
              </div>
              <Label label="Body Template JSON">
                <textarea value={smsForm.bodyTemplateJson} onChange={(event) => updateSmsForm("bodyTemplateJson", event.target.value)} disabled={!canManage} className="mt-2 min-h-36 w-full rounded-xl border border-[#d0d5dd] bg-white px-4 py-3 font-mono text-xs font-bold text-[#111827] outline-none transition focus:border-[#ef3338] focus:ring-4 focus:ring-red-100 disabled:bg-[#f3f4f6]" />
              </Label>

              <div className="rounded-3xl border border-[#fee4e2] bg-red-50/50 p-4">
                <p className="text-sm font-black text-[#111827]">Secret Credentials</p>
                <p className="mt-1 text-xs font-semibold text-[#667085]">Leave blank while editing to keep the existing encrypted secret.</p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <Label label="API Key">
                    <input value={smsForm.apiKey} onChange={(event) => updateSmsForm("apiKey", event.target.value)} disabled={!canManage} className={fieldClass()} placeholder={selectedProvider?.hasSecret ? "Existing secret configured" : "Enter API key"} />
                  </Label>
                  <Label label="Username">
                    <input value={smsForm.username} onChange={(event) => updateSmsForm("username", event.target.value)} disabled={!canManage} className={fieldClass()} placeholder="Optional username" />
                  </Label>
                  <Label label="Password / Token">
                    <input type="password" value={smsForm.password} onChange={(event) => updateSmsForm("password", event.target.value)} disabled={!canManage} className={fieldClass()} placeholder={selectedProvider?.hasSecret ? "Existing secret configured" : "Enter password"} />
                  </Label>
                  <Label label="Token">
                    <input type="password" value={smsForm.token} onChange={(event) => updateSmsForm("token", event.target.value)} disabled={!canManage} className={fieldClass()} placeholder="Optional token" />
                  </Label>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <Label label="From Email">
                  <input value={emailForm.fromEmail} onChange={(event) => updateEmailForm("fromEmail", event.target.value)} disabled={!canManage} className={fieldClass()} placeholder="no-reply@jpspare.com" />
                </Label>
                <Label label="From Name">
                  <input value={emailForm.fromName} onChange={(event) => updateEmailForm("fromName", event.target.value)} disabled={!canManage} className={fieldClass()} placeholder="JPSPARE" />
                </Label>
                <Label label="SMTP Host">
                  <input value={emailForm.host} onChange={(event) => updateEmailForm("host", event.target.value)} disabled={!canManage} className={fieldClass()} placeholder="smtp.example.com" />
                </Label>
                <Label label="SMTP Port">
                  <input type="number" value={emailForm.port} onChange={(event) => updateEmailForm("port", event.target.value)} disabled={!canManage} className={fieldClass()} />
                </Label>
                <ToggleField label="Secure TLS/SSL" checked={emailForm.secure} onChange={(value) => updateEmailForm("secure", value)} disabled={!canManage} />
              </div>

              <div className="rounded-3xl border border-[#fee4e2] bg-red-50/50 p-4">
                <p className="text-sm font-black text-[#111827]">SMTP Credentials</p>
                <p className="mt-1 text-xs font-semibold text-[#667085]">Leave blank while editing to keep the existing encrypted secret.</p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <Label label="SMTP Username">
                    <input value={emailForm.username} onChange={(event) => updateEmailForm("username", event.target.value)} disabled={!canManage} className={fieldClass()} placeholder={selectedProvider?.hasSecret ? "Existing secret configured" : "smtp-user"} />
                  </Label>
                  <Label label="SMTP Password">
                    <input type="password" value={emailForm.password} onChange={(event) => updateEmailForm("password", event.target.value)} disabled={!canManage} className={fieldClass()} placeholder={selectedProvider?.hasSecret ? "Existing secret configured" : "smtp-password"} />
                  </Label>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={!canManage || busy}
              className="h-12 rounded-xl bg-[#ef3338] px-6 text-sm font-black text-white shadow-[0_12px_24px_rgba(239,51,56,0.22)] transition hover:bg-[#dc2626] disabled:cursor-not-allowed disabled:bg-[#d0d5dd]"
            >
              {busy ? "Saving..." : selectedId ? "Save Changes" : "Create Provider"}
            </button>
            <button type="button" onClick={resetForm} className="h-12 rounded-xl border border-[#d0d5dd] bg-white px-5 text-sm font-black text-[#344054] transition hover:border-[#ef3338] hover:text-[#ef3338]">
              Reset
            </button>
            {!canManage ? <span className="text-sm font-bold text-[#667085]">Only SUPER_ADMIN can create or update OTP providers.</span> : null}
          </div>
        </form>
      </section>
    </div>
  );
}
