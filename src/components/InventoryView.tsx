import React, { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  AlertTriangle,
  Search,
  ArrowUpRight,
  TrendingDown,
  Sparkles,
  Barcode,
  RefreshCw,
  Edit2,
  Check,
  X,
  Layers,
  Filter,
  Camera,
  FileSpreadsheet,
  CheckCircle2,
  Trash2,
  Calculator,
  Boxes,
  Tag,
} from 'lucide-react';
import { Product, AIInventoryInsight, PricingMethod, StoreSettings } from '../types';
import { dbService } from '../services/db';
import { getPricingStrategy } from '../services/pricingStrategy';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../theme/ThemeContext';
import { useCurrency } from '../currency/CurrencyContext';
import { BarcodeScannerModal } from './BarcodeScannerModal';
import { ExcelImportModal } from './ExcelImportModal';

interface InventoryViewProps {
  products: Product[];
  onRefreshData: () => void;
  isOnline: boolean;
  storeSettings?: StoreSettings;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  onRefreshData,
  isOnline,
  storeSettings,
}) => {
  const { t, language, translateCategory, translateUnit } = useLanguage();
  const { formatMoney, formatSecondaryMoney, currencySymbol } = useCurrency();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);
  const [quickRestockId, setQuickRestockId] = useState<string | null>(null);
  const [restockQty, setRestockQty] = useState<number>(20);
  const [aiInsights, setAiInsights] = useState<AIInventoryInsight[]>([]);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [excelSuccessMsg, setExcelSuccessMsg] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteToastMsg, setDeleteToastMsg] = useState<string | null>(null);

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      dbService.deleteProduct(productToDelete.id);
      onRefreshData();
      const deletedName = productToDelete.name;
      setDeleteToastMsg(
        language === 'es'
          ? `Producto "${deletedName}" eliminado correctamente del catálogo.`
          : `Product "${deletedName}" was successfully deleted.`
      );
      setTimeout(() => setDeleteToastMsg(null), 4000);
      setProductToDelete(null);
      if (editingProduct && editingProduct.id === productToDelete.id) {
        setIsAddModalOpen(false);
        setEditingProduct(null);
      }
    } catch (err) {
      console.error('Error deleting product:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBatchImport = async (productsToSave: Product[]) => {
    dbService.saveProductsBatch(productsToSave);
    onRefreshData();
    setExcelSuccessMsg(
      language === 'es'
        ? `¡${productsToSave.length} productos importados y guardados con éxito!`
        : `Successfully imported and saved ${productsToSave.length} products!`
    );
    setTimeout(() => setExcelSuccessMsg(null), 5000);
  };

  // Custom category input state
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');

  // Available categories: merges configured categories from settings and existing product categories
  const availableCategories = useMemo(() => {
    const configuredCategories = dbService.getCategories();
    const fromProducts = products.map((p) => p.category).filter(Boolean);
    const merged = Array.from(new Set([...configuredCategories, ...fromProducts]));
    return merged.sort((a, b) => translateCategory(a).localeCompare(translateCategory(b)));
  }, [products, translateCategory]);

  // Current active settings
  const currentSettings = storeSettings || dbService.getStoreSettings();

  // New product form state
  const [formProduct, setFormProduct] = useState<Partial<Product>>({
    name: '',
    category: 'Coffee & Tea',
    sku: '',
    barcode: '',
    price: 4.99,
    stock: 20,
    minStock: 8,
    description: '',
    pricingMethod: currentSettings.pricingMethod || 'MANUAL',
    bulkUnits: 12,
    bulkCost: 24,
    profitMarginPercent: 25,
  });

  // Pricing strategy determination
  const effectivePricingMethod: PricingMethod =
    formProduct.pricingMethod || (currentSettings.pricingMethod || 'MANUAL');

  // Calculate bulk strategy metrics in real time
  const bulkCalculationResult = useMemo(() => {
    if (effectivePricingMethod !== 'BULK_PACK') return null;
    const strategy = getPricingStrategy('BULK_PACK');
    return strategy.calculate({
      bulkCost: formProduct.bulkCost,
      bulkUnits: formProduct.bulkUnits,
      profitMarginPercent: formProduct.profitMarginPercent,
      price: formProduct.price,
    });
  }, [
    effectivePricingMethod,
    formProduct.bulkCost,
    formProduct.bulkUnits,
    formProduct.profitMarginPercent,
    formProduct.price,
  ]);

  // Handler for wholesale bulk parameters change (auto-fills price in real-time)
  const handleBulkParamChange = (field: 'bulkCost' | 'bulkUnits' | 'profitMarginPercent', val: number) => {
    setFormProduct((prev) => {
      const updated = { ...prev, [field]: val };
      const strategy = getPricingStrategy('BULK_PACK');
      const calcResult = strategy.calculate({
        bulkCost: field === 'bulkCost' ? val : updated.bulkCost,
        bulkUnits: field === 'bulkUnits' ? val : updated.bulkUnits,
        profitMarginPercent: field === 'profitMarginPercent' ? val : updated.profitMarginPercent,
        price: updated.price,
      });

      if (updated.bulkUnits && updated.bulkUnits > 0) {
        updated.price = calcResult.suggestedPrice;
      }
      return updated;
    });
  };

  // Toggle between Manual and Bulk Pack strategy for this product
  const handlePricingMethodToggle = (newMethod: PricingMethod) => {
    setFormProduct((prev) => {
      const updated = { ...prev, pricingMethod: newMethod };
      if (newMethod === 'BULK_PACK') {
        const units = updated.bulkUnits && updated.bulkUnits > 0 ? updated.bulkUnits : 12;
        const cost =
          updated.bulkCost !== undefined && updated.bulkCost >= 0
            ? updated.bulkCost
            : 24;
        const profit =
          updated.profitMarginPercent !== undefined ? updated.profitMarginPercent : 25;

        updated.bulkUnits = units;
        updated.bulkCost = cost;
        updated.profitMarginPercent = profit;

        const strategy = getPricingStrategy('BULK_PACK');
        const calc = strategy.calculate({ bulkCost: cost, bulkUnits: units, profitMarginPercent: profit });
        updated.price = calc.suggestedPrice;
      }
      return updated;
    });
  };

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return ['All', ...Array.from(set)];
  }, [products]);

  // Inventory analytics KPIs
  const stats = useMemo(() => {
    const totalSKUs = products.length;
    const totalUnits = products.reduce((acc, p) => acc + p.stock, 0);
    const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;
    const totalRetailValue = products.reduce((acc, p) => acc + p.price * p.stock, 0);

    return {
      totalSKUs,
      totalUnits,
      lowStockCount,
      totalRetailValue,
    };
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
      const matchLow = !onlyLowStock || p.stock <= p.minStock;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.barcode.toLowerCase().includes(q);
      return matchCat && matchLow && matchSearch;
    });
  }, [products, selectedCategory, onlyLowStock, searchQuery]);

  // Quick restock execution
  const handleQuickRestock = (productId: string, qty: number) => {
    dbService.updateProductStock(productId, qty, 'Manual Restock');
    onRefreshData();
    setQuickRestockId(null);
  };

  // Generate random UPC barcode
  const generateRandomBarcode = () => {
    const prefix = '890103';
    const rand = Math.floor(100000 + Math.random() * 900000);
    return `${prefix}${rand}`;
  };

  // Save or Update product
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProduct.name || !formProduct.price) {
      alert(language === 'es' ? 'Nombre y precio del producto son obligatorios.' : 'Product name and price are required.');
      return;
    }

    const resolvedCategory = isCustomCategory
      ? (customCategoryName.trim() || 'General')
      : (formProduct.category || 'General');

    if (isCustomCategory && customCategoryName.trim()) {
      dbService.addCategory(customCategoryName.trim());
    }

    const productId = editingProduct ? editingProduct.id : `prod-${Date.now()}`;
    const sku =
      formProduct.sku ||
      `${resolvedCategory.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    const barcode = formProduct.barcode || generateRandomBarcode();

    const productToSave: Product = {
      id: productId,
      name: formProduct.name,
      category: resolvedCategory,
      sku,
      barcode,
      price: Number(formProduct.price) || 0,
      stock: Number(formProduct.stock) || 0,
      minStock: Number(formProduct.minStock) || 5,
      description: formProduct.description || '',
      pricingMethod: formProduct.pricingMethod || effectivePricingMethod,
      bulkUnits: formProduct.bulkUnits !== undefined ? Number(formProduct.bulkUnits) : undefined,
      bulkCost: formProduct.bulkCost !== undefined ? Number(formProduct.bulkCost) : undefined,
      profitMarginPercent: formProduct.profitMarginPercent !== undefined ? Number(formProduct.profitMarginPercent) : undefined,
    };

    dbService.saveProduct(productToSave);
    onRefreshData();
    setIsAddModalOpen(false);
    setEditingProduct(null);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    let resolvedMarginPercent = product.profitMarginPercent;
    if (resolvedMarginPercent === undefined) {
      if (product.profitMarginValue !== undefined && product.bulkCost && product.bulkUnits) {
        const unitCost = product.bulkCost / product.bulkUnits;
        resolvedMarginPercent = unitCost > 0 ? Number(((product.profitMarginValue / unitCost) * 100).toFixed(1)) : 25;
      } else {
        resolvedMarginPercent = 25;
      }
    }

    setFormProduct({
      ...product,
      pricingMethod: product.pricingMethod || currentSettings.pricingMethod || 'MANUAL',
      bulkUnits: product.bulkUnits !== undefined ? product.bulkUnits : 12,
      bulkCost:
        product.bulkCost !== undefined
          ? product.bulkCost
          : 24,
      profitMarginPercent: resolvedMarginPercent,
    });
    if (product.category && !availableCategories.includes(product.category)) {
      setIsCustomCategory(true);
      setCustomCategoryName(product.category);
    } else {
      setIsCustomCategory(false);
      setCustomCategoryName('');
    }
    setIsAddModalOpen(true);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setIsCustomCategory(false);
    setCustomCategoryName('');

    const defaultCategory = availableCategories.includes('Coffee & Tea')
      ? 'Coffee & Tea'
      : (availableCategories[0] || 'Coffee & Tea');

    const defaultMethod = currentSettings.pricingMethod || 'MANUAL';
    let initPrice = 5.99;
    const initBulkUnits = 12;
    const initBulkCost = 24.0;
    const initProfitMarginPercent = 25;

    if (defaultMethod === 'BULK_PACK') {
      const strategy = getPricingStrategy('BULK_PACK');
      const calc = strategy.calculate({
        bulkCost: initBulkCost,
        bulkUnits: initBulkUnits,
        profitMarginPercent: initProfitMarginPercent,
      });
      initPrice = calc.suggestedPrice;
    }

    setFormProduct({
      name: '',
      category: defaultCategory,
      sku: `PROD-${Math.floor(100 + Math.random() * 900)}`,
      barcode: generateRandomBarcode(),
      price: initPrice,
      stock: 25,
      minStock: 8,
      description: '',
      pricingMethod: defaultMethod,
      bulkUnits: initBulkUnits,
      bulkCost: initBulkCost,
      profitMarginPercent: initProfitMarginPercent,
    });
    setIsAddModalOpen(true);
  };

  const handleBarcodeScanned = (scannedCode: string) => {
    if (scannedCode) {
      setFormProduct((prev) => ({
        ...prev,
        barcode: scannedCode,
      }));
    }
    setIsBarcodeScannerOpen(false);
  };

  // Fetch AI Inventory Insights
  const fetchAiInventoryInsights = async () => {
    setIsLoadingAi(true);
    try {
      if (isOnline) {
        const res = await fetch('/api/ai/inventory-insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            inventory: products.map((p) => ({
              id: p.id,
              name: p.name,
              category: p.category,
              stock: p.stock,
              minStock: p.minStock,
              price: p.price,
              costPrice: p.costPrice,
            })),
            salesRecent: dbService.getSales().slice(0, 20),
          }),
        });
        const data = await res.json();
        setAiInsights(data.insights || []);
      } else {
        // Offline heuristic insights
        const lowItems = products.filter((p) => p.stock <= p.minStock);
        setAiInsights([
          {
            type: 'danger',
            title: language === 'es' ? `${lowItems.length} Productos en o bajo nivel crítico de reorden` : `${lowItems.length} Products At Or Below Reorder Level`,
            message: language === 'es'
              ? `Artículos (${lowItems.map((i) => i.name).slice(0, 3).join(', ')}) requieren reabastecimiento urgente para evitar pérdidas de venta.`
              : `Items (${lowItems.map((i) => i.name).slice(0, 3).join(', ')}) require vendor restocking immediately to prevent lost register sales.`,
            recommendedAction: language === 'es' ? 'Crear orden de compra a proveedores en la pestaña Libro Mayor.' : 'Create vendor purchase orders in the Vendor Ledger tab.',
          },
          {
            type: 'opportunity',
            title: language === 'es' ? 'Alta Velocidad de Margen' : 'High Margin Velocity',
            message: language === 'es'
              ? 'Artículos de Café y Té entregan >45% de margen bruto. Mantenga el exhibidor frontal surtido.'
              : 'Coffee & Tea items deliver >45% gross margin. Keep front display fully stocked.',
            recommendedAction: language === 'es' ? 'Ubicar bocadillos de alto margen junto al café.' : 'Position high margin snacks beside coffee bags.',
          },
        ]);
      }
    } catch (err) {
      console.warn('AI inventory insights fallback:', err);
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">{t.inventory.title}</h2>
          <p className="text-xs text-neutral-400 mt-0.5">{t.inventory.subtitle}</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            id="open-excel-import-btn"
            type="button"
            onClick={() => setIsExcelModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 text-xs font-semibold shadow-xs cursor-pointer transition-colors"
            title={t.inventory.importExcelBtn}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>{t.inventory.importExcelBtn}</span>
          </button>
          <button
            id="ai-inventory-insights-btn"
            onClick={fetchAiInventoryInsights}
            disabled={isLoadingAi}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 text-xs font-semibold shadow-xs cursor-pointer transition-colors"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>{isLoadingAi ? (language === 'es' ? 'Analizando...' : 'Analyzing...') : t.inventory.aiInsightsBtn}</span>
          </button>
          <button
            id="add-product-btn"
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/50 cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{t.inventory.addProduct}</span>
          </button>
        </div>
      </div>

      {/* Excel Import Success Toast Banner */}
      {excelSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800/70 text-emerald-300 text-xs flex items-center justify-between gap-3 shadow-md animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">{excelSuccessMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setExcelSuccessMsg(null)}
            className="text-emerald-400 hover:text-white p-1 rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Delete Product Toast Banner */}
      {deleteToastMsg && (
        <div className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 shadow-md animate-in fade-in slide-in-from-top-2 duration-150 ${
          isLight
            ? 'bg-rose-50 border-rose-200 text-rose-800'
            : 'bg-rose-950/60 border-rose-800/70 text-rose-300'
        }`}>
          <div className="flex items-center gap-2.5">
            <Trash2 className={`w-4 h-4 shrink-0 ${isLight ? 'text-rose-600' : 'text-rose-400'}`} />
            <span className="font-semibold">{deleteToastMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setDeleteToastMsg(null)}
            className={`p-1 rounded cursor-pointer transition-colors ${
              isLight ? 'text-rose-500 hover:text-rose-800' : 'text-rose-400 hover:text-white'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 shadow-sm">
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">{t.inventory.activeSkus}</span>
          <div className="text-2xl font-bold font-mono text-white mt-1">{stats.totalSKUs}</div>
          <span className="text-[10px] text-neutral-500 mt-0.5 block">{language === 'es' ? 'Catálogo activo' : 'Catalog size'}</span>
        </div>

        <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 shadow-sm">
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">{t.inventory.unitsInStock}</span>
          <div className="text-2xl font-bold font-mono text-white mt-1">{stats.totalUnits}</div>
          <span className="text-[10px] text-emerald-400 mt-0.5 block">{language === 'es' ? 'Todas las categorías' : 'Across all categories'}</span>
        </div>

        <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 shadow-sm">
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">{t.inventory.retailValue}</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {formatMoney(stats.totalRetailValue, 0)}
          </div>
          <span className="text-[10px] text-neutral-500 mt-0.5 block">{language === 'es' ? 'Valor en anaquel' : 'Estimated shelf value'}</span>
        </div>

        <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 shadow-sm">
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">{t.inventory.lowStockAlerts}</span>
          <div className={`text-2xl font-bold font-mono mt-1 ${stats.lowStockCount > 0 ? 'text-amber-400' : 'text-neutral-400'}`}>
            {stats.lowStockCount}
          </div>
          <span className="text-[10px] text-neutral-500 mt-0.5 block">{language === 'es' ? 'Requieren reposición' : 'Need replenishment'}</span>
        </div>
      </div>

      {/* AI Insights Banner (if generated) */}
      {aiInsights.length > 0 && (
        <div className="bg-neutral-900 text-neutral-200 p-4 rounded-xl shadow-sm border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-300">
                {language === 'es' ? 'Perspectivas IA de Inventario y Suministro' : 'AI Stock & Supply Chain Insights'}
              </h4>
            </div>
            <button
              onClick={() => setAiInsights([])}
              className="text-neutral-400 hover:text-white text-xs cursor-pointer"
            >
              {language === 'es' ? 'Cerrar' : 'Dismiss'}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {aiInsights.map((insight, idx) => (
              <div
                key={idx}
                className="bg-[#0D0D0D] border border-neutral-800 p-3 rounded-lg text-xs space-y-1"
              >
                <div className="font-bold text-neutral-100 flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      insight.type === 'danger'
                        ? 'bg-red-400'
                        : insight.type === 'warning'
                        ? 'bg-orange-400'
                        : 'bg-emerald-400'
                    }`}
                  />
                  <span>{insight.title}</span>
                </div>
                <p className="text-neutral-300 text-[11px] leading-relaxed">{insight.message}</p>
                {insight.recommendedAction && (
                  <p className="text-emerald-400 font-semibold text-[11px] pt-1">
                    {language === 'es' ? 'Acción:' : 'Action:'} {insight.recommendedAction}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t.inventory.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#0D0D0D] border border-neutral-800 rounded-lg text-xs font-medium text-white placeholder-neutral-500 focus:outline-hidden focus:border-emerald-600"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
            <button
              onClick={() => setOnlyLowStock(!onlyLowStock)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                onlyLowStock
                  ? 'bg-orange-950/40 text-orange-400 border-orange-900/50 ring-1 ring-orange-500/30'
                  : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-neutral-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
              <span>{t.inventory.lowStockAlerts} ({stats.lowStockCount})</span>
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                  : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200 border border-neutral-700'
              }`}
            >
              {translateCategory(cat)}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className={`rounded-xl border shadow-xs overflow-hidden ${
        isLight ? 'bg-white border-slate-200' : 'bg-neutral-900 border-neutral-800'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`border-b font-semibold uppercase tracking-wider text-[11px] ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-[#0D0D0D] border-neutral-800 text-neutral-400'
            }`}>
              <tr>
                <th className="px-4 py-3">{t.inventory.productAndSku}</th>
                <th className="px-4 py-3">{t.inventory.barcode}</th>
                <th className="px-4 py-3">{t.inventory.category}</th>
                <th className="px-4 py-3">{t.inventory.price}</th>
                <th className="px-4 py-3">{t.inventory.stockLevel}</th>
                <th className="px-4 py-3 text-right">{t.inventory.quickRestockActions}</th>
              </tr>
            </thead>
            <tbody className={`divide-y font-medium ${
              isLight ? 'divide-slate-200 text-slate-700' : 'divide-neutral-800 text-neutral-300'
            }`}>
              {filteredProducts.map((p) => {
                const isLow = p.stock <= p.minStock;
                const isOut = p.stock <= 0;
                const percent = Math.min(100, Math.round((p.stock / (p.minStock * 2.5)) * 100));

                return (
                  <tr key={p.id} className={`transition-colors ${
                    isLight ? 'hover:bg-slate-50/80' : 'hover:bg-neutral-800/40'
                  }`}>
                    {/* Name & SKU */}
                    <td className="px-4 py-3.5">
                      <div className={`font-bold text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>{p.name}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>{p.sku}</span>
                        {(p.pricingMethod === 'BULK_PACK' || (p.bulkUnits && p.bulkUnits > 0)) && (
                          <span
                            className={`text-[10px] font-sans font-semibold px-1.5 py-0.5 rounded border inline-flex items-center gap-1 transition-colors ${
                              isLight
                                ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-2xs'
                                : 'bg-amber-950/50 text-amber-300 border-amber-800/60'
                            }`}
                            title={`${p.bulkUnits || 1} ${language === 'es' ? 'unidades por bulto' : 'units per pack'}`}
                          >
                            <Boxes className={`w-2.5 h-2.5 ${isLight ? 'text-amber-800' : 'text-amber-400'}`} />
                            <span>{p.bulkUnits ? `${p.bulkUnits}u` : t.inventory.bulkPackBadge}</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Barcode */}
                    <td className="px-4 py-3.5">
                      <div className={`flex items-center gap-1.5 font-mono text-[11px] ${
                        isLight ? 'text-slate-600' : 'text-neutral-400'
                      }`}>
                        <Barcode className={`w-3.5 h-3.5 ${isLight ? 'text-slate-400' : 'text-neutral-500'}`} />
                        <span>{p.barcode}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[11px] border ${
                        isLight
                          ? 'bg-slate-100 text-slate-700 border-slate-200'
                          : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                      }`}>
                        {translateCategory(p.category)}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3.5 font-mono">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{formatMoney(p.price)}</span>
                      </div>
                      <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                        ≈ {formatSecondaryMoney(p.price)}
                      </div>
                    </td>

                    {/* Stock Level with threshold indicator */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono font-bold text-sm ${
                            isOut
                              ? isLight ? 'text-rose-600' : 'text-red-400'
                              : isLow
                                ? isLight ? 'text-amber-600' : 'text-orange-400'
                                : isLight ? 'text-slate-900' : 'text-white'
                          }`}
                        >
                          {p.stock}
                        </span>
                        {isLow && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                            isLight
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-orange-950/40 text-orange-400 border-orange-900/50'
                          }`}>
                            {t.register.lowStock} &le; {p.minStock}
                          </span>
                        )}
                      </div>
                      {/* Visual progress bar */}
                      <div className={`w-24 h-1.5 rounded-full overflow-hidden mt-1.5 ${
                        isLight ? 'bg-slate-200' : 'bg-neutral-800'
                      }`}>
                        <div
                          className={`h-full rounded-full ${
                            isOut ? 'bg-red-500' : isLow ? 'bg-orange-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.max(5, percent)}%` }}
                        />
                      </div>
                    </td>

                    {/* Actions: Quick Restock & Edit */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {quickRestockId === p.id ? (
                          <div className={`flex items-center gap-1 p-1 rounded-lg border ${
                            isLight ? 'bg-white border-slate-300' : 'bg-[#0D0D0D] border-neutral-700'
                          }`}>
                            <input
                              type="number"
                              min="1"
                              value={restockQty}
                              onChange={(e) => setRestockQty(parseInt(e.target.value) || 1)}
                              className={`w-14 px-1.5 py-1 text-xs font-mono rounded text-center border ${
                                isLight
                                  ? 'bg-slate-50 border-slate-300 text-slate-900'
                                  : 'bg-neutral-800 border-neutral-700 text-white'
                              }`}
                            />
                            <button
                              onClick={() => handleQuickRestock(p.id, restockQty)}
                              className="p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded cursor-pointer"
                              title="Confirm restock"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setQuickRestockId(null)}
                              className={`p-1 rounded cursor-pointer ${
                                isLight
                                  ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                                  : 'bg-neutral-700 hover:bg-neutral-600 text-neutral-300'
                              }`}
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            {/* Restock Button with Tooltip */}
                            <div className="relative group/restock flex items-center justify-center">
                              <button
                                onClick={() => {
                                  setQuickRestockId(p.id);
                                  setRestockQty(20);
                                }}
                                className={`p-1.5 rounded-lg transition-colors cursor-pointer border flex items-center justify-center shadow-2xs ${
                                  isLight
                                    ? 'bg-slate-100 hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700 border-slate-200 hover:border-emerald-300'
                                    : 'bg-neutral-800 hover:bg-neutral-700 text-emerald-400 hover:text-emerald-300 border-neutral-700'
                                }`}
                                title={t.inventory.restock}
                                aria-label={t.inventory.restock}
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>

                              {/* Floating Tooltip */}
                              <div
                                role="tooltip"
                                className="pointer-events-none absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 hidden group-hover/restock:flex flex-col items-center z-30 whitespace-nowrap animate-in fade-in duration-100"
                              >
                                <div className={`px-2 py-0.5 text-[10px] font-semibold rounded-md shadow-lg font-sans border ${
                                  isLight
                                    ? 'text-emerald-800 bg-white border-emerald-200 shadow-slate-200'
                                    : 'text-white bg-neutral-900 border-neutral-700'
                                }`}>
                                  {t.inventory.restock}
                                </div>
                                <div className={`w-1.5 h-1 border-x-3 border-x-transparent border-t-3 -mt-px ${
                                  isLight ? 'border-t-white' : 'border-t-neutral-900'
                                }`} />
                              </div>
                            </div>

                            {/* Edit Button with Tooltip */}
                            <div className="relative group/edit flex items-center justify-center">
                              <button
                                onClick={() => openEditModal(p)}
                                className={`p-1.5 rounded-lg transition-colors cursor-pointer border flex items-center justify-center shadow-2xs ${
                                  isLight
                                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border-slate-200 hover:border-slate-300'
                                    : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white border-neutral-700'
                                }`}
                                title={t.inventory.editProduct}
                                aria-label={t.inventory.editProduct}
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Floating Tooltip */}
                              <div
                                role="tooltip"
                                className="pointer-events-none absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 hidden group-hover/edit:flex flex-col items-center z-30 whitespace-nowrap animate-in fade-in duration-100"
                              >
                                <div className={`px-2 py-0.5 text-[10px] font-semibold rounded-md shadow-lg font-sans border ${
                                  isLight
                                    ? 'text-slate-800 bg-white border-slate-200 shadow-slate-200'
                                    : 'text-white bg-neutral-900 border-neutral-700'
                                }`}>
                                  {t.inventory.editProduct}
                                </div>
                                <div className={`w-1.5 h-1 border-x-3 border-x-transparent border-t-3 -mt-px ${
                                  isLight ? 'border-t-white' : 'border-t-neutral-900'
                                }`} />
                              </div>
                            </div>

                            {/* Delete Button with Tooltip */}
                            <div className="relative group/del flex items-center justify-center">
                              <button
                                id={`delete-product-btn-${p.id}`}
                                onClick={() => setProductToDelete(p)}
                                className={`p-1.5 rounded-lg transition-colors cursor-pointer border flex items-center justify-center shadow-2xs ${
                                  isLight
                                    ? 'bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border-slate-200 hover:border-rose-200'
                                    : 'bg-neutral-800 hover:bg-rose-950/40 text-neutral-400 hover:text-rose-400 border-neutral-700 hover:border-rose-800/50'
                                }`}
                                title={t.inventory.deleteProduct}
                                aria-label={t.inventory.deleteProduct}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Floating Tooltip */}
                              <div
                                role="tooltip"
                                className="pointer-events-none absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 hidden group-hover/del:flex flex-col items-center z-30 whitespace-nowrap animate-in fade-in duration-100"
                              >
                                <div className={`px-2 py-0.5 text-[10px] font-semibold rounded-md shadow-lg font-sans border ${
                                  isLight
                                    ? 'text-rose-700 bg-white border-rose-200 shadow-slate-200'
                                    : 'text-rose-300 bg-neutral-900 border-rose-900/60'
                                }`}>
                                  {t.inventory.deleteProduct}
                                </div>
                                <div className={`w-1.5 h-1 border-x-3 border-x-transparent border-t-3 -mt-px ${
                                  isLight ? 'border-t-white' : 'border-t-neutral-900'
                                }`} />
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-neutral-500">
                    {language === 'es' ? 'No se encontraron productos coincidentes.' : 'No products matched your criteria.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isAddModalOpen && (
        <div
          id="add-product-modal-backdrop"
          className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs p-3 sm:p-4"
        >
          <div className="min-h-full flex items-center justify-center py-4">
            <div
              id="add-product-modal"
              className={`rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border my-auto flex flex-col max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3rem)] transition-colors duration-150 animate-in fade-in zoom-in-95 ${
                isLight
                  ? 'bg-white border-slate-200 text-slate-800'
                  : 'bg-[#121212] border-neutral-800 text-neutral-300'
              }`}
            >
              <div
                className={`shrink-0 flex items-center justify-between px-6 py-4 border-b ${
                  isLight ? 'border-slate-200 bg-slate-50' : 'border-neutral-800 bg-[#0D0D0D]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                    isLight ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-emerald-950/40 text-emerald-400 border-emerald-900/50'
                  }`}>
                    {editingProduct ? <Edit2 className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                  </div>
                  <div>
                    <h3 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {editingProduct
                        ? (language === 'es' ? 'Editar Detalles del Producto' : 'Edit Product Details')
                        : (language === 'es' ? 'Agregar Nuevo Artículo' : 'Add New Item')}
                    </h3>
                    <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                      {editingProduct ? (formProduct.name || editingProduct.name) : (language === 'es' ? 'Catálogo de inventario y precios' : 'Inventory catalog and pricing')}
                    </p>
                  </div>
                </div>
                <button
                  id="close-add-product-modal-btn"
                  onClick={() => setIsAddModalOpen(false)}
                  className={`p-1 rounded-lg transition-colors cursor-pointer ${
                    isLight
                      ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-200'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label
                  htmlFor="product-name-input"
                  className={`block text-xs font-semibold mb-1 ${
                    isLight ? 'text-slate-600' : 'text-neutral-400'
                  }`}
                >
                  {t.inventory.productName}
                </label>
                <input
                  id="product-name-input"
                  type="text"
                  required
                  value={formProduct.name}
                  onChange={(e) => setFormProduct({ ...formProduct, name: e.target.value })}
                  placeholder={
                    language === 'es' ? 'Ej. Café Colombiano Tostado 340g' : 'e.g. Colombian Roast Beans 12oz'
                  }
                  className={`w-full text-xs p-2.5 rounded-lg border focus:outline-hidden focus:border-emerald-600 transition-colors ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white'
                      : 'bg-[#0D0D0D] border-neutral-800 text-white placeholder-neutral-600'
                  }`}
                />
              </div>

              {/* Category */}
              <div>
                <label
                  htmlFor="product-category-select"
                  className={`block text-xs font-semibold mb-1 ${
                    isLight ? 'text-slate-600' : 'text-neutral-400'
                  }`}
                >
                  {t.inventory.category}
                </label>
                <select
                  id="product-category-select"
                  value={isCustomCategory ? '__NEW_CATEGORY__' : (formProduct.category || '')}
                  onChange={(e) => {
                    if (e.target.value === '__NEW_CATEGORY__') {
                      setIsCustomCategory(true);
                      setCustomCategoryName('');
                    } else {
                      setIsCustomCategory(false);
                      setFormProduct({ ...formProduct, category: e.target.value });
                    }
                  }}
                  className={`w-full text-xs p-2.5 rounded-lg border focus:outline-hidden focus:border-emerald-600 cursor-pointer transition-colors ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white'
                      : 'bg-[#0D0D0D] border-neutral-800 text-white'
                  }`}
                >
                  {availableCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {translateCategory(cat)}
                    </option>
                  ))}
                  <option value="__NEW_CATEGORY__">
                    {language === 'es' ? '+ Crear nueva categoría...' : '+ Create new category...'}
                  </option>
                </select>

                {isCustomCategory && (
                  <div className="mt-2 animate-in fade-in slide-in-from-top-1 duration-150">
                    <input
                      id="custom-category-input"
                      type="text"
                      autoFocus
                      placeholder={
                        language === 'es'
                          ? 'Nombre de la nueva categoría...'
                          : 'Enter new category name...'
                      }
                      value={customCategoryName}
                      onChange={(e) => {
                        setCustomCategoryName(e.target.value);
                        setFormProduct({ ...formProduct, category: e.target.value });
                      }}
                      className={`w-full text-xs p-2.5 rounded-lg border focus:outline-hidden focus:border-emerald-600 transition-colors ${
                        isLight
                          ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                          : 'bg-[#0D0D0D] border-neutral-700 text-white placeholder-neutral-500'
                      }`}
                      required={isCustomCategory}
                    />
                  </div>
                )}
              </div>

              {/* Pricing Strategy Selector & Conditional Fields */}
              <div className="space-y-3 pt-1">
                {/* Method selector toggle */}
                <div>
                  <label
                    htmlFor="product-pricing-method-manual"
                    className={`block text-xs font-semibold mb-1.5 flex items-center gap-1.5 ${
                      isLight ? 'text-slate-700' : 'text-neutral-300'
                    }`}
                  >
                    <Calculator className={`w-3.5 h-3.5 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
                    <span>{t.inventory.pricingStrategyTitle}</span>
                  </label>
                  <div
                    id="product-pricing-method-selector"
                    className={`grid grid-cols-2 p-1 rounded-xl border gap-1 transition-colors ${
                      isLight
                        ? 'bg-slate-100 border-slate-200'
                        : 'bg-[#0D0D0D] border-neutral-800'
                    }`}
                  >
                    <button
                      type="button"
                      id="product-pricing-method-manual"
                      onClick={() => handlePricingMethodToggle('MANUAL')}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        effectivePricingMethod === 'MANUAL'
                          ? 'bg-emerald-600 text-white shadow-xs font-bold'
                          : isLight
                            ? 'bg-white text-slate-700 hover:text-slate-950 hover:bg-slate-50 border border-slate-200/80 shadow-2xs'
                            : 'bg-transparent text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                      }`}
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      <span>{t.settings.pricingMethodManual}</span>
                    </button>
                    <button
                      type="button"
                      id="product-pricing-method-bulk"
                      onClick={() => handlePricingMethodToggle('BULK_PACK')}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        effectivePricingMethod === 'BULK_PACK'
                          ? 'bg-emerald-600 text-white shadow-xs font-bold'
                          : isLight
                            ? 'bg-white text-slate-700 hover:text-slate-950 hover:bg-slate-50 border border-slate-200/80 shadow-2xs'
                            : 'bg-transparent text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                      }`}
                    >
                      <Boxes className="w-3.5 h-3.5" />
                      <span>{t.settings.pricingMethodBulk}</span>
                    </button>
                  </div>
                </div>

                {/* Conditional Fields: When BULK_PACK is active */}
                {effectivePricingMethod === 'BULK_PACK' && (
                  <div className={`p-3.5 rounded-xl border space-y-3 transition-all ${
                    isLight ? 'bg-amber-50/50 border-amber-200' : 'bg-amber-950/20 border-amber-800/40'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Boxes className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                          {language === 'es' ? 'Parámetros del Bulto' : 'Bulk Pack Parameters'}
                        </span>
                      </div>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 font-medium">
                        {language === 'es' ? 'Asistente de cálculo' : 'Calculation assistant'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {/* 1. Costo del Bulto */}
                      <div>
                        <label
                          htmlFor="product-bulk-cost-input"
                          className={`block text-[11px] font-semibold mb-1 ${
                            isLight ? 'text-slate-700' : 'text-neutral-300'
                          }`}
                        >
                          {t.inventory.bulkCostLabel} ({currencySymbol})
                        </label>
                        <input
                          id="product-bulk-cost-input"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formProduct.bulkCost !== undefined ? formProduct.bulkCost : ''}
                          onChange={(e) =>
                            handleBulkParamChange('bulkCost', parseFloat(e.target.value) || 0)
                          }
                          placeholder={t.inventory.bulkCostPlaceholder}
                          className={`w-full text-xs font-mono p-2 rounded-lg border font-medium focus:outline-hidden focus:border-amber-500 transition-colors ${
                            isLight
                              ? 'bg-white border-amber-300 text-slate-800'
                              : 'bg-[#0D0D0D] border-neutral-700 text-white'
                          }`}
                        />
                      </div>

                      {/* 2. Unidades por Bulto */}
                      <div>
                        <label
                          htmlFor="product-bulk-units-input"
                          className={`block text-[11px] font-semibold mb-1 ${
                            isLight ? 'text-slate-700' : 'text-neutral-300'
                          }`}
                        >
                          {t.inventory.bulkUnitsLabel}
                        </label>
                        <input
                          id="product-bulk-units-input"
                          type="number"
                          step="1"
                          min="1"
                          value={formProduct.bulkUnits !== undefined ? formProduct.bulkUnits : ''}
                          onChange={(e) =>
                            handleBulkParamChange('bulkUnits', parseInt(e.target.value, 10) || 1)
                          }
                          placeholder={t.inventory.bulkUnitsPlaceholder}
                          className={`w-full text-xs font-mono p-2 rounded-lg border font-medium focus:outline-hidden focus:border-amber-500 transition-colors ${
                            isLight
                              ? 'bg-white border-amber-300 text-slate-800'
                              : 'bg-[#0D0D0D] border-neutral-700 text-white'
                          }`}
                        />
                      </div>

                      {/* 3. Ganancia Deseada en Porcentaje (%) */}
                      <div>
                        <label
                          htmlFor="product-bulk-margin-input"
                          className={`block text-[11px] font-semibold mb-1 ${
                            isLight ? 'text-slate-700' : 'text-neutral-300'
                          }`}
                        >
                          {t.inventory.profitMarginLabel}
                        </label>
                        <div className="relative">
                          <input
                            id="product-bulk-margin-input"
                            type="number"
                            step="1"
                            min="0"
                            value={formProduct.profitMarginPercent !== undefined ? formProduct.profitMarginPercent : ''}
                            onChange={(e) =>
                              handleBulkParamChange('profitMarginPercent', parseFloat(e.target.value) || 0)
                            }
                            placeholder={t.inventory.profitMarginPlaceholder}
                            className={`w-full text-xs font-mono p-2 pr-7 rounded-lg border font-medium focus:outline-hidden focus:border-amber-500 transition-colors ${
                              isLight
                                ? 'bg-white border-amber-300 text-slate-800'
                                : 'bg-[#0D0D0D] border-neutral-700 text-white'
                            }`}
                          />
                          <span
                            className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold font-mono pointer-events-none ${
                              isLight ? 'text-amber-600' : 'text-amber-400'
                            }`}
                          >
                            %
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Breakdown computation card */}
                    {bulkCalculationResult && (
                      <div className={`p-2.5 rounded-lg text-xs space-y-1.5 ${
                        isLight ? 'bg-amber-100/60 text-slate-800' : 'bg-black/40 text-neutral-300'
                      }`}>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className={isLight ? 'text-slate-500' : 'text-neutral-400'}>
                            {t.inventory.calculatedUnitCost}:
                          </span>
                          <span className={`font-mono font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            {currencySymbol}{bulkCalculationResult.calculatedUnitCost.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className={isLight ? 'text-slate-500' : 'text-neutral-400'}>
                            {language === 'es' ? 'Ganancia por unidad:' : 'Profit per unit:'}
                          </span>
                          <span className="font-mono font-bold text-amber-500">
                            +{bulkCalculationResult.profitMarginPercent}% ({currencySymbol}{bulkCalculationResult.profitValue.toFixed(2)})
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className={isLight ? 'text-slate-500' : 'text-neutral-400'}>
                            {t.inventory.suggestedSalePrice}:
                          </span>
                          <span className="font-mono font-bold text-emerald-500">
                            {currencySymbol}{bulkCalculationResult.suggestedPrice.toFixed(2)}
                          </span>
                        </div>
                        <div className={`text-[10px] pt-1 border-t font-mono ${
                          isLight ? 'text-slate-600 border-amber-200' : 'text-neutral-400 border-neutral-800/80'
                        }`}>
                          {bulkCalculationResult.formulaSummary}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Final Selling Price (Canonical precio_venta) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="product-price-input"
                      className={`block text-xs font-semibold ${
                        isLight ? 'text-slate-600' : 'text-neutral-400'
                      }`}
                    >
                      {t.inventory.price} ({currencySymbol})
                    </label>
                    {effectivePricingMethod === 'BULK_PACK' && (
                      <span className="text-[10px] text-emerald-400 font-medium">
                        {language === 'es' ? 'Sugerido editable' : 'Editable suggested'}
                      </span>
                    )}
                  </div>
                  <input
                    id="product-price-input"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formProduct.price}
                    onChange={(e) =>
                      setFormProduct({ ...formProduct, price: parseFloat(e.target.value) || 0 })
                    }
                    className={`w-full text-xs font-mono p-2.5 rounded-lg border font-bold focus:outline-hidden focus:border-emerald-600 transition-colors ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 text-emerald-700 focus:bg-white'
                        : 'bg-[#0D0D0D] border-neutral-800 text-emerald-400'
                    }`}
                  />
                  {effectivePricingMethod === 'BULK_PACK' && (
                    <p className="text-[10px] text-neutral-400 mt-1 leading-tight">
                      {t.inventory.overridePriceNotice}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="product-stock-input"
                    className={`block text-xs font-semibold mb-1 ${
                      isLight ? 'text-slate-600' : 'text-neutral-400'
                    }`}
                  >
                    {t.inventory.stockQuantity}
                  </label>
                  <input
                    id="product-stock-input"
                    type="number"
                    min="0"
                    value={formProduct.stock}
                    onChange={(e) => setFormProduct({ ...formProduct, stock: parseInt(e.target.value) || 0 })}
                    className={`w-full text-xs font-mono p-2.5 rounded-lg border font-bold focus:outline-hidden focus:border-emerald-600 transition-colors ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white'
                        : 'bg-[#0D0D0D] border-neutral-800 text-white'
                    }`}
                  />
                </div>
                <div>
                  <label
                    htmlFor="product-min-stock-input"
                    className={`block text-xs font-semibold mb-1 ${
                      isLight ? 'text-slate-600' : 'text-neutral-400'
                    }`}
                  >
                    {t.inventory.minStockThreshold}
                  </label>
                  <input
                    id="product-min-stock-input"
                    type="number"
                    min="0"
                    value={formProduct.minStock}
                    onChange={(e) => setFormProduct({ ...formProduct, minStock: parseInt(e.target.value) || 0 })}
                    className={`w-full text-xs font-mono p-2.5 rounded-lg border focus:outline-hidden focus:border-emerald-600 transition-colors ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-700 focus:bg-white'
                        : 'bg-[#0D0D0D] border-neutral-800 text-neutral-300'
                    }`}
                  />
                </div>
              </div>

              {/* Barcode Field with Scanner & Auto Generator */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="product-barcode-input"
                    className={`block text-xs font-semibold ${
                      isLight ? 'text-slate-600' : 'text-neutral-400'
                    }`}
                  >
                    {t.inventory.barcode} (UPC / EAN)
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      id="scan-barcode-modal-btn"
                      type="button"
                      onClick={() => setIsBarcodeScannerOpen(true)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-all cursor-pointer shadow-xs ${
                        isLight
                          ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300/80 active:bg-emerald-200'
                          : 'bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-400 border-emerald-800/80 active:bg-emerald-800'
                      }`}
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{t.inventory.scanBarcodeBtn}</span>
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <input
                    id="product-barcode-input"
                    type="text"
                    value={formProduct.barcode}
                    onChange={(e) => setFormProduct({ ...formProduct, barcode: e.target.value })}
                    placeholder={language === 'es' ? 'Escanear o escribir código de barras' : 'Scan or type barcode'}
                    className={`w-full text-xs font-mono p-2.5 pr-10 rounded-lg border focus:outline-hidden focus:border-emerald-600 transition-colors ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white'
                        : 'bg-[#0D0D0D] border-neutral-800 text-white placeholder-neutral-600'
                    }`}
                  />
                  <button
                    id="product-barcode-input-scan-icon-btn"
                    type="button"
                    onClick={() => setIsBarcodeScannerOpen(true)}
                    className={`absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-colors cursor-pointer ${
                      isLight
                        ? 'text-slate-400 hover:text-emerald-600 hover:bg-slate-100'
                        : 'text-neutral-400 hover:text-emerald-400 hover:bg-neutral-800'
                    }`}
                    title={t.inventory.scanBarcodeBtn}
                    aria-label={t.inventory.scanBarcodeBtn}
                  >
                    <Barcode className="w-4 h-4" />
                  </button>
                </div>
              </div>

                </div>

                <div
                  className={`shrink-0 px-6 py-3.5 border-t flex items-center justify-between gap-2 ${
                    isLight ? 'border-slate-200 bg-slate-50' : 'border-neutral-800 bg-[#0D0D0D]'
                  }`}
                >
                  <button
                    id="cancel-save-product-btn"
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                      isLight
                        ? 'border-slate-300 text-slate-700 hover:bg-slate-100'
                        : 'border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                    }`}
                  >
                    {t.inventory.cancel}
                  </button>

                  <div className="flex items-center gap-2">
                    {editingProduct && (
                      <button
                        id="delete-product-from-modal-btn"
                        type="button"
                        onClick={() => setProductToDelete(editingProduct)}
                        className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer border ${
                          isLight
                            ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                            : 'bg-neutral-800 hover:bg-rose-950/40 text-neutral-400 hover:text-rose-400 border-neutral-700 hover:border-rose-800/50'
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{t.inventory.deleteProduct}</span>
                      </button>
                    )}
                    <button
                      id="submit-save-product-btn"
                      type="submit"
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/50 cursor-pointer transition-colors"
                    >
                      {t.inventory.saveProduct}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal to Delete Product */}
      {productToDelete && (
        <div
          id="confirm-delete-modal-backdrop"
          className="fixed inset-0 z-60 overflow-y-auto bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-150"
        >
          <div className="min-h-full flex items-center justify-center py-4">
            <div
              id="confirm-delete-modal"
              className={`rounded-2xl max-w-md w-full my-auto shadow-2xl overflow-hidden border p-5 sm:p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 ${
                isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#141414] border-neutral-800 text-neutral-200'
              }`}
            >
            {/* Standard Modal Header */}
            <div className={`flex items-center justify-between pb-3 border-b ${isLight ? 'border-slate-200' : 'border-neutral-800'}`}>
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                  isLight
                    ? 'bg-rose-50 text-rose-600 border-rose-200'
                    : 'bg-rose-950/40 text-rose-400 border-rose-900/50'
                }`}>
                  <Trash2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {t.inventory.confirmDeleteTitle}
                  </h3>
                  <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                    {productToDelete.name}
                  </p>
                </div>
              </div>
              <button
                id="close-confirm-delete-modal-btn"
                onClick={() => setProductToDelete(null)}
                className={`p-1 rounded-lg transition-colors cursor-pointer ${
                  isLight ? 'text-slate-400 hover:text-slate-700' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
              {t.inventory.confirmDeleteMsg}
            </p>

            {/* Product preview summary card */}
            <div
              className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-neutral-900/90 border-neutral-800'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`font-bold text-sm truncate max-w-[240px] ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {productToDelete.name}
                </span>
                <span className="font-mono text-emerald-400 font-bold shrink-0">
                  {formatMoney(productToDelete.price)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-400 font-mono pt-1.5 border-t border-neutral-800/60">
                <div>
                  SKU: <span className={isLight ? 'text-slate-700' : 'text-neutral-300'}>{productToDelete.sku || '-'}</span>
                </div>
                <div>
                  {t.inventory.stockQuantity}:{' '}
                  <span className={`font-bold ${isLight ? 'text-slate-700' : 'text-neutral-300'}`}>
                    {productToDelete.stock} {language === 'es' ? 'uds' : 'units'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className={`pt-3 flex items-center justify-between gap-2.5 border-t ${
              isLight ? 'border-slate-200' : 'border-neutral-800'
            }`}>
              <button
                id="cancel-delete-product-btn"
                type="button"
                disabled={isDeleting}
                onClick={() => setProductToDelete(null)}
                className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                  isLight
                    ? 'border-slate-300 text-slate-700 hover:bg-slate-100'
                    : 'border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                {t.inventory.cancel}
              </button>
              <button
                id="confirm-delete-product-btn"
                type="button"
                disabled={isDeleting}
                onClick={confirmDeleteProduct}
                className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-950/40 transition-all cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>
                  {isDeleting
                    ? (language === 'es' ? 'Eliminando...' : 'Deleting...')
                    : (language === 'es' ? 'Eliminar Producto' : 'Delete Product')}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

      {/* Barcode Scanner Modal for Add / Edit Product modal */}
      <BarcodeScannerModal
        isOpen={isBarcodeScannerOpen}
        onClose={() => setIsBarcodeScannerOpen(false)}
        onBarcodeScanned={handleBarcodeScanned}
        products={products}
      />

      {/* Excel Spreadsheet Import Modal */}
      <ExcelImportModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        existingProducts={products}
        onImportProducts={handleBatchImport}
      />
    </div>
  );
};
