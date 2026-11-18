<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep phone form fields at least 16px and constrain text-bearing grid tracks with minmax(0, 1fr); this prevents input zoom and clipped records.
- Default the calendar to day view on phones while retaining explicit week/month selection; daily appointments remain readable without horizontal scrolling.
- Size the floating assistant against the visual viewport; its composer must remain accessible when a phone keyboard is open.
- Deletes go through src/lib/actions.ts (delete_* SQL functions for leads, vehicles, customers, services) and the shared ConfirmDelete/RowDelete/DeleteButton components; keeps dependent-record handling consistent and atomic.
- Branding is centralized in src/lib/brand.ts (product name, agency, footer attribution, demo flag, fictional demo business); the product mark is the SVG in src/components/admin/DetailingMark.tsx. The sample business uses the product name; the logo images live in src/assets/logo-*.asset.json.
- Scope admin visual tokens to `.admin-workspace` and preserve legacy routes when consolidating sidebar entries; public presentation and old links must remain stable.
- Use the shared BookingWizard and booking-validation helpers for owner scheduling; customer/vehicle selection must preserve ownership and prevent overlapping visits.
- Read the operational public service catalog from database records and snapshot agreed booking totals in existing appointment notes; catalog edits must not silently change new booking displays or recorded totals.
- Display unavailable payment metrics explicitly until a payment ledger exists; quotes, service prices and booking estimates are not received revenue.
