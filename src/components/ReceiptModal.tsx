import React, { useRef, useMemo } from 'react';
import { Printer, Download, CheckCircle, Copy, X, Store, WifiOff, Cloud } from 'lucide-react';
import { SaleTransaction, StoreSettings } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { useCurrency } from '../currency/CurrencyContext';
import { useTheme } from '../theme/ThemeContext';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: SaleTransaction | null;
  storeSettings?: StoreSettings;
  storeConfig?: {
    storeName?: string;
    storeSubtitle?: string;
    address?: string;
    phone?: string;
    taxNumber?: string;
    footerMessage?: string;
    currencySymbol?: string;
  };
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  sale,
  storeSettings,
  storeConfig,
}) => {
  const { t, language, translatePaymentMethod } = useLanguage();
  const { formatMoney } = useCurrency();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const receiptRef = useRef<HTMLDivElement | null>(null);

  const storeName = storeSettings?.storeName || storeConfig?.storeName || 'TuBodeguita';
  const storeSubtitle =
    storeSettings?.storeSubtitle ||
    storeConfig?.storeSubtitle ||
    t.receipt.defaultSubtitle;
  const storeAddress = storeSettings?.address || storeConfig?.address || '742 Evergreen Terrace, Suite 100';
  const storePhone = storeSettings?.phone || storeConfig?.phone || '(555) 902-1200';
  const storeTaxId = storeSettings?.taxId || storeConfig?.taxNumber || '94-204918';
  const receiptFooter = storeSettings?.receiptFooterMessage || storeConfig?.footerMessage;

  // Determine applied tax rate percentage
  const appliedTaxPercent = useMemo(() => {
    if (!sale) return 0;
    if (typeof sale.taxRate === 'number' && !isNaN(sale.taxRate)) {
      return sale.taxRate;
    }
    if (
      sale.items &&
      sale.items.length > 0 &&
      typeof sale.items[0].taxRate === 'number' &&
      !isNaN(sale.items[0].taxRate)
    ) {
      return Number((sale.items[0].taxRate * 100).toFixed(2));
    }
    if (typeof storeSettings?.taxRate === 'number' && !isNaN(storeSettings.taxRate)) {
      return storeSettings.taxRate;
    }
    const taxableBase = Math.max(0, sale.subtotal - (sale.discountTotal || 0));
    if (taxableBase > 0 && sale.taxTotal > 0) {
      return Number(((sale.taxTotal / taxableBase) * 100).toFixed(2));
    }
    return 0;
  }, [sale, storeSettings?.taxRate]);

  if (!isOpen || !sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const textLines = [
      '================================',
      `      ${storeName.toUpperCase()}    `,
      `    ${storeAddress}`,
      `         Tel: ${storePhone}     `,
      `       Tax ID/RIF: ${storeTaxId} `,
      '================================',
      `${t.receipt.receiptNum}: ${sale.receiptNumber}`,
      `${t.ledger.date}:    ${new Date(sale.timestamp).toLocaleString()}`,
      sale.customerName ? `${t.receipt.customer}: ${sale.customerName}` : null,
      '--------------------------------',
      t.receipt.tableQtyItemTotal,
      '--------------------------------',
      ...sale.items.map(
        (item) =>
          `${item.quantity.toString().padEnd(4)} ${item.name.slice(0, 18).padEnd(18)} ${formatMoney(item.total).padStart(8)}`
      ),
      '--------------------------------',
      `${t.register.subtotal}:                 ${formatMoney(sale.subtotal)}`,
      sale.discountTotal > 0 ? `${t.register.discount}:                -${formatMoney(sale.discountTotal)}` : null,
      `${t.register.tax}${appliedTaxPercent > 0 ? ` (${appliedTaxPercent}%)` : ''}:        ${formatMoney(sale.taxTotal)}`,
      `${t.register.grandTotal}:                    ${formatMoney(sale.total)}`,
      '--------------------------------',
      `${t.receipt.paymentMethod}: ${translatePaymentMethod(sale.paymentMethod).toUpperCase()}`,
      sale.pagoMovilDetails ? '--------------------------------' : null,
      sale.pagoMovilDetails ? t.receipt.pagoMovilDetailsHeader : null,
      sale.pagoMovilDetails ? `${t.receipt.phoneLabel}        ${sale.pagoMovilDetails.phone}` : null,
      sale.pagoMovilDetails ? `${t.receipt.cedulaLabel}          ${sale.pagoMovilDetails.cedula}` : null,
      sale.pagoMovilDetails ? `${t.receipt.amountPaidLabel}       Bs. ${sale.pagoMovilDetails.amount.toFixed(2)}` : null,
      sale.pagoMovilDetails ? `${t.receipt.refLast4Label}     ${sale.pagoMovilDetails.referenceLast4}` : null,
      sale.amountTendered > 0 && sale.paymentMethod !== 'pago_movil' ? `${t.receipt.amountTendered}:       ${formatMoney(sale.amountTendered)}` : null,
      sale.changeDue > 0 ? `${t.receipt.changeReturned}:     ${formatMoney(sale.changeDue)}` : null,
      '================================',
      sale.offlineCreated
        ? t.receipt.offlineNotice
        : t.receipt.cloudNotice,
      receiptFooter ? `"${receiptFooter}"` : `    ${t.receipt.thankYou}   `,
      '================================',
    ]
      .filter(Boolean)
      .join('\n');

    navigator.clipboard.writeText(textLines);
    alert(t.receipt.copiedNotice);
  };

  return (
    <div
      id="receipt-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs p-3 sm:p-4"
    >
      <div className="min-h-full flex items-center justify-center py-4">
        <div
          id="receipt-modal"
          className={`rounded-2xl max-w-md w-full my-auto shadow-2xl overflow-hidden border flex flex-col max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3rem)] animate-in fade-in zoom-in-95 duration-150 ${
            isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#121212] border-neutral-800 text-neutral-300'
          }`}
        >
          {/* Standard Modal Header */}
          <div className={`shrink-0 flex items-center justify-between px-5 py-3.5 border-b ${
            isLight ? 'border-slate-200 bg-slate-50' : 'border-neutral-800 bg-[#0D0D0D]'
          }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 ${
              isLight ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-emerald-950/40 text-emerald-400 border-emerald-900/50'
            }`}>
              <CheckCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {t.receipt.saleCompleted}
              </h3>
              <p className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                {sale.receiptNumber}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              id="receipt-print-btn"
              onClick={handlePrint}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium cursor-pointer transition-colors shadow-xs"
              title="Print thermal receipt"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.receipt.print}</span>
            </button>
            <button
              id="receipt-copy-btn"
              onClick={handleCopyText}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
              }`}
              title="Copy receipt"
            >
              <Copy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.receipt.copy}</span>
            </button>
            <button
              id="close-receipt-modal-btn"
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-200' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Thermal Receipt Paper */}
        <div className="p-5 bg-[#0A0A0A] flex justify-center overflow-y-auto flex-1">
          <div
            id="printable-receipt"
            ref={receiptRef}
            className="receipt-paper w-full max-w-[340px] bg-white p-6 rounded-md font-mono text-slate-900 border border-neutral-300 shadow-md my-auto"
          >
            {/* Receipt Header */}
            <div className="text-center pb-4 border-b border-dashed border-slate-300">
              <h2 className="font-bold text-base tracking-wider uppercase">{storeName}</h2>
              <p className="text-[11px] text-slate-700">{storeSubtitle}</p>
              <p className="text-[10px] text-slate-700">{storeAddress}</p>
              <p className="text-[10px] text-slate-700">Tel: {storePhone} • Tax ID/RIF: {storeTaxId}</p>

              <div className="mt-3 flex justify-between text-[11px] text-slate-800 text-left">
                <div>
                  <p>
                    <span className="font-semibold">{t.receipt.receiptNum}:</span> {sale.receiptNumber}
                  </p>
                </div>
                <div className="text-right">
                  <p>{new Date(sale.timestamp).toLocaleDateString()}</p>
                  <p>{new Date(sale.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>

              {sale.customerName && (
                <div className="mt-2 text-left bg-slate-50 p-1.5 rounded border border-slate-200 text-[11px]">
                  <span className="font-bold text-slate-800">{t.receipt.customer}:</span> {sale.customerName}
                  {sale.paymentMethod === 'customer_debt' && (
                    <span className="block text-amber-700 font-bold text-[10px]">
                      {t.receipt.chargedToTabNotice}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Items List */}
            <div className="py-3 border-b border-dashed border-slate-300">
              <div className="flex justify-between text-[10px] font-bold text-slate-700 uppercase mb-1">
                <span>{t.receipt.itemAndQty}</span>
                <span>Total</span>
              </div>
              <div className="space-y-1.5 text-xs">
                {sale.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start">
                    <div className="pr-2">
                      <div className="font-medium text-slate-900 leading-tight">{item.name}</div>
                      <div className="text-[10px] text-slate-700">
                        {item.quantity} x {formatMoney(item.price)}
                        {item.discount > 0 && ` (${t.receipt.discountAbbr} -${formatMoney(item.discount)})`}
                      </div>
                    </div>
                    <div className="font-semibold text-slate-900 shrink-0">
                      {formatMoney(item.total)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="py-3 border-b border-dashed border-slate-300 space-y-1 text-xs">
              <div className="flex justify-between text-slate-800">
                <span>{t.register.subtotal}</span>
                <span>{formatMoney(sale.subtotal)}</span>
              </div>
              {sale.discountTotal > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>{t.register.discount}</span>
                  <span>-{formatMoney(sale.discountTotal)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-800">
                <span>
                  {t.register.tax}
                  {appliedTaxPercent > 0
                    ? ` (${appliedTaxPercent}%)`
                    : ` (0% ${t.receipt.exemptTax})`}
                </span>
                <span>{formatMoney(sale.taxTotal)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-950 pt-1 border-t border-slate-200">
                <span>{t.register.grandTotal.toUpperCase()}</span>
                <span className="text-base">{formatMoney(sale.total)}</span>
              </div>
            </div>

            {/* Payment Info */}
            <div className="py-3 border-b border-dashed border-slate-300 space-y-1 text-xs">
              <div className="flex justify-between text-slate-800">
                <span>{t.receipt.paymentMethod}</span>
                <span className="font-bold uppercase">{translatePaymentMethod(sale.paymentMethod)}</span>
              </div>
              {sale.amountTendered > 0 && sale.paymentMethod !== 'pago_movil' && (
                <div className="flex justify-between text-slate-800">
                  <span>{t.receipt.amountTendered}</span>
                  <span>{formatMoney(sale.amountTendered)}</span>
                </div>
              )}
              {sale.changeDue > 0 && (
                <div className="flex justify-between text-slate-800 font-semibold">
                  <span>{t.receipt.changeReturned}</span>
                  <span>{formatMoney(sale.changeDue)}</span>
                </div>
              )}
              {sale.pagoMovilDetails && (
                <div className="mt-2 pt-2 border-t border-dotted border-slate-300 text-[11px] space-y-1 text-slate-700 bg-slate-50 p-2 rounded-sm">
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <span>{t.receipt.pagoMovilDetailsHeader.replace(':', '')}</span>
                    <span className="font-mono text-emerald-800 font-bold">Ref: ****{sale.pagoMovilDetails.referenceLast4}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t.receipt.phoneLabel}</span>
                    <span className="font-mono font-medium text-slate-900">{sale.pagoMovilDetails.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t.receipt.cedulaLabel}</span>
                    <span className="font-mono font-medium text-slate-900">{sale.pagoMovilDetails.cedula}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-slate-900">
                    <span>{t.receipt.amountPaidLabel}</span>
                    <span className="font-mono font-bold">Bs. {sale.pagoMovilDetails.amount.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Offline vs Online Stamp */}
            <div className="pt-4 text-center">
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 ${
                  sale.offlineCreated
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                }`}
              >
                {sale.offlineCreated ? (
                  <>
                    <WifiOff className="w-3 h-3" />
                    <span>{t.receipt.offlineStored}</span>
                  </>
                ) : (
                  <>
                    <Cloud className="w-3 h-3" />
                    <span>{t.receipt.cloudVerified}</span>
                  </>
                )}
              </div>

              {/* Barcode Graphic */}
              <div className="flex flex-col items-center mt-2 opacity-80">
                <div className="flex items-center gap-0.5 h-8">
                  {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 2, 3, 1].map((w, i) => (
                    <span
                      key={i}
                      className="bg-black inline-block h-full"
                      style={{ width: `${w * 1.5}px` }}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-mono tracking-widest text-slate-700 mt-1">
                  {sale.receiptNumber}
                </span>
              </div>

              <p className="text-[10px] text-slate-700 mt-3">
                {receiptFooter ? (
                  <span className="italic">"{receiptFooter}"</span>
                ) : (
                  <span>{t.receipt.footerKeepReceipt}</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className={`shrink-0 px-6 py-4 border-t flex items-center justify-between gap-3 ${
          isLight ? 'border-slate-200 bg-slate-50' : 'border-neutral-800 bg-[#0D0D0D]'
        }`}>
          <button
            id="close-receipt-modal-footer-btn"
            type="button"
            onClick={onClose}
            className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
              isLight
                ? 'border-slate-300 text-slate-700 hover:bg-slate-100'
                : 'border-neutral-700 text-neutral-300 hover:bg-neutral-800'
            }`}
          >
            {t.common.close}
          </button>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-mono hidden sm:inline ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
              {t.receipt.status}: {sale.syncStatus === 'synced' ? t.receipt.cloudSynced : t.receipt.cloudPending}
            </span>
            <button
              id="new-sale-close-btn"
              onClick={onClose}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-950/50 cursor-pointer transition-colors"
            >
              {t.receipt.startNewSale}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);
};
