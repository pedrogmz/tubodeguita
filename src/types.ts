export type PricingMethod = 'MANUAL' | 'BULK_PACK';

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  price: number; // Precio canónico de venta (precio_venta)
  stock: number;
  minStock: number;
  costPrice?: number; // Opcional (descontinuado)
  unit?: string; // Opcional (descontinuado)
  colorTag?: string;
  description?: string;

  // Extensión de fijación de precios (Estrategia)
  pricingMethod?: PricingMethod; // Método específico del producto (o hereda de la tienda)
  bulkUnits?: number; // unidades_por_bulto
  bulkCost?: number; // costo_bulto
  profitMarginPercent?: number; // ganancia_porcentaje deseada (ej. 30 para 30%)
  profitMarginValue?: number; // ganancia_valor (retrocompatibilidad)
}

export interface CartItem {
  productId: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  price: number;
  costPrice?: number;
  quantity: number;
  discount: number; // percentage or fixed discount
  discountType: 'percentage' | 'fixed';
  taxRate: number; // e.g. 0.08 for 8%
  subtotal: number;
  total: number;
}

export type PaymentMethod = 'cash' | 'card' | 'pago_movil' | 'customer_debt' | 'store_credit' | 'split';

export interface PagoMovilDetails {
  phone: string;
  cedula: string;
  amount: number;
  referenceLast4: string;
}

export interface SaleTransaction {
  id: string;
  receiptNumber: string;
  timestamp: number;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  taxRate?: number; // Tax percentage applied, e.g. 16 for 16%
  total: number;
  paymentMethod: PaymentMethod;
  amountTendered: number;
  changeDue: number;
  pagoMovilDetails?: PagoMovilDetails;
  customerId?: string;
  customerName?: string;
  cashierName?: string;
  notes?: string;
  syncStatus: 'synced' | 'pending' | 'failed';
  offlineCreated: boolean;
}

export type Sale = SaleTransaction;

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  currentDebt: number; // positive = customer owes store
  creditBalance: number; // store credit / deposit
  debtLimit: number; // maximum credit limit
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
  amount: number;
  balanceAfter: number;
  referenceReceiptNumber?: string;
  notes?: string;
  syncStatus: 'synced' | 'pending';
}

export interface Vendor {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email?: string;
  categorySupplied: string;
  outstandingPayable: number; // how much store owes vendor
  paymentTerms: string; // e.g. "Net 15", "Net 30", "COD"
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

export interface SyncQueueItem {
  id: string;
  timestamp: number;
  type: 'SALE' | 'INVENTORY_UPDATE' | 'CUSTOMER_LEDGER' | 'VENDOR_LEDGER';
  payload: any;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  retryCount: number;
  error?: string;
}

export interface AIRecommendation {
  productId: string;
  productName: string;
  reason: string;
  discountSuggestion: string | null;
  confidence: number;
}

export interface AIInventoryInsight {
  type: 'danger' | 'warning' | 'opportunity' | 'info';
  title: string;
  message: string;
  recommendedAction?: string;
}

export type AccentColor =
  | 'emerald'
  | 'indigo'
  | 'blue'
  | 'purple'
  | 'teal'
  | 'rose'
  | 'amber'
  | 'orange';

export type PrimaryCurrency = 'USD' | 'VES';

export interface StoreSettings {
  storeName: string;
  storeSubtitle: string;
  address: string;
  phone: string;
  taxId: string;
  taxRate: number; // percentage, e.g. 8 for 8%
  currencySymbol: string;
  primaryCurrency: PrimaryCurrency; // 'USD' (Dólares) or 'VES' (Bolívares)
  exchangeRate: number; // Tasa de cambio oficial BCV (Bs. por USD)
  exchangeRateLastUpdated?: number; // timestamp en ms
  exchangeRateAutoSync?: boolean; // Sincronización automática de tasa de cambio oficial
  cashierName?: string;
  terminalId: string;
  receiptFooterMessage: string;
  accentColor?: AccentColor;
  pricingMethod?: PricingMethod; // 'MANUAL' | 'BULK_PACK' (default: 'MANUAL')
  categories?: string[]; // Lista configurable de categorías de productos
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: 'TuBodeguita',
  storeSubtitle: 'Point of Sale & Provisions',
  address: '742 Evergreen Terrace, Suite 100',
  phone: '(555) 902-1200',
  taxId: '94-204918',
  taxRate: 8,
  currencySymbol: '$',
  primaryCurrency: 'USD',
  exchangeRate: 842.21,
  exchangeRateLastUpdated: Date.now(),
  exchangeRateAutoSync: true,
  pricingMethod: 'MANUAL',
  terminalId: 'POS-TERMINAL-01',
  receiptFooterMessage: 'Thank you for shopping local! Returns accepted within 14 days with receipt.',
  accentColor: 'emerald',
};

export interface SqliteStats {
  engine: string;
  path: string;
  sizeBytes: number;
  sizeFormatted: string;
  lastModified: number;
  tableCounts: {
    products: number;
    sales: number;
    saleItems: number;
    customers: number;
    customerLedger: number;
    vendors: number;
    vendorLedger: number;
  };
}

export interface SqlQueryResult {
  columns?: string[];
  values?: any[][];
  rowCount?: number;
  success?: boolean;
  message?: string;
  rowsAffected?: number;
  error?: string;
}


