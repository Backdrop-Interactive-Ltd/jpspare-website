# JPSPARE Website + CMS AI Instructions
Read `AGENTS.md` first. It is the master instruction file for this repository.
This repository is only for JPSPARE Website + CMS. BMS/ERP is a separate future project.

## 1. Project Scope
- Website = Customer Experience Layer.
- CMS/Admin = Content and website management layer.
- Future BMS/ERP = Operational Source of Truth.
- Do not implement BMS/ERP features in this repository.

## 2. Website Responsibilities
- Public pages
- Product browsing and discovery
- Cart and checkout user experience
- Customer account pages
- Blog/news pages
- SEO, sitemap, robots, and structured data
- Customer-facing marketing presentation

## 3. CMS Responsibilities
- Homepage content
- Static page content
- Blog/news content
- SEO settings
- Media management
- Website navigation and presentation settings
- Website-safe product/category/brand presentation fields

## 4. Future BMS Boundary
BMS/ERP will own:
- Inventory
- Warehouse
- Purchasing
- Suppliers
- Finance
- CRM
- Fulfillment
- Returns
- Operational approvals and automation

Website/CMS may consume future BMS APIs, but must not own operational business logic.

## 5. Micro-task Workflow
- Inspect before modifying.
- Work on one micro-task only.
- Modify only required files.
- Avoid broad refactoring.
- Preserve backward compatibility.
- Run only requested verification.

## 6. Coding Principles
- Match existing project patterns.
- Prefer reusable components and helpers.
- Avoid duplication.
- Keep components small.
- Separate UI from logic.
- Keep business logic out of UI.
- Avoid unnecessary packages.

## 7. UI Principles
- Mobile-first.
- Minimal, modern, and accessible.
- Consistent spacing and hierarchy.
- Use buttons for actions and links for navigation.
- Preserve existing design unless redesign is requested.

## 8. API Principles
- Public APIs must be customer-safe.
- Admin APIs require authentication and authorization.
- Validate inputs.
- Return safe errors.
- Keep APIs stateless where possible.
- Do not add operational BMS mutations here.

## 9. Documentation References
Read relevant docs before coding:
- `AGENTS.md`
- `docs/architecture.md`
- `docs/project-status.md`
- `docs/coding-standards.md`
- `docs/ui-guidelines.md`
- `docs/cms-rules.md`
- `docs/api-guidelines.md`

## 10. AI Behavior Rules
- Never implement BMS features here.
- Never install packages unless explicitly requested.
- Never commit or push unless explicitly requested.
- Never expose secrets.
- Always finish with a final report.
