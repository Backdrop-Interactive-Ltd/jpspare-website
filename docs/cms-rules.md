# CMS Rules

These rules define how the JPSPARE Website CMS should be used and extended.

The CMS manages website content only. It must never become the operational BMS/ERP.

## 1. CMS Purpose

The CMS exists to help admins manage the customer-facing website experience.

It should make website content easy to create, update, publish, and maintain without requiring code changes for routine content work.

## 2. CMS Responsibilities

The CMS may own:

- Homepage content
- Static website pages
- Blog/news content
- SEO metadata
- Media used by the website
- Navigation and menu presentation
- Banners and promotional presentation
- Website landing page content
- Product/category/brand presentation fields

The CMS must remain focused on content and website management.

## 3. Website vs CMS Ownership

Website owns:

- Public customer experience
- Page rendering
- Product browsing experience
- Cart and checkout presentation
- Customer-facing account pages

CMS owns:

- Content configuration
- Website presentation settings
- Editorial workflows
- SEO and media management

The Website consumes CMS content. The CMS does not own operational business workflows.

## 4. Content Types

CMS content types may include:

- Homepage sections
- Static pages
- Blog posts
- Blog categories
- Banners
- Landing pages
- SEO settings
- Media assets
- Navigation items

Content types should be simple, explicit, and easy to maintain.

## 5. Homepage Management

Homepage CMS should control customer-facing content sections such as:

- Hero content
- Featured product presentation
- Category highlights
- Promotional banners
- Featured articles
- Trust or service messaging

Homepage CMS must not control operational decisions such as inventory allocation, warehouse routing, purchasing, or fulfillment.

## 6. Navigation Management

Navigation management should focus on website browsing structure.

Allowed:

- Header links
- Footer links
- Menu labels
- Category/brand presentation
- Mega menu content

Not allowed:

- Operational workflow routing
- Employee task routing
- BMS/ERP navigation

## 7. Product Presentation Rules

CMS may manage product presentation fields needed for the website.

Examples:

- Display title
- Short description
- SEO fields
- Media
- Featured flags
- Website category/brand presentation

CMS must not own operational product data such as:

- Inventory source of truth
- Warehouse stock
- Supplier cost management
- Procurement decisions
- Fulfillment rules

Pricing ownership should remain conservative. Website may display pricing, but operational pricing authority belongs to the future BMS unless explicitly scoped otherwise.

## 8. Blog Management

Blog CMS may manage:

- Blog posts
- Blog categories
- Draft/published status
- Featured images
- Authors
- Tags
- SEO fields

Blog content should be optimized for readability, SEO, and customer trust.

## 9. SEO Management

SEO CMS may manage:

- Global defaults
- Page-level metadata
- Blog metadata
- Product/category/brand presentation metadata
- Open Graph images
- Canonical settings
- Sitemap and robots settings

SEO settings must have safe fallbacks so missing CMS data does not break public pages.

## 10. Media Library Rules

The media library should store website-safe assets.

Rules:

- Use descriptive filenames or titles where possible.
- Prefer optimized images.
- Keep alt text meaningful.
- Avoid uploading sensitive internal documents.
- Do not store operational records, invoices, financial documents, or private BMS assets as CMS media.

## 11. Banner Management

Banners are website presentation content.

They may include:

- Promotional text
- Images
- Links
- Scheduling metadata
- Display priority

Banners must not execute operational rules or modify pricing, inventory, coupons, fulfillment, or customer data.

## 12. Landing Page Rules

Landing pages should support marketing, content, and customer education.

Allowed:

- Campaign-style content
- Product/category highlights
- SEO landing pages
- Editorial content

Not allowed:

- BMS operational workflows
- Internal employee task flows
- Finance, purchasing, warehouse, CRM, or fulfillment processes

## 13. Draft / Publish Workflow

CMS content should support clear publishing states where useful.

Recommended states:

- Draft
- Published
- Archived

Draft content should not appear publicly.

Published content should be safe for customers.

Archived content should remain unavailable from normal public browsing unless explicitly linked for historical reasons.

## 14. Roles & Permissions

Roles and permissions should be future-ready.

CMS permissions may distinguish:

- View content
- Create content
- Edit content
- Publish content
- Delete or archive content
- Manage SEO
- Manage media

Permission checks should follow existing admin auth and RBAC patterns.

## 15. Audit Considerations

CMS changes should be auditable where practical.

Useful audit fields include:

- Created by
- Updated by
- Published by
- Created time
- Updated time
- Published time

Audit needs should stay focused on CMS content changes, not operational BMS workflows.

## 16. Future BMS Integration Boundary

BMS/ERP is a separate future project.

The future BMS owns:

- Inventory
- Pricing authority
- Purchasing
- Suppliers
- Warehouse operations
- Finance
- CRM
- Fulfillment
- Returns and RMA operations
- Operational approvals

CMS may display BMS-owned data after API integration, but it must not become the source of truth for operational business data.

Any BMS integration must happen through explicit APIs after BMS contracts are defined.
