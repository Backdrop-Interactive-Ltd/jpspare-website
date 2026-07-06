export function getAiProviderSettingsPlaceholder() {
  return {
    configured: false,
    provider: null,
    defaultModel: null,
    embeddingModel: null,
    rateLimit: null,
    monthlyBudget: null,
    lastUpdated: null,
    securityNote: "AI provider credentials are not configured. Secrets must never be stored or displayed in plaintext.",
  };
}
