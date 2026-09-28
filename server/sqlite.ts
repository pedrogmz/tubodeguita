import fs from "fs";
import path from "path";
import initSqlJs, { Database } from "sql.js";

const DB_DIR = path.join(process.cwd(), "data");
const LEGACY_DB_PATH = path.join(DB_DIR, "smartshop_pos.sqlite");
const NEW_DB_PATH = path.join(DB_DIR, "tubodeguita.sqlite");
const DB_PATH =
  fs.existsSync(LEGACY_DB_PATH) && fs.statSync(LEGACY_DB_PATH).size > 0
    ? LEGACY_DB_PATH
    : NEW_DB_PATH;

let db: Database | null = null;

// Initial Seeds
const SEED_PRODUCTS = [
  {
    id: "prod-1",
    name: "Artisan Roast Coffee Beans 1lb",
    sku: "BEV-COF-001",
    barcode: "793573192014",
    category: "Coffee & Tea",
    price: 14.99,
    costPrice: 8.5,
    stock: 28,
    minStock: 10,
    unit: "bag",
    description: "Freshly roasted whole bean medium blend",
  },
  {
    id: "prod-2",
    name: "Organic Whole Milk 1 Gal",
    sku: "DAI-MLK-002",
    barcode: "012000000133",
    category: "Dairy & Fresh",
    price: 4.89,
    costPrice: 3.1,
    stock: 14,
    minStock: 8,
    unit: "bottle",
    description: "Pasteurized grade A local farm milk",
  },
  {
    id: "prod-3",
    name: "Fresh Butter Croissant",
    sku: "BAK-CRS-003",
    barcode: "890103000001",
    category: "Bakery",
    price: 3.25,
    costPrice: 1.2,
    stock: 18,
    minStock: 12,
    unit: "pcs",
    description: "Flaky French style golden butter pastry",
  },
  {
    id: "prod-4",
    name: "Gourmet Dark Chocolate Chip Cookie",
    sku: "BAK-COK-004",
    barcode: "890103000002",
    category: "Bakery",
    price: 2.75,
    costPrice: 0.9,
    stock: 35,
    minStock: 15,
    unit: "pcs",
    description: "Warm, soft center with Belgian chocolate chips",
  },
  {
    id: "prod-5",
    name: "Cold Pressed Orange Juice 16oz",
    sku: "BEV-OJ-005",
    barcode: "500011263012",
    category: "Beverages",
    price: 4.5,
    costPrice: 2.4,
    stock: 12,
    minStock: 6,
    unit: "bottle",
    description: "100% pure squeezed Florida oranges",
  },
  {
    id: "prod-6",
    name: "Sparkling Mineral Water 750ml",
    sku: "BEV-WAT-006",
    barcode: "761303598211",
    category: "Beverages",
    price: 2.99,
    costPrice: 1.3,
    stock: 45,
    minStock: 15,
    unit: "bottle",
    description: "Crisp natural effervescent spring water",
  },
  {
    id: "prod-7",
    name: "Free-Range Brown Eggs 1 Dozen",
    sku: "DAI-EGG-007",
    barcode: "041220790114",
    category: "Dairy & Fresh",
    price: 5.49,
    costPrice: 3.2,
    stock: 5,
    minStock: 8,
    unit: "carton",
    description: "Non-GMO pasture raised large brown eggs",
  },
  {
    id: "prod-8",
    name: "Aged White Cheddar Block 8oz",
    sku: "DAI-CHD-008",
    barcode: "021000611234",
    category: "Dairy & Fresh",
    price: 6.99,
    costPrice: 4.1,
    stock: 16,
    minStock: 8,
    unit: "block",
    description: "Sharp aged 18 months Vermont cheddar",
  },
  {
    id: "prod-9",
    name: "Sea Salt & Vinegar Potato Chips",
    sku: "SNK-CHP-009",
    barcode: "028400040112",
    category: "Snacks",
    price: 3.49,
    costPrice: 1.6,
    stock: 22,
    minStock: 10,
    unit: "bag",
    description: "Kettle cooked crunchy potato chips",
  },
  {
    id: "prod-10",
    name: "Braided Fast USB-C Cable 6ft",
    sku: "ELE-CAB-010",
    barcode: "840103990011",
    category: "Electronics",
    price: 12.99,
    costPrice: 4.5,
    stock: 4,
    minStock: 6,
    unit: "pcs",
    description: "Heavy duty 60W power delivery charge cable",
  },
  {
    id: "prod-11",
    name: "Dual Port 30W USB-C Fast Wall Charger",
    sku: "ELE-CHR-011",
    barcode: "840103990022",
    category: "Electronics",
    price: 19.99,
    costPrice: 8.0,
    stock: 9,
    minStock: 5,
    unit: "pcs",
    description: "GaN compact dual port phone & tablet fast charger",
  },
  {
    id: "prod-12",
    name: "Antibacterial Hand Sanitizer 8oz",
    sku: "GEN-SAN-012",
    barcode: "070200881144",
    category: "Essentials",
    price: 3.99,
    costPrice: 1.5,
    stock: 3,
    minStock: 10,
    unit: "bottle",
    description: "Aloe infused 75% alcohol gel pump",
  },
];

const SEED_CUSTOMERS = [
  {
    id: "cust-1",
    name: "John Martinez (Local Barber)",
    phone: "(555) 234-5678",
    email: "john.barber@example.com",
    currentDebt: 45.5,
    creditBalance: 0,
    debtLimit: 200.0,
    notes: "Pays tab every Friday afternoon.",
    createdAt: Date.now() - 30 * 86400000,
    updatedAt: Date.now() - 86400000,
  },
  {
    id: "cust-2",
    name: "Maria Santos (Floral Studio)",
    phone: "(555) 876-5432",
    email: "maria@studioflora.com",
    currentDebt: 0,
    creditBalance: 25.0,
    debtLimit: 300.0,
    notes: "Pre-paid store credit balance available.",
    createdAt: Date.now() - 60 * 86400000,
    updatedAt: Date.now() - 2 * 86400000,
  },
  {
    id: "cust-3",
    name: "David Chen (Graphic Design)",
    phone: "(555) 345-9876",
    email: "dchen@pixelcraft.co",
    currentDebt: 112.75,
    creditBalance: 0,
    debtLimit: 150.0,
    notes: "Approaching credit ceiling. Send invoice reminder.",
    createdAt: Date.now() - 15 * 86400000,
    updatedAt: Date.now() - 3 * 86400000,
  },
  {
    id: "cust-4",
    name: "Sarah Jenkins (Morning Commuter)",
    phone: "(555) 912-3456",
    email: "s.jenkins@cityhealth.org",
    currentDebt: 12.5,
    creditBalance: 0,
    debtLimit: 50.0,
    notes: "Daily drip coffee & muffin regular.",
    createdAt: Date.now() - 40 * 86400000,
    updatedAt: Date.now() - 5 * 86400000,
  },
];

const SEED_CUSTOMER_LEDGER = [
  {
    id: "c-ledg-1",
    customerId: "cust-1",
    customerName: "John Martinez (Local Barber)",
    timestamp: Date.now() - 3 * 86400000,
    type: "sale_debt",
    amount: 45.5,
    balanceAfter: 45.5,
    referenceReceiptNumber: "RCP-2026-0081",
    notes: "Store tab purchase: Coffee bag + whole milk",
    syncStatus: "synced",
  },
  {
    id: "c-ledg-2",
    customerId: "cust-3",
    customerName: "David Chen (Graphic Design)",
    timestamp: Date.now() - 4 * 86400000,
    type: "sale_debt",
    amount: 112.75,
    balanceAfter: 112.75,
    referenceReceiptNumber: "RCP-2026-0064",
    notes: "Store tab purchase: USB-C cable + charger + snacks",
    syncStatus: "synced",
  },
  {
    id: "c-ledg-3",
    customerId: "cust-4",
    customerName: "Sarah Jenkins (Morning Commuter)",
    timestamp: Date.now() - 2 * 86400000,
    type: "sale_debt",
    amount: 12.5,
    balanceAfter: 12.5,
    referenceReceiptNumber: "RCP-2026-0092",
    notes: "Morning order on customer tab",
    syncStatus: "synced",
  },
];

const SEED_VENDORS = [
  {
    id: "vend-1",
    name: "Metro Beverage & Cold Drink Co.",
    contactPerson: "Marcus Vance",
    phone: "(555) 601-2020",
    email: "orders@metrobev.example.com",
    categorySupplied: "Beverages & Juices",
    outstandingPayable: 420.0,
    paymentTerms: "Net 15",
    notes: "Weekly delivery every Tuesday 8 AM.",
    createdAt: Date.now() - 90 * 86400000,
    updatedAt: Date.now() - 4 * 86400000,
  },
  {
    id: "vend-2",
    name: "Golden Grain Artisanal Bakery Supply",
    contactPerson: "Elena Rostova",
    phone: "(555) 441-9988",
    email: "deliveries@goldengrain.example.com",
    categorySupplied: "Bakery & Pastries",
    outstandingPayable: 185.5,
    paymentTerms: "Net 7",
    notes: "Fresh bake deliveries daily at 6:30 AM.",
    createdAt: Date.now() - 120 * 86400000,
    updatedAt: Date.now() - 2 * 86400000,
  },
  {
    id: "vend-3",
    name: "Valley Dairy & Egg Farmers Cooperative",
    contactPerson: "Tom Bradley",
    phone: "(555) 773-1234",
    email: "accounts@valleydairy.example.com",
    categorySupplied: "Dairy & Fresh Produce",
    outstandingPayable: 340.0,
    paymentTerms: "Net 30",
    notes: "Restock milk & brown eggs bi-weekly.",
    createdAt: Date.now() - 150 * 86400000,
    updatedAt: Date.now() - 5 * 86400000,
  },
  {
    id: "vend-4",
    name: "Apex Wholesale Electronics & Sundries",
    contactPerson: "Kenji Sato",
    phone: "(555) 882-3400",
    email: "b2b@apexelectronics.example.com",
    categorySupplied: "Electronics & Accessories",
    outstandingPayable: 680.0,
    paymentTerms: "Net 30",
    notes: "Fast turnaround cables, adapters, sanitizers.",
    createdAt: Date.now() - 60 * 86400000,
    updatedAt: Date.now() - 8 * 86400000,
  },
];

const SEED_VENDOR_LEDGER = [
  {
    id: "v-ledg-1",
    vendorId: "vend-1",
    vendorName: "Metro Beverage & Cold Drink Co.",
    timestamp: Date.now() - 5 * 86400000,
    type: "supply_invoice",
    amount: 420.0,
    balanceAfter: 420.0,
    referenceInvoiceNumber: "INV-METRO-9941",
    notes: "Cases of sparkling water and organic juices",
    syncStatus: "synced",
  },
  {
    id: "v-ledg-2",
    vendorId: "vend-2",
    vendorName: "Golden Grain Artisanal Bakery Supply",
    timestamp: Date.now() - 3 * 86400000,
    type: "supply_invoice",
    amount: 185.5,
    balanceAfter: 185.5,
    referenceInvoiceNumber: "INV-GG-4310",
    notes: "Croissants and chocolate chip cookies wholesale restock",
    syncStatus: "synced",
  },
];

export async function getSqliteDb(): Promise<Database> {
  if (db) return db;

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  const SQL = await initSqlJs();

  let fileBuffer: Buffer | null = null;
  if (fs.existsSync(DB_PATH)) {
    try {
      fileBuffer = fs.readFileSync(DB_PATH);
    } catch (e) {
      console.warn("Could not read existing sqlite file, initializing fresh:", e);
    }
  }

  db = fileBuffer ? new SQL.Database(fileBuffer) : new SQL.Database();
  initSchema(db);
  persistDb();

  return db;
}

function persistDb(): void {
  if (!db) return;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  } catch (err) {
    console.error(`Failed to write ${path.basename(DB_PATH)} to disk:`, err);
  }
}

function initSchema(database: Database): void {
  database.run(`
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

    CREATE TABLE IF NOT EXISTS vendors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      contact_person TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      category_supplied TEXT NOT NULL,
      outstanding_payable REAL NOT NULL DEFAULT 0,
      payment_terms TEXT NOT NULL DEFAULT 'Net 30',
      notes TEXT,
      created_at INTEGER,
      updated_at INTEGER
    );

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

    CREATE TABLE IF NOT EXISTS store_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
    CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
    CREATE INDEX IF NOT EXISTS idx_sales_timestamp ON sales(timestamp);
    CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
    CREATE INDEX IF NOT EXISTS idx_customer_ledger_cust ON customer_ledger(customer_id);
    CREATE INDEX IF NOT EXISTS idx_vendor_ledger_vend ON vendor_ledger(vendor_id);
  `);

  try {
    database.run("ALTER TABLE sales ADD COLUMN pago_movil_details TEXT;");
  } catch {
    // column already exists in schema or newly created
  }

  try {
    database.run("ALTER TABLE products ADD COLUMN pricing_method TEXT DEFAULT 'MANUAL';");
  } catch {}
  try {
    database.run("ALTER TABLE products ADD COLUMN bulk_units REAL;");
  } catch {}
  try {
    database.run("ALTER TABLE products ADD COLUMN bulk_cost REAL;");
  } catch {}
  try {
    database.run("ALTER TABLE products ADD COLUMN profit_margin_value REAL;");
  } catch {}
  try {
    database.run("ALTER TABLE products ADD COLUMN profit_margin_percent REAL;");
  } catch {}

  // Seed if empty
  const prodCheck = database.exec("SELECT COUNT(*) as c FROM products");
  const prodCount = (prodCheck[0]?.values[0]?.[0] as number) || 0;
  if (prodCount === 0) {
    for (const p of SEED_PRODUCTS) {
      database.run(
        `INSERT INTO products (id, name, sku, barcode, category, price, cost_price, stock, min_stock, unit, description)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.id, p.name, p.sku, p.barcode, p.category, p.price, p.costPrice || 0, p.stock, p.minStock, p.unit || 'pcs', p.description]
      );
    }
  }

  const custCheck = database.exec("SELECT COUNT(*) as c FROM customers");
  const custCount = (custCheck[0]?.values[0]?.[0] as number) || 0;
  if (custCount === 0) {
    for (const c of SEED_CUSTOMERS) {
      database.run(
        `INSERT INTO customers (id, name, phone, email, current_debt, credit_balance, debt_limit, notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [c.id, c.name, c.phone, c.email, c.currentDebt, c.creditBalance, c.debtLimit, c.notes, c.createdAt, c.updatedAt]
      );
    }
  }

  const cLedgCheck = database.exec("SELECT COUNT(*) as c FROM customer_ledger");
  const cLedgCount = (cLedgCheck[0]?.values[0]?.[0] as number) || 0;
  if (cLedgCount === 0) {
    for (const cl of SEED_CUSTOMER_LEDGER) {
      database.run(
        `INSERT INTO customer_ledger (id, customer_id, customer_name, timestamp, type, amount, balance_after, reference_receipt_number, notes, sync_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [cl.id, cl.customerId, cl.customerName, cl.timestamp, cl.type, cl.amount, cl.balanceAfter, cl.referenceReceiptNumber, cl.notes, cl.syncStatus]
      );
    }
  }

  const vendCheck = database.exec("SELECT COUNT(*) as c FROM vendors");
  const vendCount = (vendCheck[0]?.values[0]?.[0] as number) || 0;
  if (vendCount === 0) {
    for (const v of SEED_VENDORS) {
      database.run(
        `INSERT INTO vendors (id, name, contact_person, phone, email, category_supplied, outstanding_payable, payment_terms, notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [v.id, v.name, v.contactPerson, v.phone, v.email, v.categorySupplied, v.outstandingPayable, v.paymentTerms, v.notes, v.createdAt, v.updatedAt]
      );
    }
  }

  const vLedgCheck = database.exec("SELECT COUNT(*) as c FROM vendor_ledger");
  const vLedgCount = (vLedgCheck[0]?.values[0]?.[0] as number) || 0;
  if (vLedgCount === 0) {
    for (const vl of SEED_VENDOR_LEDGER) {
      database.run(
        `INSERT INTO vendor_ledger (id, vendor_id, vendor_name, timestamp, type, amount, balance_after, reference_invoice_number, notes, sync_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [vl.id, vl.vendorId, vl.vendorName, vl.timestamp, vl.type, vl.amount, vl.balanceAfter, vl.referenceInvoiceNumber, vl.notes, vl.syncStatus]
      );
    }
  }
}

// ----------------- CRUD & QUERY HELPERS -----------------

export async function getAllProducts() {
  const d = await getSqliteDb();
  const res = d.exec("SELECT * FROM products ORDER BY name ASC");
  if (!res.length) return [];
  const cols = res[0].columns;
  return res[0].values.map((row) => {
    const obj: any = {};
    cols.forEach((col, idx) => {
      // Map column name snake_case to camelCase
      if (col === "cost_price") obj.costPrice = row[idx];
      else if (col === "min_stock") obj.minStock = row[idx];
      else if (col === "color_tag") obj.colorTag = row[idx];
      else if (col === "pricing_method") obj.pricingMethod = row[idx];
      else if (col === "bulk_units") obj.bulkUnits = row[idx];
      else if (col === "bulk_cost") obj.bulkCost = row[idx];
      else if (col === "profit_margin_value") obj.profitMarginValue = row[idx];
      else if (col === "profit_margin_percent") obj.profitMarginPercent = row[idx];
      else obj[col] = row[idx];
    });
    return obj;
  });
}

export async function upsertProduct(p: any) {
  const d = await getSqliteDb();
  d.run(
    `INSERT OR REPLACE INTO products (id, name, sku, barcode, category, price, cost_price, stock, min_stock, unit, color_tag, description, pricing_method, bulk_units, bulk_cost, profit_margin_value, profit_margin_percent)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      p.id,
      p.name,
      p.sku,
      p.barcode || null,
      p.category,
      p.price,
      p.costPrice || 0,
      p.stock,
      p.minStock || 0,
      p.unit || "pcs",
      p.colorTag || null,
      p.description || null,
      p.pricingMethod || "MANUAL",
      p.bulkUnits !== undefined ? p.bulkUnits : null,
      p.bulkCost !== undefined ? p.bulkCost : null,
      p.profitMarginValue !== undefined ? p.profitMarginValue : null,
      p.profitMarginPercent !== undefined ? p.profitMarginPercent : null,
    ]
  );
  persistDb();
  return p;
}

export async function updateStock(productId: string, deltaQty: number) {
  const d = await getSqliteDb();
  d.run(
    `UPDATE products SET stock = MAX(0, stock + ?) WHERE id = ?`,
    [deltaQty, productId]
  );
  persistDb();
}

export async function removeProduct(productId: string) {
  const d = await getSqliteDb();
  d.run(`DELETE FROM products WHERE id = ?`, [productId]);
  persistDb();
}

export async function upsertProductsBatch(products: any[]) {
  const d = await getSqliteDb();
  for (const p of products) {
    d.run(
      `INSERT OR REPLACE INTO products (id, name, sku, barcode, category, price, cost_price, stock, min_stock, unit, color_tag, description, pricing_method, bulk_units, bulk_cost, profit_margin_value, profit_margin_percent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p.id,
        p.name,
        p.sku,
        p.barcode || null,
        p.category,
        p.price,
        p.costPrice || 0,
        p.stock,
        p.minStock || 0,
        p.unit || "pcs",
        p.colorTag || null,
        p.description || null,
        p.pricingMethod || "MANUAL",
        p.bulkUnits !== undefined ? p.bulkUnits : null,
        p.bulkCost !== undefined ? p.bulkCost : null,
        p.profitMarginValue !== undefined ? p.profitMarginValue : null,
        p.profitMarginPercent !== undefined ? p.profitMarginPercent : null,
      ]
    );
  }
  persistDb();
  return products;
}

export async function getAllSales() {
  const d = await getSqliteDb();
  const salesRes = d.exec("SELECT * FROM sales ORDER BY timestamp DESC");
  if (!salesRes.length) return [];

  const salesCols = salesRes[0].columns;
  const sales = salesRes[0].values.map((row) => {
    const obj: any = {};
    salesCols.forEach((col, idx) => {
      if (col === "receipt_number") obj.receiptNumber = row[idx];
      else if (col === "item_count") obj.itemCount = row[idx];
      else if (col === "discount_total") obj.discountTotal = row[idx];
      else if (col === "tax_total") obj.taxTotal = row[idx];
      else if (col === "payment_method") obj.paymentMethod = row[idx];
      else if (col === "amount_tendered") obj.amountTendered = row[idx];
      else if (col === "change_due") obj.changeDue = row[idx];
      else if (col === "customer_id") obj.customerId = row[idx];
      else if (col === "customer_name") obj.customerName = row[idx];
      else if (col === "cashier_name") obj.cashierName = row[idx];
      else if (col === "sync_status") obj.syncStatus = row[idx];
      else if (col === "offline_created") obj.offlineCreated = !!row[idx];
      else if (col === "pago_movil_details") {
        if (row[idx]) {
          try {
            obj.pagoMovilDetails = typeof row[idx] === "string" ? JSON.parse(row[idx]) : row[idx];
          } catch {
            obj.pagoMovilDetails = undefined;
          }
        }
      }
      else obj[col] = row[idx];
    });
    obj.items = [];
    return obj;
  });

  // Attach items
  const itemsRes = d.exec("SELECT * FROM sale_items");
  if (itemsRes.length) {
    const itemCols = itemsRes[0].columns;
    const saleMap = new Map(sales.map((s) => [s.id, s]));
    for (const row of itemsRes[0].values) {
      const item: any = {};
      itemCols.forEach((col, idx) => {
        if (col === "sale_id") item.saleId = row[idx];
        else if (col === "product_id") item.productId = row[idx];
        else if (col === "cost_price") item.costPrice = row[idx];
        else if (col === "discount_type") item.discountType = row[idx];
        else if (col === "tax_rate") item.taxRate = row[idx];
        else item[col] = row[idx];
      });
      const parent = saleMap.get(item.saleId);
      if (parent) {
        parent.items.push(item);
      }
    }
  }

  return sales;
}

export async function insertSale(sale: any) {
  const d = await getSqliteDb();
  d.run("BEGIN TRANSACTION;");
  try {
    const pagoMovilJson = sale.pagoMovilDetails
      ? (typeof sale.pagoMovilDetails === "string" ? sale.pagoMovilDetails : JSON.stringify(sale.pagoMovilDetails))
      : null;

    d.run(
      `INSERT OR REPLACE INTO sales (
        id, receipt_number, timestamp, item_count, subtotal, discount_total, tax_total, total,
        payment_method, amount_tendered, change_due, customer_id, customer_name, cashier_name,
        notes, pago_movil_details, sync_status, offline_created
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sale.id,
        sale.receiptNumber,
        sale.timestamp,
        sale.itemCount || (sale.items ? sale.items.length : 0),
        sale.subtotal,
        sale.discountTotal || 0,
        sale.taxTotal || 0,
        sale.total,
        sale.paymentMethod,
        sale.amountTendered || 0,
        sale.changeDue || 0,
        sale.customerId || null,
        sale.customerName || null,
        sale.cashierName || "Terminal",
        sale.notes || null,
        pagoMovilJson,
        sale.syncStatus || "synced",
        sale.offlineCreated ? 1 : 0,
      ]
    );

    if (Array.isArray(sale.items)) {
      for (const item of sale.items) {
        const itemId = item.id || `item-${sale.id}-${item.productId}`;
        d.run(
          `INSERT OR REPLACE INTO sale_items (
            id, sale_id, product_id, name, sku, barcode, category, price, cost_price, quantity,
            discount, discount_type, tax_rate, subtotal, total
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            itemId,
            sale.id,
            item.productId,
            item.name,
            item.sku || null,
            item.barcode || null,
            item.category || null,
            item.price,
            item.costPrice || 0,
            item.quantity,
            item.discount || 0,
            item.discountType || "percentage",
            item.taxRate || 0,
            item.subtotal,
            item.total,
          ]
        );

        // Decrement product inventory in SQLite
        d.run(`UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?`, [item.quantity, item.productId]);
      }
    }

    d.run("COMMIT;");
    persistDb();
    return sale;
  } catch (err) {
    d.run("ROLLBACK;");
    throw err;
  }
}

export async function getAllCustomers() {
  const d = await getSqliteDb();
  const res = d.exec("SELECT * FROM customers ORDER BY name ASC");
  if (!res.length) return [];
  const cols = res[0].columns;
  return res[0].values.map((row) => {
    const obj: any = {};
    cols.forEach((col, idx) => {
      if (col === "current_debt") obj.currentDebt = row[idx];
      else if (col === "credit_balance") obj.creditBalance = row[idx];
      else if (col === "debt_limit") obj.debtLimit = row[idx];
      else if (col === "created_at") obj.createdAt = row[idx];
      else if (col === "updated_at") obj.updatedAt = row[idx];
      else obj[col] = row[idx];
    });
    return obj;
  });
}

export async function upsertCustomer(c: any) {
  const d = await getSqliteDb();
  d.run(
    `INSERT OR REPLACE INTO customers (id, name, phone, email, current_debt, credit_balance, debt_limit, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      c.id,
      c.name,
      c.phone,
      c.email || null,
      c.currentDebt || 0,
      c.creditBalance || 0,
      c.debtLimit || 100,
      c.notes || null,
      c.createdAt || Date.now(),
      c.updatedAt || Date.now(),
    ]
  );
  persistDb();
  return c;
}

export async function deleteCustomerFromDb(id: string) {
  const d = await getSqliteDb();
  d.run("DELETE FROM customers WHERE id = ?", [id]);
  persistDb();
}

export async function getAllCustomerLedger() {
  const d = await getSqliteDb();
  const res = d.exec("SELECT * FROM customer_ledger ORDER BY timestamp DESC");
  if (!res.length) return [];
  const cols = res[0].columns;
  return res[0].values.map((row) => {
    const obj: any = {};
    cols.forEach((col, idx) => {
      if (col === "customer_id") obj.customerId = row[idx];
      else if (col === "customer_name") obj.customerName = row[idx];
      else if (col === "balance_after") obj.balanceAfter = row[idx];
      else if (col === "reference_receipt_number") obj.referenceReceiptNumber = row[idx];
      else if (col === "sync_status") obj.syncStatus = row[idx];
      else obj[col] = row[idx];
    });
    return obj;
  });
}

export async function insertCustomerLedger(entry: any) {
  const d = await getSqliteDb();
  d.run(
    `INSERT OR REPLACE INTO customer_ledger (id, customer_id, customer_name, timestamp, type, amount, balance_after, reference_receipt_number, notes, sync_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      entry.id,
      entry.customerId,
      entry.customerName,
      entry.timestamp,
      entry.type,
      entry.amount,
      entry.balanceAfter,
      entry.referenceReceiptNumber || null,
      entry.notes || null,
      entry.syncStatus || "synced",
    ]
  );
  persistDb();
  return entry;
}

export async function getAllVendors() {
  const d = await getSqliteDb();
  const res = d.exec("SELECT * FROM vendors ORDER BY name ASC");
  if (!res.length) return [];
  const cols = res[0].columns;
  return res[0].values.map((row) => {
    const obj: any = {};
    cols.forEach((col, idx) => {
      if (col === "contact_person") obj.contactPerson = row[idx];
      else if (col === "category_supplied") obj.categorySupplied = row[idx];
      else if (col === "outstanding_payable") obj.outstandingPayable = row[idx];
      else if (col === "payment_terms") obj.paymentTerms = row[idx];
      else if (col === "created_at") obj.createdAt = row[idx];
      else if (col === "updated_at") obj.updatedAt = row[idx];
      else obj[col] = row[idx];
    });
    return obj;
  });
}

export async function upsertVendor(v: any) {
  const d = await getSqliteDb();
  d.run(
    `INSERT OR REPLACE INTO vendors (id, name, contact_person, phone, email, category_supplied, outstanding_payable, payment_terms, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      v.id,
      v.name,
      v.contactPerson,
      v.phone,
      v.email || null,
      v.categorySupplied,
      v.outstandingPayable || 0,
      v.paymentTerms || "Net 30",
      v.notes || null,
      v.createdAt || Date.now(),
      v.updatedAt || Date.now(),
    ]
  );
  persistDb();
  return v;
}

export async function deleteVendorFromDb(id: string) {
  const d = await getSqliteDb();
  d.run("DELETE FROM vendors WHERE id = ?", [id]);
  persistDb();
}

export async function getAllVendorLedger() {
  const d = await getSqliteDb();
  const res = d.exec("SELECT * FROM vendor_ledger ORDER BY timestamp DESC");
  if (!res.length) return [];
  const cols = res[0].columns;
  return res[0].values.map((row) => {
    const obj: any = {};
    cols.forEach((col, idx) => {
      if (col === "vendor_id") obj.vendorId = row[idx];
      else if (col === "vendor_name") obj.vendorName = row[idx];
      else if (col === "balance_after") obj.balanceAfter = row[idx];
      else if (col === "reference_invoice_number") obj.referenceInvoiceNumber = row[idx];
      else if (col === "sync_status") obj.syncStatus = row[idx];
      else obj[col] = row[idx];
    });
    return obj;
  });
}

export async function insertVendorLedger(entry: any) {
  const d = await getSqliteDb();
  d.run(
    `INSERT OR REPLACE INTO vendor_ledger (id, vendor_id, vendor_name, timestamp, type, amount, balance_after, reference_invoice_number, notes, sync_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      entry.id,
      entry.vendorId,
      entry.vendorName,
      entry.timestamp,
      entry.type,
      entry.amount,
      entry.balanceAfter,
      entry.referenceInvoiceNumber || null,
      entry.notes || null,
      entry.syncStatus || "synced",
    ]
  );
  persistDb();
  return entry;
}

export async function getStoreSettingsFromDb() {
  const d = await getSqliteDb();
  const res = d.exec("SELECT value FROM store_settings WHERE key = 'main'");
  if (res.length && res[0].values.length) {
    try {
      return JSON.parse(res[0].values[0][0] as string);
    } catch {
      return null;
    }
  }
  return null;
}

export async function saveStoreSettingsToDb(settings: any) {
  const d = await getSqliteDb();
  d.run(
    `INSERT OR REPLACE INTO store_settings (key, value) VALUES ('main', ?)`,
    [JSON.stringify(settings)]
  );
  persistDb();
}

// ----------------- SQLITE STATS & EXPORT -----------------

export async function getSqliteStats() {
  const d = await getSqliteDb();
  const getCount = (table: string): number => {
    try {
      const res = d.exec(`SELECT COUNT(*) as c FROM ${table}`);
      return (res[0]?.values[0]?.[0] as number) || 0;
    } catch {
      return 0;
    }
  };

  let sizeBytes = 0;
  let lastModified = Date.now();
  if (fs.existsSync(DB_PATH)) {
    const stats = fs.statSync(DB_PATH);
    sizeBytes = stats.size;
    lastModified = stats.mtimeMs;
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return {
    engine: "SQLite 3 (Wasm engine)",
    path: path.relative(process.cwd(), DB_PATH) || "data/tubodeguita.sqlite",
    sizeBytes,
    sizeFormatted: formatSize(sizeBytes),
    lastModified,
    tableCounts: {
      products: getCount("products"),
      sales: getCount("sales"),
      saleItems: getCount("sale_items"),
      customers: getCount("customers"),
      customerLedger: getCount("customer_ledger"),
      vendors: getCount("vendors"),
      vendorLedger: getCount("vendor_ledger"),
    },
  };
}

export async function getSqliteBuffer(): Promise<Buffer> {
  const d = await getSqliteDb();
  const data = d.export();
  return Buffer.from(data);
}

export async function generateSqlDump(): Promise<string> {
  const d = await getSqliteDb();
  const tables = ["products", "sales", "sale_items", "customers", "customer_ledger", "vendors", "vendor_ledger", "store_settings"];
  let sql = `-- ========================================================\n`;
  sql += `-- TuBodeguita - SQLite Database Dump\n`;
  sql += `-- Export Date: ${new Date().toISOString()}\n`;
  sql += `-- Engine: SQLite3\n`;
  sql += `-- ========================================================\n\n`;
  sql += `PRAGMA foreign_keys = OFF;\nBEGIN TRANSACTION;\n\n`;

  for (const t of tables) {
    const res = d.exec(`SELECT * FROM ${t}`);
    if (res.length) {
      const cols = res[0].columns;
      sql += `-- Table: ${t}\n`;
      for (const row of res[0].values) {
        const valuesFormatted = row.map((v) => {
          if (v === null || v === undefined) return "NULL";
          if (typeof v === "number") return v;
          return `'${String(v).replace(/'/g, "''")}'`;
        });
        sql += `INSERT INTO ${t} (${cols.join(", ")}) VALUES (${valuesFormatted.join(", ")});\n`;
      }
      sql += `\n`;
    }
  }

  sql += `COMMIT;\nPRAGMA foreign_keys = ON;\n`;
  return sql;
}

export async function runRawQuery(sqlQuery: string) {
  const d = await getSqliteDb();
  const trimmed = sqlQuery.trim();
  const isSelect = /^\s*SELECT/i.test(trimmed) || /^\s*PRAGMA/i.test(trimmed) || /^\s*EXPLAIN/i.test(trimmed);

  if (isSelect) {
    const results = d.exec(trimmed);
    if (!results.length) {
      return { columns: [], values: [], rowCount: 0 };
    }
    return {
      columns: results[0].columns,
      values: results[0].values,
      rowCount: results[0].values.length,
    };
  } else {
    d.run(trimmed);
    persistDb();
    return {
      success: true,
      message: "Query executed successfully",
      rowsAffected: d.getRowsModified(),
    };
  }
}
