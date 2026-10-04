---
name: TuBodeguita
description: High-velocity offline-first counter terminal and bi-monetary retail design system
colors:
  primary: "#10b981"
  primary-hover: "#059669"
  primary-active: "#047857"
  primary-subtle: "#064e3b"
  surface-dark: "#0A0A0A"
  surface-card-dark: "#0D0D0D"
  surface-elevated-dark: "#121212"
  surface-light: "#f8fafc"
  surface-card-light: "#ffffff"
  border-dark: "#262626"
  border-light: "#e2e8f0"
  text-primary-dark: "#ffffff"
  text-secondary-dark: "#a3a3a3"
  text-primary-light: "#0f172a"
  text-secondary-light: "#475569"
  accent-amber: "#f59e0b"
  accent-amber-subtle: "#78350f"
  accent-red: "#ef4444"
  accent-blue: "#3b82f6"
typography:
  display:
    fontFamily: "Plus Jakarta Sans, system-ui, -apple-system, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Plus Jakarta Sans, system-ui, -apple-system, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Plus Jakarta Sans, system-ui, -apple-system, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Plus Jakarta Sans, system-ui, -apple-system, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.02em"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.text-primary-dark}"
    rounded: "{rounded.lg}"
    padding: "10px 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.surface-elevated-dark}"
    textColor: "{colors.text-primary-dark}"
    rounded: "{rounded.lg}"
    padding: "8px 12px"
---

# Design System: TuBodeguita

## Overview

**Creative North Star: "The High-Velocity Counter Terminal"**

TuBodeguita's design system is engineered for the fast-paced reality of neighborhood retail counters in Latin America. It marries high-contrast digital telemetry with physical store rituals: instant dual-currency parity (USD and official BCV Bolívares), trust-based community customer credit (*el fiado*), and tactile thermal receipt printing. The interface is optimized for rapid peripheral scanning in varied corner-store lighting conditions, prioritizing cashier speed, minimal modal interruptions, and zero cognitive overload.

The aesthetic philosophy centers on pragmatic clarity. Dark mode serves as the default industrial workhorse canvas (`#0A0A0A`), reducing eye fatigue over 12-hour counter shifts, while full semantic support for light mode (`#f8fafc`) ensures flexibility in sunlit storefronts. Hierarchy is established through structured tonal layering and crisp hairline borders rather than gratuitous drop shadows or decorative gradients.

**Key Characteristics:**
- **Counter-Speed Ergonomics:** High-density, scan-optimized layouts designed for split-second decisions without hunting for buttons.
- **Bi-Monetary Telemetry:** Persistent, simultaneous presentation of base USD and BCV Bolívares using tabular monospace numerals (`JetBrains Mono`).
- **Tonal Layering with Tactile Borders:** Flat surfaces at rest with disciplined border contrasts (`#262626` / `#e2e8f0`), paired with responsive hover and active micro-interactions.
- **Physical Authenticity:** Physical thermal receipt artifacts (`80mm` roll typography, tear-top jagged edges) ground digital accounting in familiar bodega conventions.

## Colors

The palette is rooted in deep obsidian neutrals punctuated by an energetic emerald primary accent, accompanied by high-visibility amber for warnings/sync telemetry and clear red for debts and destructive actions.

### Primary
- **Emerald Terminal Green** (`#10b981`): The primary brand and transactional accent. Applied to positive actions, checkout CTAs, active navigation indicators, and successful state confirmations. It communicates cash flow vitality and transactional certainty.
- **Emerald Hover** (`#059669`): Deepened emerald used for interactive hover states.
- **Emerald Active** (`#047857`): Pressed state for tactile button feedback.

### Secondary
- **Telemetry Amber** (`#f59e0b`): Dedicated to attention-demanding status cues: offline queue indicators, pending cloud synchronizations, customer store credit debts, and low-stock alerts.
- **Alert Rose** (`#ef4444`): Reserved strictly for destructive operations (clearing cart, deleting inventory items) and credit limit overages.

### Neutral
- **Obsidian Canvas** (`#0A0A0A`): The foundational deep-dark background in dark mode, minimizing ambient backlight glare.
- **Surface Card** (`#0D0D0D`): Primary container background for ticket drawer, catalog lists, and control panels.
- **Surface Elevated** (`#121212`): Muted inner container and input field surface.
- **Hairline Border Dark** (`#262626` / `neutral-800`): Structural boundary defining cards and panels.
- **Light Slate Canvas** (`#f8fafc`): Base viewport background in light mode.
- **Light Card Surface** (`#ffffff`): Clean white container background in light mode.
- **Hairline Border Light** (`#e2e8f0` / `slate-200`): Delimiter in light mode.
- **Primary Text** (`#ffffff` dark / `#0f172a` light): High-contrast label and value display.
- **Secondary Text** (`#a3a3a3` dark / `#475569` light): Metadata, secondary currency conversions, and helper descriptors.

### Named Rules
**The Dual-Currency Rule.** Every customer-facing price, cart subtotal, and ledger balance must present both USD and official BCV Bolívares simultaneously. The primary currency uses prominent bold styling; the secondary equivalent is rendered in tabular monospace font immediately adjacent.

**The Semantic Reservation Rule.** Emerald is strictly reserved for positive actions and success; Amber is strictly reserved for queues, debts, and warnings; Red is strictly reserved for deletions and limits. Never use accent colors purely as decorative background fills.

## Typography

**Display Font:** Plus Jakarta Sans (with `system-ui, -apple-system, sans-serif` fallback)  
**Body Font:** Plus Jakarta Sans (with `system-ui, -apple-system, sans-serif` fallback)  
**Label/Mono Font:** JetBrains Mono (with `monospace` fallback)  

**Character:** Modern geometric sans-serif delivering exceptional legibility at small sizes, paired with an industrial tabular monospace face for currency figures, barcodes, SKUs, and receipt lines.

### Hierarchy
- **Display** (Bold 700, `1.5rem` / `24px`, line-height `1.2`, tracking `-0.02em`): Screen titles and grand totals on checkout.
- **Headline** (Bold 700, `1.25rem` / `20px`, line-height `1.3`, tracking `-0.01em`): Section headings, modal titles, and register drawer sums.
- **Title** (SemiBold 600, `1rem` / `16px`, line-height `1.4`): Product card names and customer ledger account labels.
- **Body** (Regular 400, `0.875rem` / `14px`, line-height `1.5`): Table rows, dialogue explanations, and form instructions.
- **Label** (SemiBold 600, `0.75rem` / `12px`, line-height `1.4`, tracking `0.02em`): Monospace prices, inventory units, SKU identifiers, and status pill badges.
- **Caption** (Medium 500, `0.6875rem` / `11px`, line-height `1.3`): Secondary currency conversions, sub-labels, and empty state descriptions.
- **Micro** (Bold 700, `0.625rem` / `10px`, line-height `1.2`): Compact telemetry pills, SKU numbers, currency unit badges, and shortcut keys.
- **Nano** (ExtraBold 800, `0.5625rem` / `9px`, line-height `1.1`): Compact mobile notification count badges and mini multipliers.

### Named Rules
**The Monospace Telemetry Rule.** All financial amounts, exchange rates, item quantities, barcodes, and timestamps must render in `font-mono` (`JetBrains Mono`) with tabular numbers enabled to ensure vertical column alignment during rapid scanning.

## Layout

The spatial model uses an asymmetric split-screen layout optimized for standard POS counter resolutions (1024px to 1920px width), with dedicated mobile adaptations for handheld inventory checks.

- **POS Viewport Partition:** A 7:5 two-column grid on desktop screens (`lg:grid-cols-12`). The left 7 columns house high-density product search and catalog tiles; the right 5 columns house the sticky active order ticket and customer selector.
- **Spacing Scale:** Standard 4px baseline rhythm (`4px`, `8px`, `12px`, `16px`, `24px`). Compact margins (`p-3.5` / `14px`) maximize screen real estate for cashier visibility.
- **Responsive Adaptations:** Below 1024px, the layout transitions to a vertical stack with category scrollbars and mobile bottom navigation bars (`min-w-[58px]` touch targets).

## Elevation & Depth

TuBodeguita avoids fuzzy, decorative box-shadows. Depth is established through tonal surface stepping and crisp 1px borders.

Surfaces follow a 3-tier elevation model:
1. **Canvas Level** (`#0A0A0A` dark / `#f8fafc` light): Base viewport layer.
2. **Container Level** (`#0D0D0D` dark / `#ffffff` light): Cards, search panels, and cart container, outlined by a 1px solid border (`#262626` / `#e2e8f0`).
3. **Floating Level** (`#141414` dark / `#ffffff` light with `0 10px 25px -5px rgba(0,0,0,0.4)`): Modals, dropdown menus, and customer search popovers.

### Shadow Vocabulary
- **Modal Depth** (`box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4)`): Used exclusively for full-screen dialogs (Checkout, Excel Import, Barcode Camera).
- **Receipt Paper Float** (`box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.15)`): Used on `.receipt-paper` to mimic physical paper resting on the counter.

### Named Rules
**The Flat-at-Rest Rule.** All static dashboard panels, catalog cards, and ticket containers are flat at rest. Elevation shadows appear only during active modal focus or hover state transitions.

## Shapes

The form language balances industrial precision with soft, modern curves to make touchscreen tapping welcoming.

- **Primary Containers & Modals:** Large radius (`rounded-2xl` / `16px`) providing visual containment and friendliness.
- **Buttons, Inputs & Cards:** Medium radius (`rounded-xl` / `12px`) ensuring distinct tap boundaries.
- **Badges & Category Chips:** Compact radius (`rounded-lg` / `8px`) or full pill (`rounded-full` / `9999px`) for numeric counters.
- **Borders:** Consistent 1px solid hairline outlines (`#262626` dark, `#e2e8f0` light).

## Components

### Buttons
- **Shape:** Medium radius (`rounded-xl`, 12px), touch-friendly height (`min-h-[44px]` on mobile, `py-2.5 px-4` on desktop).
- **Primary CTA ("Cobrar Ticket"):** Vibrant emerald background (`bg-emerald-600`, `#10b981`), bold white text, subtle shadow (`shadow-md shadow-emerald-950/40`).
- **Hover / Active:** Darkens to `#059669` on hover, translates `translate-y-0.5` on active press.
- **Secondary / Action:** Muted neutral background (`bg-neutral-850`, `#171717`), crisp border (`border-neutral-700`), hover transitions to `text-white bg-neutral-800`.
- **Danger / Clear:** Ghost styling with `text-neutral-500` shifting to `text-red-400` on hover.

### Chips & Category Pills
- **Style:** Compact horizontal pills (`px-3 py-1.5 rounded-lg text-xs font-semibold`).
- **Selected State:** Solid emerald fill (`bg-emerald-600 text-white shadow-xs`).
- **Unselected State:** Dark neutral surface (`bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white`).

### Cards / Product Tiles
- **Corner Style:** Medium radius (`rounded-xl`, 12px).
- **Background:** Dark neutral (`bg-neutral-900`) with hairline border (`border-neutral-800`).
- **Internal Padding:** `p-3.5` (14px).
- **Hover Treatment:** Border shifts to subtle accent tint (`hover:border-emerald-600/50`), add button shifts to emerald green (`group-hover:bg-emerald-600 group-hover:text-white`).

### Inputs / Search Fields
- **Style:** Dark inner surface (`bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500`).
- **Focus:** Outline glows with crisp emerald border (`focus-within:border-emerald-600`).
- **Accessories:** Integrated leading search icons and trailing quick-clear button.

### Navigation
- **Desktop Navbar:** Dark header bar (`bg-[#0D0D0D] border-b border-neutral-800 h-16`) featuring brand initials badge, persistent text-labeled tabs, official BCV exchange rate pill, and unified system menu.
- **Mobile App Bar:** Edge-to-edge bottom navigation tabs with stacked icon + label layout (`text-[10px] whitespace-nowrap`).

### Signature Component: Thermal Receipt Paper (`.receipt-paper`)
- **Visual Reality:** Crisp pure white thermal paper (`#ffffff`) with monospace black printing, receipt header branding, dotted ledger dividers, and a radial-gradient jagged tear pattern (`.receipt-tear-top`) at the top edge. Formatted specifically for 80mm thermal receipt printers via `@media print`.

## Do's and Don'ts

### Do:
- **Do** format every currency amount with its currency symbol (`$` or `Bs.`) and exactly 2 decimal places using `JetBrains Mono`.
- **Do** maintain a minimum touch target size of 44x44px for primary touchscreen actions on tablets and mobile screens.
- **Do** display the BCV rate pill persistently in the header so counter staff can verify official conversions in real time.
- **Do** use non-blocking toast notifications or accessible modal overlays for error states; never trigger browser-native `window.alert()`.

### Don't:
- **Don't** hide navigation tab labels behind hover tooltips; counter cashiers on touchscreen tablets cannot hover.
- **Don't** use decorative gradient text or multi-colored glow halos outside of verified theme accents.
- **Don't** isolate customer credit (*el fiado*) in disconnected post-checkout modals; display active customer credit status directly on the register ticket.
- **Don't** use low-contrast text below WCAG AA 4.5:1 ratio (e.g. avoid `text-neutral-500` for essential metadata on dark backgrounds).
