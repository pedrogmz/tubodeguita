# SDD 01: Visión General del Sistema y Arquitectura

- **Documento:** SDD-01
- **Proyecto:** TuBodeguita
- **Versión:** 1.2.0
- **Estado:** Activo / Producción

---

## 1. Visión y Propósito del Sistema

**TuBodeguita** es una plataforma moderna de punto de venta (POS) y gestión comercial diseñada para pequeños y medianos comercios, bodegas, mini-markets y tiendas minoristas que operan en entornos dinámicos y a menudo con conectividad inestable.

### Objetivos Clave de Negocio
1. **Continuidad Operativa Absoluta (Offline-First):** La caja registradora debe poder cobrar, registrar transacciones, consultar catálogo e imprimir recibos incluso sin conexión a internet ni acceso inmediato al backend.
2. **Economía Bi-monetaria (USD / VES):** Soporte simultáneo y transparente de Dólares estadounidenses ($) y Bolívares venezolanos (Bs.), incorporando sincronización y actualización de tasa oficial (BCV) y múltiples métodos de pago locales (Pago Móvil, Efectivo multimoneda, Tarjetas, Crédito de tienda).
3. **Control Integral de Cuentas por Cobrar y Pagar:**
   - Libro de Clientes ("Fiado" / Línea de crédito individual con topes y control de balance).
   - Libro de Proveedores (Cuentas por pagar a distribuidores, términos de pago y facturas de reposición).
4. **Fijación de Precios Flexible y Extensible:** Motor desacoplado basado en el Patrón Estrategia (*Strategy Pattern*) que permite tanto fijación manual directa como fijación por bulto/mayorista calculando costos unitarios y márgenes de ganancia.
5. **Persistencia Híbrida y Portabilidad:** Base de datos relacional SQLite embebida en servidor con capacidad de exportación SQL, respaldos binarios y runner de consultas directas.

---

## 2. Principios de Arquitectura

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        ARQUITECTURA DEL SISTEMA                        │
│                                                                        │
│   ┌──────────────────────────────────────────────────────────────┐    │
│   │                     CLIENTE (React 19 SPA)                   │    │
│   │                                                              │    │
│   │  [Vistas: Register | Inventory | Ledger | Dashboard]         │    │
│   │                                                              │    │
│   │  [Contextos: Theme | Currency (USD/VES) | i18n (ES/EN)]      │    │
│   │                                                              │    │
│   │  [Motor de Estrategias: PricingStrategyContext (Manual/Bulk)] │    │
│   │                                                              │    │
│   │  [Capa de Datos Cliente: dbService (LocalStorage + SyncQueue)]│   │
│   └───────────────▲──────────────────────────────▲───────────────┘    │
│                   │ HTTP / REST                  │ Fallback Offline   │
│                   │ (Transacciones, Sync, AI)    │ (Cache local)      │
│   ┌───────────────▼──────────────────────────────┴───────────────┐    │
│   │                 SERVIDOR (Node.js + Express)                 │    │
│   │                                                              │    │
│   │  [Vite Dev Middlewares / Archivos Estáticos Bundled]         │    │
│   │  [API Endpoints: /api/products, /api/sales, /api/sync...]    │    │
│   │  [Proxy Google Gemini AI: @google/genai]                     │    │
│   │  [Controlador SQLite: sql.js con persistencia en disco]      │    │
│   └──────────────────────────────┬───────────────────────────────┘    │
│                                  │ Escritura binaria                  │
│                                  ▼                                    │
│   ┌──────────────────────────────────────────────────────────────┐    │
│   │              ALMACENAMIENTO PERSISTENTE (Disco)              │    │
│   │               /data/tubodeguita.sqlite                       │    │
│   └──────────────────────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────────────────────┘
```

### 2.1. Offline-First y Resiliencia
- El cliente almacena todas las entidades en `LocalStorage` (`smartshop_products_v1`, `smartshop_sales_v1`, etc.).
- Toda mutación (creación de venta, movimiento de inventario, abono de deuda) se aplica inmediatamente en el almacenamiento local.
- Si el cliente detecta conexión a internet y el backend está accesible, las mutaciones se propagan en tiempo real vía `fetch`.
- Si el cliente está fuera de línea o el servidor no responde, la mutación se encola en `smartshop_sync_queue_v1` y se reintenta automáticamente con estrategia de *backoff* cuando la conexión regresa.

### 2.2. Dual-Currency First
- Todo precio base se almacena en una moneda canónica interna normalizada.
- El contexto `CurrencyContext` expone `formatAmount`, `convertAmount`, `primaryCurrency` y `exchangeRate`.
- La interfaz de usuario muestra instantáneamente equivalencias cruzadas en todas las pantallas críticas (total de carrito, saldo deudores, cuentas por pagar, valor de inventario).

### 2.3. Patrón Estrategia (Strategy Pattern)
- El cálculo de precios de venta está completamente desacoplado de los componentes de UI.
- Los algoritmos implementan la interfaz `PricingStrategy` (`calculate(params)`), permitiendo añadir nuevas estrategias (p. ej. margen por volumen, precios dinámicos por temporada) sin alterar la estructura del inventario ni la caja registradora.

---

## 3. Estructura de Directorios del Código Fuente

```text
/
├── data/
│   └── tubodeguita.sqlite        # Archivo binario de base de datos SQLite persistente
├── docs/
│   ├── README.md                 # Portal general de documentación
│   └── sdd/                      # Especificaciones del Software Design Document
│       ├── 01_SYSTEM_OVERVIEW_AND_ARCHITECTURE.md
│       ├── 02_DATA_MODELS_AND_SCHEMAS.md
│       ├── 03_MODULES_AND_BUSINESS_LOGIC.md
│       ├── 04_API_AND_OFFLINE_SYNC_PROTOCOL.md
│       └── 05_SPEC_DRIVEN_DEVELOPMENT_GUIDE.md
├── server/
│   └── sqlite.ts                 # Capa de abstracción SQLite (sql.js), schemas, seeds y queries
├── src/
│   ├── components/               # Vistas principales y componentes modales de interfaz
│   │   ├── BarcodeScannerModal.tsx
│   │   ├── CheckoutModal.tsx
│   │   ├── CustomerLedgerView.tsx
│   │   ├── DashboardView.tsx
│   │   ├── ExcelImportModal.tsx
│   │   ├── InventoryView.tsx
│   │   ├── Navbar.tsx
│   │   ├── ReceiptModal.tsx
│   │   ├── RegisterView.tsx
│   │   ├── SettingsView.tsx
│   │   └── VendorLedgerView.tsx
│   ├── currency/                 # Contexto de multi-moneda (USD, VES, tasa BCV)
│   ├── i18n/                     # Internacionalización (Español / Inglés)
│   ├── services/
│   │   ├── db.ts                 # Servicio maestro de datos cliente (LocalStorage + Sync)
│   │   └── pricingStrategy.ts    # Patrón Estrategia de cálculo de precios
│   ├── theme/                    # Contexto de temas (Dark/Light) y acentos de color
│   ├── utils/                    # Utilidades de formato y validaciones
│   ├── types.ts                  # Declaraciones de tipos TypeScript canónicos
│   ├── App.tsx                   # Enrutador principal de vistas y orquestador de estado
│   └── main.tsx                  # Punto de montaje React 19
├── server.ts                     # Servidor Express, endpoints REST, integración Gemini y Vite
├── package.json
└── tsconfig.json
```

---

## 4. Roles y Límites de Responsabilidad

| Capa | Responsabilidad | Tecnologías |
| :--- | :--- | :--- |
| **Frontend UI** | Interacción con cajero, escaneo de cámara (ZXing), filtros, modals, vista previa de ticket. | React 19, Tailwind CSS, Lucide |
| **Domain Logic** | Reglas de carrito, cálculo de impuestos, conversor de divisas, cálculo por bulto. | TypeScript puro, `pricingStrategy.ts` |
| **Client Storage** | Almacenamiento local persistente sin red, buffer de cola de sincronización. | Web Storage API (`LocalStorage`) |
| **Server Controller**| Validación de peticiones, endpoints REST, orquestación de batch, exportación SQL. | Node.js, Express |
| **Server Persistence**| Persistencia relacional ACID, integridad referencial de tickets e ítems. | `sql.js` (WebAssembly SQLite) en disco |
| **External AI** | Asistente de optimización de inventario y recomendaciones de ticket promedio. | `@google/genai` (Gemini API) |
