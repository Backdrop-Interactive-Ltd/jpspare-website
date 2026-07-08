# JPSPARE Website + CMS Agent Instructions

## 1. Project Mission

JPSPARE Website + CMS is the customer-facing digital storefront and content management system for JPSPARE.

The mission of this repository is to deliver a fast, reliable, searchable, SEO-friendly, and conversion-focused website where customers can discover products, read content, manage their account, and place orders.

This repository is not the BMS/ERP. BMS/ERP is a separate future project.

## 2. Project Scope

This repository owns:

- Public website pages
- Customer account experience
- Product discovery and browsing
- Cart and checkout user experience
- Website CMS content
- Blog/news CMS
- SEO metadata and structured data
- Marketing content display
- Website-facing admin controls
- Website API routes needed by the storefront and CMS
- Future API integration surfaces for BMS/ERP, when BMS is complete

Website = Customer Experience Layer.

CMS/Admin = Content and website management layer.

BMS/ERP = Separate project and future operational Source of Truth.

## 3. Out of Scope

Do not build operational BMS/ERP modules in this repository.

Out of scope includes:

- Inventory operations
- Warehouse management
- Purchasing/procurement
- Supplier management
- Fulfillment operations
- Dispatch workflows
- Returns/RMA operations
- Finance and reconciliation
- CRM operations
- Approval workflow systems
- Business automation engines
- AI operations or autonomous agents
- Operational analytics engines
- Deep employee workflow tools

Never put operational business logic inside Website/CMS.

If a task asks for BMS/ERP behavior, stop and report that it belongs in the separate BMS/ERP project unless the request is only for a website-facing integration contract or read-only placeholder.

## 4. Architecture Rules

- Keep the website as the customer experience layer.
- Keep CMS/Admin focused on content and website management.
- Treat BMS/ERP as the future operational Source of Truth.
- Do not duplicate future BMS ownership inside this repo.
- Preserve backward compatibility unless explicitly instructed otherwise.
- Prefer existing project patterns over new abstractions.
- Avoid broad refactors during feature work.
- Add abstractions only when they clearly reduce real duplication or risk.
- Keep server/client boundaries intentional.
- Do not introduce operational state machines here.
- Do not add background jobs, schedulers, automation workers, or autonomous agents here.

Next.js note:

This project may use a Next.js version with breaking changes. Before writing Next.js-specific code, inspect the relevant local docs under `node_modules/next/dist/docs/` and follow current project patterns.

## 5. Website Responsibilities

Website responsibilities include:

- Home page and public landing pages
- Product listing and product detail pages
- Category, brand, collection, and search pages
- Blog/news public pages
- Cart and checkout presentation
- Customer authentication UI
- Customer account pages
- Wishlist and customer-facing saved data
- SEO metadata, sitemap, robots, and structured data
- Public campaign, content, and promotional presentation
- Customer-safe API consumption

Website code should optimize for customer clarity, performance, reliability, and accessibility.

## 6. CMS/Admin Responsibilities

CMS/Admin responsibilities include:

- Website page content management
- Homepage content management
- Blog/news content management
- SEO settings and page-level SEO overrides
- Media management for website content
- Product/catalog presentation fields when needed for the website
- Marketing content presentation settings
- Read-only operational summaries only when useful for website context

Admin features in this repository must stay lightweight and website-focused.

Do not turn this CMS into a BMS.

## 7. Future BMS Integration Rules

BMS/ERP will be developed separately and will eventually own operational data and workflows.

Future integration rules:

- Integrate through explicit APIs only.
- Do not use direct database coupling across projects.
- Do not implement two-way sync without idempotency, audit logs, conflict policy, and rollback strategy.
- Website may cache or display BMS-owned data, but must not become the operational source of truth.
- Website may send customer-facing events to BMS through APIs after BMS contracts are defined.
- BMS should own inventory, warehouse, purchasing, supplier, finance, fulfillment, returns, and operational approvals.
- Website should own presentation, content, customer UX, and SEO.

Until BMS is complete, do not backfill its future responsibilities into this repo.

## 8. Development Workflow

Always inspect before modifying.

Before editing:

- Read the requested task carefully.
- Inspect only relevant files.
- Understand existing patterns.
- Identify the smallest safe change.
- Confirm allowed files and constraints.

While editing:

- Work only on the requested micro-task.
- Touch only necessary files.
- Avoid unrelated cleanup.
- Avoid broad refactoring.
- Preserve existing behavior unless the task asks to change it.
- Do not install packages unless explicitly required and approved.

After editing:

- Run only the verification requested by the task.
- For documentation-only tasks, do not run builds unless requested.
- Report what changed, what was verified, and any limitations.

## 9. Micro-Task Workflow

Every task should be treated as a narrow micro-task.

Rules:

- One goal at a time.
- No hidden extra features.
- No opportunistic architecture changes.
- No schema changes unless explicitly requested.
- No migrations unless explicitly requested.
- No UI redesign unless explicitly requested.
- No public route changes unless explicitly requested.
- No admin changes unless explicitly requested.
- No BMS/ERP behavior unless explicitly requested as an integration placeholder.

If the task scope is unclear, inspect first and choose the safest narrow interpretation.

## 10. Coding Standards

- Match existing code style.
- Prefer clear names over clever abstractions.
- Keep functions focused.
- Use structured data APIs instead of ad hoc string parsing where practical.
- Keep comments sparse and useful.
- Handle null, missing, and malformed data safely.
- Validate inputs at API boundaries.
- Keep data mapping explicit.
- Avoid global side effects.
- Avoid unnecessary dependencies.
- Do not add unused code.

## 11. Component Standards

- Reuse existing components and UI patterns.
- Keep server and client components separated intentionally.
- Do not convert server components to client components unless necessary.
- Keep forms accessible and clear.
- Preserve existing visual language unless asked to redesign.
- Keep repeated UI predictable.
- Avoid nested cards and unnecessary decorative wrappers.
- Use stable dimensions for tables, controls, grids, and repeated elements where layout shift is likely.

## 12. API Standards

- Follow existing API route patterns.
- Require authentication for admin APIs.
- Return safe, consistent error responses.
- Validate request bodies and query params.
- Do not expose secrets.
- Do not leak stack traces.
- Keep public APIs read-only unless a task explicitly requires mutation.
- Keep admin mutations scoped and permission-aware.
- Avoid destructive operations.
- Do not implement BMS mutation APIs in this repository until BMS contracts exist.

## 13. UI/UX Standards

- Build usable interfaces, not placeholder marketing screens.
- Preserve current layouts unless the task asks for UI changes.
- Keep admin screens practical, scannable, and work-focused.
- Use clear labels and predictable actions.
- Show empty states safely.
- Show loading and error states when user actions are asynchronous.
- Avoid visual clutter.
- Ensure text does not overlap or overflow in normal viewports.

## 14. SEO Standards

- Preserve SEO metadata behavior.
- Use safe fallbacks for missing CMS values.
- Keep canonical URLs stable.
- Do not break sitemap or robots behavior.
- Keep structured data valid and conservative.
- Avoid duplicate or misleading metadata.
- Page-level SEO overrides should fall back to global SEO defaults.

## 15. Performance Standards

- Keep queries bounded.
- Avoid unbounded scans in request/response paths.
- Fetch only required fields where practical.
- Avoid unnecessary client-side JavaScript.
- Keep public pages fast and cache-aware.
- Avoid duplicate data fetching.
- Preserve static rendering where possible.
- Use server rendering when it improves reliability or SEO.

## 16. Security Standards

- Never expose secrets, tokens, credentials, or provider keys.
- Do not log sensitive customer data.
- Require admin auth for admin routes and APIs.
- Validate authorization, not just authentication.
- Sanitize unsafe error messages.
- Do not add plaintext secret storage.
- Do not bypass existing auth/RBAC helpers.
- Do not implement autonomous execution or approval bypasses.
- Do not create customer-facing pricing or operational mutations without explicit approval.

## 17. Accessibility Standards

- Use semantic HTML where possible.
- Keep forms labeled.
- Ensure buttons are actual buttons for actions.
- Ensure links are actual links for navigation.
- Preserve keyboard accessibility.
- Use `aria-live` for asynchronous status messages where useful.
- Maintain readable contrast.
- Avoid relying only on color to communicate status.

## 18. Refactoring Rules

Refactor only when required by the task.

Allowed:

- Tiny cleanup directly related to the requested change
- Dead import removal in touched files
- Local helper extraction when it reduces risk
- Shape normalization needed for compatibility

Not allowed:

- Broad file rewrites
- Style-only churn
- Moving ownership boundaries
- Replacing working patterns without need
- Refactoring unrelated modules
- Converting website CMS into BMS/ERP

## 19. Verification Checklist

Use the verification requested by the task.

Common checks:

- `git status --short`
- `npm run build` for code changes
- `npx prisma validate` for schema or Prisma-related work
- Route/API manual QA when requested
- Documentation read-back for documentation-only tasks

For documentation-only tasks:

- Read the changed document.
- Confirm markdown is valid.
- Confirm required rules are included.
- Do not run build unless requested.

## 20. Final Report Format

Every task must end with a concise final report.

Use this structure when not otherwise specified:

```text
Goal:
Files modified:
Files created:
What changed:
Verification:
Build result:
Git status:
PASS/FAIL:
Recommended git add:
Recommended commit message:
```

If the user provides a specific final report format, follow that format exactly.

## 21. Commit Policy

- Never commit unless the user explicitly asks.
- Never push unless the user explicitly asks.
- Never stage files unless the user explicitly asks or the final report only recommends `git add`.
- Do not run destructive git commands.
- Do not revert user changes unless explicitly requested.
- Keep git status visible in final reports when requested.

Recommended commit messages should be concise and task-specific.

## 22. AI Behavior Rules

Agents working in this repository must:

- Inspect before modifying.
- Respect the requested scope.
- Work only on the requested micro-task.
- Touch only necessary files.
- Preserve backward compatibility.
- Avoid broad refactoring.
- Avoid unnecessary package installation.
- Never implement BMS/ERP features here.
- Never put operational business logic inside Website/CMS.
- Never create autonomous workflows unless explicitly requested for this repo and confirmed as website-safe.
- Never call external AI providers unless explicitly requested.
- Never create approval, automation, finance, warehouse, purchasing, supplier, fulfillment, or inventory operations in this repo.
- Always finish with a final report.

When unsure, choose the smallest safe website/CMS interpretation and report the boundary clearly.
