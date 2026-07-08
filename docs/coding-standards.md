# Coding Standards

These standards apply to the JPSPARE Website + CMS repository.

The goal is consistent, maintainable, website-focused code that supports the customer experience and CMS without drifting into BMS/ERP ownership.

## 1. Folder Structure

- Keep route code under `app/`.
- Keep shared UI under `components/` when a component is reused across routes.
- Keep reusable logic under `lib/`.
- Keep documentation under `docs/`.
- Keep Prisma schema and migrations under `prisma/`.
- Do not create operational BMS/ERP folders in this repository.

## 2. File Naming

- Use existing naming patterns in the target folder.
- Use route conventions required by Next.js, such as `page.js` and `route.js`.
- Use descriptive names for shared helpers.
- Avoid vague names such as `utils2.js`, `new-helper.js`, or `temp.js`.

## 3. Component Naming

- Use PascalCase for React components.
- Name components by responsibility, not visual style alone.
- Keep route-only components close to the route.
- Move components to shared folders only when they are genuinely reused.

## 4. Server Components vs Client Components

- Prefer server components by default.
- Use client components only for browser interactivity, local state, effects, or event handlers.
- Do not convert a server component to a client component unless necessary.
- Keep data fetching in server components or API routes where practical.
- Keep client components small and focused.

## 5. API Route Guidelines

- Follow existing API patterns.
- Validate request bodies and query parameters.
- Return safe error messages.
- Require admin authentication for admin APIs.
- Keep public APIs customer-safe.
- Avoid destructive operations.
- Keep BMS/ERP mutations out of this repository.

## 6. Reusable Components

- Prefer composition over duplication.
- Reuse existing components before creating new ones.
- Keep components small and readable.
- Separate display components from data-loading logic when it improves clarity.
- Avoid over-abstracting components that are only used once.

## 7. Utility Functions

- Place shared helper logic in `lib/`.
- Keep utility functions pure when possible.
- Handle missing, null, and malformed data safely.
- Avoid mixing UI rendering with business logic.
- Do not hide important side effects inside generic helpers.

## 8. Hooks

- Use hooks only in client components.
- Keep hooks focused on one responsibility.
- Name hooks with the `use` prefix.
- Avoid hooks for logic that can safely run on the server.
- Do not use hooks to bypass route, auth, or data ownership boundaries.

## 9. Constants

- Use constants for repeated values, option lists, and stable labels.
- Keep constants close to the code that uses them unless they are shared.
- Avoid global constants for one-off values.
- Do not hardcode secrets or environment-specific values.

## 10. Type Safety

This project may evolve toward stronger typing over time.

Future-ready rules:

- Keep data shapes explicit.
- Normalize external or optional data at boundaries.
- Avoid ambiguous object structures.
- Prefer clear field names.
- Preserve compatibility with existing JavaScript files unless a task explicitly introduces TypeScript.

## 11. Error Handling

- Fail safely.
- Return useful but non-sensitive errors.
- Do not expose stack traces to users.
- Use fallback data where appropriate for public website pages.
- For admin operations, explain validation failures clearly.
- Avoid swallowing errors when the caller needs to know the operation failed.

## 12. Logging

- Do not log secrets, tokens, passwords, OTPs, payment data, or sensitive customer data.
- Keep logs concise.
- Avoid noisy console logging.
- Use existing logging or audit patterns when available.
- Do not add operational logging systems in this repository unless explicitly requested.

## 13. Comments

- Prefer readable code over comments.
- Add comments only when they explain non-obvious decisions or constraints.
- Do not write comments that repeat the code.
- Keep comments current when code changes.

## 14. Imports

- Keep imports organized and minimal.
- Remove unused imports in files you touch.
- Prefer existing local helpers over new dependencies.
- Do not introduce circular dependencies.
- Avoid importing server-only code into client components.

## 15. Code Formatting

- Match the surrounding file style.
- Keep indentation and spacing consistent.
- Avoid unrelated formatting churn.
- Do not reformat entire files unless the task explicitly asks.
- Keep lines readable without forcing awkward abstractions.

## 16. Performance Considerations

- Keep queries bounded.
- Fetch only fields needed for the task where practical.
- Avoid duplicate data fetching.
- Avoid unnecessary client-side JavaScript.
- Preserve static rendering where possible.
- Use server rendering when it improves SEO, freshness, or reliability.
- Avoid premature optimization that makes code harder to maintain.

## 17. Accessibility

- Use semantic HTML.
- Use buttons for actions and links for navigation.
- Label form fields.
- Preserve keyboard navigation.
- Use `aria-live` for asynchronous status messages when useful.
- Do not rely only on color to communicate state.
- Keep text readable and avoid overflow.

## 18. Security

- Never expose secrets.
- Never commit credentials.
- Validate authorization, not just authentication.
- Keep admin APIs protected.
- Sanitize unsafe error messages.
- Do not bypass existing auth or RBAC helpers.
- Do not add customer-visible pricing, operational, or financial mutations without explicit scope.

## 19. Refactoring Policy

- Refactor only when required by the task.
- Touch only required files.
- Preserve backward compatibility.
- Avoid broad refactoring.
- Avoid unrelated cleanup.
- Prefer small, targeted improvements.
- Keep business logic out of UI.
- Keep operational BMS/ERP logic out of this repository.

## 20. Code Review Checklist

Before finalizing a change, confirm:

- The task scope was followed.
- Only necessary files were changed.
- Existing behavior remains compatible.
- Components are small and understandable.
- UI and logic are separated where practical.
- Reusable code is used where it reduces duplication.
- API inputs are validated.
- Errors are safe and useful.
- No secrets or sensitive data are exposed.
- Accessibility basics are preserved.
- Performance is reasonable and queries are bounded.
- No BMS/ERP responsibilities were added.
- Requested verification was completed.
