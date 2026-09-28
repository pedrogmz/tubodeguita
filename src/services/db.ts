import {
  Product,
  SaleTransaction,
  Customer,
  CustomerLedgerEntry,
  Vendor,
  VendorLedgerEntry,
  SyncQueueItem,
  StoreSettings,
  DEFAULT_STORE_SETTINGS,
  SqliteStats,
  SqlQueryResult,
} from '../types';

const STORAGE_KEYS = {
  PRODUCTS: 'smartshop_products_v1',
  SALES: 'smartshop_sales_v1',
  CUSTOMERS: 'smartshop_customers_v1',
  CUSTOMER_LEDGER: 'smartshop_customer_ledger_v1',
  VENDORS: 'smartshop_vendors_v1',
  VENDOR_LEDGER: 'smartshop_vendor_ledger_v1',
  SYNC_QUEUE: 'smartshop_sync_queue_v1',
  STORE_INFO: 'smartshop_store_info_v1',
  SIMULATED_OFFLINE: 'smartshop_simulated_offline_v1',
  CATEGORIES: 'smartshop_categories_v1',
};

export const DEFAULT_CATEGORIES: string[] = [
  'Bakery',
  'Beverages',
  'Coffee & Tea',
  'Dairy & Fresh',
  'Electronics',
  'Essentials',
  'Groceries',
  'Household',
  'Pantry & Grains',
  'Produce',
  'Snacks & Sweets',
];

// Realistic seed products with standard barcodes
const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Artisan Roast Coffee Beans 1lb',
    sku: 'BEV-COF-001',
    barcode: '793573192014',
    category: 'Coffee & Tea',
    price: 14.99,
    stock: 28,
    minStock: 10,
    description: 'Freshly roasted whole bean medium blend',
  },
  {
    id: 'prod-2',
    name: 'Organic Whole Milk 1 Gal',
    sku: 'DAI-MLK-002',
    barcode: '012000000133',
    category: 'Dairy & Fresh',
    price: 4.89,
    stock: 14,
    minStock: 8,
    description: 'Pasteurized grade A local farm milk',
  },
  {
    id: 'prod-3',
    name: 'Fresh Butter Croissant',
    sku: 'BAK-CRS-003',
    barcode: '890103000001',
    category: 'Bakery',
    price: 3.25,
    stock: 18,
    minStock: 12,
    description: 'Flaky French style golden butter pastry',
  },
  {
    id: 'prod-4',
    name: 'Gourmet Dark Chocolate Chip Cookie',
    sku: 'BAK-COK-004',
    barcode: '890103000002',
    category: 'Bakery',
    price: 2.75,
    stock: 35,
    minStock: 15,
    description: 'Warm, soft center with Belgian chocolate chips',
  },
  {
    id: 'prod-5',
    name: 'Cold Pressed Orange Juice 16oz',
    sku: 'BEV-OJ-005',
    barcode: '500011263012',
    category: 'Beverages',
    price: 4.5,
    stock: 12,
    minStock: 6,
    description: '100% pure squeezed Florida oranges',
  },
  {
    id: 'prod-6',
    name: 'Sparkling Mineral Water 750ml',
    sku: 'BEV-WAT-006',
    barcode: '761303598211',
    category: 'Beverages',
    price: 2.99,
    stock: 45,
    minStock: 15,
    description: 'Crisp natural effervescent spring water',
  },
  {
    id: 'prod-7',
    name: 'Free-Range Brown Eggs 1 Dozen',
    sku: 'DAI-EGG-007',
    barcode: '041220790114',
    category: 'Dairy & Fresh',
    price: 5.49,
    stock: 5, // LOW STOCK TRIGGER
    minStock: 8,
    description: 'Non-GMO pasture raised large brown eggs',
  },
  {
    id: 'prod-8',
    name: 'Aged White Cheddar Block 8oz',
    sku: 'DAI-CHD-008',
    barcode: '021000611234',
    category: 'Dairy & Fresh',
    price: 6.99,
    stock: 16,
    minStock: 8,
    description: 'Sharp aged 18 months Vermont cheddar',
  },
  {
    id: 'prod-9',
    name: 'Sea Salt & Vinegar Potato Chips',
    sku: 'SNK-CHP-009',
    barcode: '028400040112',
    category: 'Snacks',
    price: 3.49,
    stock: 22,
    minStock: 10,
    description: 'Kettle cooked crunchy potato chips',
  },
  {
    id: 'prod-10',
    name: 'Braided Fast USB-C Cable 6ft',
    sku: 'ELE-CAB-010',
    barcode: '840103990011',
    category: 'Electronics',
    price: 12.99,
    stock: 4, // LOW STOCK
    minStock: 6,
    description: 'Heavy duty 60W power delivery charge cable',
  },
  {
    id: 'prod-11',
    name: 'Dual Port 30W USB-C Fast Wall Charger',
    sku: 'ELE-CHR-011',
    barcode: '840103990022',
    category: 'Electronics',
    price: 19.99,
    stock: 9,
    minStock: 5,
    description: 'GaN compact dual port phone & tablet fast charger',
  },
  {
    id: 'prod-12',
    name: 'Antibacterial Hand Sanitizer 8oz',
    sku: 'GEN-SAN-012',
    barcode: '070200881144',
    category: 'Essentials',
    price: 3.99,
    stock: 3, // CRITICAL LOW STOCK
    minStock: 10,
    description: 'Aloe infused 75% alcohol gel pump',
  },
];

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'John Martinez (Local Barber)',
    phone: '(555) 234-5678',
    email: 'john.barber@example.com',
    currentDebt: 45.5,
    creditBalance: 0,
    debtLimit: 200.0,
    notes: 'Pays tab every Friday afternoon.',
    createdAt: Date.now() - 30 * 86400000,
    updatedAt: Date.now() - 86400000,
  },
  {
    id: 'cust-2',
    name: 'Maria Santos (Floral Studio)',
    phone: '(555) 876-5432',
    email: 'maria@studioflora.com',
    currentDebt: 0,
    creditBalance: 25.0,
    debtLimit: 300.0,
    notes: 'Pre-paid store credit balance available.',
    createdAt: Date.now() - 60 * 86400000,
    updatedAt: Date.now() - 2 * 86400000,
  },
  {
    id: 'cust-3',
    name: 'David Chen (Graphic Design)',
    phone: '(555) 345-9876',
    email: 'dchen@pixelcraft.co',
    currentDebt: 112.75,
    creditBalance: 0,
    debtLimit: 150.0,
    notes: 'Approaching credit ceiling. Send invoice reminder.',
    createdAt: Date.now() - 15 * 86400000,
    updatedAt: Date.now() - 3 * 86400000,
  },
  {
    id: 'cust-4',
    name: 'Sarah Jenkins (Morning Commuter)',
    phone: '(555) 912-3456',
    email: 's.jenkins@cityhealth.org',
    currentDebt: 12.5,
    creditBalance: 0,
    debtLimit: 50.0,
    notes: 'Daily drip coffee & muffin regular.',
    createdAt: Date.now() - 40 * 86400000,
    updatedAt: Date.now() - 5 * 86400000,
  },
];

const INITIAL_CUSTOMER_LEDGERS: CustomerLedgerEntry[] = [
  {
    id: 'c-ledg-1',
    customerId: 'cust-1',
    customerName: 'John Martinez (Local Barber)',
    timestamp: Date.now() - 3 * 86400000,
    type: 'sale_debt',
    amount: 45.5,
    balanceAfter: 45.5,
    referenceReceiptNumber: 'RCP-2026-0081',
    notes: 'Store tab purchase: Coffee bag + whole milk',
    syncStatus: 'synced',
  },
  {
    id: 'c-ledg-2',
    customerId: 'cust-3',
    customerName: 'David Chen (Graphic Design)',
    timestamp: Date.now() - 4 * 86400000,
    type: 'sale_debt',
    amount: 112.75,
    balanceAfter: 112.75,
    referenceReceiptNumber: 'RCP-2026-0064',
    notes: 'Store tab purchase: USB-C cable + charger + snacks',
    syncStatus: 'synced',
  },
  {
    id: 'c-ledg-3',
    customerId: 'cust-4',
    customerName: 'Sarah Jenkins (Morning Commuter)',
    timestamp: Date.now() - 2 * 86400000,
    type: 'sale_debt',
    amount: 12.5,
    balanceAfter: 12.5,
    referenceReceiptNumber: 'RCP-2026-0092',
    notes: 'Morning order on customer tab',
    syncStatus: 'synced',
  },
];

const INITIAL_VENDORS: Vendor[] = [
  {
    id: 'vend-1',
    name: 'Metro Beverage & Cold Drink Co.',
    contactPerson: 'Marcus Vance',
    phone: '(555) 601-2020',
    email: 'orders@metrobev.example.com',
    categorySupplied: 'Beverages & Juices',
    outstandingPayable: 420.0,
    paymentTerms: 'Net 15',
    notes: 'Weekly delivery every Tuesday 8 AM.',
    createdAt: Date.now() - 90 * 86400000,
    updatedAt: Date.now() - 4 * 86400000,
  },
  {
    id: 'vend-2',
    name: 'Golden Grain Artisanal Bakery Supply',
    contactPerson: 'Elena Rostova',
    phone: '(555) 441-9988',
    email: 'deliveries@goldengrain.example.com',
    categorySupplied: 'Bakery & Pastries',
    outstandingPayable: 185.5,
    paymentTerms: 'Net 7',
    notes: 'Fresh bake deliveries daily at 6:30 AM.',
    createdAt: Date.now() - 120 * 86400000,
    updatedAt: Date.now() - 2 * 86400000,
  },
  {
    id: 'vend-3',
    name: 'Valley Dairy & Egg Farmers Cooperative',
    contactPerson: 'Tom Bradley',
    phone: '(555) 773-1234',
    email: 'accounts@valleydairy.example.com',
    categorySupplied: 'Dairy & Fresh Produce',
    outstandingPayable: 340.0,
    paymentTerms: 'Net 30',
    notes: 'Restock milk & brown eggs bi-weekly.',
    createdAt: Date.now() - 150 * 86400000,
    updatedAt: Date.now() - 5 * 86400000,
  },
  {
    id: 'vend-4',
    name: 'Apex Wholesale Electronics & Sundries',
    contactPerson: 'Kenji Sato',
    phone: '(555) 882-3400',
    email: 'b2b@apexelectronics.example.com',
    categorySupplied: 'Electronics & Accessories',
    outstandingPayable: 680.0,
    paymentTerms: 'Net 30',
    notes: 'Fast turnaround cables, adapters, sanitizers.',
    createdAt: Date.now() - 60 * 86400000,
    updatedAt: Date.now() - 8 * 86400000,
  },
];

const INITIAL_VENDOR_LEDGERS: VendorLedgerEntry[] = [
  {
    id: 'v-ledg-1',
    vendorId: 'vend-1',
    vendorName: 'Metro Beverage & Cold Drink Co.',
    timestamp: Date.now() - 5 * 86400000,
    type: 'supply_invoice',
    amount: 420.0,
    balanceAfter: 420.0,
    referenceInvoiceNumber: 'INV-METRO-9941',
    notes: 'Cases of sparkling water and organic juices',
    syncStatus: 'synced',
  },
  {
    id: 'v-ledg-2',
    vendorId: 'vend-2',
    vendorName: 'Golden Grain Artisanal Bakery Supply',
    timestamp: Date.now() - 3 * 86400000,
    type: 'supply_invoice',
    amount: 185.5,
    balanceAfter: 185.5,
    referenceInvoiceNumber: 'INV-GG-4310',
    notes: 'Croissants and chocolate chip cookies wholesale restock',
    syncStatus: 'synced',
  },
];

// Helper: load from localStorage with fallback
function loadLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function saveLocal<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save to localStorage key ${key}:`, e);
  }
}

export const dbService = {
  // Check if simulated offline mode is toggled on
  isSimulatedOffline(): boolean {
    return loadLocal<boolean>(STORAGE_KEYS.SIMULATED_OFFLINE, false);
  },

  setSimulatedOffline(val: boolean): void {
    saveLocal(STORAGE_KEYS.SIMULATED_OFFLINE, val);
  },

  // Effective online status (checks navigator.onLine AND simulated toggle)
  isOnline(): boolean {
    if (this.isSimulatedOffline()) return false;
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  },

  // PRODUCTS
  getProducts(): Product[] {
    const products = loadLocal<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    if (products.length === 0) {
      saveLocal(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
      return INITIAL_PRODUCTS;
    }
    return products;
  },

  saveProduct(product: Product): Product {
    const products = this.getProducts();
    const idx = products.findIndex((p) => p.id === product.id);
    let updated: Product[];
    if (idx >= 0) {
      updated = [...products];
      updated[idx] = product;
    } else {
      updated = [product, ...products];
    }
    saveLocal(STORAGE_KEYS.PRODUCTS, updated);

    // Persist directly to SQLite API if online
    if (this.isOnline()) {
      fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      }).catch((e) => console.warn('Background SQLite product save deferred:', e));
    }

    // Queue sync
    this.addToSyncQueue({
      type: 'INVENTORY_UPDATE',
      payload: {
        productId: product.id,
        newStock: product.stock,
        product,
      },
    });

    return product;
  },

  saveProductsBatch(incomingProducts: Product[]): Product[] {
    if (!incomingProducts.length) return [];
    const products = this.getProducts();
    const productMap = new Map<string, Product>();
    // Pre-populate with existing products
    products.forEach((p) => productMap.set(p.id, p));

    // Upsert incoming products
    incomingProducts.forEach((p) => {
      productMap.set(p.id, p);
    });

    const updatedList = Array.from(productMap.values());
    saveLocal(STORAGE_KEYS.PRODUCTS, updatedList);

    // Direct batch push to SQLite if online
    if (this.isOnline()) {
      fetch('/api/products/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: incomingProducts }),
      }).catch((e) => console.warn('Background SQLite batch product save deferred:', e));
    }

    // Add to local sync queue
    incomingProducts.forEach((p) => {
      this.addToSyncQueue({
        type: 'INVENTORY_UPDATE',
        payload: {
          productId: p.id,
          newStock: p.stock,
          product: p,
        },
      });
    });

    return incomingProducts;
  },

  updateProductStock(productId: string, deltaQty: number, reason: string = 'sale'): Product | null {
    const products = this.getProducts();
    const idx = products.findIndex((p) => p.id === productId);
    if (idx === -1) return null;

    const product = products[idx];
    const newStock = Math.max(0, product.stock + deltaQty);
    const updatedProduct = { ...product, stock: newStock };
    products[idx] = updatedProduct;

    saveLocal(STORAGE_KEYS.PRODUCTS, products);

    if (this.isOnline()) {
      fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct),
      }).catch((e) => console.warn('Background SQLite stock update deferred:', e));
    }

    this.addToSyncQueue({
      type: 'INVENTORY_UPDATE',
      payload: {
        productId,
        change: deltaQty,
        newStock,
        reason,
        timestamp: Date.now(),
      },
    });

    return updatedProduct;
  },

  deleteProduct(productId: string): void {
    const products = this.getProducts().filter((p) => p.id !== productId);
    saveLocal(STORAGE_KEYS.PRODUCTS, products);

    if (this.isOnline()) {
      fetch(`/api/products/${encodeURIComponent(productId)}`, {
        method: 'DELETE',
      }).catch((e) => console.warn('Background SQLite delete deferred:', e));
    }
  },

  // SALES & TRANSACTIONS
  getSales(): SaleTransaction[] {
    return loadLocal<SaleTransaction[]>(STORAGE_KEYS.SALES, []);
  },

  recordSale(saleData: Omit<SaleTransaction, 'id' | 'receiptNumber' | 'timestamp' | 'syncStatus' | 'offlineCreated'>): SaleTransaction {
    const isOnlineNow = this.isOnline();
    const timestamp = Date.now();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const receiptNumber = `RCP-${new Date().getFullYear()}-${randomSuffix}`;

    const newSale: SaleTransaction = {
      ...saleData,
      id: `sale-${timestamp}-${randomSuffix}`,
      receiptNumber,
      timestamp,
      syncStatus: isOnlineNow ? 'synced' : 'pending',
      offlineCreated: !isOnlineNow,
    };

    // 1. Decrement inventory locally immediately
    for (const item of newSale.items) {
      this.updateProductStock(item.productId, -item.quantity, `Sale ${receiptNumber}`);
    }

    // 2. If paid via customer debt / store credit tab:
    if (newSale.paymentMethod === 'customer_debt' && newSale.customerId) {
      this.recordCustomerDebt(newSale.customerId, newSale.total, receiptNumber, `Sale debt charge: ${newSale.items.map(i => i.name).join(', ')}`);
    } else if (newSale.paymentMethod === 'store_credit' && newSale.customerId) {
      this.recordCustomerCreditDeduction(newSale.customerId, newSale.total, receiptNumber);
    }

    // 3. Save sale locally
    const sales = this.getSales();
    const updatedSales = [newSale, ...sales];
    saveLocal(STORAGE_KEYS.SALES, updatedSales);

    // Persist directly to SQLite API if online
    if (this.isOnline()) {
      fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSale),
      }).catch((e) => console.warn('Background SQLite sale save deferred:', e));
    }

    // 4. Add to sync queue
    this.addToSyncQueue({
      type: 'SALE',
      payload: newSale,
    });

    return newSale;
  },

  // CUSTOMERS & LEDGER
  getCustomers(): Customer[] {
    const customers = loadLocal<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
    if (customers.length === 0) {
      saveLocal(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
      return INITIAL_CUSTOMERS;
    }
    return customers;
  },

  saveCustomer(customer: Customer): Customer {
    const customers = this.getCustomers();
    const idx = customers.findIndex((c) => c.id === customer.id);
    let updated: Customer[];
    if (idx >= 0) {
      updated = [...customers];
      updated[idx] = { ...customer, updatedAt: Date.now() };
    } else {
      updated = [
        {
          ...customer,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        ...customers,
      ];
    }
    saveLocal(STORAGE_KEYS.CUSTOMERS, updated);

    if (this.isOnline()) {
      fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customer),
      }).catch((e) => console.warn('Background SQLite customer save deferred:', e));
    }

    return customer;
  },

  deleteCustomer(customerId: string): void {
    const customers = this.getCustomers().filter((c) => c.id !== customerId);
    saveLocal(STORAGE_KEYS.CUSTOMERS, customers);

    if (this.isOnline()) {
      fetch(`/api/customers/${encodeURIComponent(customerId)}`, {
        method: 'DELETE',
      }).catch((e) => console.warn('Background SQLite customer delete deferred:', e));
    }
  },

  getCustomerLedger(): CustomerLedgerEntry[] {
    const ledgers = loadLocal<CustomerLedgerEntry[]>(STORAGE_KEYS.CUSTOMER_LEDGER, []);
    if (ledgers.length === 0) {
      saveLocal(STORAGE_KEYS.CUSTOMER_LEDGER, INITIAL_CUSTOMER_LEDGERS);
      return INITIAL_CUSTOMER_LEDGERS;
    }
    return ledgers;
  },

  recordCustomerDebt(customerId: string, amount: number, receiptNumber: string, notes?: string): void {
    const customers = this.getCustomers();
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return;

    const newDebt = Number((customer.currentDebt + amount).toFixed(2));
    customer.currentDebt = newDebt;
    customer.updatedAt = Date.now();
    saveLocal(STORAGE_KEYS.CUSTOMERS, customers);

    const entry: CustomerLedgerEntry = {
      id: `c-ledg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      customerId,
      customerName: customer.name,
      timestamp: Date.now(),
      type: 'sale_debt',
      amount,
      balanceAfter: newDebt,
      referenceReceiptNumber: receiptNumber,
      notes: notes || 'Charged to customer store account tab',
      syncStatus: this.isOnline() ? 'synced' : 'pending',
    };

    const ledgers = this.getCustomerLedger();
    saveLocal(STORAGE_KEYS.CUSTOMER_LEDGER, [entry, ...ledgers]);

    this.addToSyncQueue({
      type: 'CUSTOMER_LEDGER',
      payload: entry,
    });
  },

  recordCustomerCreditDeduction(customerId: string, amount: number, receiptNumber: string): void {
    const customers = this.getCustomers();
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return;

    const newCredit = Math.max(0, Number((customer.creditBalance - amount).toFixed(2)));
    customer.creditBalance = newCredit;
    customer.updatedAt = Date.now();
    saveLocal(STORAGE_KEYS.CUSTOMERS, customers);

    const entry: CustomerLedgerEntry = {
      id: `c-ledg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      customerId,
      customerName: customer.name,
      timestamp: Date.now(),
      type: 'credit_spent',
      amount,
      balanceAfter: -newCredit,
      referenceReceiptNumber: receiptNumber,
      notes: 'Store credit balance used for purchase',
      syncStatus: this.isOnline() ? 'synced' : 'pending',
    };

    const ledgers = this.getCustomerLedger();
    saveLocal(STORAGE_KEYS.CUSTOMER_LEDGER, [entry, ...ledgers]);

    this.addToSyncQueue({
      type: 'CUSTOMER_LEDGER',
      payload: entry,
    });
  },

  recordCustomerPayment(customerId: string, paymentAmount: number, paymentMethod: 'cash' | 'card', notes?: string): CustomerLedgerEntry | null {
    const customers = this.getCustomers();
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return null;

    const prevDebt = customer.currentDebt;
    let newDebt = prevDebt - paymentAmount;
    let extraCredit = 0;
    if (newDebt < 0) {
      extraCredit = Math.abs(newDebt);
      newDebt = 0;
    }

    customer.currentDebt = Number(newDebt.toFixed(2));
    if (extraCredit > 0) {
      customer.creditBalance = Number((customer.creditBalance + extraCredit).toFixed(2));
    }
    customer.updatedAt = Date.now();
    saveLocal(STORAGE_KEYS.CUSTOMERS, customers);

    const receiptNum = `PAY-${Date.now().toString().slice(-6)}`;
    const entry: CustomerLedgerEntry = {
      id: `c-ledg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      customerId,
      customerName: customer.name,
      timestamp: Date.now(),
      type: 'debt_payment',
      amount: paymentAmount,
      balanceAfter: customer.currentDebt,
      referenceReceiptNumber: receiptNum,
      notes: notes || `Customer debt payment received via ${paymentMethod.toUpperCase()}`,
      syncStatus: this.isOnline() ? 'synced' : 'pending',
    };

    const ledgers = this.getCustomerLedger();
    saveLocal(STORAGE_KEYS.CUSTOMER_LEDGER, [entry, ...ledgers]);

    this.addToSyncQueue({
      type: 'CUSTOMER_LEDGER',
      payload: entry,
    });

    return entry;
  },

  // VENDORS & VENDOR PAYMENTS
  getVendors(): Vendor[] {
    const vendors = loadLocal<Vendor[]>(STORAGE_KEYS.VENDORS, []);
    if (vendors.length === 0) {
      saveLocal(STORAGE_KEYS.VENDORS, INITIAL_VENDORS);
      return INITIAL_VENDORS;
    }
    return vendors;
  },

  saveVendor(vendor: Vendor): Vendor {
    const vendors = this.getVendors();
    const idx = vendors.findIndex((v) => v.id === vendor.id);
    let updated: Vendor[];
    if (idx >= 0) {
      updated = [...vendors];
      updated[idx] = { ...vendor, updatedAt: Date.now() };
    } else {
      updated = [
        {
          ...vendor,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        ...vendors,
      ];
    }
    saveLocal(STORAGE_KEYS.VENDORS, updated);

    if (this.isOnline()) {
      fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vendor),
      }).catch((e) => console.warn('Background SQLite vendor save deferred:', e));
    }

    return vendor;
  },

  deleteVendor(vendorId: string): void {
    const vendors = this.getVendors().filter((v) => v.id !== vendorId);
    saveLocal(STORAGE_KEYS.VENDORS, vendors);

    if (this.isOnline()) {
      fetch(`/api/vendors/${encodeURIComponent(vendorId)}`, {
        method: 'DELETE',
      }).catch((e) => console.warn('Background SQLite vendor delete deferred:', e));
    }
  },

  getVendorLedger(): VendorLedgerEntry[] {
    const ledgers = loadLocal<VendorLedgerEntry[]>(STORAGE_KEYS.VENDOR_LEDGER, []);
    if (ledgers.length === 0) {
      saveLocal(STORAGE_KEYS.VENDOR_LEDGER, INITIAL_VENDOR_LEDGERS);
      return INITIAL_VENDOR_LEDGERS;
    }
    return ledgers;
  },

  recordVendorPayment(vendorId: string, paymentAmount: number, paymentMethod: string, notes?: string): VendorLedgerEntry | null {
    const vendors = this.getVendors();
    const vendor = vendors.find((v) => v.id === vendorId);
    if (!vendor) return null;

    const newPayable = Math.max(0, Number((vendor.outstandingPayable - paymentAmount).toFixed(2)));
    vendor.outstandingPayable = newPayable;
    vendor.updatedAt = Date.now();
    saveLocal(STORAGE_KEYS.VENDORS, vendors);

    const refNo = `VPAY-${Date.now().toString().slice(-6)}`;
    const entry: VendorLedgerEntry = {
      id: `v-ledg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      vendorId,
      vendorName: vendor.name,
      timestamp: Date.now(),
      type: 'vendor_payment',
      amount: paymentAmount,
      balanceAfter: newPayable,
      referenceInvoiceNumber: refNo,
      notes: notes || `Supplier payment cleared via ${paymentMethod}`,
      syncStatus: this.isOnline() ? 'synced' : 'pending',
    };

    const ledgers = this.getVendorLedger();
    saveLocal(STORAGE_KEYS.VENDOR_LEDGER, [entry, ...ledgers]);

    this.addToSyncQueue({
      type: 'VENDOR_LEDGER',
      payload: entry,
    });

    return entry;
  },

  recordVendorSupplyBill(vendorId: string, invoiceAmount: number, invoiceNumber: string, itemsDescription?: string): VendorLedgerEntry | null {
    const vendors = this.getVendors();
    const vendor = vendors.find((v) => v.id === vendorId);
    if (!vendor) return null;

    const newPayable = Number((vendor.outstandingPayable + invoiceAmount).toFixed(2));
    vendor.outstandingPayable = newPayable;
    vendor.updatedAt = Date.now();
    saveLocal(STORAGE_KEYS.VENDORS, vendors);

    const entry: VendorLedgerEntry = {
      id: `v-ledg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      vendorId,
      vendorName: vendor.name,
      timestamp: Date.now(),
      type: 'supply_invoice',
      amount: invoiceAmount,
      balanceAfter: newPayable,
      referenceInvoiceNumber: invoiceNumber,
      notes: itemsDescription || 'Inventory delivery invoice',
      syncStatus: this.isOnline() ? 'synced' : 'pending',
    };

    const ledgers = this.getVendorLedger();
    saveLocal(STORAGE_KEYS.VENDOR_LEDGER, [entry, ...ledgers]);

    this.addToSyncQueue({
      type: 'VENDOR_LEDGER',
      payload: entry,
    });

    return entry;
  },

  // SYNC QUEUE MANAGEMENT
  getSyncQueue(): SyncQueueItem[] {
    return loadLocal<SyncQueueItem[]>(STORAGE_KEYS.SYNC_QUEUE, []);
  },

  addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'status' | 'retryCount'>): void {
    const queue = this.getSyncQueue();
    const newItem: SyncQueueItem = {
      id: `sync-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: Date.now(),
      status: 'pending',
      retryCount: 0,
      ...item,
    };
    saveLocal(STORAGE_KEYS.SYNC_QUEUE, [...queue, newItem]);
  },

  async processSyncQueue(): Promise<{ syncedCount: number; remainingCount: number; error?: string }> {
    if (!this.isOnline()) {
      return {
        syncedCount: 0,
        remainingCount: this.getSyncQueue().filter((q) => q.status === 'pending').length,
        error: 'Terminal is currently in offline mode',
      };
    }

    const queue = this.getSyncQueue();
    const pendingItems = queue.filter((i) => i.status === 'pending' || i.status === 'failed');
    if (pendingItems.length === 0) {
      return { syncedCount: 0, remainingCount: 0 };
    }

    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batch: pendingItems,
          deviceId: 'pos-terminal-01',
          timestamp: Date.now(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Sync server responded with status ${response.status}`);
      }

      const resData = await response.json();
      const syncedIds = new Set((resData.syncedResults || []).map((r: any) => r.id));

      // Mark local sales as synced
      const sales = this.getSales();
      let salesModified = false;
      const updatedSales = sales.map((s) => {
        if (s.syncStatus === 'pending') {
          salesModified = true;
          return { ...s, syncStatus: 'synced' as const };
        }
        return s;
      });
      if (salesModified) saveLocal(STORAGE_KEYS.SALES, updatedSales);

      // Update sync queue
      const updatedQueue = queue.map((item) => {
        if (syncedIds.has(item.id)) {
          return { ...item, status: 'synced' as const };
        }
        return item;
      });
      saveLocal(STORAGE_KEYS.SYNC_QUEUE, updatedQueue);

      const remaining = updatedQueue.filter((q) => q.status === 'pending').length;
      return { syncedCount: syncedIds.size, remainingCount: remaining };
    } catch (err: any) {
      console.warn('Background sync deferred (server unreachable or offline):', err.message);
      return {
        syncedCount: 0,
        remainingCount: pendingItems.length,
        error: err.message,
      };
    }
  },

  clearSyncedQueue(): void {
    const queue = this.getSyncQueue();
    const remaining = queue.filter((q) => q.status !== 'synced');
    saveLocal(STORAGE_KEYS.SYNC_QUEUE, remaining);
  },

  // ALIASES & CONVENIENCE METHODS
  getCustomerLedgers(): CustomerLedgerEntry[] {
    return this.getCustomerLedger();
  },

  getVendorLedgers(): VendorLedgerEntry[] {
    return this.getVendorLedger();
  },

  getOnlineStatus(): boolean {
    return this.isOnline();
  },

  setOnlineStatus(online: boolean): void {
    this.setSimulatedOffline(!online);
  },

  flushSyncQueue(): Promise<{ syncedCount: number; remainingCount: number; error?: string }> {
    return this.processSyncQueue();
  },

  createSale(sale: SaleTransaction): SaleTransaction {
    return this.recordSale(sale);
  },

  // STORE SETTINGS & PARAMETERS
  getStoreSettings(): StoreSettings {
    const loaded = loadLocal<StoreSettings>(STORAGE_KEYS.STORE_INFO, DEFAULT_STORE_SETTINGS);
    const primaryCurrency =
      loaded.primaryCurrency === 'VES' || loaded.primaryCurrency === 'USD'
        ? loaded.primaryCurrency
        : loaded.currencySymbol === 'Bs.'
        ? 'VES'
        : 'USD';

    const currencySymbol = primaryCurrency === 'VES' ? 'Bs.' : '$';
    const exchangeRate =
      typeof loaded.exchangeRate === 'number' && !isNaN(loaded.exchangeRate) && loaded.exchangeRate > 0
        ? loaded.exchangeRate
        : DEFAULT_STORE_SETTINGS.exchangeRate;

    const exchangeRateAutoSync =
      loaded.exchangeRateAutoSync !== undefined
        ? Boolean(loaded.exchangeRateAutoSync)
        : (DEFAULT_STORE_SETTINGS.exchangeRateAutoSync ?? true);

    const pricingMethod = loaded.pricingMethod || DEFAULT_STORE_SETTINGS.pricingMethod || 'MANUAL';

    return {
      ...DEFAULT_STORE_SETTINGS,
      ...loaded,
      primaryCurrency,
      currencySymbol,
      exchangeRate,
      exchangeRateLastUpdated: loaded.exchangeRateLastUpdated || Date.now(),
      exchangeRateAutoSync,
      pricingMethod,
      accentColor: loaded.accentColor || 'emerald',
    };
  },

  saveStoreSettings(settings: StoreSettings): StoreSettings {
    saveLocal(STORAGE_KEYS.STORE_INFO, settings);

    if (this.isOnline()) {
      fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      }).catch((e) => console.warn('Background SQLite settings save deferred:', e));
    }

    return settings;
  },

  resetStoreSettings(): StoreSettings {
    saveLocal(STORAGE_KEYS.STORE_INFO, DEFAULT_STORE_SETTINGS);
    return DEFAULT_STORE_SETTINGS;
  },

  // ----------------- PRODUCT CATEGORIES MANAGEMENT -----------------
  getCategories(): string[] {
    const stored = loadLocal<string[] | null>(STORAGE_KEYS.CATEGORIES, null);
    const products = this.getProducts();
    const prodCats = products.map((p) => p.category).filter(Boolean);

    if (stored && Array.isArray(stored) && stored.length > 0) {
      const merged = Array.from(new Set([...stored, ...prodCats]));
      return merged;
    }

    const initial = Array.from(new Set([...DEFAULT_CATEGORIES, ...prodCats]));
    saveLocal(STORAGE_KEYS.CATEGORIES, initial);
    return initial;
  },

  saveCategories(categories: string[]): string[] {
    const cleaned = Array.from(new Set(categories.map((c) => c.trim()).filter(Boolean)));
    saveLocal(STORAGE_KEYS.CATEGORIES, cleaned);
    return cleaned;
  },

  addCategory(categoryName: string): { success: boolean; error?: string; categories: string[] } {
    const name = categoryName.trim();
    if (!name) {
      return { success: false, error: 'El nombre de la categoría no puede estar vacío.', categories: this.getCategories() };
    }
    const current = this.getCategories();
    const exists = current.some((c) => c.toLowerCase() === name.toLowerCase());
    if (exists) {
      return { success: false, error: 'Ya existe una categoría con este nombre.', categories: current };
    }
    const updated = [...current, name];
    saveLocal(STORAGE_KEYS.CATEGORIES, updated);
    return { success: true, categories: updated };
  },

  updateCategory(oldName: string, newName: string): { success: boolean; error?: string; updatedCount: number; categories: string[] } {
    const trimmedNew = newName.trim();
    if (!trimmedNew) {
      return { success: false, error: 'El nuevo nombre no puede estar vacío.', updatedCount: 0, categories: this.getCategories() };
    }
    const current = this.getCategories();
    if (oldName.toLowerCase() !== trimmedNew.toLowerCase()) {
      const exists = current.some((c) => c.toLowerCase() === trimmedNew.toLowerCase());
      if (exists) {
        return { success: false, error: 'Ya existe una categoría con ese nombre.', updatedCount: 0, categories: current };
      }
    }

    // Update categories list
    const updatedCategories = current.map((c) => (c.toLowerCase() === oldName.toLowerCase() ? trimmedNew : c));
    saveLocal(STORAGE_KEYS.CATEGORIES, updatedCategories);

    // Update all products with this category
    const products = this.getProducts();
    let updatedCount = 0;
    const updatedProducts = products.map((p) => {
      if (p.category.toLowerCase() === oldName.toLowerCase()) {
        updatedCount++;
        return { ...p, category: trimmedNew };
      }
      return p;
    });

    if (updatedCount > 0) {
      saveLocal(STORAGE_KEYS.PRODUCTS, updatedProducts);
      if (this.isOnline()) {
        for (const p of updatedProducts.filter((p) => p.category === trimmedNew)) {
          fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(p),
          }).catch((e) => console.warn('Background product category update deferred:', e));
        }
      }
    }

    return { success: true, updatedCount, categories: updatedCategories };
  },

  deleteCategory(categoryName: string, reassignTo?: string): { success: boolean; reassignedCount: number; categories: string[] } {
    const current = this.getCategories();
    const updatedCategories = current.filter((c) => c.toLowerCase() !== categoryName.toLowerCase());
    saveLocal(STORAGE_KEYS.CATEGORIES, updatedCategories);

    const products = this.getProducts();
    let reassignedCount = 0;
    const targetCategory = reassignTo && reassignTo.trim() ? reassignTo.trim() : (updatedCategories[0] || 'General');

    const updatedProducts = products.map((p) => {
      if (p.category.toLowerCase() === categoryName.toLowerCase()) {
        reassignedCount++;
        return { ...p, category: targetCategory };
      }
      return p;
    });

    if (reassignedCount > 0) {
      saveLocal(STORAGE_KEYS.PRODUCTS, updatedProducts);
      if (this.isOnline()) {
        for (const p of updatedProducts.filter((p) => p.category === targetCategory)) {
          fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(p),
          }).catch((e) => console.warn('Background product category reassign deferred:', e));
        }
      }
    }

    return { success: true, reassignedCount, categories: updatedCategories };
  },

  // RESET ALL DATA TO DEFAULTS
  resetToDefaults(): void {
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.SALES);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMER_LEDGER);
    localStorage.removeItem(STORAGE_KEYS.VENDORS);
    localStorage.removeItem(STORAGE_KEYS.VENDOR_LEDGER);
    localStorage.removeItem(STORAGE_KEYS.SYNC_QUEUE);
    localStorage.removeItem(STORAGE_KEYS.STORE_INFO);
    localStorage.removeItem(STORAGE_KEYS.SIMULATED_OFFLINE);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
  },

  // ----------------- SQLITE DATABASE INTEGRATION -----------------
  async getSqliteStats(): Promise<SqliteStats | null> {
    try {
      const res = await fetch('/api/db/stats');
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  exportSqliteFile(): void {
    window.location.href = '/api/db/export-sqlite';
  },

  exportSqlDump(): void {
    window.location.href = '/api/db/export-sql';
  },

  async executeSqlQuery(sql: string): Promise<SqlQueryResult> {
    try {
      const res = await fetch('/api/db/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.message || data.error || 'Query failed' };
      }
      return data;
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error executing query' };
    }
  },

  async syncFromSqlite(): Promise<{ success: boolean; stats?: SqliteStats; error?: string }> {
    if (!this.isOnline()) {
      return { success: false, error: 'Terminal is currently in offline mode' };
    }
    try {
      // First flush pending local queue to SQLite
      await this.processSyncQueue();

      // Fetch latest state from SQLite database
      const [prodsRes, salesRes, custsRes, cLedgRes, vendsRes, vLedgRes, settsRes, statsRes] = await Promise.all([
        fetch('/api/products').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/sales').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/customers').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/customer-ledger').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/vendors').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/vendor-ledger').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/settings').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/db/stats').then((r) => (r.ok ? r.json() : null)),
      ]);

      if (Array.isArray(prodsRes) && prodsRes.length > 0) {
        saveLocal(STORAGE_KEYS.PRODUCTS, prodsRes);
      }
      if (Array.isArray(salesRes)) {
        saveLocal(STORAGE_KEYS.SALES, salesRes);
      }
      if (Array.isArray(custsRes) && custsRes.length > 0) {
        saveLocal(STORAGE_KEYS.CUSTOMERS, custsRes);
      }
      if (Array.isArray(cLedgRes)) {
        saveLocal(STORAGE_KEYS.CUSTOMER_LEDGER, cLedgRes);
      }
      if (Array.isArray(vendsRes) && vendsRes.length > 0) {
        saveLocal(STORAGE_KEYS.VENDORS, vendsRes);
      }
      if (Array.isArray(vLedgRes)) {
        saveLocal(STORAGE_KEYS.VENDOR_LEDGER, vLedgRes);
      }
      if (settsRes && settsRes.storeName) {
        saveLocal(STORAGE_KEYS.STORE_INFO, settsRes);
      }

      return { success: true, stats: statsRes };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },
};
