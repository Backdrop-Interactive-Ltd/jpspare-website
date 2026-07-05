# JPSPARE Source of Truth and Admin Control Map

This document defines which system owns each major feature and data area for the JPSPARE website, the current website admin, and the future BMS/ERP system.

All future website, admin, CMS, BMS, and integration work should check this file before implementation.

## 1. Project Strategy Summary

The current JPSPARE project is the public ecommerce website plus a lightweight website admin/CMS. Its job is to manage the storefront experience: product display, media, homepage content, website SEO, orders review, API settings, and basic ecommerce operations.

The full BMS is not built yet. The future BMS will be developed later from the owner-provided BMS UI design. Its job should be deeper business operations: suppliers, purchasing, warehouse inventory, fulfillment workflow, advanced reporting, accounting, reconciliation, and customer service operations.

BMS write/sync endpoints are paused for now because the BMS data contract is not finalized. Read-only BMS lookup endpoints and API key authentication already exist, but mutation endpoints should wait until ownership, payload shape, idempotency rules, and conflict handling are approved.

## 2. Website CMS Ownership

The website remains the customer-facing storefront, marketing CMS, and lightweight ecommerce admin. It should be optimized for a light-employee, automation-heavy operating model: business users manage public content, marketing, product presentation, customer-facing incentives, and high-level order visibility without owning deep warehouse or finance workflows.

Website CMS owns:

- Public storefront pages, layouts, components, and UX.
- Homepage CMS, static page CMS, blog/news CMS, offers page, FAQ/help/legal pages, and content copy.
- Header, footer, navigation, mega menu, announcement bar, and website display settings.
- Website SEO Manager, metadata, sitemap, robots, structured data, and social/OG settings.
- Media library and public product/category/brand presentation assets.
- Product storefront presentation: public title, description, images, badges, SEO, featured flags, menu visibility, and display ordering.
- Category and brand presentation: logos, thumbnails, public descriptions, SEO, menu/featured status.
- Customer account UX: login/profile, addresses, vehicles, wishlist, cart, order history, notifications inbox, loyalty wallet, referral dashboard.
- Website checkout, payment initiation, public order creation, and customer-facing order confirmation.
- Marketing/growth modules: coupons, campaigns, customer segments, email templates, notification templates, loyalty, and referrals.
- API key settings and read-only integration visibility until BMS write contracts are approved.

Current website admin operational features are transitional. Inventory adjustment, suppliers, purchases, order status operation, and fulfillment-like views may exist in the website repository now, but they should not expand into a full operations suite inside the Website CMS.

## 3. Future BMS Ownership

The future BMS becomes the operational source of truth for inventory, warehouse, procurement, fulfillment, reconciliation, and staff operations. It should be built separately from the Website CMS after the owner-provided BMS UI and data contract are approved.

Future BMS owns:

- Warehouse inventory, bin/location stock, stock transfers, reconciliation, cycle counts, and stock corrections.
- Procurement: suppliers, purchase orders, receiving, supplier invoices, cost history, and lead times.
- Fulfillment: order picking, packing, dispatch, courier assignment, delivery tracking, failed delivery handling.
- Returns/RMA/refunds operational workflow.
- Payment reconciliation, settlement matching, accounting exports, finance reports, and audit trails.
- Supplier performance, demand planning, inventory intelligence, reorder suggestions, dead stock, and forecasting.
- Staff dashboards, role-based operational task queues, approvals, productivity metrics, and shift/workload reporting.
- Customer service operations: support cases, internal notes, call follow-up, escalation queues.
- Advanced reporting across sales, margin, fulfillment SLA, stock aging, procurement, and finance.

## 4. Shared Data Boundaries

Shared data must have field-level direction of truth before any write sync is implemented.

| Data Area | Website CMS Responsibility | Future BMS Responsibility | Sync Direction Rule |
| --- | --- | --- | --- |
| Products | Public presentation, media, SEO, featured/display fields | SKU master, cost, procurement identity, operational status | Field-level ownership required before mutation sync |
| Categories | Menu, SEO, public ordering, storefront taxonomy | Operational category mapping if needed | BMS may sync identities; website owns display |
| Brands | Logo, SEO, storefront presentation | Supplier/brand operational mapping if needed | BMS may sync identities; website owns display |
| Inventory | Read availability, reserve during checkout until BMS takes over | Warehouse stock, reservations, adjustments, reconciliation | BMS should become source of truth |
| Orders | Customer checkout/order creation and customer order history | Fulfillment status, dispatch, delivery, operational notes | Website creates; BMS fulfills and updates |
| Customers | Auth, profile, addresses, account UX | Support/service records and operational customer notes | Shared with strict privacy boundaries |
| Payments | Gateway initiation and payment event capture | Reconciliation, settlement, finance reporting | Website captures; BMS reconciles |
| Coupons/campaigns/loyalty/referrals | Customer-facing rules and storefront display | Reporting/approval/finance visibility later | Website primary unless BMS reporting needs a read model |

## 5. Required BMS Modules

- BMS Dashboard and staff task center
- Product/SKU operations master
- Warehouse/location inventory
- Stock transfers, adjustments, cycle counts, and reconciliation
- Supplier management
- Purchase order and receiving workflow
- Fulfillment workflow: pick, pack, dispatch, delivery
- Courier/delivery management
- Returns, refund, and warranty/RMA workflow
- Customer service/ticketing and internal notes
- Payment reconciliation and accounting exports
- Inventory intelligence: stock health, reorder suggestions, demand forecast, dead stock, ABC analysis
- Supplier performance and lead-time analytics
- Reports/BI and audit logs
- Integration monitor, sync retry queue, and conflict resolution center

## 6. Required Integration APIs

Before any BMS write sync, build the integration layer with logs, idempotency, and conflict handling.

Required APIs and infrastructure:

- Service-to-service authentication with scoped API keys or signed tokens.
- Integration audit log for every inbound/outbound BMS event.
- Idempotency key support for all mutation endpoints.
- Sync status, retry count, error message, and dead-letter handling.
- Product/category/brand identity sync with explicit field ownership.
- Inventory availability read API for website storefront.
- Inventory mutation webhook/API from BMS to website after contract approval.
- Order-created outbound event from website to BMS.
- Order fulfillment/status inbound event from BMS to website.
- Payment reconciliation status inbound event.
- Customer lookup/update APIs with privacy-safe field controls.
- Webhooks for order created, payment paid/failed/refunded, stock changed, purchase received, return approved, and delivery status changed.
- Admin integration monitor for successful, pending, failed, and conflicted sync events.

## 7. Sync Conflict Risks

- Product price, stock, SKU, and status can diverge if Website CMS and BMS both mutate the same fields.
- Order status can become inconsistent if website admin and BMS fulfillment both update lifecycle states.
- Inventory can oversell if website reservation and BMS warehouse reservation run independently.
- Payment status can become unsafe if gateway callbacks, admin edits, and BMS reconciliation all write without precedence rules.
- Supplier/purchase data inside the website can drift from future BMS procurement if transitional modules keep expanding.
- Customer profile edits need privacy and merge rules before BMS service notes or support data are synced.
- Campaign/coupon/loyalty/referral finance impact may need BMS reporting but should not be double-counted.
- Two-way mutation sync without idempotency can duplicate orders, inventory movements, rewards, or payment updates.

## 8. Recommended Implementation Roadmap

1. Freeze this Website CMS vs BMS ownership contract.
2. Define field-level source of truth for products, orders, inventory, payments, and customers.
3. Add integration audit log, idempotency, retry, and conflict models.
4. Keep existing BMS endpoints read-only until contracts are approved.
5. Build BMS core shell and staff role model from owner-approved UI.
6. Build BMS product/SKU and warehouse inventory modules.
7. Build order fulfillment and dispatch workflow.
8. Build suppliers, purchasing, and receiving.
9. Build payment reconciliation and accounting exports.
10. Build inventory intelligence and operational reporting.
11. Enable controlled one-way sync first, then tightly scoped two-way sync only where ownership is explicit.

## 9. Do Not Build Now

- Two-way BMS mutation sync.
- Inventory mutation sync from BMS without integration logs and idempotency.
- Order status mutation from BMS without lifecycle precedence rules.
- Payment mutation/reconciliation writes without gateway/admin/BMS precedence.
- Supplier and purchase expansion inside Website CMS as a long-term operations suite.
- Advanced warehouse/bin/location logic inside Website CMS.
- Accounting or settlement reconciliation inside Website CMS.
- Operational staff task queues inside Website CMS.
- Any major feature without assigning Website CMS vs BMS ownership first.
- Random UI redesign without approved owner design.

## 10. UI Redesign Rule

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

## 11. Recommended Next Work Order

1. Customer auth/account cleanup
2. Product data consistency cleanup
3. Complete Website CMS/customer-facing modules that are already in progress
4. BMS UI design analysis from owner-approved design
5. Integration audit/idempotency/conflict foundation
6. BMS core development
7. Website-BMS write sync after contract approval

## 12. Developer Rules For Future Codex Tasks

- Always check this file before BMS, admin, CMS, API, or integration work.
- Do not add major features without assigning an owner.
- Do not create write sync endpoints without an approved BMS contract.
- Do not create two-way mutation sync until integration logs, idempotency, and conflict policy exist.
- Keep website admin and future BMS responsibilities separated.
- Keep the website admin lightweight and storefront-focused.
- Keep suppliers, purchases, advanced warehouse, reports, and accounting out of the website admin unless the roadmap changes.
- For shared data, define direction of truth before writing code.
- Keep read-only integration endpoints safe until write sync is explicitly approved.
- Do not redesign UI without owner-provided screenshots or design references.
