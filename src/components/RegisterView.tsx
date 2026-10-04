import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  User,
  UserCheck,
  X,
  ChevronDown,
  AlertTriangle,
  Keyboard,
  HelpCircle,
  Clock,
  Pause,
  Play,
  ArrowLeftRight,
  UserPlus,
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
  showToast?: (msg: string) => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({
  products,
  customers = [],
  cart,
  setCart,
  selectedCustomer = null,
  setSelectedCustomer,
  onOpenScanner,
  onOpenCheckout,
  onRefreshData,
  isOnline,
  storeSettings,
  showToast,
}) => {
  const { t, language, translateCategory, translateUnit } = useLanguage();
  const { formatMoney, formatSecondaryMoney } = useCurrency();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Customer selection & fiado state
  const [isCustomerSelectorOpen, setIsCustomerSelectorOpen] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const customerSelectorRef = useRef<HTMLDivElement>(null);

  // Non-blocking inline clear cart confirmation state
  const [isConfirmingClearCart, setIsConfirmingClearCart] = useState(false);

  // Held sale state (stored in localStorage for crash/reload resilience)
  const [heldSale, setHeldSale] = useState<{
    cart: CartItem[];
    customer: Customer | null;
    timestamp: number;
  } | null>(() => {
    try {
      const saved = localStorage.getItem('tubodeguita_held_sale');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Cashier quick help guide modal
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Local fallback toast if parent showToast not provided
  const [internalToast, setInternalToast] = useState<{ message: string; type: 'error' | 'success' | 'info' } | null>(null);

  const notify = (message: string, type: 'error' | 'success' | 'info' = 'info') => {
    if (showToast) {
      showToast(message);
    } else {
      setInternalToast({ message, type });
      setTimeout(() => setInternalToast(null), 3500);
    }
  };

  // Hold current sale
  const suspendCurrentSale = () => {
    if (cart.length === 0) return;
    const newHeld = {
      cart: [...cart],
      customer: selectedCustomer || null,
      timestamp: Date.now(),
    };
    setHeldSale(newHeld);
    try {
      localStorage.setItem('tubodeguita_held_sale', JSON.stringify(newHeld));
    } catch (e) {
      console.warn('Could not save held sale to localStorage', e);
    }
    setCart([]);
    setSelectedCustomer?.(null);
    setIsConfirmingClearCart(false);
    sound.scan();
    notify(t.register.heldSaleAlert, 'info');
  };

  // Swap active cart with held sale
  const swapHeldSale = () => {
    if (!heldSale) return;
    const currentCartSnapshot = [...cart];
    const currentCustomerSnapshot = selectedCustomer || null;

    setCart(heldSale.cart);
    setSelectedCustomer?.(heldSale.customer);

    const newHeld = {
      cart: currentCartSnapshot,
      customer: currentCustomerSnapshot,
      timestamp: Date.now(),
    };
    setHeldSale(newHeld);
    try {
      localStorage.setItem('tubodeguita_held_sale', JSON.stringify(newHeld));
    } catch (e) {
      console.warn('Could not update held sale in localStorage', e);
    }
    sound.scan();
    notify(
      language === 'es'
        ? 'Tickets intercambiados en mostrador.'
        : 'Tickets swapped on counter.',
      'info'
    );
  };

  // Resume or swap held sale
  const resumeHeldSale = () => {
    if (!heldSale) return;
    if (cart.length > 0) {
      swapHeldSale();
      return;
    }
    setCart(heldSale.cart);
    setSelectedCustomer?.(heldSale.customer);
    setHeldSale(null);
    try {
      localStorage.removeItem('tubodeguita_held_sale');
    } catch (e) {
      console.warn('Could not clear held sale from localStorage', e);
    }
    sound.success();
    notify(language === 'es' ? 'Venta reanudada en caja' : 'Held sale resumed', 'success');
  };

  // Auto-dismiss clear cart confirmation after 6 seconds of inactivity
  useEffect(() => {
    if (isConfirmingClearCart) {
      const timer = setTimeout(() => setIsConfirmingClearCart(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [isConfirmingClearCart]);

  // Customer quick create modal state
  const [isQuickCustomerModalOpen, setIsQuickCustomerModalOpen] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({
    name: '',
    phone: '',
    idDocument: '',
    debtLimit: '50.00',
  });

  const openQuickCustomerModal = (initialName: string = '') => {
    setNewCustomerForm({
      name: initialName,
      phone: '',
      idDocument: '',
      debtLimit: '50.00',
    });
    setIsQuickCustomerModalOpen(true);
    setIsCustomerSelectorOpen(false);
  };

  const handleSaveQuickCustomer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const name = newCustomerForm.name.trim();
    if (!name) {
      sound.error();
      notify(t.register.nameRequired, 'error');
      return;
    }

    const limitNum = parseFloat(newCustomerForm.debtLimit);
    const validLimit = isNaN(limitNum) || limitNum < 0 ? 50 : limitNum;

    // Check duplicate
    const existing = customers.find(
      (c) => c.name.toLowerCase() === name.toLowerCase()
    );
    if (existing) {
      sound.error();
      notify(
        language === 'es'
          ? `Ya existe un cliente con el nombre "${name}". Seleccionándolo...`
          : `A customer named "${name}" already exists. Selecting...`,
        'info'
      );
      setSelectedCustomer?.(existing);
      setIsQuickCustomerModalOpen(false);
      return;
    }

    const notesParts: string[] = [];
    if (newCustomerForm.idDocument.trim()) {
      notesParts.push(`Cédula/ID: ${newCustomerForm.idDocument.trim()}`);
    }

    const newCustomer: Customer = {
      id: `cust-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name,
      phone: newCustomerForm.phone.trim(),
      currentDebt: 0,
      creditBalance: 0,
      debtLimit: validLimit,
      notes: notesParts.join(' | ') || undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    try {
      dbService.saveCustomer(newCustomer);
      onRefreshData();
      setSelectedCustomer?.(newCustomer);
      setIsQuickCustomerModalOpen(false);
      setCustomerSearchQuery('');
      sound.success();
      notify(
        language === 'es'
          ? `Cliente "${name}" registrado y asignado al ticket.`
          : `Customer "${name}" registered and assigned to ticket.`,
        'success'
      );
    } catch (err) {
      console.error('Failed to create customer', err);
      notify(language === 'es' ? 'Error al registrar cliente' : 'Failed to register customer', 'error');
    }
  };

  // Close customer selector on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (customerSelectorRef.current && !customerSelectorRef.current.contains(e.target as Node)) {
        setIsCustomerSelectorOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation & POS shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      // F1 or '?' (when not in input) to open Quick Help Guide
      if (e.key === 'F1' || (e.key === '?' && !isInput)) {
        e.preventDefault();
        setIsHelpOpen((prev) => !prev);
        return;
      }

      // '/' to focus product search input (standard POS shortcut)
      if (e.key === '/' && !isInput) {
        e.preventDefault();
        const searchInput = document.getElementById('pos-search-input') as HTMLInputElement | null;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
        return;
      }

      // 'Escape' key
      if (e.key === 'Escape') {
        if (isQuickCustomerModalOpen) {
          e.preventDefault();
          setIsQuickCustomerModalOpen(false);
          return;
        }
        if (isHelpOpen) {
          e.preventDefault();
          setIsHelpOpen(false);
          return;
        }
        if (isCustomerSelectorOpen) {
          e.preventDefault();
          setIsCustomerSelectorOpen(false);
          return;
        }
        if (isConfirmingClearCart) {
          e.preventDefault();
          setIsConfirmingClearCart(false);
          return;
        }
        if (isInput) {
          target.blur();
          return;
        }
      }

      // F2 to open Barcode scanner
      if (e.key === 'F2') {
        e.preventDefault();
        onOpenScanner();
        return;
      }

      // F4 or 'c' / 'C' (when not in input) to open Customer selection
      if ((e.key === 'F4' || ((e.key === 'c' || e.key === 'C') && !isInput)) && setSelectedCustomer) {
        e.preventDefault();
        setIsCustomerSelectorOpen((prev) => !prev);
        return;
      }

      // F8 to suspend or resume sale
      if (e.key === 'F8') {
        e.preventDefault();
        if (cart.length > 0) {
          suspendCurrentSale();
        } else if (heldSale) {
          resumeHeldSale();
        }
        return;
      }

      // F12 or Space (when not in input and cart has items) to trigger Checkout
      if ((e.key === 'F12' || (e.code === 'Space' && !isInput)) && cart.length > 0) {
        e.preventDefault();
        onOpenCheckout();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart.length, isCustomerSelectorOpen, isConfirmingClearCart, isHelpOpen, isQuickCustomerModalOpen, heldSale, onOpenScanner, onOpenCheckout, setSelectedCustomer]);

  // Categories list
  const categories = useMemo(() => {
    const configured = dbService.getCategories();
    const fromProds = products.map((p) => p.category).filter(Boolean);
    const unique = Array.from(new Set([...configured, ...fromProds]));
    return ['All', ...unique.sort((a, b) => translateCategory(a).localeCompare(translateCategory(b)))];
  }, [products, translateCategory]);

  // Search multiplier parsing (e.g., "5*harina" or "12*7591234")
  const { multiplier, cleanSearchTerm } = useMemo(() => {
    const match = searchQuery.match(/^(\d+)\s*\*\s*(.*)$/);
    if (match) {
      const mult = parseInt(match[1], 10);
      return { multiplier: isNaN(mult) || mult <= 0 ? 1 : Math.min(mult, 9999), cleanSearchTerm: match[2].trim() };
    }
    return { multiplier: 1, cleanSearchTerm: searchQuery.trim() };
  }, [searchQuery]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
      const q = cleanSearchTerm.toLowerCase();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.barcode.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, cleanSearchTerm]);

  // Filtered customers for the selector popover
  const filteredCustomers = useMemo(() => {
    if (!customerSearchQuery.trim()) return customers;
    const q = customerSearchQuery.toLowerCase().trim();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.phone && c.phone.toLowerCase().includes(q))
    );
  }, [customers, customerSearchQuery]);

  // Add item to cart with optional multiplier
  const addToCart = (product: Product, quantityToAdd: number = 1, customDiscountPercent: number = 0) => {
    const qty = Math.max(1, quantityToAdd);
    if (product.stock <= 0) {
      sound.error();
      notify(`"${product.name}" ${t.register.outOfStockAlert}`, 'error');
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
        if (existing.quantity + qty > product.stock) {
          sound.error();
          notify(`${t.register.maxStockAlert} ${product.stock}`, 'error');
          return prevCart;
        }

        const newQty = existing.quantity + qty;
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
        const actualQty = Math.min(qty, product.stock);
        if (qty > product.stock) {
          notify(`${t.register.maxStockAlert} ${product.stock}`, 'error');
        }
        const discountAmt = (product.price * actualQty * customDiscountPercent) / 100;
        const subtotal = product.price * actualQty;
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
          quantity: actualQty,
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
            notify(`${t.register.maxStockAlert} ${product.stock}`, 'error');
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
    setCart([]);
    setIsConfirmingClearCart(false);
    notify(language === 'es' ? 'Ticket vaciado' : 'Ticket cleared', 'info');
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
  const grandTotal = Math.max(0, Number((subtotal - discountTotal + taxTotal).toFixed(2)));
  const customerProjectedDebt = (selectedCustomer?.currentDebt || 0) + grandTotal;
  const isOverCreditLimit = Boolean(
    selectedCustomer &&
    selectedCustomer.debtLimit > 0 &&
    customerProjectedDebt > selectedCustomer.debtLimit
  );

  // Search input Enter key handler for instant scan or single match addition
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredProducts.length === 1) {
        addToCart(filteredProducts[0], multiplier);
        setSearchQuery('');
      } else if (filteredProducts.length > 1 && cleanSearchTerm) {
        const exactMatch = filteredProducts.find(
          (p) =>
            p.barcode === cleanSearchTerm ||
            p.sku.toLowerCase() === cleanSearchTerm.toLowerCase() ||
            p.name.toLowerCase() === cleanSearchTerm.toLowerCase()
        );
        if (exactMatch) {
          addToCart(exactMatch, multiplier);
          setSearchQuery('');
        }
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Counter Shift & Telemetry Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80 mb-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-white tracking-wide">
              {language === 'es' ? 'Terminal de Mostrador #1' : 'Counter Terminal #1'}
            </span>
          </div>
          <span className="text-neutral-600 hidden sm:inline">•</span>
          <span className="text-neutral-400 font-mono hidden sm:inline">
            {language === 'es' ? 'Turno Activo' : 'Active Shift'}
          </span>
        </div>
        <button
          onClick={() => setIsHelpOpen(true)}
          className="flex items-center gap-1.5 text-neutral-400 hover:text-emerald-400 font-semibold cursor-pointer transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>{language === 'es' ? 'Guía de atajos (F1)' : 'Shortcuts guide (F1)'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: Product Catalog & Fast Grid (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search Bar + Barcode Scanner Trigger */}
          <div className="flex gap-2">
            <div className="relative flex-1 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center transition-colors focus-within:border-emerald-600">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              {multiplier > 1 && (
                <span className="absolute left-8 bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded">
                  {multiplier}x
                </span>
              )}
              <input
                id="pos-search-input"
                type="text"
                placeholder={t.register.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className={`w-full ${multiplier > 1 ? 'pl-16' : 'pl-9'} ${searchQuery ? 'pr-24' : 'pr-3'} py-2.5 bg-transparent border-none outline-none text-xs font-medium text-white placeholder-neutral-500`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label={t.register.clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white text-xs cursor-pointer font-medium px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 transition-colors flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>{t.register.clearSearch}</span>
                </button>
              )}
            </div>
            <button
              id="open-barcode-scanner-btn"
              onClick={onOpenScanner}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold border border-emerald-500/40 transition-colors cursor-pointer shrink-0 shadow-xs"
              title={t.register.scanBarcodeBtn}
              aria-label={t.register.scanBarcodeBtn}
            >
              <Barcode className="w-4 h-4 text-white" />
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
                {cat === 'All' ? t.register.allCategories : translateCategory(cat)}
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
                  onClick={() => {
                    addToCart(product, multiplier);
                    if (multiplier > 1) setSearchQuery('');
                  }}
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
                          {product.stock} {t.common.unitsAbbr}
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
                        <span className="text-xs font-semibold text-neutral-300 font-mono">
                          ≈ {formatSecondaryMoney(product.price)}
                        </span>
                      </div>
                      <span className="text-xs text-neutral-400 block font-mono mt-0.5">
                        {product.sku}
                      </span>
                    </div>
                    <span className="w-6 h-6 rounded-lg bg-neutral-800 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center text-white/70 transition-colors shrink-0">
                      <Plus className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </button>
              );
            })}

            {filteredProducts.length === 0 && (
              <div className="col-span-full py-12 text-center bg-neutral-900 rounded-2xl border border-neutral-800 p-6">
                <ShoppingBag className="w-10 h-10 text-neutral-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-neutral-300">{t.inventory.noProductsFound}</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Active Cart & Customer Fiado (5 cols) */}
        <div className="lg:col-span-5 space-y-3.5">
          {/* Customer Selection & Fiado Credit Card */}
          <div className="relative" ref={customerSelectorRef}>
            <div
              className={`p-3 rounded-2xl border transition-all ${
                selectedCustomer
                  ? isOverCreditLimit
                    ? 'bg-amber-950/30 border-amber-600/70 text-amber-200'
                    : 'bg-[#0D0D0D] border-neutral-700/80 text-white'
                  : 'bg-[#0D0D0D] border-neutral-800 text-neutral-300'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      selectedCustomer
                        ? isOverCreditLimit
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                    }`}
                  >
                    {selectedCustomer ? <UserCheck className="w-4.5 h-4.5" /> : <User className="w-4.5 h-4.5" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold truncate">
                        {selectedCustomer ? selectedCustomer.name : t.register.walkInCustomer}
                      </span>
                      {selectedCustomer?.phone && (
                        <span className="text-[10px] font-mono text-neutral-400 hidden sm:inline">
                          {selectedCustomer.phone}
                        </span>
                      )}
                    </div>
                    {selectedCustomer ? (
                      <div className="flex items-center gap-2 text-[11px] font-mono mt-0.5">
                        <span className={selectedCustomer.currentDebt > 0 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-semibold'}>
                          {t.register.customerDebt}: {formatMoney(selectedCustomer.currentDebt)}
                        </span>
                        {selectedCustomer.debtLimit > 0 && (
                          <span className="text-neutral-500">
                            • {t.register.customerLimit}: {formatMoney(selectedCustomer.debtLimit)}
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-[11px] text-neutral-500 font-medium">
                        {language === 'es' ? 'Venta al contado sin cuenta de crédito' : 'Walk-in cash/card sale without tab'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {selectedCustomer && (
                    <button
                      onClick={() => {
                        setSelectedCustomer?.(null);
                        notify(language === 'es' ? 'Ticket desvinculado de cliente' : 'Ticket unlinked from customer', 'info');
                      }}
                      title={t.register.removeCustomer}
                      aria-label={t.register.removeCustomer}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    id="toggle-customer-selector-btn"
                    onClick={() => setIsCustomerSelectorOpen((prev) => !prev)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-neutral-850 hover:bg-neutral-800 text-neutral-200 hover:text-white border border-neutral-700/80 transition-colors cursor-pointer"
                  >
                    <span>{selectedCustomer ? (language === 'es' ? 'Cambiar' : 'Change') : t.register.assignCustomer}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isCustomerSelectorOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Over Limit Warning Chip */}
              {isOverCreditLimit && selectedCustomer && (
                <div className="mt-2.5 pt-2 border-t border-amber-800/40 flex items-center justify-between text-[11px] text-amber-300">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    {language === 'es' ? 'Límite de fiado superado' : 'Credit limit exceeded'}
                  </span>
                  <span className="font-mono font-bold">
                    +{formatMoney(customerProjectedDebt - selectedCustomer.debtLimit)}
                  </span>
                </div>
              )}
            </div>

            {/* Customer Search & Selection Popover */}
            {isCustomerSelectorOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#141414] border border-neutral-700 rounded-2xl shadow-2xl p-3 animate-in fade-in zoom-in-95 duration-150">
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    autoFocus
                    placeholder={t.register.selectCustomer}
                    value={customerSearchQuery}
                    onChange={(e) => setCustomerSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-white placeholder-neutral-500 outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="max-h-56 overflow-y-auto divide-y divide-neutral-800/70 scrollbar-none">
                  {/* Walk-in Customer Option */}
                  <button
                    onClick={() => {
                      setSelectedCustomer?.(null);
                      setIsCustomerSelectorOpen(false);
                      setCustomerSearchQuery('');
                    }}
                    className="w-full text-left py-2 px-2.5 rounded-xl hover:bg-neutral-850 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div>
                      <span className="text-xs font-semibold text-neutral-300">
                        {t.register.walkInCustomer}
                      </span>
                      <p className="text-[10px] text-neutral-500">
                        {language === 'es' ? 'Contado directo (sin fiado)' : 'Direct checkout without tab'}
                      </p>
                    </div>
                    {!selectedCustomer && <Check className="w-4 h-4 text-emerald-400" />}
                  </button>

                  {/* Customer Tab Accounts */}
                  {filteredCustomers.map((c) => {
                    const isSelected = selectedCustomer?.id === c.id;
                    const exceedsLimit = c.debtLimit > 0 && c.currentDebt + grandTotal > c.debtLimit;
                    return (
                      <button
                        key={c.id}
                        onClick={() => {
                          setSelectedCustomer?.(c);
                          setIsCustomerSelectorOpen(false);
                          setCustomerSearchQuery('');
                          sound.scan();
                          notify(language === 'es' ? `Cliente asignado: ${c.name}` : `Assigned customer: ${c.name}`, 'info');
                        }}
                        className={`w-full text-left py-2 px-2.5 rounded-xl hover:bg-neutral-850 flex items-center justify-between cursor-pointer transition-colors ${
                          isSelected ? 'bg-neutral-800/60' : ''
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-white truncate">{c.name}</span>
                            {exceedsLimit && (
                              <span className="bg-amber-950 text-amber-400 border border-amber-800 text-[9px] px-1 py-0.2 rounded font-mono font-bold">
                                {language === 'es' ? 'Límite' : 'Limit'}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-400 mt-0.5">
                            {c.phone && <span>{c.phone}</span>}
                            <span className={c.currentDebt > 0 ? 'text-amber-400 font-semibold' : 'text-emerald-400'}>
                              {t.register.customerDebt}: {formatMoney(c.currentDebt)}
                            </span>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                      </button>
                    );
                  })}

                  {filteredCustomers.length === 0 && (
                    <div className="py-4 text-center text-xs text-neutral-400">
                      {language === 'es' ? 'No se encontraron clientes registrados.' : 'No registered customers found.'}
                    </div>
                  )}

                  <div className="pt-2 mt-1 border-t border-neutral-800">
                    <button
                      type="button"
                      onClick={() => openQuickCustomerModal(customerSearchQuery.trim())}
                      className="w-full py-2.5 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer active:scale-98 shadow-xs"
                    >
                      <UserPlus className="w-4 h-4 text-emerald-400" />
                      <span>
                        {customerSearchQuery.trim()
                          ? (language === 'es'
                              ? `+ Registrar a "${customerSearchQuery.trim()}"`
                              : `+ Register "${customerSearchQuery.trim()}"`)
                          : t.register.quickRegisterBtn}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Active Cart Box */}
          <div className="bg-[#0D0D0D] rounded-2xl border border-neutral-800 overflow-hidden flex flex-col">
            {/* Standby Held Sale Banner */}
            {heldSale && (
              <div className="bg-amber-950/40 border-b border-amber-800/60 p-2.5 px-3.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-amber-200 truncate">
                      {t.register.heldSaleBadge} ({heldSale.cart.reduce((a, b) => a + b.quantity, 0)} {language === 'es' ? 'arts.' : 'items'} • {formatMoney(heldSale.cart.reduce((a, b) => a + b.total, 0))})
                    </p>
                    {heldSale.customer && (
                      <p className="text-xs text-amber-400/80 font-mono truncate">
                        {heldSale.customer.name}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={resumeHeldSale}
                  className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-xs active:scale-95"
                  title={cart.length > 0 ? "Intercambiar con ticket actual (F8)" : "Reanudar venta en espera (F8)"}
                >
                  {cart.length > 0 ? (
                    <>
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                      <span>{language === 'es' ? 'Intercambiar' : 'Swap'} [F8]</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 fill-black" />
                      <span>{t.register.resumeSale} [F8]</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Cart Header */}
            <div className="p-3.5 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {t.register.cartTitle} ({cart.reduce((a, b) => a + b.quantity, 0)} {cart.reduce((a, b) => a + b.quantity, 0) === 1 ? t.checkout.itemCountSingular : t.checkout.itemCountPlural})
                </span>
              </div>
              {cart.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={suspendCurrentSale}
                    className="text-neutral-400 hover:text-amber-300 text-xs flex items-center gap-1 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-neutral-800"
                    title="Suspender venta actual para atender a otro cliente (F8)"
                  >
                    <Pause className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline">{t.register.holdSale}</span>
                    <span className="font-mono text-[10px] text-amber-400/80">[F8]</span>
                  </button>
                  {isConfirmingClearCart ? (
                    <div className="flex items-center gap-1.5 animate-in fade-in duration-150">
                      <span className="text-xs text-amber-300 font-medium">
                        {language === 'es' ? '¿Vaciar?' : 'Clear?'}
                      </span>
                      <button
                        onClick={clearCart}
                        className="px-2 py-0.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                      >
                        {language === 'es' ? 'Sí' : 'Yes'}
                      </button>
                      <button
                        onClick={() => setIsConfirmingClearCart(false)}
                        className="px-2 py-0.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs transition-colors cursor-pointer"
                      >
                        {language === 'es' ? 'No' : 'Cancel'}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsConfirmingClearCart(true)}
                      className="text-neutral-400 hover:text-red-400 text-xs flex items-center gap-1 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-neutral-800"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{t.register.clearCart}</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Cart Items List */}
            <div className="p-3.5 divide-y divide-neutral-800/60 max-h-72 overflow-y-auto min-h-[160px]">
              {cart.map((item) => (
                <div key={item.productId} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                  {/* Item Description */}
                  <div className="min-w-0 flex-1">
                    <h5 className="font-medium text-xs text-white truncate">{item.name}</h5>
                    <div className="flex items-center gap-2 text-xs text-neutral-300 font-mono mt-0.5">
                      <span>{formatMoney(item.price)} {t.register.perUnit}</span>
                      {item.discount > 0 && (
                        <span className="text-emerald-400 font-medium">({item.discount}% {t.register.discountShort})</span>
                      )}
                    </div>
                  </div>

                  {/* Quantity +/- Buttons with Touch Ergonomics */}
                  <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 p-1 rounded-xl">
                    <button
                      onClick={() => updateQuantity(item.productId, -1)}
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white flex items-center justify-center cursor-pointer transition-colors active:scale-95 shrink-0"
                      aria-label="Disminuir cantidad"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-7 sm:w-8 text-center font-mono font-bold text-xs text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, 1)}
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white flex items-center justify-center cursor-pointer transition-colors active:scale-95 shrink-0"
                      aria-label="Aumentar cantidad"
                    >
                      <Plus className="w-3.5 h-3.5" />
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
                    className="text-neutral-500 hover:text-red-400 p-1.5 rounded-lg transition-colors cursor-pointer"
                    aria-label="Eliminar producto del ticket"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {cart.length === 0 && (
                <div className="py-12 text-center text-neutral-500">
                  <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs font-semibold text-neutral-400">{t.register.emptyCartTitle}</p>
                  <p className="text-xs text-neutral-500 mt-1">{t.register.emptyCartDesc}</p>
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
                    <div className="text-sm font-mono font-semibold text-emerald-300/90">
                      ≈ {formatSecondaryMoney(grandTotal)}
                    </div>
                  </div>
                </div>

                {/* Big Checkout Trigger Button */}
                <button
                  id="checkout-ticket-btn"
                  onClick={onOpenCheckout}
                  className="w-full mt-2 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-950/50 flex items-center justify-between px-4 cursor-pointer transition-all active:translate-y-0.5"
                >
                  <span className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-emerald-200" />
                    <span>{t.register.chargeBtn}</span>
                  </span>
                  <div className="flex items-baseline gap-2 font-mono">
                    <span>{formatMoney(grandTotal)}</span>
                    <span className="text-xs text-emerald-100/90 font-normal">
                      ≈ {formatSecondaryMoney(grandTotal)}
                    </span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Quick Keyboard Shortcuts Guide */}
          <div className="bg-neutral-900/40 border border-neutral-800/60 rounded-xl p-2.5 px-3 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-400 font-mono">
            <button
              onClick={() => setIsHelpOpen(true)}
              className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-sans font-semibold text-xs cursor-pointer transition-colors"
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>{language === 'es' ? 'Atajos de caja' : 'Shortcuts'}</span>
              <kbd className="px-1 py-0.2 rounded bg-neutral-800 border border-neutral-700 text-white text-[10px]">F1</kbd>
            </button>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span><kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-white">/</kbd> {language === 'es' ? 'Buscar' : 'Search'}</span>
              <span><kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-white">5*</kbd> {language === 'es' ? 'Mult.' : 'Multi.'}</span>
              <span><kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-white">F2</kbd> {language === 'es' ? 'Cámara' : 'Scanner'}</span>
              <span><kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-white">F4 / C</kbd> {language === 'es' ? 'Fiado' : 'Tab'}</span>
              <span><kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-white">F8</kbd> {language === 'es' ? 'Suspender' : 'Hold'}</span>
              <span><kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-white">F12</kbd> {language === 'es' ? 'Cobrar' : 'Pay'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cashier Quick Help Modal */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#0D0D0D] border border-neutral-800 rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">{t.register.helpModalTitle}</h3>
              </div>
              <button
                onClick={() => setIsHelpOpen(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800">
                  <div className="flex items-center gap-2 font-mono font-bold text-white">
                    <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-emerald-400">/</kbd>
                    <span>{language === 'es' ? 'Buscar / F3' : 'Search / F3'}</span>
                  </div>
                  <p className="text-neutral-400 mt-1">
                    {language === 'es' ? 'Enfoca el buscador para ingresar nombre, SKU o código de barra.' : 'Focus search input for product name, SKU, or barcode.'}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800">
                  <div className="flex items-center gap-2 font-mono font-bold text-white">
                    <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-emerald-400">5*</kbd>
                    <span>{language === 'es' ? 'Multiplicador' : 'Multiplier'}</span>
                  </div>
                  <p className="text-neutral-400 mt-1">
                    {language === 'es' ? 'Escribe "5*harina" y presiona Enter para agregar 5 unidades de golpe.' : 'Type "5*coke" and press Enter to instantly add 5 units.'}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800">
                  <div className="flex items-center gap-2 font-mono font-bold text-white">
                    <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-emerald-400">F2</kbd>
                    <span>{language === 'es' ? 'Cámara escáner' : 'Barcode Camera'}</span>
                  </div>
                  <p className="text-neutral-400 mt-1">
                    {language === 'es' ? 'Abre la cámara para leer códigos de barra físicos.' : 'Open camera to scan physical product barcodes.'}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800">
                  <div className="flex items-center gap-2 font-mono font-bold text-white">
                    <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-emerald-400">F4</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-white">C</kbd>
                    <span>{language === 'es' ? 'Cliente / Fiado' : 'Customer Tab'}</span>
                  </div>
                  <p className="text-neutral-400 mt-1">
                    {language === 'es' ? 'Despliega la lista de clientes para asignar cuenta de fiado y límite.' : 'Open customer dropdown to assign store credit or debt limit.'}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800">
                  <div className="flex items-center gap-2 font-mono font-bold text-white">
                    <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-emerald-400">F8</kbd>
                    <span>{language === 'es' ? 'Suspender venta' : 'Hold / Resume'}</span>
                  </div>
                  <p className="text-neutral-400 mt-1">
                    {language === 'es' ? 'Pone en espera la compra actual para atender al siguiente cliente.' : 'Pause current order to attend next in line, then resume.'}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800">
                  <div className="flex items-center gap-2 font-mono font-bold text-white">
                    <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-emerald-400">F12</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-white">Espacio</kbd>
                    <span>{language === 'es' ? 'Cobrar ticket' : 'Pay / Checkout'}</span>
                  </div>
                  <p className="text-neutral-400 mt-1">
                    {language === 'es' ? 'Abre la pantalla de cobro (Efectivo, Pago Móvil o Libreta).' : 'Open payment modal (Cash, Pago Móvil or Tab).'}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex items-start gap-2.5 text-emerald-200">
                <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed">
                  {language === 'es'
                    ? 'Consejo de mostrador: Los precios en Bolívares se calculan con la tasa oficial BCV en tiempo real. Si no hay internet, el sistema sigue funcionando offline con la última tasa guardada.'
                    : 'Counter tip: Bolívares prices update in real-time with official BCV rate. If offline, the POS keeps operating with the last saved rate.'}
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsHelpOpen(false)}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                {language === 'es' ? 'Entendido (Esc)' : 'Got it (Esc)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Customer Modal */}
      {isQuickCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#0D0D0D] border border-neutral-800 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{t.register.quickCustomerModalTitle}</h3>
                  <p className="text-xs text-neutral-400">{t.register.quickCustomerModalSubtitle}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickCustomerModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickCustomer} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  {t.register.fullName} <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  value={newCustomerForm.name}
                  onChange={(e) => setNewCustomerForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder={t.register.fullNamePlaceholder}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  {t.register.idDocument}
                </label>
                <input
                  type="text"
                  value={newCustomerForm.idDocument}
                  onChange={(e) => setNewCustomerForm((prev) => ({ ...prev, idDocument: e.target.value }))}
                  placeholder={t.register.idDocumentPlaceholder}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-medium mb-1">
                    {t.register.customerPhone}
                  </label>
                  <input
                    type="tel"
                    value={newCustomerForm.phone}
                    onChange={(e) => setNewCustomerForm((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder={t.register.customerPhonePlaceholder}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium mb-1">
                    {t.register.creditLimit}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-mono text-xs">$</span>
                    <input
                      type="number"
                      step="5"
                      min="0"
                      value={newCustomerForm.debtLimit}
                      onChange={(e) => setNewCustomerForm((prev) => ({ ...prev, debtLimit: e.target.value }))}
                      className="w-full pl-7 pr-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsQuickCustomerModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium transition-colors cursor-pointer"
                >
                  {t.register.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shadow-lg shadow-emerald-950/40"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{t.register.saveAndAssign}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Non-blocking Internal Toast Notification */}
      {internalToast && (
        <div
          role="alert"
          className={`fixed bottom-4 right-4 z-50 text-xs px-4 py-3 rounded-xl shadow-2xl border flex items-center gap-2.5 animate-in slide-in-from-bottom-2 duration-200 ${
            internalToast.type === 'error'
              ? 'bg-neutral-900 border-red-700/80 text-red-200'
              : internalToast.type === 'success'
              ? 'bg-neutral-900 border-emerald-700/80 text-emerald-200'
              : 'bg-neutral-900 border-neutral-700 text-neutral-200'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              internalToast.type === 'error'
                ? 'bg-red-400'
                : internalToast.type === 'success'
                ? 'bg-emerald-400'
                : 'bg-neutral-400'
            }`}
          />
          <span>{internalToast.message}</span>
        </div>
      )}
    </div>
  );
};
