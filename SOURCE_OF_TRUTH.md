# JPSPARE Source of Truth and Admin Control Map

This document defines which system owns each major feature and data area for the JPSPARE website, the current website admin, and the future BMS/ERP system.

All future website, admin, CMS, BMS, and integration work should check this file before implementation.

## 1. Project Strategy Summary

The current JPSPARE project is the public ecommerce website plus a lightweight website admin/CMS. Its job is to manage the storefront experience: product display, media, homepage content, website SEO, orders review, API settings, and basic ecommerce operations.

The full BMS is not built yet. The future BMS will be developed later from the owner-provided BMS UI design. Its job should be deeper business operations: suppliers, purchasing, warehouse inventory, fulfillment workflow, advanced reporting, accounting, reconciliation, and customer service operations.

BMS write/sync endpoints are paused for now because the BMS data contract is not finalized. Read-only BMS lookup endpoints and API key authentication already exist, but mutation endpoints should wait until ownership, payload shape, idempotency rules, and conflict handling are approved.

## 2. Ownership Matrix

| Area | Current Owner | Future Owner | Admin Editable Now | BMS Sync Later | Risk Level | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Products | Website Admin + Database | Both Website Admin and Future BMS | Yes | Yes | High | Website admin can manage storefront product data now. Before BMS write sync, decide which system owns price, stock, SKU, and status changes. |
| Product media | Website Media Library + Product CMS | Website Admin primarily | Yes | Later | Medium | Product images should stay website-owned unless the future BMS becomes the media/DAM source. |
| Categories | Website Admin + Database | Both | Yes | Yes | Medium | Website owns menu display, SEO, sorting, and presentation. BMS may sync category identities later. |
| Brands | Website Admin + Database | Both | Yes | Yes | Medium | Website owns brand presentation, logos, SEO, and featured status. BMS may sync brand identities later. |
| Homepage content | Homepage CMS + some fallback/static content | Website Admin | Partial/Yes | No | Medium | Homepage banners, featured sections, and SEO should be controlled by Website Admin/CMS. Remaining hardcoded content should move gradually. |
| Header/footer/menu | Static code + partial settings | Website Admin | Later | No/Later | Medium | Header, footer, mega menu, contact info, social links, and footer links should become CMS-controlled after final UI scope is approved. |
| Orders | Website checkout + Admin Orders | Both | Yes | Yes | High | Website creates orders. Future BMS should own fulfillment, operational status, dispatch, and deeper order workflow. |
| Customers/accounts | Website account system + Database | Both | Partial | Yes | High | Website owns login/profile/order history. BMS may own support/service workflow later. Customer auth should be cleaned up before deeper integration. |
| Inventory | Product stock fields + Inventory view | Future BMS as operational source | Basic view/limited | Yes | High | Website should show availability. Future BMS should own warehouse-level stock, reservations, adjustments, and reconciliation. |
| Payments | Website checkout/payment records | Both | Partial | Yes | High | Website records payment method/status and gateway responses. Future BMS/payment system should handle reconciliation and reporting. |
| Static pages | Static code currently | Website Admin | Later | No | Low/Medium | About, Help, Blog, Offers, and legal pages should become CMS-managed where business users need editing. |
| Settings | Mixed code, SiteSetting, API Settings | Website Admin + Future BMS for business rules | Partial | Later | Medium | Website admin owns contact, SEO, API keys, and display settings. BMS may own tax, delivery, and operational rules later. |
| API/integration settings | Website Admin API Settings + Database | Website Admin | Yes | Yes | High | Website admin owns API key management. BMS routes must require API key validation and approved contracts. |
| Suppliers/purchases | Prototype/database code only; hidden from sidebar | Future BMS | No | Later | High | Keep database/code for future reference, but do not expose supplier/purchase UI in website admin now. |
| Reports/accounting | Not a real website admin module | Future BMS | No | Later | High | Advanced reports, finance, accounting, reconciliation, and procurement reports belong in the future BMS. |

## 3. Website Admin Should Permanently Own

- Homepage CMS
- Media Library
- Website display settings
- Website SEO and meta content
- Product storefront presentation
- Category and brand presentation
- Header, footer, and menu CMS
- API key settings
- General website settings
- Public content pages that business users need to edit

## 4. Future BMS Should Own Later

- Suppliers
- Purchases
- Warehouse inventory
- Procurement workflow
- Fulfillment workflow
- Dispatch and delivery operations
- Advanced reports
- Accounting and reconciliation
- Deep customer service workflow
- Staff operation dashboards

## 5. Shared Between Website and BMS

- Products
- Categories
- Brands
- Customers
- Orders
- Inventory availability
- Payment status
- Delivery and fulfillment status

Shared areas must have a clear direction of truth before write sync is implemented. For example, the website may create an order, while the BMS later owns fulfillment status updates.

## 6. Do Not Build Now

- BMS write/sync endpoints
- Inventory mutation sync from BMS
- Order status mutation from BMS
- Payment status mutation from BMS
- Supplier UI inside website admin
- Purchase UI inside website admin
- Advanced warehouse logic inside website admin
- Accounting or reconciliation inside website admin
- Random UI redesign without approved owner design
- Major features without assigning ownership first

## 7. UI Redesign Rule

Website UI redesign will follow owner-provided UI screenshots and design references. The website should not be redesigned randomly.

Safe first redesign areas:

- Header and footer
- Homepage sections
- Product cards
- Product listing pages
- Product details page
- Cart UI
- Checkout UI

Areas needing backend cleanup before deeper redesign:

- Customer auth and account flow
- Product demo/fallback data
- Search and filter data source
- Track order data source
- Checkout edge cases
- Customer order history

## 8. Recommended Next Work Order

1. Customer auth/account cleanup
2. Product data consistency cleanup
3. Header/footer/menu CMS scope decision
4. UI redesign from provided design
5. BMS UI design analysis
6. BMS core development
7. Website-BMS write sync after contract approval

## 9. Developer Rules For Future Codex Tasks

- Always check this file before BMS, admin, CMS, API, or integration work.
- Do not add major features without assigning an owner.
- Do not create write sync endpoints without an approved BMS contract.
- Keep website admin and future BMS responsibilities separated.
- Keep the website admin lightweight and storefront-focused.
- Keep suppliers, purchases, advanced warehouse, reports, and accounting out of the website admin unless the roadmap changes.
- For shared data, define direction of truth before writing code.
- Keep read-only integration endpoints safe until write sync is explicitly approved.
- Do not redesign UI without owner-provided screenshots or design references.
