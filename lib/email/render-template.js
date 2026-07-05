function safeString(value) {
  if (value === undefined || value === null) return "";
  return String(value);
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeVariableValue(value) {
  if (value === undefined || value === null) return "";
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(normalizeVariableValue);
  if (isPlainObject(value)) {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, normalizeVariableValue(item)]));
  }
  return value;
}

export function normalizeTemplateVariables(variables = {}) {
  if (!isPlainObject(variables)) return {};
  return Object.fromEntries(Object.entries(variables).map(([key, value]) => [key, normalizeVariableValue(value)]));
}

export function getTemplateVariable(variables, path) {
  const normalizedPath = safeString(path).trim();
  if (!normalizedPath) return "";

  return normalizedPath.split(".").reduce((current, key) => {
    if (current === undefined || current === null) return "";
    if (!Object.prototype.hasOwnProperty.call(Object(current), key)) return "";
    return current[key];
  }, variables);
}

export function renderTemplateString(template, variables = {}) {
  const normalizedVariables = normalizeTemplateVariables(variables);

  return safeString(template).replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, (_, key) =>
    safeString(getTemplateVariable(normalizedVariables, key)),
  );
}

export function renderTemplateValue(value, variables = {}) {
  if (typeof value === "string") return renderTemplateString(value, variables);
  if (Array.isArray(value)) return value.map((item) => renderTemplateValue(item, variables));
  if (isPlainObject(value)) {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, renderTemplateValue(item, variables)]));
  }
  return value;
}

export function extractTemplateVariables(template) {
  const matches = safeString(template).matchAll(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g);
  return [...new Set([...matches].map((match) => match[1]))].sort();
}

export function extractEmailTemplateVariables(template = {}) {
  const variables = [
    ...extractTemplateVariables(template.subject),
    ...extractTemplateVariables(template.htmlBody),
    ...extractTemplateVariables(template.textBody),
  ];

  return [...new Set(variables)].sort();
}

export function renderEmailTemplate(template = {}, variables = {}) {
  const normalizedVariables = normalizeTemplateVariables(variables);

  return {
    id: template.id || null,
    name: template.name || null,
    slug: template.slug || null,
    category: template.category || null,
    subject: renderTemplateString(template.subject, normalizedVariables),
    htmlBody: renderTemplateString(template.htmlBody, normalizedVariables),
    textBody: template.textBody ? renderTemplateString(template.textBody, normalizedVariables) : null,
    variables: normalizedVariables,
  };
}
