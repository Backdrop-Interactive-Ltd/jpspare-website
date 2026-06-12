export function parsePriceValue(value) {
  if (typeof value === "number") return value;

  const amount = Number(String(value || "").replace(/^(Tk\.?|৳)\s*/i, "").replace(/,/g, ""));
  return Number.isFinite(amount) ? amount : null;
}

export function formatPriceDisplay(value) {
  function formatAmount(amount) {
    return `৳${amount.toLocaleString("en-US", {
      minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
      maximumFractionDigits: 2,
    })}`;
  }

  if (typeof value === "number") {
    return formatAmount(value);
  }

  const text = String(value || "").trim();
  if (!text) return "৳0";
  if (/^(Tk\.?|৳)\s*/i.test(text)) {
    const amount = parsePriceValue(text);
    if (Number.isFinite(amount)) return formatAmount(amount);
  }
  return text.replace(/^Tk\.?\s*/i, "৳").replace(/\s+Tk\b/gi, " ৳").replace(/\bTk\b/gi, "৳");
}
