# UI Guidelines

These guidelines define the JPSPARE Website + CMS design system principles.

They are intentionally implementation-neutral. Do not treat this document as a list of CSS classes.

## 1. Design Philosophy

- Mobile-first.
- Minimal and modern.
- Clear before decorative.
- Fast before flashy.
- Accessible by default.
- Consistent visual hierarchy.
- Customer-facing pages should feel trustworthy and easy to browse.
- Admin pages should feel practical, dense enough for work, and easy to scan.

## 2. Layout & Container

- Use consistent page containers.
- Keep primary content aligned across pages.
- Avoid unnecessary nested containers.
- Give pages a clear information hierarchy.
- Public pages should prioritize product discovery and conversion.
- Admin pages should prioritize scanning, filtering, and repeated action.

## 3. Responsive Breakpoints

- Design from mobile upward.
- Ensure every page works on small screens first.
- Tablet and desktop layouts may add columns, not new complexity.
- Avoid hiding critical actions on mobile.
- Do not rely on hover-only interactions.

## 4. Spacing System

- Use consistent spacing increments.
- Keep related elements close.
- Use larger spacing to separate sections.
- Avoid cramped forms and tables.
- Avoid excessive whitespace in admin workflows.

## 5. Typography

- Use a clear hierarchy for headings, body text, labels, and helper text.
- Keep body text readable.
- Avoid oversized text inside compact UI.
- Use strong typography for product names, prices, and key actions.
- Do not use negative letter spacing.

## 6. Color Token Strategy

Color tokens should be defined centrally in the future.

Suggested token categories:

- Brand
- Text
- Background
- Border
- Surface
- Success
- Warning
- Error
- Info
- Disabled

Use colors consistently by meaning, not by one-off visual preference.

## 7. Border Radius

- Keep radius consistent across similar components.
- Use smaller radius for admin tables, forms, and dense controls.
- Use moderate radius for cards and content surfaces.
- Avoid overly rounded controls unless the existing design pattern requires it.

## 8. Shadows

- Use shadows sparingly.
- Prefer borders and spacing for structure.
- Use stronger shadows only for overlays, modals, drawers, or active floating UI.
- Avoid decorative shadow-heavy layouts.

## 9. Buttons

- Buttons should clearly communicate action priority.
- Use primary buttons for the main action.
- Use secondary buttons for supporting actions.
- Use destructive styling only for destructive actions.
- Disable buttons during async work.
- Show loading feedback when actions take time.

## 10. Inputs & Forms

- Every input needs a clear label.
- Helper text should explain format or constraints.
- Validation messages should be specific and safe.
- Required fields should be obvious.
- Keep forms grouped by meaning.
- Avoid long forms without clear sections.

## 11. Product Cards

- Product image, title, price, and primary action should be easy to identify.
- Preserve consistent image ratios.
- Avoid layout shift when product data changes.
- Badges should be meaningful and limited.
- Product cards should remain readable on mobile.

## 12. Tables

- Tables should support scanning.
- Use clear column names.
- Keep status values visually distinct.
- Empty states should explain when no data exists.
- Avoid crowding too many actions into each row.
- Admin tables should support filtering or search when data can grow.

## 13. Modals & Drawers

- Use modals for focused confirmation or short forms.
- Use drawers for contextual editing or detail views.
- Keep close/cancel behavior predictable.
- Avoid stacking multiple overlays.
- Trap focus when overlays are open.

## 14. Loading States

- Show loading states for async actions.
- Prefer skeletons or clear progress messages for page-level loading.
- Disable repeated submissions while a request is running.
- Avoid sudden layout jumps after loading completes.

## 15. Empty States

- Empty states should be calm and useful.
- Explain what is missing.
- Offer the next safe action when appropriate.
- Do not make empty states look like errors unless something failed.

## 16. Icons

- Use icons to support recognition, not replace unclear labels.
- Pair unfamiliar icons with text or tooltips.
- Keep icon style consistent.
- Do not use decorative icons that add noise.

## 17. Images

- Use real product, brand, category, or content imagery where possible.
- Maintain stable aspect ratios.
- Optimize images for performance.
- Avoid blurry, stretched, or misleading images.
- Provide meaningful alt text for content images.

## 18. Animations

- Use animation sparingly.
- Motion should clarify state changes, not distract.
- Keep animations quick and subtle.
- Respect reduced-motion preferences.
- Avoid animation that blocks user action.

## 19. Accessibility

- Use semantic structure.
- Maintain keyboard navigation.
- Ensure visible focus states.
- Keep contrast readable.
- Use buttons for actions and links for navigation.
- Do not rely only on color for meaning.
- Announce async status changes when useful.

## 20. Component Reuse Rules

- Reuse existing components before creating new ones.
- Prefer composition over duplication.
- Keep components small and focused.
- Separate UI from data and business logic.
- Do not create a shared component too early.
- Promote a component to shared only after repeated use is clear.
- Preserve existing behavior when improving visuals.
