# JPSPARE Website + CMS Architecture

## 1. Purpose

This document defines the architecture boundaries for the JPSPARE Website + CMS project.

This repository contains only the customer-facing Website and the Website CMS/Admin layer. BMS/ERP is a separate future project and will own operational business workflows after integration.

## 2. System Overview

JPSPARE Website + CMS is the customer experience and content management layer.

It exists to help customers:

- Discover products
- Browse categories, brands, collections, and search results
- Read content and blog/news articles
- Manage account-facing website features
- Add products to cart and complete checkout
- View customer-facing order/account information

It exists to help admins manage:

- Website content
- Homepage content
- Blog/news content
- SEO settings
- Media
- Website presentation settings

It must not become the operational BMS/ERP.

## 3. High-Level Architecture

```text
Customer
   |
   v
JPSPARE Website
   |
   v
Website CMS/Admin
   |
   v
Future BMS APIs
   |
   v
BMS/ERP Source of Truth
```

Current repository role:

```text
Website + CMS repo
  = Customer Experience Layer
  + Website Content Management Layer
  + Future API Integration Consumer
```

Future BMS/ERP role:

```text
BMS/ERP repo
  = Operational Source of Truth
  + Inventory / Warehouse / Purchasing / Finance / Fulfillment
```

## 4. Website Responsibilities

The Website owns customer-facing presentation and interaction.

Responsibilities:

- Public pages
- Home page
- Product listing and detail pages
- Category, brand, collection, and search pages
- Blog/news public pages
- Cart and checkout user experience
- Customer account pages
- Wishlist and customer-facing saved data
- SEO metadata, sitemap, robots, and structured data
- Customer-safe display of campaigns and marketing content

The Website should prioritize speed, clarity, accessibility, SEO, and reliable customer experience.

## 5. CMS Responsibilities

The CMS/Admin layer manages website content and presentation only.

Responsibilities:

- Homepage content
- Static page content
- Blog/news content
- SEO defaults and page-level overrides
- Media used by the website
- Website navigation or presentation settings
- Website-facing product/category/brand presentation fields
- Read-only operational summaries only when useful for website context

CMS/Admin must remain lightweight. It must not become a warehouse, purchasing, finance, fulfillment, CRM, or operations system.

## 6. Future BMS Integration

BMS/ERP will be integrated later through APIs after the BMS project is complete.

BMS/ERP will become the source of truth for:

- Inventory
- Warehouse and bin locations
- Purchasing and procurement
- Suppliers
- Fulfillment and dispatch
- Returns/RMA
- Finance and reconciliation
- Operational approvals
- Internal employee workflows

The Website may consume BMS data for display, but it must not own BMS operational logic.

## 7. API Boundary

API boundaries must be explicit.

```text
Website/CMS API
  - Serves customer website
  - Serves website admin CMS
  - Handles website-facing reads and safe customer interactions

Future BMS API
  - Owns operational writes
  - Owns inventory and fulfillment mutations
  - Owns purchasing, supplier, warehouse, finance, and reconciliation logic
```

Rules:

- Do not directly couple Website/CMS to a BMS database.
- Do not implement two-way sync without audit logging, idempotency, conflict policy, and rollback strategy.
- Do not expose secrets or operational internals through public APIs.
- Keep public APIs customer-safe.
- Keep admin APIs permission-aware.

## 8. Folder Organization Principles

Folder organization should reflect ownership.

Expected patterns:

```text
app/
  Public routes, admin routes, and API routes

components/
  Shared UI components

lib/
  Shared helpers, CMS utilities, SEO utilities, website-safe service logic

prisma/
  Website/CMS data model until BMS integration contracts are finalized

docs/
  Project documentation and architecture references
```

Do not create folders that imply this repository owns BMS operations unless the folder is clearly a future integration adapter or read-only display surface.

## 9. Component Architecture

Component rules:

- Prefer server components for data-heavy public pages.
- Use client components only for interactive behavior.
- Keep admin components practical and scannable.
- Reuse existing UI patterns before creating new ones.
- Keep forms accessible.
- Keep customer-facing UI fast, responsive, and stable.
- Avoid redesigning pages during unrelated functional tasks.

Public website components should optimize for customer trust and conversion.

Admin CMS components should optimize for clarity and repeated use.

## 10. Data Flow

Current website/CMS flow:

```text
Customer
   |
   v
Website Pages
   |
   v
Website APIs / CMS Data
   |
   v
Website Database
```

Future integrated flow:

```text
Customer
   |
   v
Website
   |
   v
Website API Adapter
   |
   v
Future BMS APIs
   |
   v
BMS/ERP Source of Truth
```

Important rule:

The Website can display operational data from BMS, but operational decisions and mutations must remain in BMS.

## 11. Design Principles

- Customer experience first.
- Content and SEO should be easy to manage.
- Operational ownership must stay clean.
- Prefer simple, explicit data flow.
- Avoid hidden automation.
- Preserve backward compatibility.
- Keep integrations contract-based.
- Keep public pages fast.
- Keep admin tools focused on website management.

## 12. Scalability Guidelines

- Keep queries bounded.
- Fetch only required fields where practical.
- Avoid unbounded scans in request paths.
- Prefer reusable helpers for repeated data normalization.
- Keep future BMS adapters isolated.
- Avoid introducing operational state machines in Website/CMS.
- Keep caching and rendering choices aligned with SEO and freshness needs.
- Design APIs so BMS integration can replace transitional local data later.

## 13. Things This Repository Must Never Own

This repository must never own:

- Warehouse operations
- Inventory source-of-truth mutations
- Purchasing/procurement workflows
- Supplier operations
- Fulfillment and dispatch workflows
- Returns/RMA operations
- Finance and reconciliation workflows
- CRM operations
- Internal employee workflow automation
- Operational approval systems
- Autonomous AI operations
- BMS/ERP source-of-truth business logic

If a feature belongs to BMS/ERP, implement it in the BMS/ERP project, not here.

This repository may only add website-facing integration adapters or read-only presentation surfaces when explicitly requested.
