import React, { useState, useMemo } from 'react';
import {
  Search,
  Barcode,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Tag,
  AlertCircle,
  Check,
  ChevronRight,
  PlusCircle,
} from 'lucide-react';
import { Product, CartItem, Customer, StoreSettings } from '../types';
import { dbService } from '../services/db';
import { sound } from '../utils/audio';
import { useLanguage } from '../i18n/LanguageContext';
import { useCurrency } from '../currency/CurrencyContext';

interface RegisterViewProps {
  products: Product[];
  customers?: Customer[];
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  selectedCustomer?: Customer | null;
  setSelectedCustomer?: (customer: Customer | null) => void;
  onOpenScanner: () => void;
  onOpenCheckout: () => void;
  onRefreshData: () => void;
  isOnline: boolean;
  storeSettings?: StoreSettings;
}

export const RegisterView: React.FC<RegisterViewProps> = ({
  products,
  cart,
  setCart,
  onOpenScanner,
  onOpenCheckout,
  onRefreshData,
  isOnline,
  storeSettings,
}) => {
  const { t, language, translateCategory, translateUnit } = useLanguage();
  const { formatMoney, formatSecondaryMoney } = useCurrency();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Categories list
  const categories = useMemo(() => {
    const configured = dbService.getCategories();
    const fromProds = products.map((p) => p.category).filter(Boolean);
    const unique = Array.from(new Set([...configured, ...fromProds]));
    return ['All', ...unique.sort((a, b) => translateCategory(a).localeCompare(translateCategory(b)))];
  }, [products, translateCategory]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.barcode.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Add item to cart
  const addToCart = (product: Product, customDiscountPercent: number = 0) => {
    if (product.stock <= 0) {
      sound.error();
      alert(`"${product.name}" is currently OUT OF STOCK.`);
      return;
    }

    sound.scan();

    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex((item) => item.productId === product.id);
      const taxRateDecimal =
        typeof storeSettings?.taxRate === 'number' && !isNaN(storeSettings.taxRate)
          ? storeSettings.taxRate / 100
          : 0.16;

      if (existingIdx >= 0) {
        const existing = prevCart[existingIdx];
        if (existing.quantity + 1 > product.stock) {
          sound.error();
          alert(`Cannot add more. Only ${product.stock} units available in stock.`);
          return prevCart;
        }

        const newQty = existing.quantity + 1;
        const discountAmt =
          existing.discountType === 'percentage'
            ? (product.price * newQty * existing.discount) / 100
            : existing.discount;
        const subtotal = product.price * newQty;
        const taxable = Math.max(0, subtotal - discountAmt);
        const total = taxable + taxable * taxRateDecimal;

        const updated = [...prevCart];
        updated[existingIdx] = {
          ...existing,
          quantity: newQty,
          taxRate: taxRateDecimal,
          subtotal,
          total,
        };
        return updated;
      } else {
        const newQty = 1;
        const discountAmt = (product.price * newQty * customDiscountPercent) / 100;
        const subtotal = product.price * newQty;
        const taxable = Math.max(0, subtotal - discountAmt);
        const total = taxable + taxable * taxRateDecimal;

        const newItem: CartItem = {
          productId: product.id,
          name: product.name,
          sku: product.sku,
          barcode: product.barcode,
          category: product.category,
          price: product.price,
          costPrice: product.costPrice,
          quantity: newQty,
          discount: customDiscountPercent,
          discountType: 'percentage',
          taxRate: taxRateDecimal,
          subtotal,
          total,
        };
        return [...prevCart, newItem];
      }
    });
  };

  // Update item quantity
  const updateQuantity = (productId: string, delta: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.productId !== productId) return item;
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          if (newQty > product.stock) {
            sound.error();
            alert(`Maximum stock available: ${product.stock}`);
            return item;
          }

          const taxRateDecimal =
            typeof storeSettings?.taxRate === 'number' && !isNaN(storeSettings.taxRate)
              ? storeSettings.taxRate / 100
              : (typeof item.taxRate === 'number' && !isNaN(item.taxRate) ? item.taxRate : 0.16);

          const discountAmt =
            item.discountType === 'percentage'
              ? (item.price * newQty * item.discount) / 100
              : item.discount;
          const subtotal = item.price * newQty;
          const taxable = Math.max(0, subtotal - discountAmt);
          const total = taxable + taxable * taxRateDecimal;

          return {
            ...item,
            quantity: newQty,
            taxRate: taxRateDecimal,
            subtotal,
            total,
          };
        })
        .filter(Boolean) as CartItem[];
    });
  };

  // Remove single item
  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  // Clear entire cart
  const clearCart = () => {
    if (cart.length > 0 && confirm('Clear all items from current cart?')) {
      setCart([]);
    }
  };

  // Totals calculations
  const subtotal = useMemo(() => cart.reduce((acc, i) => acc + i.subtotal, 0), [cart]);
  const discountTotal = useMemo(() => {
    return cart.reduce((acc, i) => {
      const disc =
        i.discountType === 'percentage'
          ? (i.price * i.quantity * i.discount) / 100
          : i.discount;
      return acc + disc;
    }, 0);
  }, [cart]);
  const taxTotal = useMemo(() => {
    const defaultTaxDecimal =
      typeof storeSettings?.taxRate === 'number' && !isNaN(storeSettings.taxRate)
        ? storeSettings.taxRate / 100
        : 0.16;
    return cart.reduce((acc, i) => {
      const disc =
        i.discountType === 'percentage'
          ? (i.price * i.quantity * i.discount) / 100
          : i.discount;
      const taxable = Math.max(0, i.subtotal - disc);
      const rate = typeof i.taxRate === 'number' && !isNaN(i.taxRate) ? i.taxRate : defaultTaxDecimal;
      return acc + taxable * rate;
    }, 0);
  }, [cart, storeSettings?.taxRate]);
  const grandTotal = subtotal - discountTotal + taxTotal;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: Product Catalog & Fast Grid (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search Bar + Barcode Scanner Trigger */}
          <div className="flex gap-2">
            <div className="relative flex-1 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center transition-colors focus-within:border-emerald-600">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="pos-search-input"
                type="text"
                placeholder={t.register.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-transparent border-none outline-none text-xs font-medium text-white placeholder-neutral-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white text-xs cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
            <button
              id="open-barcode-scanner-btn"
              onClick={onOpenScanner}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-700 hover:border-emerald-500/60 text-white rounded-xl text-xs font-semibold border border-neutral-700 transition-colors cursor-pointer shrink-0"
              title="Open camera or barcode scan modal"
            >
              <Barcode className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">{t.register.scanBarcodeBtn}</span>
            </button>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800 hover:bg-neutral-800/50'
                }`}
              >
                {translateCategory(cat)}
              </button>
            ))}
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {filteredProducts.map((product) => {
              const isLowStock = product.stock > 0 && product.stock <= product.minStock;
              const isOutOfStock = product.stock <= 0;

              return (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  disabled={isOutOfStock}
                  className={`bg-neutral-900 rounded-2xl p-3.5 border text-left flex flex-col justify-between transition-colors cursor-pointer group ${
                    isOutOfStock
                      ? 'border-neutral-800/80 opacity-50 cursor-not-allowed bg-neutral-950'
                      : 'border-neutral-800 hover:border-emerald-600'
                  }`}
                >
                  <div>
                    {/* Category & Stock Tag */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-semibold text-neutral-500 truncate uppercase">
                        {translateCategory(product.category)}
                      </span>
                      {isOutOfStock ? (
                        <span className="text-[10px] font-bold text-red-400 bg-red-950/40 px-1.5 py-0.5 rounded border border-red-900/50">
                          {t.register.outOfStock}
                        </span>
                      ) : isLowStock ? (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-900/50">
                          {t.register.lowStock}: {product.stock}
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900/50">
                          {product.stock} {language === 'es' ? 'uds' : 'units'}
                        </span>
                      )}
                    </div>

                    {/* Product Name */}
                    <h4 className="font-medium text-xs text-white group-hover:text-emerald-400 line-clamp-2 leading-snug">
                      {product.name}
                    </h4>
                  </div>

                  {/* Price & Barcode / SKU */}
                  <div className="mt-3 pt-2 border-t border-neutral-800/80 flex items-end justify-between">
                    <div>
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="text-sm font-bold text-emerald-400 font-mono">
                          {formatMoney(product.price)}
                        </span>
                        <span className="text-[10px] font-medium text-neutral-400 font-mono">
                          ≈ {formatSecondaryMoney(product.price)}
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-500 block font-mono mt-0.5">
                        {product.sku}
                      </span>
                    </div>
                    <span className="w-6 h-6 rounded-lg bg-neutral-800 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center text-neutral-400 transition-colors shrink-0">
                      <Plus className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </button>
              );
            })}

            {filteredProducts.length === 0 && (
              <div className="col-span-full py-12 text-center bg-neutral-900 rounded-2xl border border-neutral-800 p-6">
                <ShoppingBag className="w-10 h-10 text-neutral-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-neutral-300">No products match &ldquo;{searchQuery}&rdquo;</p>
                <p className="text-[11px] text-neutral-500 mt-1">Try searching another SKU or category.</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Active Cart (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active Cart Box */}
          <div className="bg-[#0D0D0D] rounded-2xl border border-neutral-800 overflow-hidden flex flex-col">
            {/* Cart Header */}
            <div className="p-3.5 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {t.register.cartTitle} ({cart.reduce((a, b) => a + b.quantity, 0)} {cart.reduce((a, b) => a + b.quantity, 0) === 1 ? t.checkout.itemCountSingular : t.checkout.itemCountPlural})
                </span>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-neutral-500 hover:text-red-400 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t.register.clearCart}</span>
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="p-3.5 divide-y divide-neutral-800/60 max-h-72 overflow-y-auto min-h-[160px]">
              {cart.map((item) => (
                <div key={item.productId} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                  {/* Item Description */}
                  <div className="min-w-0 flex-1">
                    <h5 className="font-medium text-xs text-white truncate">{item.name}</h5>
                    <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-mono">
                      <span>{formatMoney(item.price)} {language === 'es' ? 'c/u' : 'ea'}</span>
                      {item.discount > 0 && (
                        <span className="text-emerald-400 font-medium">({item.discount}% {language === 'es' ? 'desc.' : 'off'})</span>
                      )}
                    </div>
                  </div>

                  {/* Quantity +/- Buttons */}
                  <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 p-1 rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.productId, -1)}
                      className="w-6 h-6 rounded bg-neutral-800 text-neutral-300 hover:bg-neutral-700 flex items-center justify-center text-xs font-bold cursor-pointer transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-mono font-bold text-xs text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, 1)}
                      className="w-6 h-6 rounded bg-neutral-800 text-neutral-300 hover:bg-neutral-700 flex items-center justify-center text-xs font-bold cursor-pointer transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Line Total */}
                  <div className="text-right shrink-0 w-16">
                    <span className="font-mono font-bold text-xs text-white">
                      {formatMoney(item.total)}
                    </span>
                  </div>

                  {/* Remove Item Button */}
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="text-neutral-600 hover:text-red-400 p-1 rounded transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {cart.length === 0 && (
                <div className="py-12 text-center text-neutral-500">
                  <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs font-semibold text-neutral-400">{t.register.emptyCartTitle}</p>
                  <p className="text-[11px] text-neutral-600 mt-1">{t.register.emptyCartDesc}</p>
                </div>
              )}
            </div>

            {/* Cart Calculations Footer */}
            {cart.length > 0 && (
              <div className="p-4 bg-neutral-900/60 border-t border-neutral-800 space-y-2 text-xs">
                <div className="flex justify-between text-neutral-400">
                  <span>{t.register.subtotal}</span>
                  <span className="font-mono text-neutral-200">{formatMoney(subtotal)}</span>
                </div>
                {discountTotal > 0 && (
                  <div className="flex justify-between text-emerald-400 font-medium">
                    <span>{t.register.discount}</span>
                    <span className="font-mono">-{formatMoney(discountTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-400">
                  <span>
                    {t.register.tax}
                    {typeof storeSettings?.taxRate === 'number' ? ` (${storeSettings.taxRate}%)` : ''}
                  </span>
                  <span className="font-mono text-neutral-200">{formatMoney(taxTotal)}</span>
                </div>

                <div className="pt-2.5 border-t border-neutral-800 flex justify-between items-baseline">
                  <span className="font-bold text-sm text-white uppercase">{t.register.grandTotal}</span>
                  <div className="text-right">
                    <div className="font-bold text-xl font-mono text-emerald-400">
                      {formatMoney(grandTotal)}
                    </div>
                    <div className="text-xs font-mono font-medium text-neutral-400">
                      ≈ {formatSecondaryMoney(grandTotal)}
                    </div>
                  </div>
                </div>

                {/* Big Checkout Trigger Button */}
                <button
                  id="checkout-ticket-btn"
                  onClick={onOpenCheckout}
                  className="w-full mt-2 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <span>{t.register.chargeBtn}</span>
                  <span className="font-mono font-semibold">({formatMoney(grandTotal)})</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
