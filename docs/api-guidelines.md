# API Guidelines

These guidelines define API design principles for the JPSPARE Website + CMS project.

Website APIs are customer-facing and CMS-facing. Operational business APIs belong to the future BMS/ERP project.

## 1. API Philosophy

- Keep APIs simple, predictable, and stateless where possible.
- Design APIs around website and CMS needs.
- Keep public APIs customer-safe.
- Keep admin APIs authenticated and permission-aware.
- Do not place operational BMS/ERP business logic in Website APIs.
- Prefer explicit contracts over hidden behavior.

## 2. REST Naming Conventions

- Use nouns for resources.
- Use plural resource names where practical.
- Keep endpoint names readable.
- Avoid action-heavy names unless the route represents a clear command.
- Use nested routes only when the relationship is important.

Examples:

```text
/api/products
/api/products/[id]
/api/categories
/api/admin/pages
/api/admin/blog-posts
```

## 3. Endpoint Structure

Recommended structure:

```text
/api/...                Public or customer-facing APIs
/api/account/...        Authenticated customer APIs
/api/admin/...          Authenticated admin CMS APIs
/api/bms/...            Future BMS integration adapters only
```

Public APIs must not expose admin-only or operational data.

Admin APIs must not become BMS operational APIs.

## 4. Request Validation

- Validate request bodies.
- Validate query parameters.
- Reject invalid IDs, dates, numbers, and enum-like values safely.
- Normalize optional values at the API boundary.
- Do not trust client-provided totals, permissions, or ownership claims.

Validation errors should be clear and safe.

## 5. Response Format

Responses should be consistent and easy to consume.

Recommended success shape:

```json
{
  "data": {},
  "message": "Success"
}
```

For list APIs:

```json
{
  "data": [],
  "pagination": {}
}
```

Existing routes may use established local shapes. Preserve backward compatibility unless the task explicitly changes the contract.

## 6. Error Handling

- Return safe error messages.
- Do not expose stack traces.
- Do not leak secrets or internal provider responses.
- Handle missing data gracefully.
- Use fallback behavior when appropriate for public website pages.
- Keep errors actionable for admin users.

Recommended error shape:

```json
{
  "error": "Safe error message"
}
```

## 7. HTTP Status Codes

Use standard status codes:

- `200` success
- `201` created
- `400` invalid request
- `401` unauthenticated
- `403` unauthorized
- `404` not found
- `409` conflict
- `422` valid request but cannot be processed
- `500` unexpected server error

Avoid returning `200` for failed mutations unless preserving an existing contract.

## 8. Pagination

Use pagination for lists that can grow.

Recommended parameters:

```text
page
limit
```

Rules:

- Provide safe defaults.
- Enforce maximum limits.
- Include pagination metadata.
- Avoid unbounded list responses.

## 9. Filtering

Filters should be explicit and predictable.

Rules:

- Validate filter values.
- Ignore unsupported filters only when safe.
- Prefer clear query parameter names.
- Avoid complex query languages in public APIs.
- Keep BMS-owned filtering logic in BMS after integration.

## 10. Sorting

Sorting should be intentional.

Rules:

- Provide stable default sorting.
- Allow only known sortable fields.
- Validate sort direction.
- Avoid exposing raw database field control to clients.

## 11. Authentication

- Public APIs may be unauthenticated only when data is safe for customers.
- Account APIs require customer authentication.
- Admin APIs require admin authentication.
- Do not bypass existing auth helpers.
- Do not expose private customer data to unauthenticated callers.

## 12. Authorization

Authentication is not enough.

Rules:

- Check role or permission for admin APIs.
- Check ownership for customer account APIs.
- Never allow users to access another customer's private data.
- Keep authorization logic close to the API boundary or shared auth helpers.

## 13. Rate Limiting

Rate limiting is future-ready.

Sensitive APIs should eventually support rate limits, especially:

- Authentication
- OTP
- Checkout
- Search
- Public forms
- Future BMS integration adapters

Until rate limiting is implemented, avoid adding APIs that are easy to abuse without protective controls.

## 14. Versioning Strategy

Prefer stable APIs and backward-compatible changes.

Future versioning options:

```text
/api/v1/...
/api/bms/v1/...
```

Do not introduce versioning casually. Use it when external consumers or BMS contracts require long-term compatibility.

## 15. Logging & Audit

- Log only what is safe and useful.
- Do not log secrets, OTPs, payment credentials, or sensitive customer data.
- Audit admin mutations where practical.
- Future BMS integration should include request IDs, idempotency keys, event logs, and conflict handling.
- Website APIs should not create operational audit systems that belong in BMS.

## 16. Security

- Validate all inputs.
- Sanitize unsafe error output.
- Never expose secrets.
- Never trust client-provided totals or permissions.
- Avoid direct database coupling with future BMS.
- Use HTTPS in deployed environments.
- Keep public responses minimal and customer-safe.

## 17. Future BMS Integration

Future BMS integration must happen through explicit APIs.

Expected future flow:

```text
Website API
   |
   v
BMS API Adapter
   |
   v
Future BMS API
   |
   v
BMS Source of Truth
```

Rules:

- Website APIs should consume BMS APIs after integration.
- BMS owns operational mutations.
- Website may display BMS data but must not become the operational source of truth.
- Two-way sync requires idempotency, audit logs, conflict policy, and rollback strategy.

## 18. Things Website APIs Must Never Own

Website APIs must never own:

- Inventory source-of-truth mutations
- Warehouse operations
- Purchasing/procurement workflows
- Supplier operations
- Finance and reconciliation workflows
- Fulfillment and dispatch operations
- Returns/RMA operations
- CRM operations
- Operational approval workflows
- Autonomous business automation
- BMS/ERP source-of-truth logic

If an API is operational rather than customer-facing or CMS-facing, it belongs in the future BMS/ERP project.
