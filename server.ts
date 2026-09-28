import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import {
  getSqliteDb,
  getSqliteStats,
  getSqliteBuffer,
  generateSqlDump,
  runRawQuery,
  getAllProducts,
  upsertProduct,
  upsertProductsBatch,
  removeProduct,
  updateStock,
  getAllSales,
  insertSale,
  getAllCustomers,
  upsertCustomer,
  deleteCustomerFromDb,
  getAllCustomerLedger,
  insertCustomerLedger,
  getAllVendors,
  upsertVendor,
  deleteVendorFromDb,
  getAllVendorLedger,
  insertVendorLedger,
  getStoreSettingsFromDb,
  saveStoreSettingsToDb,
} from "./server/sqlite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini SDK with fallback handling
let genAI: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!genAI && process.env.GEMINI_API_KEY) {
    try {
      genAI = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    } catch (err) {
      console.error("Error initializing GoogleGenAI:", err);
      return null;
    }
  }
  return genAI;
}

// In-memory cloud simulation store for synced records
interface CloudStore {
  sales: any[];
  inventory: Record<string, number>;
  customerLedgers: any[];
  vendorLedgers: any[];
  lastSyncTimestamp: number;
}

const cloudDatabase: CloudStore = {
  sales: [],
  inventory: {},
  customerLedgers: [],
  vendorLedgers: [],
  lastSyncTimestamp: Date.now(),
};

// API: Health
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    appName: "TuBodeguita",
    timestamp: new Date().toISOString(),
    hasAiKey: !!process.env.GEMINI_API_KEY,
  });
});

// API: AI Product Recommendations (Cross-sell / Bundling)
app.post("/api/ai/recommendations", async (req, res) => {
  try {
    const { cartItems, inventory, customerProfile } = req.body;
    const aiClient = getGeminiClient();

    // If Gemini key is not configured, send a structured fallback response
    if (!aiClient) {
      return res.json({
        source: "fallback",
        recommendations: generateFallbackRecommendations(cartItems, inventory),
        tip: "Smart POS cross-selling tips active. (Configure GEMINI_API_KEY for deep LLM reasoning)",
      });
    }

    const prompt = `You are an expert retail POS smart assistant for a store.
Analyze the current cart items, available store inventory, and optional customer profile to recommend 2 to 4 high-affinity products to cross-sell or bundle.

Cart items currently in checkout:
${JSON.stringify(cartItems, null, 2)}

Available store inventory items (must choose ONLY from these available in-stock items):
${JSON.stringify(inventory, null, 2)}

Customer context:
${customerProfile ? JSON.stringify(customerProfile, null, 2) : "Standard Walk-in Customer"}

Respond with a JSON object in this exact format:
{
  "recommendations": [
    {
      "productId": "string matching an id in inventory",
      "productName": "string",
      "reason": "1 concise sentence why this pairs well with the cart",
      "discountSuggestion": "e.g. '10% bundle discount' or null",
      "confidence": 0.95
    }
  ],
  "cashierPitch": "A short, natural 1-sentence phrase for the cashier to suggest this to the shopper at the counter."
}`;

    const response = await aiClient.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({
      source: "gemini",
      recommendations: parsed.recommendations || [],
      cashierPitch: parsed.cashierPitch || "Would you also like to add any complementary items today?",
    });
  } catch (error: any) {
    console.error("AI Recommendations error:", error);
    // Graceful fallback if network/API fails
    const { cartItems, inventory } = req.body;
    return res.json({
      source: "fallback",
      recommendations: generateFallbackRecommendations(cartItems || [], inventory || []),
      tip: "Complementary recommendations based on store buying patterns.",
    });
  }
});

// API: AI Inventory & Reorder Insights
app.post("/api/ai/inventory-insights", async (req, res) => {
  try {
    const { inventory, salesRecent } = req.body;
    const aiClient = getGeminiClient();

    if (!aiClient) {
      return res.json({
        source: "fallback",
        insights: [
          {
            type: "warning",
            title: "Check Low Stock Thresholds",
            message: "Items with stock <= minStock should be reordered from vendors promptly.",
          },
          {
            type: "opportunity",
            title: "Fast Turnover Velocity",
            message: "Beverages and Snacks show the highest daily transaction frequency.",
          },
        ],
      });
    }

    const prompt = `You are a retail inventory and supply chain optimization expert.
Review the current store inventory and recent sales:

Current inventory:
${JSON.stringify(inventory, null, 2)}

Recent sales summaries:
${JSON.stringify(salesRecent, null, 2)}

Provide 3 actionable insights (such as reorder urgency, high-margin opportunities, or dead stock alert).
Return JSON:
{
  "insights": [
    {
      "type": "danger" | "warning" | "opportunity" | "info",
      "title": "short title",
      "message": "specific advice referencing exact items and stock levels",
      "recommendedAction": "e.g. 'Create PO to vendor for 24 units'"
    }
  ]
}`;

    const response = await aiClient.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.4,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({
      source: "gemini",
      insights: parsed.insights || [],
    });
  } catch (error: any) {
    console.error("AI Inventory Insights error:", error);
    return res.json({
      source: "fallback",
      insights: [
        {
          type: "warning",
          title: "Low Stock Alert",
          message: "Check items below minimum stock threshold and generate vendor purchase orders.",
        },
      ],
    });
  }
});

// BCV Exchange Rate Proxy Endpoint (rates.dolarvzla.com/bcv/current.json)
// Caches rate for 12 hours (43,200,000 ms) unless force=true
const BCV_API_URL = "https://rates.dolarvzla.com/bcv/current.json";
const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;
let cachedBcvRate: {
  rate: number;
  date: string;
  timestamp: number;
  data: any;
} | null = null;

app.get("/api/bcv-rate", async (req, res) => {
  const force = req.query.force === "true";
  const now = Date.now();

  if (!force && cachedBcvRate && (now - cachedBcvRate.timestamp < TWELVE_HOURS_MS)) {
    return res.json({
      success: true,
      rate: cachedBcvRate.rate,
      date: cachedBcvRate.date,
      lastUpdated: cachedBcvRate.timestamp,
      cached: true,
      data: cachedBcvRate.data,
    });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const resp = await fetch(BCV_API_URL, {
      signal: controller.signal,
      headers: {
        "User-Agent": "TuBodeguita-BCV-Service/1.0",
        "Accept": "application/json",
      },
    });
    clearTimeout(timeout);

    if (!resp.ok) {
      throw new Error(`HTTP status ${resp.status} ${resp.statusText}`);
    }

    const json: any = await resp.json();
    const usdRate = Number(json?.current?.usd);

    if (!usdRate || isNaN(usdRate) || usdRate <= 0) {
      throw new Error("Invalid USD rate received from BCV upstream API");
    }

    cachedBcvRate = {
      rate: usdRate,
      date: json?.current?.date || new Date().toISOString().split("T")[0],
      timestamp: now,
      data: json,
    };

    return res.json({
      success: true,
      rate: cachedBcvRate.rate,
      date: cachedBcvRate.date,
      lastUpdated: cachedBcvRate.timestamp,
      cached: false,
      data: json,
    });
  } catch (err: any) {
    console.error("BCV Rate Proxy fetch error:", err.message);
    if (cachedBcvRate) {
      return res.json({
        success: true,
        rate: cachedBcvRate.rate,
        date: cachedBcvRate.date,
        lastUpdated: cachedBcvRate.timestamp,
        cached: true,
        stale: true,
        warning: `Used stale rate (${err.message})`,
      });
    }
    return res.status(502).json({
      success: false,
      error: "Failed to fetch BCV rate",
      message: err.message,
    });
  }
});

// SQLite Database Endpoints
app.get("/api/db/stats", async (req, res) => {
  try {
    const stats = await getSqliteStats();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to get SQLite stats", message: err.message });
  }
});

app.get("/api/db/export-sqlite", async (req, res) => {
  try {
    const buffer = await getSqliteBuffer();
    res.setHeader("Content-Type", "application/x-sqlite3");
    res.setHeader("Content-Disposition", 'attachment; filename="tubodeguita.sqlite"');
    res.setHeader("Content-Length", buffer.length);
    res.send(buffer);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to export sqlite file", message: err.message });
  }
});

app.get("/api/db/export-sql", async (req, res) => {
  try {
    const sqlDump = await generateSqlDump();
    res.setHeader("Content-Type", "application/sql");
    res.setHeader("Content-Disposition", 'attachment; filename="tubodeguita_dump.sql"');
    res.send(sqlDump);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to generate SQL dump", message: err.message });
  }
});

app.post("/api/db/query", async (req, res) => {
  try {
    const { sql } = req.body;
    if (!sql || typeof sql !== "string") {
      return res.status(400).json({ error: "SQL query string required" });
    }
    const result = await runRawQuery(sql);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: "Query execution error", message: err.message });
  }
});

// Products SQLite CRUD
app.get("/api/products", async (req, res) => {
  try {
    const products = await getAllProducts();
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch products from SQLite", message: err.message });
  }
});

app.post("/api/products", async (req, res) => {
  try {
    const product = req.body;
    const saved = await upsertProduct(product);
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to save product to SQLite", message: err.message });
  }
});

app.post("/api/products/batch", async (req, res) => {
  try {
    const { products } = req.body;
    if (!Array.isArray(products)) {
      return res.status(400).json({ error: "Array of products required in body.products" });
    }
    const saved = await upsertProductsBatch(products);
    res.json({ success: true, count: saved.length, products: saved });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to batch save products to SQLite", message: err.message });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
    await removeProduct(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to delete product from SQLite", message: err.message });
  }
});

// Sales SQLite CRUD
app.get("/api/sales", async (req, res) => {
  try {
    const sales = await getAllSales();
    res.json(sales);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch sales from SQLite", message: err.message });
  }
});

app.post("/api/sales", async (req, res) => {
  try {
    const sale = req.body;
    const saved = await insertSale(sale);
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to save sale to SQLite", message: err.message });
  }
});

// Customers SQLite CRUD
app.get("/api/customers", async (req, res) => {
  try {
    const customers = await getAllCustomers();
    res.json(customers);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch customers from SQLite", message: err.message });
  }
});

app.post("/api/customers", async (req, res) => {
  try {
    const customer = req.body;
    const saved = await upsertCustomer(customer);
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to save customer to SQLite", message: err.message });
  }
});

app.delete("/api/customers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await deleteCustomerFromDb(id);
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to delete customer from SQLite", message: err.message });
  }
});

// Customer Ledger SQLite
app.get("/api/customer-ledger", async (req, res) => {
  try {
    const entries = await getAllCustomerLedger();
    res.json(entries);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch customer ledger from SQLite", message: err.message });
  }
});

app.post("/api/customer-ledger", async (req, res) => {
  try {
    const entry = req.body;
    const saved = await insertCustomerLedger(entry);
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to save customer ledger entry to SQLite", message: err.message });
  }
});

// Vendors SQLite CRUD
app.get("/api/vendors", async (req, res) => {
  try {
    const vendors = await getAllVendors();
    res.json(vendors);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch vendors from SQLite", message: err.message });
  }
});

app.post("/api/vendors", async (req, res) => {
  try {
    const vendor = req.body;
    const saved = await upsertVendor(vendor);
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to save vendor to SQLite", message: err.message });
  }
});

app.delete("/api/vendors/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await deleteVendorFromDb(id);
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to delete vendor from SQLite", message: err.message });
  }
});

// Vendor Ledger SQLite
app.get("/api/vendor-ledger", async (req, res) => {
  try {
    const entries = await getAllVendorLedger();
    res.json(entries);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch vendor ledger from SQLite", message: err.message });
  }
});

app.post("/api/vendor-ledger", async (req, res) => {
  try {
    const entry = req.body;
    const saved = await insertVendorLedger(entry);
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to save vendor ledger entry to SQLite", message: err.message });
  }
});

// Settings SQLite
app.get("/api/settings", async (req, res) => {
  try {
    const settings = await getStoreSettingsFromDb();
    res.json(settings || {});
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch settings from SQLite", message: err.message });
  }
});

app.post("/api/settings", async (req, res) => {
  try {
    await saveStoreSettingsToDb(req.body);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to save settings to SQLite", message: err.message });
  }
});

// API: Synchronization Endpoint (Persists directly to SQLite)
app.post("/api/sync", async (req, res) => {
  try {
    const { batch } = req.body;
    if (!Array.isArray(batch)) {
      return res.status(400).json({ error: "Batch array required" });
    }

    const syncedResults: Array<{ id: string; status: string; timestamp: number }> = [];

    for (const item of batch) {
      try {
        if (item.type === "SALE") {
          await insertSale(item.payload);
        } else if (item.type === "INVENTORY_UPDATE") {
          const { productId, change, newStock, product } = item.payload;
          if (product) {
            await upsertProduct(product);
          } else if (productId && typeof change === "number") {
            await updateStock(productId, change);
          } else if (productId && typeof newStock === "number") {
            const products = await getAllProducts();
            const existing = products.find((p: any) => p.id === productId);
            if (existing) {
              await upsertProduct({ ...existing, stock: newStock });
            }
          }
        } else if (item.type === "CUSTOMER_LEDGER") {
          await insertCustomerLedger(item.payload);
        } else if (item.type === "VENDOR_LEDGER") {
          await insertVendorLedger(item.payload);
        }

        syncedResults.push({
          id: item.id,
          status: "synced",
          timestamp: Date.now(),
        });
      } catch (itemErr) {
        console.error("Error processing sync item:", item.id, itemErr);
        syncedResults.push({
          id: item.id,
          status: "failed",
          timestamp: Date.now(),
        });
      }
    }

    const stats = await getSqliteStats();

    return res.json({
      success: true,
      processedCount: batch.length,
      syncedResults,
      sqliteStats: stats,
    });
  } catch (err: any) {
    console.error("Sync error:", err);
    res.status(500).json({ error: "SQLite sync failed", message: err.message });
  }
});

// API: Cloud/SQLite Status Check
app.get("/api/cloud-status", async (req, res) => {
  try {
    const stats = await getSqliteStats();
    res.json({
      online: true,
      serverTime: Date.now(),
      sqlite: stats,
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to get database status", message: err.message });
  }
});

// Heuristic fallback recommendations for offline/no-key mode
function generateFallbackRecommendations(cartItems: any[], inventory: any[]) {
  if (!Array.isArray(inventory) || inventory.length === 0) return [];
  const cartIds = new Set((cartItems || []).map((i) => i.productId || i.id));
  const available = inventory.filter((item) => !cartIds.has(item.id) && item.stock > 0);

  // Cross-category affinities
  const categoryPairs: Record<string, string[]> = {
    Beverages: ["Snacks", "Bakery"],
    Coffee: ["Bakery", "Snacks"],
    Electronics: ["Accessories", "Hardware"],
    Groceries: ["Dairy", "Bakery"],
  };

  const cartCategories = (cartItems || []).map((i) => i.category);
  const preferredCategories = cartCategories.flatMap((cat) => categoryPairs[cat] || []);

  const sorted = [...available].sort((a, b) => {
    const aPreferred = preferredCategories.includes(a.category) ? 1 : 0;
    const bPreferred = preferredCategories.includes(b.category) ? 1 : 0;
    return bPreferred - aPreferred;
  });

  return sorted.slice(0, 3).map((item) => ({
    productId: item.id,
    productName: item.name,
    reason: `Frequently bought with ${cartItems[0]?.name || "popular store items"}`,
    discountSuggestion: item.price > 10 ? "5% combo save" : null,
    confidence: 0.88,
  }));
}

// Vite middleware & Static serving
async function startServer() {
  try {
    console.log("Initializing SQLite Local Database (tubodeguita.sqlite)...");
    await getSqliteDb();
    const stats = await getSqliteStats();
    console.log("SQLite ready:", stats.path, `(${stats.sizeFormatted})`, stats.tableCounts);
  } catch (dbErr) {
    console.error("Warning: SQLite initialization error:", dbErr);
  }

  const isProduction =
    process.env.NODE_ENV === "production" ||
    (process.env.NODE_ENV !== "development" && fs.existsSync(path.join(process.cwd(), "dist", "index.html")));

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TuBodeguita server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
