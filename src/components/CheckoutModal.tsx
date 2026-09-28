import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  Banknote,
  BookOpen,
  Gift,
  Check,
  AlertTriangle,
  Receipt,
  User,
  ShieldAlert,
  Smartphone,
  Phone,
  Hash,
} from 'lucide-react';
import { CartItem, Customer, PaymentMethod, PagoMovilDetails } from '../types';
import { sound } from '../utils/audio';
import { useLanguage } from '../i18n/LanguageContext';
import { useCurrency } from '../currency/CurrencyContext';
import { useTheme } from '../theme/ThemeContext';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  taxRate?: number;
  total: number;
  selectedCustomer: Customer | null;
  customers?: Customer[];
  onSelectCustomer?: (customer: Customer | null) => void;
  onCompleteSale: (details: {
    paymentMethod: PaymentMethod;
    amountTendered: number;
    changeDue: number;
    pagoMovilDetails?: PagoMovilDetails;
    notes?: string;
  }) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  subtotal,
  discountTotal,
  taxTotal,
  taxRate,
  total,
  selectedCustomer,
  customers,
  onSelectCustomer,
  onCompleteSale,
}) => {
  const { t, language } = useLanguage();
  const { formatMoney, formatSecondaryMoney, formatBoth, exchangeRate, primaryCurrency, secondaryCurrency, currencySymbol } = useCurrency();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [tenderedInput, setTenderedInput] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Pago Móvil specific state
  const calculatedBsTotal = (primaryCurrency === 'USD' ? total * exchangeRate : total).toFixed(2);
  const [pmPhone, setPmPhone] = useState<string>('');
  const [pmCedula, setPmCedula] = useState<string>('');
  const [pmAmount, setPmAmount] = useState<string>('');
  const [pmReferenceLast4, setPmReferenceLast4] = useState<string>('');

  // Set default tender on modal open or method switch
  useEffect(() => {
    if (isOpen) {
      setTenderedInput(total.toFixed(2));
      setErrorMsg(null);
      setPmAmount(calculatedBsTotal);
      if (selectedCustomer?.phone && !pmPhone) {
        setPmPhone(selectedCustomer.phone);
      }
    }
  }, [isOpen, total, exchangeRate, primaryCurrency, selectedCustomer]);

  if (!isOpen) return null;

  const tenderedAmount = parseFloat(tenderedInput) || 0;
  const changeDue = Math.max(0, tenderedAmount - total);
  const isCashUnderpaid = paymentMethod === 'cash' && tenderedAmount < total;

  // Quick cash bill shortcuts
  const quickBills = [
    { label: t.checkout.exact, amount: total },
    { label: `${currencySymbol}10`, amount: 10 },
    { label: `${currencySymbol}20`, amount: 20 },
    { label: `${currencySymbol}50`, amount: 50 },
    { label: `${currencySymbol}100`, amount: 100 },
  ].filter((b) => b.amount >= total || b.label === t.checkout.exact);

  // Customer debt tab calculation
  const newProjectedDebt = selectedCustomer ? selectedCustomer.currentDebt + total : 0;
  const isOverDebtLimit = selectedCustomer ? newProjectedDebt > selectedCustomer.debtLimit : false;

  const handleCheckout = () => {
    setErrorMsg(null);

    if (paymentMethod === 'cash' && isCashUnderpaid) {
      sound.error();
      setErrorMsg(
        `${t.checkout.insufficientCash} (${t.checkout.shortageWarning} ${formatMoney(total - tenderedAmount)})`
      );
      return;
    }

    if (paymentMethod === 'pago_movil') {
      const cleanPhone = pmPhone.trim();
      const cleanCedula = pmCedula.trim();
      const cleanRef = pmReferenceLast4.trim();
      const parsedAmount = parseFloat(pmAmount);

      if (!cleanPhone) {
        sound.error();
        setErrorMsg(t.checkout.phoneRequired);
        return;
      }
      if (!cleanCedula) {
        sound.error();
        setErrorMsg(t.checkout.cedulaRequired);
        return;
      }
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        sound.error();
        setErrorMsg(t.checkout.validAmountRequired);
        return;
      }
      if (!cleanRef || !/^\d{4}$/.test(cleanRef)) {
        sound.error();
        setErrorMsg(t.checkout.validRefRequired);
        return;
      }

      sound.success();
      onCompleteSale({
        paymentMethod: 'pago_movil',
        amountTendered: total,
        changeDue: 0,
        pagoMovilDetails: {
          phone: cleanPhone,
          cedula: cleanCedula,
          amount: parsedAmount,
          referenceLast4: cleanRef,
        },
        notes: notes.trim() || undefined,
      });
      return;
    }

    if (paymentMethod === 'customer_debt') {
      if (!selectedCustomer) {
        sound.error();
        setErrorMsg(t.checkout.noCustomerSelectedWarning);
        return;
      }
      if (isOverDebtLimit) {
        const proceed = confirm(
          `${t.checkout.creditLimitWarning} (${t.checkout.currentDebtLabel} ${formatMoney(selectedCustomer.currentDebt)}, ${t.checkout.projectedDebtLabel} ${formatMoney(newProjectedDebt)})`
        );
        if (!proceed) return;
      }
    }

    if (paymentMethod === 'store_credit') {
      if (!selectedCustomer || selectedCustomer.creditBalance < total) {
        sound.error();
        setErrorMsg(
          `${t.checkout.insufficientCreditBalance} (${t.checkout.availableCreditLabel} ${formatMoney(selectedCustomer?.creditBalance || 0)})`
        );
        return;
      }
    }

    sound.success();
    onCompleteSale({
      paymentMethod,
      amountTendered: paymentMethod === 'cash' ? tenderedAmount : total,
      changeDue: paymentMethod === 'cash' ? changeDue : 0,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div
      id="checkout-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs p-3 sm:p-4"
    >
      <div className="min-h-full flex items-center justify-center py-4">
        <div
          id="checkout-modal"
          className={`rounded-2xl max-w-xl w-full my-auto shadow-2xl overflow-hidden border flex flex-col max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3rem)] animate-in fade-in zoom-in-95 duration-150 ${
            isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#121212] border-neutral-800 text-neutral-300'
          }`}
        >
          {/* Header */}
          <div className={`shrink-0 flex items-center justify-between px-6 py-4 border-b ${
            isLight ? 'border-slate-200 bg-slate-50' : 'border-neutral-800 bg-[#0D0D0D]'
          }`}>
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                isLight ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-emerald-950/40 text-emerald-400 border-emerald-900/50'
              }`}>
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h3 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {t.checkout.title}
                </h3>
                <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                  {t.checkout.paymentMethod}
                </p>
              </div>
            </div>
            <button
              id="close-checkout-modal-btn"
              onClick={onClose}
              className={`p-1 rounded-lg transition-colors cursor-pointer ${
                isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-200' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Order Summary Pill */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-neutral-500 font-medium">{t.checkout.grandTotal}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400 font-mono">
                  BCV: {exchangeRate.toFixed(2)} Bs./$
                </span>
              </div>
              <div className="flex items-baseline gap-2.5 mt-0.5">
                <div className="text-2xl font-bold font-mono text-emerald-400">{formatMoney(total)}</div>
                <div className="text-sm font-semibold font-mono text-neutral-400">
                  ≈ {formatSecondaryMoney(total)}
                </div>
              </div>
            </div>
            <div className="text-left sm:text-right text-xs text-neutral-400 space-y-0.5 font-mono border-t sm:border-t-0 pt-2 sm:pt-0 border-neutral-800">
              <div>{t.register.subtotal}: {formatMoney(subtotal)}</div>
              {discountTotal > 0 && <div className="text-emerald-400">{t.register.discount}: -{formatMoney(discountTotal)}</div>}
              <div>{t.register.tax}{typeof taxRate === 'number' ? ` (${taxRate}%)` : ''}: {formatMoney(taxTotal)}</div>
            </div>
          </div>

            {/* Payment Method Selector */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isLight ? 'text-slate-700' : 'text-neutral-400'}`}>
                {t.checkout.paymentMethod}
              </label>
              <div
                id="checkout-payment-methods-grid"
                className="grid grid-cols-2 sm:grid-cols-3 gap-2.5"
              >
                <button
                  type="button"
                  id="checkout-method-cash"
                  onClick={() => setPaymentMethod('cash')}
                  className={`flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'cash'
                      ? isLight
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/30 font-semibold shadow-xs'
                        : 'border-emerald-500 bg-emerald-600/20 text-white ring-1 ring-emerald-500/50'
                      : isLight
                      ? 'border-slate-200 bg-slate-50/80 text-slate-600 hover:text-slate-900 hover:bg-slate-100 hover:border-slate-300'
                      : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                  }`}
                >
                  <Banknote className="w-5 h-5 mb-1.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-bold">{t.checkout.cash}</span>
                  <span className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-neutral-500'}`}>{t.checkout.billsAndChange}</span>
                </button>

                <button
                  type="button"
                  id="checkout-method-card"
                  onClick={() => setPaymentMethod('card')}
                  className={`flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'card'
                      ? isLight
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/30 font-semibold shadow-xs'
                        : 'border-emerald-500 bg-emerald-600/20 text-white ring-1 ring-emerald-500/50'
                      : isLight
                      ? 'border-slate-200 bg-slate-50/80 text-slate-600 hover:text-slate-900 hover:bg-slate-100 hover:border-slate-300'
                      : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                  }`}
                >
                  <CreditCard className="w-5 h-5 mb-1.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-bold">{t.checkout.card}</span>
                  <span className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-neutral-500'}`}>{t.checkout.cardPos}</span>
                </button>

                <button
                  type="button"
                  id="checkout-method-pago-movil"
                  onClick={() => {
                    setPaymentMethod('pago_movil');
                    if (!pmAmount) setPmAmount(calculatedBsTotal);
                  }}
                  className={`flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'pago_movil'
                      ? isLight
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/30 font-semibold shadow-xs'
                        : 'border-emerald-500 bg-emerald-600/20 text-white ring-1 ring-emerald-500/50'
                      : isLight
                      ? 'border-slate-200 bg-slate-50/80 text-slate-600 hover:text-slate-900 hover:bg-slate-100 hover:border-slate-300'
                      : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                  }`}
                >
                  <Smartphone className="w-5 h-5 mb-1.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-bold">{t.checkout.pagoMovil}</span>
                  <span className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-neutral-500'}`}>{t.checkout.pagoMovilBs}</span>
                </button>

                <button
                  type="button"
                  id="checkout-method-customer-debt"
                  onClick={() => setPaymentMethod('customer_debt')}
                  className={`flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'customer_debt'
                      ? isLight
                        ? 'border-amber-600 bg-amber-50 text-amber-950 ring-2 ring-amber-500/30 font-semibold shadow-xs'
                        : 'border-orange-500 bg-orange-950/40 text-orange-400 ring-1 ring-orange-500/50'
                      : isLight
                      ? 'border-slate-200 bg-slate-50/80 text-slate-600 hover:text-slate-900 hover:bg-slate-100 hover:border-slate-300'
                      : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                  }`}
                >
                  <BookOpen className="w-5 h-5 mb-1.5 text-amber-600 dark:text-orange-400" />
                  <span className="text-xs font-bold">{t.checkout.customerTab}</span>
                  <span className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-neutral-500'}`}>{t.checkout.chargeToTab}</span>
                </button>

                <button
                  type="button"
                  id="checkout-method-store-credit"
                  onClick={() => setPaymentMethod('store_credit')}
                  className={`flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'store_credit'
                      ? isLight
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/30 font-semibold shadow-xs'
                        : 'border-emerald-500 bg-emerald-600/20 text-white ring-1 ring-emerald-500/50'
                      : isLight
                      ? 'border-slate-200 bg-slate-50/80 text-slate-600 hover:text-slate-900 hover:bg-slate-100 hover:border-slate-300'
                      : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                  }`}
                >
                  <Gift className="w-5 h-5 mb-1.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-bold">{t.checkout.storeCredit}</span>
                  <span className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-neutral-500'}`}>{t.checkout.prepaidCredit}</span>
                </button>
              </div>
            </div>

          {/* Contextual Payment Form based on Method */}
          {paymentMethod === 'cash' && (
            <div className="bg-neutral-900/80 p-4 rounded-xl border border-neutral-800 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">{t.checkout.cashTendered}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-mono font-bold">{currencySymbol}</span>
                  <input
                    id="cash-tendered-input"
                    type="number"
                    step="0.01"
                    min="0"
                    value={tenderedInput}
                    onChange={(e) => setTenderedInput(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 text-lg font-mono font-bold text-white bg-[#0D0D0D] border border-neutral-800 rounded-lg focus:outline-hidden focus:border-emerald-600"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Quick Cash Presets */}
              <div className="flex flex-wrap gap-2">
                {quickBills.map((b, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setTenderedInput(b.amount.toFixed(2))}
                    className="px-3 py-1.5 bg-neutral-800 border border-neutral-700 hover:border-emerald-500 hover:bg-neutral-700 rounded-lg text-xs font-mono font-semibold text-neutral-200 transition-colors cursor-pointer"
                  >
                    {b.label === t.checkout.exact ? `${t.checkout.exact} (${formatMoney(b.amount)})` : b.label}
                  </button>
                ))}
              </div>

              {/* Change Calculation Box */}
              <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-neutral-500">{t.checkout.changeDue}</span>
                  <div className="flex items-baseline gap-2">
                    <div
                      className={`text-xl font-mono font-bold ${
                        isCashUnderpaid ? 'text-orange-400' : 'text-emerald-400'
                      }`}
                    >
                      {formatMoney(changeDue)}
                    </div>
                    {!isCashUnderpaid && changeDue > 0 && (
                      <span className="text-xs font-mono font-semibold text-neutral-400">
                        ≈ {formatSecondaryMoney(changeDue)}
                      </span>
                    )}
                  </div>
                </div>
                {isCashUnderpaid && (
                  <span className="text-xs text-orange-400 font-medium bg-orange-950/40 border border-orange-900/50 px-2 py-1 rounded-md">
                    {t.checkout.shortageWarning} {formatMoney(total - tenderedAmount)}
                  </span>
                )}
              </div>
            </div>
          )}

          {paymentMethod === 'card' && (
            <div className="bg-neutral-900/80 p-5 rounded-xl border border-neutral-800 text-center space-y-2">
              <CreditCard className="w-8 h-8 text-emerald-400 mx-auto" />
              <h4 className="text-xs font-bold text-white">{t.checkout.cardTerminalReady}</h4>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                {t.checkout.cardTerminalInstructions}
              </p>
              <div className="text-[11px] font-mono text-emerald-400 font-semibold bg-[#0D0D0D] inline-block px-3 py-1 rounded-full border border-neutral-800">
                {t.checkout.authorizedAmount}: {formatMoney(total)}
              </div>
            </div>
          )}

          {/* Pago Móvil Form */}
          {paymentMethod === 'pago_movil' && (
            <div className="bg-neutral-900/80 p-4 rounded-xl border border-neutral-800 space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{t.checkout.pagoMovil}</h4>
                    <p className="text-[11px] text-neutral-400">{t.checkout.pagoMovilDesc}</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-900/60 text-emerald-300 font-semibold">
                  Tasa BCV: {exchangeRate.toFixed(2)} Bs./$
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Número Telefónico */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-neutral-300">
                      {t.checkout.pagoMovilPhone} <span className="text-emerald-400">*</span>
                    </label>
                    {selectedCustomer?.phone && pmPhone !== selectedCustomer.phone && (
                      <button
                        type="button"
                        onClick={() => setPmPhone(selectedCustomer.phone)}
                        className="text-[10px] text-emerald-400 hover:text-emerald-300 cursor-pointer underline"
                      >
                        {t.checkout.useCustomer}
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
                      <Phone className="w-3.5 h-3.5" />
                    </span>
                    <input
                      id="pm-phone-input"
                      type="tel"
                      placeholder={t.checkout.pagoMovilPhonePlaceholder}
                      value={pmPhone}
                      onChange={(e) => setPmPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-[#0D0D0D] border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                {/* 2. Cédula de Identidad / RIF */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    {t.checkout.pagoMovilCedula} <span className="text-emerald-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
                      <User className="w-3.5 h-3.5" />
                    </span>
                    <input
                      id="pm-cedula-input"
                      type="text"
                      placeholder={t.checkout.pagoMovilCedulaPlaceholder}
                      value={pmCedula}
                      onChange={(e) => setPmCedula(e.target.value.toUpperCase())}
                      className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-[#0D0D0D] border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500 uppercase transition-colors"
                    />
                  </div>
                </div>

                {/* 3. Monto en Bolívares */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-neutral-300">
                      {t.checkout.pagoMovilAmount} <span className="text-emerald-400">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setPmAmount(calculatedBsTotal)}
                      className="text-[10px] text-neutral-400 hover:text-emerald-400 cursor-pointer"
                    >
                      {t.checkout.exactAmount}
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-mono font-bold text-xs">
                      Bs.
                    </span>
                    <input
                      id="pm-amount-input"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={pmAmount}
                      onChange={(e) => setPmAmount(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs font-mono font-bold bg-[#0D0D0D] border border-neutral-800 rounded-lg text-emerald-400 placeholder-neutral-600 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                  {primaryCurrency === 'USD' && (
                    <p className="text-[10px] text-neutral-500 mt-1 font-mono">
                      ≈ ${total.toFixed(2)} USD × {exchangeRate.toFixed(2)} Bs./$
                    </p>
                  )}
                </div>

                {/* 4. Últimos 4 Dígitos de Referencia */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    {t.checkout.pagoMovilRef} <span className="text-emerald-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
                      <Hash className="w-3.5 h-3.5" />
                    </span>
                    <input
                      id="pm-ref-input"
                      type="text"
                      maxLength={4}
                      placeholder={t.checkout.pagoMovilRefPlaceholder}
                      value={pmReferenceLast4}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                        setPmReferenceLast4(val);
                      }}
                      className="w-full pl-9 pr-3 py-2 text-xs font-mono font-bold tracking-widest bg-[#0D0D0D] border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                  <p className="text-[10px] text-neutral-500 mt-1">
                    {t.checkout.refDigitsHint}
                  </p>
                </div>
              </div>

              <div className="bg-[#0D0D0D] p-2.5 rounded-lg border border-neutral-800 text-[11px] text-neutral-400 flex items-start gap-2">
                <Smartphone className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{t.checkout.pagoMovilHelp}</span>
              </div>
            </div>
          )}

          {paymentMethod === 'customer_debt' && (
            <div className="bg-neutral-900/80 p-4 rounded-xl border border-neutral-800 space-y-3">
              <div className="flex items-start gap-2.5">
                <BookOpen className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">{t.checkout.customerTab}</h4>
                  <p className="text-xs text-neutral-400">
                    {t.checkout.tabCustomerDescription}
                  </p>
                </div>
              </div>

              {selectedCustomer ? (
                <div className="bg-[#0D0D0D] p-3 rounded-lg border border-neutral-800 text-xs space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500">{t.ledger.customerName}:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{selectedCustomer.name}</span>
                      {onSelectCustomer && (
                        <button
                          type="button"
                          onClick={() => onSelectCustomer(null)}
                          className="text-[11px] text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
                        >
                          {t.checkout.changeCustomer}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">{t.checkout.currentDebtLabel}</span>
                    <span className="font-mono font-bold text-orange-400">
                      {formatMoney(selectedCustomer.currentDebt)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">{t.checkout.projectedDebtLabel}</span>
                    <span className="font-mono font-bold text-white">
                      {formatMoney(newProjectedDebt)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">{t.ledger.creditLimit}:</span>
                    <span className="font-mono text-neutral-300">{formatMoney(selectedCustomer.debtLimit)}</span>
                  </div>

                  {isOverDebtLimit && (
                    <div className="mt-2 flex items-center gap-1.5 p-2 bg-red-950/40 text-red-400 rounded-md border border-red-900/50 text-[11px]">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      <span>
                        {t.checkout.creditLimitWarning}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-[#0D0D0D] rounded-lg border border-neutral-800 space-y-2">
                  <label className="block text-xs font-semibold text-neutral-300">
                    {t.checkout.selectCustomerForTab}
                  </label>
                  <select
                    value=""
                    onChange={(e) => {
                      const found = customers?.find((c) => c.id === e.target.value) || null;
                      onSelectCustomer?.(found);
                    }}
                    className="w-full text-xs py-2 px-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-hidden focus:border-emerald-600"
                  >
                    <option value="">{t.checkout.chooseCustomerForTabPlaceholder}</option>
                    {customers?.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.currentDebt > 0 ? `• [${t.register.customerDebt}: ${formatMoney(c.currentDebt)}]` : ''}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-neutral-500">
                    {t.checkout.tabExplanation}
                  </p>
                </div>
              )}
            </div>
          )}

          {paymentMethod === 'store_credit' && (
            <div className="bg-neutral-900/80 p-4 rounded-xl border border-neutral-800 space-y-2">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-emerald-400" />
                <h4 className="text-xs font-bold text-white">{t.checkout.storeCredit}</h4>
              </div>
              {selectedCustomer ? (
                <div className="bg-[#0D0D0D] p-3 rounded-lg border border-neutral-800 text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500">{t.ledger.customerName}:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{selectedCustomer.name}</span>
                      {onSelectCustomer && (
                        <button
                          type="button"
                          onClick={() => onSelectCustomer(null)}
                          className="text-[11px] text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
                        >
                          {t.checkout.changeCustomer}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">{t.checkout.availableCreditLabel}</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {formatMoney(selectedCustomer.creditBalance)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">{t.checkout.remainingCreditLabel}</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {formatMoney(Math.max(0, selectedCustomer.creditBalance - total))}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-[#0D0D0D] rounded-lg border border-neutral-800 space-y-2">
                  <label className="block text-xs font-semibold text-neutral-300">
                    {t.checkout.selectCustomerCredit}
                  </label>
                  <select
                    value=""
                    onChange={(e) => {
                      const found = customers?.find((c) => c.id === e.target.value) || null;
                      onSelectCustomer?.(found);
                    }}
                    className="w-full text-xs py-2 px-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-hidden focus:border-emerald-600"
                  >
                    <option value="">{t.checkout.chooseCustomerCreditPlaceholder}</option>
                    {customers?.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} • [{t.register.customerCredit}: ${formatMoney(c.creditBalance)}]
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Transaction Notes */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-neutral-400 mb-1">{t.checkout.notesOptional}</label>
            <input
              type="text"
              placeholder={t.checkout.notesPlaceholder}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs py-2.5 px-3 bg-[#0D0D0D] border border-neutral-800 rounded-lg text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-950/40 text-red-400 rounded-lg border border-red-900/50 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className={`shrink-0 px-6 py-4 border-t flex items-center justify-between ${
          isLight ? 'border-slate-200 bg-slate-50' : 'border-neutral-800 bg-[#0D0D0D]'
        }`}>
          <button
            id="cancel-checkout-btn"
            type="button"
            onClick={onClose}
            className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
              isLight
                ? 'border-slate-300 text-slate-700 hover:bg-slate-100'
                : 'border-neutral-700 text-neutral-300 hover:bg-neutral-800'
            }`}
          >
            {t.checkout.cancel}
          </button>
          <button
            id="confirm-checkout-btn"
            type="button"
            onClick={handleCheckout}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/50 cursor-pointer transition-all"
          >
            <Receipt className="w-4 h-4" />
            <span>{t.checkout.completePayment} ({formatMoney(total)})</span>
          </button>
        </div>
      </div>
    </div>
  </div>
);
};
