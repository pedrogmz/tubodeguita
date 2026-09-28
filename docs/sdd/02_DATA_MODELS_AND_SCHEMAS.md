# SDD 02: Modelos de Datos y Esquemas

- **Documento:** SDD-02
- **Proyecto:** TuBodeguita
- **Versión:** 1.2.0
- **Estado:** Activo / Producción

---

## 1. Definición de Entidades Principales (TypeScript)

Todas las definiciones canónicas se encuentran en `src/types.ts`. A continuación se detallan los contratos de cada modelo de dominio:

### 1.1. Producto (`Product`)
Representa una unidad de mercancía inventariable y vendible.

```typescript
export type PricingMethod = 'MANUAL' | 'BULK_PACK';

export interface Product {
  id: string;                      // Identificador único (ej: "prod-1", "prod-169823901")
  name: string;                    // Nombre comercial del producto
  sku: string;                     // Código SKU único de control de inventario
  barcode: string;                 // Código de barras (EAN-13, UPC, Code128, etc.)
  category: string;                // Categoría de producto
  price: number;                   // Precio canónico de venta al público (precio_venta)
  stock: number;                   // Cantidad actual en existencias
  minStock: number;                // Umbral mínimo de alerta para reposición
  costPrice?: number;              // Costo unitario base
  unit?: string;                   // Unidad de medida ('pcs', 'kg', 'bottle', etc.)
  colorTag?: string;               // Color distintivo para la interfaz
  description?: string;            // Descripción extendida

  // Parámetros del Patrón Estrategia de Fijación de Precios
  pricingMethod?: PricingMethod;   // 'MANUAL' | 'BULK_PACK'
  bulkUnits?: number;              // unidades_por_bulto (ej: 24 latas)
  bulkCost?: number;               // costo_bulto (ej: $18.50)
  profitMarginPercent?: number;    // Margen de ganancia porcentual deseado (ej: 30%)
  profitMarginValue?: number;      // Ganancia monetaria fija (compatibilidad)
}
```

### 1.2. Carrito y Transacción de Venta (`CartItem`, `SaleTransaction`)

```typescript
export interface CartItem {
  productId: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  price: number;
  costPrice?: number;
  quantity: number;
  discount: number;               // Monto o porcentaje de descuento
  discountType: 'percentage' | 'fixed';
  taxRate: number;                // Tasa impositiva aplicable (ej: 0.16 para 16%)
  subtotal: number;               // (price * quantity) - descuento
  total: number;                  // subtotal + impuesto
}

export type PaymentMethod = 
  | 'cash' 
  | 'card' 
  | 'pago_movil' 
  | 'customer_debt' 
  | 'store_credit' 
  | 'split';

export interface PagoMovilDetails {
  phone: string;
  cedula: string;
  amount: number;
  referenceLast4: string;
}

export interface SaleTransaction {
  id: string;                     // Identificador de la venta
  receiptNumber: string;          // Número de recibo legible (ej: "RCP-2026-0042")
  timestamp: number;              // Marca de tiempo UNIX en milisegundos
  items: CartItem[];              // Líneas de producto vendidas
  itemCount: number;              // Suma total de unidades físicas
  subtotal: number;               // Base imponible total antes de impuestos
  discountTotal: number;          // Total de descuentos aplicados
  taxTotal: number;               // Monto total de impuestos
  taxRate?: number;               // Porcentaje de impuesto aplicado
  total: number;                  // Monto final a cobrar
  paymentMethod: PaymentMethod;
  amountTendered: number;         // Monto entregado por el cliente
  changeDue: number;              // Vuelto / Cambio entregado
  pagoMovilDetails?: PagoMovilDetails;
  customerId?: string;            // ID de cliente si la venta fue a crédito ("Fiado")
  customerName?: string;
  cashierName?: string;
  notes?: string;
  syncStatus: 'synced' | 'pending' | 'failed';
  offlineCreated: boolean;
}
```

### 1.3. Clientes y Libro de Crédito ("Fiado")

```typescript
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  currentDebt: number;            // Saldo adeudado actual por el cliente a la tienda
  creditBalance: number;          // Saldo a favor / depósito prepagado
  debtLimit: number;              // Límite máximo de crédito permitido
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface CustomerLedgerEntry {
  id: string;
  customerId: string;
  customerName: string;
  timestamp: number;
  type: 'sale_debt' | 'debt_payment' | 'credit_deposit' | 'credit_spent' | 'adjustment';
  amount: number;                 // Magnitud de la transacción
  balanceAfter: number;           // Saldo deudor resultante tras la operación
  referenceReceiptNumber?: string;// Recibo de venta o comprobante de abono
  notes?: string;
  syncStatus: 'synced' | 'pending';
}
```

### 1.4. Proveedores y Libro de Cuentas por Pagar

```typescript
export interface Vendor {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email?: string;
  categorySupplied: string;
  outstandingPayable: number;     // Saldo adeudado por la tienda al proveedor
  paymentTerms: string;           // ej: "Contado", "Crédito 15 días", "Net 30"
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface VendorLedgerEntry {
  id: string;
  vendorId: string;
  vendorName: string;
  timestamp: number;
  type: 'supply_invoice' | 'vendor_payment' | 'adjustment';
  amount: number;
  balanceAfter: number;
  referenceInvoiceNumber?: string;
  notes?: string;
  syncStatus: 'synced' | 'pending';
}
```

### 1.5. Configuración de Tienda y Categorías

```typescript
export interface StoreSettings {
  storeName: string;
  storeSubtitle: string;
  address: string;
  phone: string;
  taxId: string;
  taxRate: number;                // Porcentaje de impuesto (ej: 8 para 8%)
  currencySymbol: string;
  primaryCurrency: 'USD' | 'VES'; // Moneda base predeterminada
  exchangeRate: number;           // Tasa de cambio oficial (Bs. por USD)
  exchangeRateLastUpdated?: number;
  exchangeRateAutoSync?: boolean; // Actualización automática vía API
  cashierName?: string;
  terminalId: string;
  receiptFooterMessage: string;
  accentColor?: string;
  pricingMethod?: PricingMethod;  // Estrategia por defecto para nuevos productos
  categories?: string[];          // Catálogo configurable de categorías
}
```

---

## 2. Esquema Relacional de Base de Datos (SQLite DDL)

El archivo `server/sqlite.ts` inicializa y mantiene las siguientes tablas relacionales en `/data/tubodeguita.sqlite`:

```sql
-- 1. Tabla de Productos
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT NOT NULL,
  barcode TEXT,
  category TEXT NOT NULL,
  price REAL NOT NULL,
  cost_price REAL NOT NULL DEFAULT 0,
  stock REAL NOT NULL DEFAULT 0,
  min_stock REAL NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'pcs',
  color_tag TEXT,
  description TEXT,
  pricing_method TEXT DEFAULT 'MANUAL',
  bulk_units REAL,
  bulk_cost REAL,
  profit_margin_value REAL,
  profit_margin_percent REAL
);

-- 2. Tabla de Ventas (Encabezados de Recibos)
CREATE TABLE IF NOT EXISTS sales (
  id TEXT PRIMARY KEY,
  receipt_number TEXT UNIQUE NOT NULL,
  timestamp INTEGER NOT NULL,
  item_count INTEGER NOT NULL DEFAULT 0,
  subtotal REAL NOT NULL DEFAULT 0,
  discount_total REAL NOT NULL DEFAULT 0,
  tax_total REAL NOT NULL DEFAULT 0,
  total REAL NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL,
  amount_tendered REAL NOT NULL DEFAULT 0,
  change_due REAL NOT NULL DEFAULT 0,
  customer_id TEXT,
  customer_name TEXT,
  cashier_name TEXT NOT NULL,
  notes TEXT,
  pago_movil_details TEXT,
  sync_status TEXT NOT NULL DEFAULT 'synced',
  offline_created INTEGER NOT NULL DEFAULT 0
);

-- 3. Tabla de Renglones de Venta (Detalle)
CREATE TABLE IF NOT EXISTS sale_items (
  id TEXT PRIMARY KEY,
  sale_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  name TEXT NOT NULL,
  sku TEXT,
  barcode TEXT,
  category TEXT,
  price REAL NOT NULL,
  cost_price REAL NOT NULL DEFAULT 0,
  quantity REAL NOT NULL,
  discount REAL NOT NULL DEFAULT 0,
  discount_type TEXT NOT NULL DEFAULT 'percentage',
  tax_rate REAL NOT NULL DEFAULT 0,
  subtotal REAL NOT NULL,
  total REAL NOT NULL,
  FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE
);

-- 4. Tabla de Clientes
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  current_debt REAL NOT NULL DEFAULT 0,
  credit_balance REAL NOT NULL DEFAULT 0,
  debt_limit REAL NOT NULL DEFAULT 100,
  notes TEXT,
  created_at INTEGER,
  updated_at INTEGER
);

-- 5. Tabla de Movimientos del Libro de Clientes
CREATE TABLE IF NOT EXISTS customer_ledger (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  type TEXT NOT NULL,
  amount REAL NOT NULL,
  balance_after REAL NOT NULL,
  reference_receipt_number TEXT,
  notes TEXT,
  sync_status TEXT NOT NULL DEFAULT 'synced',
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- 6. Tabla de Proveedores
CREATE TABLE IF NOT EXISTS vendors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  category_supplied TEXT,
  outstanding_payable REAL NOT NULL DEFAULT 0,
  payment_terms TEXT NOT NULL DEFAULT 'Net 30',
  notes TEXT,
  created_at INTEGER,
  updated_at INTEGER
);

-- 7. Tabla de Movimientos del Libro de Proveedores
CREATE TABLE IF NOT EXISTS vendor_ledger (
  id TEXT PRIMARY KEY,
  vendor_id TEXT NOT NULL,
  vendor_name TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  type TEXT NOT NULL,
  amount REAL NOT NULL,
  balance_after REAL NOT NULL,
  reference_invoice_number TEXT,
  notes TEXT,
  sync_status TEXT NOT NULL DEFAULT 'synced',
  FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
);

-- 8. Tabla de Configuración de Tienda
CREATE TABLE IF NOT EXISTS store_settings (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);
```

---

## 3. Claves de Persistencia Local (`LocalStorage`)

El cliente almacena copias de trabajo desacopladas en el navegador:

| Clave | Contenido | Tipo |
| :--- | :--- | :--- |
| `smartshop_products_v1` | Lista completa de productos con stock y precios | `Product[]` |
| `smartshop_sales_v1` | Historial de transacciones de venta | `SaleTransaction[]` |
| `smartshop_customers_v1` | Directorio de clientes con deuda y límites | `Customer[]` |
| `smartshop_customer_ledger_v1` | Registro cronológico de créditos y abonos | `CustomerLedgerEntry[]` |
| `smartshop_vendors_v1` | Directorio de proveedores y cuentas por pagar | `Vendor[]` |
| `smartshop_vendor_ledger_v1` | Registro cronológico de facturas y pagos | `VendorLedgerEntry[]` |
| `smartshop_sync_queue_v1` | Cola de operaciones pendientes de sincronizar | `SyncQueueItem[]` |
| `smartshop_store_info_v1` | Configuración comercial y datos de recibo | `StoreSettings` |
| `smartshop_categories_v1` | Lista de categorías disponibles para el catálogo | `string[]` |

---

## 4. Invariantes del Dominio y Reglas Matemáticas

1. **Invariante de Inventario:**
   $$\text{stock}_{\text{nuevo}} = \text{stock}_{\text{anterior}} - \text{cantidad\_vendida}$$
   Si $\text{stock} \le \text{minStock}$, el producto se clasifica automáticamente con advertencia de reposición.
2. **Invariante de Venta a Crédito ("Fiado"):**
   Una venta con método `customer_debt` solo es admisible si:
   $$\text{currentDebt} + \text{total\_venta} \le \text{debtLimit}$$
3. **Invariante de Cambio / Vuelto:**
   $$\text{changeDue} = \max(0, \text{amountTendered} - \text{total})$$
4. **Invariante de Conversión Cambiaria:**
   $$\text{Monto}_{\text{VES}} = \text{Monto}_{\text{USD}} \times \text{exchangeRate}$$
   $$\text{Monto}_{\text{USD}} = \frac{\text{Monto}_{\text{VES}}}{\text{exchangeRate}}$$
