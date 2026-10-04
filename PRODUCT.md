# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Bodegueros, corner store and mini-market owners, and cashiers operating neighborhood retail counters in Latin America (especially Venezuela). They operate in high-turnover, fast-paced retail counter environments, serving local neighborhood customers who pay with mixed currency or store credit.

## Product Purpose

A modern point of sale (POS) and store management platform built for absolute operational continuity. Success means sales, inventory lookups, and customer tickets never stall during network dropouts or power fluctuations, while maintaining tight control over cash flow, inventory, supplier debts, and customer store credit.

## Positioning

True offline-first hybrid architecture (instant LocalStorage mutations with queued SQLite backoff synchronization) tailored for bi-monetary retail environments (native USD and VES with official BCV exchange rate calculation), localized payment handling (Pago Móvil, multi-currency cash, and "fiado" customer credit), and modular pricing strategies.

## Operating Context

- Retail checkout counter with barcode scanners, receipt printers, and varying device formats (desktop PC, touch tablet, mobile browser).
- Rapid customer flow during peak neighborhood hours.
- Bi-monetary economy where prices fluctuate with exchange rates and customers frequently split or combine payment types.
- Community-based credit rituals: digitizing the traditional corner-store debt notebook ("cuaderno de fiado") without adding administrative friction.

## Capabilities and Constraints

- **Capabilities:**
  - High-speed POS register with keyboard shortcuts and camera/USB barcode scanner support.
  - Native dual-currency engine (USD/VES) with dynamic BCV rate synchronization and real-time conversions.
  - Decoupled Pricing Engine (Strategy Pattern) supporting manual unit pricing and bulk/wholesale cost-plus markups.
  - Customer Credit Ledger (*Libro de Clientes / Fiado*) with credit limits, balance histories, and payment logs.
  - Supplier Accounts Payable (*Libro de Proveedores*) for managing distributor invoices and payment terms.
  - AI-assisted inventory diagnostics and cross-selling recommendations via Google Gemini proxy with resilient local heuristic fallbacks.
  - Data portability: Excel/CSV import/export, SQL queries, and local binary backups.
  - Bilingual UI (Spanish as primary/default, English supported).
- **Constraints:**
  - Offline-first is mandatory: zero network latency on checkout; register works completely disconnected.
  - Persistence must survive browser refresh via LocalStorage and synchronize reliably to server-side SQLite (`sql.js`).
  - Mathematical precision on currency conversions and rounding invariants.

## Brand Commitments

- **Name:** TuBodeguita
- **Voice:** Pragmatic, accessible, professional yet neighborhood-friendly, clear, and empowering.
- **Language:** Spanish (primary/default), English.

## Evidence on Hand

- Formal Spec-Driven Development documentation suite in `docs/sdd/`:
  - `docs/sdd/01_SYSTEM_OVERVIEW_AND_ARCHITECTURE.md`
  - `docs/sdd/02_DATA_MODELS_AND_SCHEMAS.md`
  - `docs/sdd/03_MODULES_AND_BUSINESS_LOGIC.md`
  - `docs/sdd/04_API_AND_OFFLINE_SYNC_PROTOCOL.md`
  - `docs/sdd/05_SPEC_DRIVEN_DEVELOPMENT_GUIDE.md`
- Working implementation in `src/` (React 19, TypeScript, Tailwind CSS v4) and `server/` (Express, SQLite `sql.js`).
- Seed dataset and persistent SQLite database at `data/tubodeguita.sqlite`.

## Product Principles

1. **Continuity over Connectivity:** Sales and register actions must never fail or block because the internet or backend is down.
2. **Dual-Currency Precision:** Prices, balances, totals, and change must be immediately clear and exact in both USD and VES at every step.
3. **Counter-Speed Ergonomics:** Every key register interaction must be achievable in minimum keystrokes or taps with instant feedback.
4. **Trust with Accountability:** Dignify and formalize neighborhood store credit ("fiado") with transparent logs without slowing down transactions.

## Accessibility & Inclusion

- High-contrast readability optimized for varying corner store ambient lighting and screens.
- Keyboard-first navigation for register workflows.
- Touch-friendly touch targets (min 44px) for tablets and mobile devices.
