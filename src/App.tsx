import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { RegisterView } from './components/RegisterView';
import { InventoryView } from './components/InventoryView';
import { CustomerLedgerView } from './components/CustomerLedgerView';
import { VendorLedgerView } from './components/VendorLedgerView';
import { DashboardView } from './components/DashboardView';
import { SettingsView } from './components/SettingsView';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { ReceiptModal } from './components/ReceiptModal';
import { CheckoutModal } from './components/CheckoutModal';
import { dbService } from './services/db';
import {
  Product,
  Customer,
  Vendor,
  Sale,
  CartItem,
  CustomerLedgerEntry,
  VendorLedgerEntry,
  SyncQueueItem,
  PaymentMethod,
  StoreSettings,
  PagoMovilDetails,
} from './types';
import { sound } from './utils/audio';
import { useLanguage } from './i18n/LanguageContext';
import { useTheme } from './theme/ThemeContext';
import { CurrencyProvider } from './currency/CurrencyContext';

export default function App() {
  const { t, language } = useLanguage();
  const { theme, setAccentColor } = useTheme();

  // Navigation (Default to dashboard)
  const [activeTab, setActiveTab] = useState<
    'register' | 'inventory' | 'customer_ledger' | 'vendor_ledger' | 'dashboard' | 'settings'
  >('dashboard');

  // Store Configuration Settings
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(dbService.getStoreSettings());

  // Core POS Datasets (Loaded from offline-first local database)
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [customerLedgers, setCustomerLedgers] = useState<CustomerLedgerEntry[]>([]);
  const [vendorLedgers, setVendorLedgers] = useState<VendorLedgerEntry[]>([]);
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>([]);

  // Register State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Connectivity & Cloud Sync
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Modals
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [receiptToPrint, setReceiptToPrint] = useState<Sale | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Reload all data from local dbService
  const refreshData = useCallback(() => {
    setProducts(dbService.getProducts());
    setCustomers(dbService.getCustomers());
    setVendors(dbService.getVendors());
    setSales(dbService.getSales());
    setCustomerLedgers(dbService.getCustomerLedgers());
    setVendorLedgers(dbService.getVendorLedgers());
    setSyncQueue(dbService.getSyncQueue());
    setIsOnline(dbService.getOnlineStatus());
    setStoreSettings(dbService.getStoreSettings());
  }, []);

  // Initial Load
  useEffect(() => {
    refreshData();

    // Background sync with SQLite database on server
    dbService.syncFromSqlite().then((res) => {
      if (res.success) {
        refreshData();
      }
    }).catch(() => {});

    // Listen for browser online / offline network events
    const handleOnline = () => {
      dbService.setOnlineStatus(true);
      setIsOnline(true);
      showToast(t.alerts.networkRestored);
      // Auto flush queue when reconnecting
      handleTriggerSync();
    };

    const handleOffline = () => {
      dbService.setOnlineStatus(false);
      setIsOnline(false);
      showToast(t.alerts.networkDisconnected);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refreshData, language, t]);

  // Cloud / SQLite Sync Handler
  const handleTriggerSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);

    try {
      const result = await dbService.syncFromSqlite();
      refreshData();
      sound.success();
      showToast(t.alerts.syncSuccess);
    } catch (err) {
      sound.error();
      showToast(t.alerts.syncFailed);
    } finally {
      setIsSyncing(false);
    }
  };

  // Online / Offline Simulation Toggle
  const handleToggleOnlineSimulation = () => {
    const newStatus = !isOnline;
    dbService.setOnlineStatus(newStatus);
    setIsOnline(newStatus);

    if (newStatus) {
      showToast(t.alerts.switchedToOnline);
      handleTriggerSync();
    } else {
      showToast(t.alerts.simulatingOffline);
    }
  };

  // Store Settings Handlers
  const handleSaveStoreSettings = (newSettings: StoreSettings) => {
    dbService.saveStoreSettings(newSettings);
    setStoreSettings(newSettings);
    if (newSettings.accentColor) {
      setAccentColor(newSettings.accentColor);
    }
    showToast(t.alerts.settingsSaved);
  };

  const handleResetStoreSettings = () => {
    dbService.resetStoreSettings();
    const defaults = dbService.getStoreSettings();
    setStoreSettings(defaults);
    setAccentColor('emerald');
    showToast(t.alerts.settingsReset);
  };

  const handleClearSyncedQueue = () => {
    dbService.clearSyncedQueue();
    refreshData();
    showToast(t.alerts.queueCleared);
  };

  // Barcode scanned callback
  const handleBarcodeScanned = (barcode: string) => {
    const product = products.find(
      (p) => p.barcode === barcode || p.sku.toLowerCase() === barcode.toLowerCase()
    );

    if (!product) {
      sound.error();
      alert(`${t.alerts.productNotFound} "${barcode}"`);
      return;
    }

    if (product.stock <= 0) {
      sound.error();
      alert(`"${product.name}" ${t.alerts.productOutOfStock}`);
      return;
    }

    sound.scan();
    // Add to cart directly
    setCart((prev) => {
      const existingIdx = prev.findIndex((item) => item.productId === product.id);
      const taxRateDecimal =
        typeof storeSettings.taxRate === 'number' && !isNaN(storeSettings.taxRate)
          ? storeSettings.taxRate / 100
          : 0.16;

      if (existingIdx >= 0) {
        const existing = prev[existingIdx];
        if (existing.quantity + 1 > product.stock) {
          sound.error();
          alert(t.alerts.cannotAddMoreStock.replace('{stock}', String(product.stock)));
          return prev;
        }

        const newQty = existing.quantity + 1;
        const subtotal = product.price * newQty;
        const total = subtotal + subtotal * taxRateDecimal;

        const updated = [...prev];
        updated[existingIdx] = {
          ...existing,
          quantity: newQty,
          taxRate: taxRateDecimal,
          subtotal,
          total,
        };
        return updated;
      } else {
        const subtotal = product.price;
        const total = subtotal + subtotal * taxRateDecimal;
        const newItem: CartItem = {
          productId: product.id,
          name: product.name,
          sku: product.sku,
          barcode: product.barcode,
          category: product.category,
          price: product.price,
          costPrice: product.costPrice,
          quantity: 1,
          discount: 0,
          discountType: 'percentage',
          taxRate: taxRateDecimal,
          subtotal,
          total,
        };
        return [...prev, newItem];
      }
    });

    const currSym = storeSettings.currencySymbol || '$';
    showToast(`${t.alerts.productScanned} ${product.name} (${currSym}${product.price.toFixed(2)})`);
    setIsScannerOpen(false);
  };

  // Re-sync cart items with current tax rate whenever settings change
  useEffect(() => {
    if (cart.length === 0) return;
    const currentTaxDecimal =
      typeof storeSettings.taxRate === 'number' && !isNaN(storeSettings.taxRate)
        ? storeSettings.taxRate / 100
        : 0.16;
    setCart((prev) =>
      prev.map((item) => {
        const disc =
          item.discountType === 'percentage'
            ? (item.price * item.quantity * item.discount) / 100
            : item.discount;
        const taxable = Math.max(0, item.subtotal - disc);
        const total = taxable + taxable * currentTaxDecimal;
        return {
          ...item,
          taxRate: currentTaxDecimal,
          total,
        };
      })
    );
  }, [storeSettings.taxRate]);

  // Cart Totals for Checkout
  const effectiveTaxDecimal =
    typeof storeSettings.taxRate === 'number' && !isNaN(storeSettings.taxRate)
      ? storeSettings.taxRate / 100
      : 0.16;
  const cartSubtotal = cart.reduce((acc, i) => acc + i.subtotal, 0);
  const cartDiscountTotal = cart.reduce((acc, i) => {
    const disc =
      i.discountType === 'percentage'
        ? (i.price * i.quantity * i.discount) / 100
        : i.discount;
    return acc + disc;
  }, 0);
  const cartTaxTotal = cart.reduce((acc, i) => {
    const disc =
      i.discountType === 'percentage'
        ? (i.price * i.quantity * i.discount) / 100
        : i.discount;
    const taxable = Math.max(0, i.subtotal - disc);
    const itemTax = typeof i.taxRate === 'number' && !isNaN(i.taxRate) ? i.taxRate : effectiveTaxDecimal;
    return acc + taxable * itemTax;
  }, 0);
  const cartTotal = cartSubtotal - cartDiscountTotal + cartTaxTotal;

  // Complete Sale
  const handleCompleteSale = (details: {
    paymentMethod: PaymentMethod;
    amountTendered: number;
    changeDue: number;
    pagoMovilDetails?: PagoMovilDetails;
    notes?: string;
  }) => {
    // Save to local database (updates stocks, ledgers, and queues sync)
    const newSale = dbService.recordSale({
      items: cart.map((i) => ({
        ...i,
        taxRate: typeof i.taxRate === 'number' && !isNaN(i.taxRate) ? i.taxRate : effectiveTaxDecimal,
      })),
      itemCount: cart.reduce((acc, i) => acc + i.quantity, 0),
      subtotal: cartSubtotal,
      discountTotal: cartDiscountTotal,
      taxTotal: cartTaxTotal,
      taxRate: storeSettings.taxRate,
      total: cartTotal,
      paymentMethod: details.paymentMethod,
      amountTendered: details.amountTendered,
      changeDue: details.changeDue,
      pagoMovilDetails: details.pagoMovilDetails,
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer?.name,
      cashierName: storeSettings?.terminalId || 'Terminal',
      notes: details.notes,
    });

    // Refresh data
    refreshData();

    // Close checkout and clear cart
    setIsCheckoutOpen(false);
    setCart([]);
    setSelectedCustomer(null);

    // Show thermal receipt printable modal
    setReceiptToPrint(newSale);
    showToast(`${t.alerts.saleSuccess} ${newSale.receiptNumber}`);

    // If online, trigger auto sync in background
    if (isOnline) {
      setTimeout(() => {
        handleTriggerSync();
      }, 500);
    }
  };

  return (
    <CurrencyProvider storeSettings={storeSettings} onSettingsUpdated={setStoreSettings}>
      <div
        className={`min-h-screen ${
          theme === 'light' ? 'bg-slate-50 text-slate-700' : 'bg-[#0A0A0A] text-neutral-300'
        } flex flex-col font-sans antialiased selection:bg-emerald-600 selection:text-white transition-colors duration-150`}
      >
      {/* Universal POS Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOnline={isOnline}
        onToggleOnlineSimulation={handleToggleOnlineSimulation}
        syncQueueCount={syncQueue.length}
        onTriggerSync={handleTriggerSync}
        isSyncing={isSyncing}
        storeSettings={storeSettings}
      />

      {/* Main Screen Views */}
      <main className="flex-1 pb-12">
        {activeTab === 'register' && (
          <RegisterView
            products={products}
            customers={customers}
            cart={cart}
            setCart={setCart}
            selectedCustomer={selectedCustomer}
            setSelectedCustomer={setSelectedCustomer}
            onOpenScanner={() => setIsScannerOpen(true)}
            onOpenCheckout={() => setIsCheckoutOpen(true)}
            onRefreshData={refreshData}
            isOnline={isOnline}
            storeSettings={storeSettings}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryView
            products={products}
            onRefreshData={refreshData}
            isOnline={isOnline}
            storeSettings={storeSettings}
          />
        )}

        {activeTab === 'customer_ledger' && (
          <CustomerLedgerView
            customers={customers}
            customerLedgers={customerLedgers}
            onRefreshData={refreshData}
            isOnline={isOnline}
          />
        )}

        {activeTab === 'vendor_ledger' && (
          <VendorLedgerView
            vendors={vendors}
            vendorLedgers={vendorLedgers}
            onRefreshData={refreshData}
            isOnline={isOnline}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardView
            sales={sales}
            products={products}
            customers={customers}
            vendors={vendors}
            syncQueue={syncQueue}
            isOnline={isOnline}
            onReprintReceipt={(sale) => setReceiptToPrint(sale)}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onTriggerSync={handleTriggerSync}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            storeSettings={storeSettings}
            onSaveSettings={handleSaveStoreSettings}
            onResetDefaults={handleResetStoreSettings}
            isOnline={isOnline}
            onToggleOnlineSimulation={handleToggleOnlineSimulation}
            syncQueue={syncQueue}
            onTriggerSync={handleTriggerSync}
            isSyncing={isSyncing}
            onClearSyncedQueue={handleClearSyncedQueue}
            products={products}
            onRefreshData={refreshData}
          />
        )}
      </main>

      {/* Floating System Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-[#171717] text-neutral-200 text-xs px-4 py-3 rounded-xl shadow-2xl border border-neutral-800 flex items-center gap-2.5 animate-in slide-in-from-bottom-2 duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Barcode Scanner Modal (Hardware + Camera + Code Search) */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onBarcodeScanned={handleBarcodeScanned}
        products={products}
      />

      {/* Checkout Modal (Cash change calculator, card terminal, customer debt tab) */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        subtotal={cartSubtotal}
        discountTotal={cartDiscountTotal}
        taxTotal={cartTaxTotal}
        taxRate={storeSettings.taxRate}
        total={cartTotal}
        selectedCustomer={selectedCustomer}
        customers={customers}
        onSelectCustomer={setSelectedCustomer}
        onCompleteSale={handleCompleteSale}
      />

      {/* Receipt Modal (Thermal 80mm printable layout & clipboard copy) */}
      {receiptToPrint && (
        <ReceiptModal
          isOpen={!!receiptToPrint}
          onClose={() => setReceiptToPrint(null)}
          sale={receiptToPrint}
          storeSettings={storeSettings}
          storeConfig={{
            storeName: storeSettings.storeName,
            storeSubtitle: storeSettings.storeSubtitle,
            address: storeSettings.address,
            phone: storeSettings.phone,
            taxNumber: storeSettings.taxId,
            footerMessage: storeSettings.receiptFooterMessage,
            currencySymbol: storeSettings.currencySymbol,
          }}
        />
      )}
    </div>
    </CurrencyProvider>
  );
}
