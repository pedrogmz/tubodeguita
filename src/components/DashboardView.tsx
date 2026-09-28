import React, { useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Clock,
  Printer,
  Sparkles,
  AlertTriangle,
  ArrowUpRight,
  CreditCard,
  Banknote,
  BookOpen,
  CloudOff,
  CheckCircle,
  Package,
  Smartphone,
} from 'lucide-react';
import { Sale, Product, Customer, Vendor, SyncQueueItem } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { useCurrency } from '../currency/CurrencyContext';

interface DashboardViewProps {
  sales: Sale[];
  products: Product[];
  customers: Customer[];
  vendors: Vendor[];
  syncQueue: SyncQueueItem[];
  isOnline: boolean;
  onReprintReceipt: (sale: Sale) => void;
  onNavigateTab: (tab: 'register' | 'inventory' | 'customer_ledger' | 'vendor_ledger' | 'settings') => void;
  onTriggerSync: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  sales,
  products,
  customers,
  vendors,
  syncQueue,
  isOnline,
  onReprintReceipt,
  onNavigateTab,
  onTriggerSync,
}) => {
  const { t, language, translatePaymentMethod, translateUnit } = useLanguage();
  const { formatMoney } = useCurrency();

  // Financial computations
  const metrics = useMemo(() => {
    const totalSalesCount = sales.length;
    const totalGrossRevenue = sales.reduce((acc, s) => acc + s.total, 0);

    // Calculate COGS and Gross Profit
    let totalCogs = 0;
    sales.forEach((s) => {
      s.items.forEach((item) => {
        totalCogs += (item.costPrice || item.price * 0.5) * item.quantity;
      });
    });
    const netProfit = Math.max(0, totalGrossRevenue - totalCogs);
    const avgOrderValue = totalSalesCount > 0 ? totalGrossRevenue / totalSalesCount : 0;

    // Debt & Payables
    const totalCustomerDebt = customers.reduce((acc, c) => acc + c.currentDebt, 0);
    const totalVendorPayables = vendors.reduce((acc, v) => acc + v.outstandingPayable, 0);

    // Payment methods breakdown
    const paymentBreakdown = {
      cash: sales.filter((s) => s.paymentMethod === 'cash').reduce((a, s) => a + s.total, 0),
      card: sales.filter((s) => s.paymentMethod === 'card').reduce((a, s) => a + s.total, 0),
      pagoMovil: sales.filter((s) => s.paymentMethod === 'pago_movil').reduce((a, s) => a + s.total, 0),
      debt: sales.filter((s) => s.paymentMethod === 'customer_debt').reduce((a, s) => a + s.total, 0),
      credit: sales.filter((s) => s.paymentMethod === 'store_credit').reduce((a, s) => a + s.total, 0),
    };

    // Low stock items
    const lowStockItems = products.filter((p) => p.stock <= p.minStock);

    // Best sellers
    const productSoldMap: Record<string, { name: string; qty: number; revenue: number }> = {};
    sales.forEach((s) => {
      s.items.forEach((i) => {
        if (!productSoldMap[i.productId]) {
          productSoldMap[i.productId] = { name: i.name, qty: 0, revenue: 0 };
        }
        productSoldMap[i.productId].qty += i.quantity;
        productSoldMap[i.productId].revenue += i.total;
      });
    });
    const bestSellers = Object.values(productSoldMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    return {
      totalSalesCount,
      totalGrossRevenue,
      netProfit,
      avgOrderValue,
      totalCustomerDebt,
      totalVendorPayables,
      paymentBreakdown,
      lowStockItems,
      bestSellers,
    };
  }, [sales, products, customers, vendors]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner / System Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {t.dashboard.title}
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            {t.dashboard.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {syncQueue.length > 0 ? (
            <button
              onClick={onTriggerSync}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-orange-950/40 hover:bg-orange-900/50 text-orange-400 border border-orange-900/50 rounded-xl text-xs font-semibold cursor-pointer shadow-sm transition-colors"
            >
              <CloudOff className="w-4 h-4 text-orange-400" />
              <span>{syncQueue.length} {t.dashboard.queuedChanges}</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-950/40 text-emerald-400 border border-emerald-900/50 rounded-xl text-xs font-medium">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>{t.dashboard.allDataSynced}</span>
            </div>
          )}
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Sales */}
        <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              {t.dashboard.grossSales}
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-950/40 text-emerald-400 border border-emerald-900/50">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-2">
            {formatMoney(metrics.totalGrossRevenue)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1 flex items-center justify-between">
            <span>{metrics.totalSalesCount} {t.dashboard.completedTickets}</span>
            <span>{t.dashboard.avgTicket}: {formatMoney(metrics.avgOrderValue)}</span>
          </div>
        </div>

        {/* Net Profit Margin */}
        <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              {t.dashboard.netProfit}
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-950/40 text-emerald-400 border border-emerald-900/50">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">
            {formatMoney(metrics.netProfit)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            {t.dashboard.netProfitDesc}
          </div>
        </div>

        {/* Customer Receivables (Khata) */}
        <div
          onClick={() => onNavigateTab('customer_ledger')}
          className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 shadow-sm cursor-pointer hover:border-orange-500/50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              {t.dashboard.customerTabsDebt}
            </span>
            <span className="p-1.5 rounded-lg bg-orange-950/40 text-orange-400 border border-orange-900/50">
              <BookOpen className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-orange-400 mt-2">
            {formatMoney(metrics.totalCustomerDebt)}
          </div>
          <div className="text-[11px] text-orange-400 mt-1 flex items-center gap-1">
            <span>{t.dashboard.viewAccountsLedger}</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>

        {/* Vendor Payables */}
        <div
          onClick={() => onNavigateTab('vendor_ledger')}
          className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 shadow-sm cursor-pointer hover:border-emerald-500/50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              {t.dashboard.wholesalePayables}
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-950/40 text-emerald-400 border border-emerald-900/50">
              <Package className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">
            {formatMoney(metrics.totalVendorPayables)}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <span>{t.dashboard.manageVendorBills}</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Sales + Payment Methods / Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Completed Tickets (7 cols) */}
        <div className="lg:col-span-7 bg-neutral-900 rounded-xl border border-neutral-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-[#0D0D0D]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-xs text-white uppercase tracking-wider">
                {t.dashboard.recentSales} ({sales.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('register')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
            >
              {t.dashboard.openRegister} &rarr;
            </button>
          </div>

          <div className="divide-y divide-neutral-800 max-h-96 overflow-y-auto">
            {sales.slice(0, 10).map((sale) => (
              <div
                key={sale.id}
                className="p-3.5 hover:bg-neutral-800/40 transition-colors flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white">
                      {sale.receiptNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                        sale.paymentMethod === 'cash'
                          ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/50'
                          : sale.paymentMethod === 'card'
                          ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/50'
                          : sale.paymentMethod === 'customer_debt'
                          ? 'bg-orange-950/40 text-orange-400 border border-orange-900/50'
                          : 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/50'
                      }`}
                    >
                      {translatePaymentMethod(sale.paymentMethod)}
                    </span>
                  </div>

                  <p className="text-[11px] text-neutral-400 mt-1">
                    {new Date(sale.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                    {sale.customerName ? `${language === 'es' ? 'Cliente' : 'Customer'}: ${sale.customerName}` : (language === 'es' ? 'Cliente Casual' : 'Walk-In')} •{' '}
                    {sale.items.length} {sale.items.length === 1 ? (language === 'es' ? 'artículo' : 'item') : (language === 'es' ? 'artículos' : 'items')}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="font-mono font-bold text-sm text-white block">
                      {formatMoney(sale.total)}
                    </span>
                    <span className="text-[10px] text-neutral-500">{language === 'es' ? 'Impuesto' : 'Tax'}: {formatMoney(sale.taxTotal)}</span>
                  </div>

                  <button
                    onClick={() => onReprintReceipt(sale)}
                    className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white cursor-pointer transition-colors border border-neutral-700"
                    title={t.dashboard.reprintReceipt}
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {sales.length === 0 && (
              <div className="p-8 text-center text-neutral-500">
                <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs font-semibold text-neutral-400">{t.dashboard.noSalesYet}</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">{t.dashboard.ringUpSalesDesc}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Payment Split & Low Stock (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Payment Method Split Card */}
          <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-4 shadow-sm space-y-3">
            <h3 className="font-bold text-xs text-white uppercase tracking-wider">
              {t.dashboard.revenueByPayment}
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#0D0D0D] border border-neutral-800">
                <div className="flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-emerald-400" />
                  <span className="font-medium text-neutral-300">{t.dashboard.cashRegister}</span>
                </div>
                <span className="font-mono font-bold text-white">
                  {formatMoney(metrics.paymentBreakdown.cash)}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-[#0D0D0D] border border-neutral-800">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span className="font-medium text-neutral-300">{t.dashboard.cardContactless}</span>
                </div>
                <span className="font-mono font-bold text-white">
                  {formatMoney(metrics.paymentBreakdown.card)}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-[#0D0D0D] border border-neutral-800">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span className="font-medium text-neutral-300">{language === 'es' ? 'Pago Móvil' : 'Mobile Payment'}</span>
                </div>
                <span className="font-mono font-bold text-white">
                  {formatMoney(metrics.paymentBreakdown.pagoMovil)}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-[#0D0D0D] border border-neutral-800">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-orange-400" />
                  <span className="font-medium text-neutral-300">{t.dashboard.customerTabDebt}</span>
                </div>
                <span className="font-mono font-bold text-orange-400">
                  {formatMoney(metrics.paymentBreakdown.debt)}
                </span>
              </div>
            </div>
          </div>

          {/* Low Stock Alerts Mini-Panel */}
          <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                <h3 className="font-bold text-xs text-white uppercase tracking-wider">
                  {t.dashboard.inventoryAlerts} ({metrics.lowStockItems.length})
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('inventory')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
              >
                {t.dashboard.manageStock} &rarr;
              </button>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto text-xs">
              {metrics.lowStockItems.slice(0, 4).map((p) => (
                <div
                  key={p.id}
                  className="p-2 rounded-lg bg-orange-950/30 border border-orange-900/40 flex items-center justify-between"
                >
                  <div>
                    <span className="font-semibold text-orange-200 block">{p.name}</span>
                    <span className="text-[10px] text-orange-400/80">SKU: {p.sku}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-orange-300">
                      {p.stock} {t.dashboard.unitsLeft}
                    </span>
                    <span className="text-[10px] text-orange-400/80 block">{t.dashboard.minRequired}: {p.minStock}</span>
                  </div>
                </div>
              ))}

              {metrics.lowStockItems.length === 0 && (
                <p className="text-xs text-neutral-500 py-3 text-center">
                  {t.dashboard.allStockHealthy}
                </p>
              )}
            </div>
          </div>

          {/* Top Selling Products */}
          {metrics.bestSellers.length > 0 && (
            <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-4 shadow-sm space-y-2">
              <h3 className="font-bold text-xs text-white uppercase tracking-wider">
                {t.dashboard.topSellingProducts}
              </h3>
              <div className="divide-y divide-neutral-800 text-xs">
                {metrics.bestSellers.map((item, idx) => (
                  <div key={idx} className="py-1.5 first:pt-0 last:pb-0 flex justify-between items-center">
                    <span className="text-neutral-300 font-medium truncate max-w-[200px]">{item.name}</span>
                    <div className="font-mono text-right">
                      <span className="font-bold text-white">{item.qty} {t.dashboard.unitsSold}</span>
                      <span className="text-neutral-400 text-[10px] ml-1.5">({formatMoney(item.revenue)})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
