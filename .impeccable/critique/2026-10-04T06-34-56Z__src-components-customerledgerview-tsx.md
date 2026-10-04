---
target: Customer Tabs
total_score: 18
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 2
target_identity: "file:/Users/poisson/Documents/tubodeguita/src/components/CustomerLedgerView.tsx"
target_fingerprint: "sha256:d8fcfd000c2dd51904122739b7138878f3755f1ddad13cc43eba36a860b5987a"
target_path: /Users/poisson/Documents/tubodeguita/src/components/CustomerLedgerView.tsx
timestamp: 2026-10-04T06-34-56Z
slug: src-components-customerledgerview-tsx
closed: true
---
# Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|:-----:|-----------|
| 1 | Visibility of System Status | 2 | Lack of immediate visual confirmation toasts on abono, no exchange rate telemetry on screen. |
| 2 | Match System / Real World | 1 | Zero BCV Bolívares conversion, missing Pago Móvil (phone/cédula/ref), US boilerplate form examples. |
| 3 | User Control and Freedom | 2 | No ability to edit, reverse, or void a mistyped abono or debt payment in the ledger history. |
| 4 | Consistency and Standards | 1 | Ignores `formatSecondaryMoney`; violates 44px touch target rules (uses 32px icon buttons). |
| 5 | Error Prevention | 2 | Destructive "Delete Customer" icon placed adjacent to "Collect Payment"; window.alert() usage. |
| 6 | Recognition Rather Than Recall | 2 | Forces cashiers to mentally convert debt to Bolívares; icon-only buttons rely on hover tooltips. |
| 7 | Flexibility and Efficiency | 2 | Missing quick-filter tabs ("Con Deuda", "Al Día"); no quick preset payment amounts ($5, $10, Total). |
| 8 | Aesthetic and Minimalist Design | 2 | Heavy corporate credit utilization progress bars; top KPI cards push ledger below the fold. |
| 9 | Error Recovery | 2 | Native browser `window.alert()` halts execution; no workflow to correct mistaken debt charges. |
| 10 | Help and Documentation | 2 | No inline explanation of store credit carryover, debt limit enforcement, or receipt printing. |
| **Total** | | **18/40** | **Poor (12–19)** |

---

## Design Specificity Verdict

**Verdict:** Generic SaaS Accounts Receivable disguised behind Spanish i18n strings.

### LLM Assessment
While the interface uses authentic local vocabulary (*"Libreta de Clientes y Fiados"*, *"Compra fiada"*, *"Abono recibido"*), its interaction model, data display, and ergonomics are modeled after a generic US corporate receivables system rather than a Latin American neighborhood bodega:
1. **Monolingual Currency Blindness:** Despite TuBodeguita's core tenet of dual-currency precision (USD + BCV Bolívares), `CustomerLedgerView.tsx` imports `formatSecondaryMoney` but **never calls it anywhere**. Customers asking *"¿Cuánto es en bolívares al BCV de hoy?"* force cashiers to pull out manual calculators.
2. **Missing Pago Móvil Rail:** Debt collection only supports `cash` and `card`. In Venezuela, over 80% of debt abonos occur via Pago Móvil. Cashiers have no fields for phone, cédula, or bank reference.
3. **Silicon Valley Placeholders:** The customer creation modal displays `"Robert Taylor"`, `"(555) 000-0000"`, and `"robert@example.com"`, completely alien to neighborhood commerce.
4. **Corporate Credit Framing:** Uses revolving credit utilization progress meters (`75% utilized`) instead of neighborhood trust, payment frequency (weekly/quincenal), and recent balance changes.

### Deterministic Scan
- **Findings:** 0 Errors, 2 Warnings (`gray-on-color`), 29 Advisories (`design-system-font-size`).
- **Analysis:** The 2 `gray-on-color` warnings on action buttons are false positives caused by static analyzer misattribution of `hover:` modifiers. The 29 font size advisories reflect documented sub-12px steps (`10px`, `11px`).
- **Real Critical Code/Design Smells:**
  1. **WCAG Contrast Failures:** Metadata rendered in `10px` with `text-slate-400` on white (2.56:1) and `text-neutral-500` on obsidian (4.18:1), directly violating `DESIGN.md` AA standards.
  2. **Sub-44px Touch Targets:** Card action buttons are ~32x32px icon squares with no text labels, failing tablet ergonomics.
  3. **Blocking Native Alert:** Direct call to `window.alert()` on line 107.

### Visual Overlays
- **Status:** Skipped (CLI static analysis mode).

---

## Overall Impression
The foundation has a clean, resilient local-first data architecture and full dark/light theme support. However, it fails counter speed and cultural ergonomics: by ignoring secondary currency (Bolívares), omitting Pago Móvil, and using tiny 32px icon buttons, it creates high friction for cashiers and compromises customer dignity at the counter.

---

## What's Working
1. **Robust Local-First Persistence & Ledger Audit Trail:** Every debt charge and abono writes directly to `CustomerLedgerEntry` via `dbService` with timestamps, balance-after snapshots, and sync queueing, ensuring no ledger state is lost during offline outages.
2. **Granular Transaction Statement Drawer:** The statement modal provides an explicit chronological record of charges (`sale_debt`) vs payments (`debt_payment`), allowing store owners to inspect individual transaction histories with receipt references.
3. **Dual-Theme Token Coverage:** The component systematically implements dark (`#0A0A0A`, `#121212`, `#0D0D0D`) and light (`slate-50`, `white`, `slate-200`) styling, preserving visual contrast across different store lighting conditions.

---

## Priority Issues

### [P0] Total Omission of Dual-Currency (USD + BCV Bolívares) Display
- **What:** Ledger balances, customer cards, transaction statements, and the payment collection modal exclusively display base USD (`formatMoney()`), completely ignoring `formatSecondaryMoney()`.
- **Why it matters:** Violates `PRODUCT.md` Principle 2 and `DESIGN.md` Rule 1. Bodega debts are overwhelmingly paid in Bolívares at the official BCV rate of the day. Forcing mental conversions stalls counter operations.
- **Fix:** Display primary bold USD values paired with tabular monospace BCV Bolívares equivalents on customer cards, statement rows, and inside the payment modal.
- **Suggested command:** `/impeccable clarify`

### [P0] Missing Pago Móvil & Localized Payment Details in Payment Modal
- **What:** The payment modal only offers `cash` and `card`. Pago Móvil (phone, cédula, bank reference last 4) is completely missing.
- **Why it matters:** Cashiers cannot reconcile bank transfers against customer debt, forcing them to write bank reference numbers on loose paper or in freeform notes.
- **Fix:** Add a dedicated Pago Móvil option with Phone, Cédula, and Reference Last 4 inputs, mirroring `CheckoutModal`.
- **Suggested command:** `/impeccable shape`

### [P1] Sub-44px Clustered Touch Targets & Destructive Action Proximity
- **What:** Card action buttons are ~32px icon-only squares. The red `Trash2` (Delete) button is directly adjacent to `Banknote` (Record Payment).
- **Why it matters:** Violates the 44px touch target standard. On grease-smudged touchscreen tablets during rush hour, cashiers risk mis-tapping Delete instead of Abono. Icon-only buttons with hover tooltips fail on touchscreens.
- **Fix:** Replace the icon cluster with a prominent 44px primary action button (*"Abonar"*) and move secondary actions (Edit, Delete, History) into a safe dropdown or drawer.
- **Suggested command:** `/impeccable harden`

### [P1] High Cognitive Clutter & Lack of Operational Quick Filters
- **What:** Every customer card displays a corporate credit progress bar, percentages, and total limits, while the view lacks basic filtering (*"Con Deuda"*, *"Al Día"*, *"Excedidos"*).
- **Why it matters:** Cashiers searching through 50+ accounts must parse massive visual noise.
- **Fix:** Add filter pills at the top (*"Todos"*, *"Con Deuda"*, *"Al Día"*), replace the progress bar with a clean debt status badge (USD + Bs.), and provide a dense counter list view.
- **Suggested command:** `/impeccable distill`

### [P2] Inability to Share Statement via WhatsApp or Print Thermal Abono Receipt
- **What:** Recording an abono generates no printable thermal receipt and offers no WhatsApp dispatch.
- **Why it matters:** In Latin American community commerce, WhatsApp receipts (*"comprobante de pago"*) and physical printed slips are critical for mutual trust (*"cuentas claras conservan amistades"*).
- **Fix:** Connect `ReceiptModal` to abonos and add an `Enviar a WhatsApp` button generating a pre-formatted message with customer tab details.
- **Suggested command:** `/impeccable delight`

### [P2] Deprecate Browser `window.alert()` & Support Abono Correction
- **What:** Line 107 triggers `window.alert()`. Mistyped payments cannot be reversed or corrected in the UI.
- **Why it matters:** Native alerts break mobile/touch POS shells. Accidental payment amounts cause immediate accounting discrepancies with no recourse.
- **Fix:** Replace `alert()` with inline field validation / toast notifications, and support transaction reversal/voiding in the statement history.
- **Suggested command:** `/impeccable polish`

---

## Persona Red Flags

### Doña Carmen (Neighborhood Bodega Owner / Non-Technical Operator)
- **Workflow:** Wants to check what "Sra. María" owes, record a $5 cash abono, and tell her the remaining balance in Bolívares.
- **Red Flags:**
  - In `isAddCustomerOpen`, seeing `"Robert Taylor"` and `"(555) 000-0000"` makes her think the app is for English speakers or overseas stores.
  - On María's card, her thumb hovers between the tiny green banknote (`collect-payment-btn`) and the red trash can (`delete-customer-btn`), separated by just 6 pixels.
  - Sra. María asks *"¿Cuánto es eso en bolívares al cambio del BCV?"*. The screen only shows `$15.00`. Doña Carmen must search for her reading glasses and manual calculator.

### Alex (Fast Cashier Handling Counter Abonos in Rush Hour)
- **Workflow:** Line of 6 customers. Customer quickly pays 250 Bs. via Pago Móvil to cover part of their tab.
- **Red Flags:**
  - Cannot filter by *"Solo con deuda"*; must type the full name into the search input.
  - Clicking `collect-payment-btn` opens a modal where the amount is prefilled with the *entire* balance. Alex must manually backspace to enter the partial abono amount.
  - Modal only has `Efectivo` and `Tarjeta`. Alex has nowhere to record the 4-digit bank reference number or customer cédula.
  - On a 10-inch counter tablet, the 32px icon buttons cause repeated mis-clicks under rapid tapping.

### Don Manuel (Customer Checking His Tab Balance)
- **Workflow:** Asks how much he owes, pays $10, and requests a receipt or WhatsApp confirmation for his records.
- **Red Flags:**
  - When the cashier pulls up his card, a loud red banner *"¡Límite excedido por $15.00!"* and orange warning meter is visible to the neighbor standing beside him in line.
  - The cashier cannot send him a WhatsApp text breakdown of his purchases; the statement modal only has an on-screen table.
  - Don Manuel pays $10 cash, but TuBodeguita offers no thermal receipt print option for ledger payments. He walks away with zero proof of payment.

---

## Minor Observations
- **Hover Tooltips on Touch:** CSS `:hover` tooltips (`group-hover/statement:flex`) do not trigger on tablet touchscreens.
- **Search Clear Affordance:** The customer search input lacks a quick-clear (`X`) button.
- **Duplicate Label Copy:** In KPI Card 2, `{t.ledger.totalStoreCredit}` is mistakenly printed twice (once as label, once as helper text).
- **Modal Scroll Lock:** Backdrops do not lock `body` scroll, causing background viewport jitter during touch scrolling.

---

## Questions to Consider
- What if *La Libreta* offered a dense "Cuaderno de Mostrador" (table/notebook view) alongside the card grid, optimized for rapid 2-second abono lookups?
- Why are customer debt abonos isolated from the thermal receipt printer when TuBodeguita already has a dedicated receipt engine?
- Could a toggleable "Modo Discreto" (Privacy Mode) conceal debt numbers and overage alerts from peripheral customer vision at the counter?
