# JPSPARE Website + CMS

JPSPARE Website + CMS is the customer-facing storefront and website content management system for JPSPARE.

This repository is only for the Website + CMS. BMS/ERP is a separate future project and will become the operational source of truth after API integration.

## Scope

This project owns:

- Public website experience
- Product browsing and discovery
- Cart and checkout user experience
- Customer account pages
- Blog/news content
- SEO, sitemap, robots, and structured data
- Website CMS/Admin content management
- Website-facing API routes

This project does not own:

- Inventory operations
- Warehouse operations
- Purchasing/procurement
- Supplier operations
- Finance and reconciliation
- CRM operations
- Fulfillment and returns
- Operational approvals or automation

## Architecture Documentation

Start with these documents before making changes:

- `AGENTS.md`
- `.github/copilot-instructions.md`
- `docs/architecture.md`
- `docs/project-status.md`
- `docs/coding-standards.md`
- `docs/ui-guidelines.md`
- `docs/cms-rules.md`
- `docs/api-guidelines.md`

## Development Workflow

- Inspect before modifying.
- Work on one micro-task at a time.
- Touch only required files.
- Preserve backward compatibility.
- Avoid broad refactoring.
- Do not install packages unless explicitly requested.
- Do not implement BMS/ERP features in this repository.
- Always finish work with a final report.

## Local Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Build the project:

```bash
npm run build
```

Run Prisma validation:

```bash
npx prisma validate
```

Generate Prisma client:

```bash
npm run prisma:generate
```

## AI Instruction Files

AI assistants should read:

1. `AGENTS.md`
2. `.github/copilot-instructions.md`
3. Relevant files under `docs/`

These files define the Website/CMS scope, coding standards, API rules, UI principles, and BMS/ERP boundary.

## Commit Policy

- Do not commit unless explicitly requested.
- Do not push unless explicitly requested.
- Do not stage unrelated files.
- Use concise, task-specific commit messages.
- Keep generated or unrelated changes out of commits.

## Future BMS Integration

Future BMS/ERP integration will happen through explicit APIs after the BMS project is complete.

The Website may consume and display BMS-owned data, but it must not become the operational source of truth.

BMS/ERP will own inventory, warehouse, purchasing, suppliers, finance, fulfillment, returns, CRM, and operational approvals.
