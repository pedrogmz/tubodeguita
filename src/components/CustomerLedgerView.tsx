import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  DollarSign,
  CreditCard,
  Banknote,
  FileText,
  X,
  Phone,
  UserCheck,
  UserPlus,
  ShieldAlert,
  ArrowDownLeft,
  ArrowUpRight,
  Edit2,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { Customer, CustomerLedgerEntry } from '../types';
import { dbService } from '../services/db';
import { sound } from '../utils/audio';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../theme/ThemeContext';
import { useCurrency } from '../currency/CurrencyContext';

interface CustomerLedgerViewProps {
  customers: Customer[];
  customerLedgers: CustomerLedgerEntry[];
  onRefreshData: () => void;
  isOnline: boolean;
}

export const CustomerLedgerView: React.FC<CustomerLedgerViewProps> = ({
  customers,
  customerLedgers,
  onRefreshData,
  isOnline,
}) => {
  const { t, language } = useLanguage();
  const { formatMoney, formatSecondaryMoney, currencySymbol } = useCurrency();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [searchQuery, setSearchQuery] = useState('');
  const [statementCustomer, setStatementCustomer] = useState<Customer | null>(null);

  // Customer Payment Modal State
  const [isCustomerPayModalOpen, setIsCustomerPayModalOpen] = useState(false);
  const [customerPayTarget, setCustomerPayTarget] = useState<Customer | null>(null);
  const [customerPayAmount, setCustomerPayAmount] = useState<string>('');
  const [customerPayMethod, setCustomerPayMethod] = useState<'cash' | 'card'>('cash');
  const [customerPayNotes, setCustomerPayNotes] = useState<string>('');

  // Add Customer Modal State
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState({
    name: '',
    phone: '',
    email: '',
    debtLimit: 200,
    initialDebt: 0,
    notes: '',
  });

  // Edit Customer Modal State
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editCustomerData, setEditCustomerData] = useState({
    name: '',
    phone: '',
    email: '',
    debtLimit: 200,
    notes: '',
  });

  // Delete Customer Confirmation State
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [isDeletingCustomer, setIsDeletingCustomer] = useState(false);

  // KPIs
  const customerStats = useMemo(() => {
    const totalDebt = customers.reduce((acc, c) => acc + c.currentDebt, 0);
    const totalCredit = customers.reduce((acc, c) => acc + c.creditBalance, 0);
    const activeDebtors = customers.filter((c) => c.currentDebt > 0).length;
    return { totalDebt, totalCredit, activeDebtors };
  }, [customers]);

  // Filtered customer list
  const filteredCustomers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.email && c.email.toLowerCase().includes(q))
    );
  }, [customers, searchQuery]);

  // Handle Customer Payment Submit
  const handleCustomerPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerPayTarget) return;
    const amount = parseFloat(customerPayAmount);
    if (isNaN(amount) || amount <= 0) {
      alert(t.alerts.validPaymentRequired);
      return;
    }

    sound.success();
    dbService.recordCustomerPayment(
      customerPayTarget.id,
      amount,
      customerPayMethod,
      customerPayNotes || undefined
    );
    onRefreshData();
    setIsCustomerPayModalOpen(false);
    setCustomerPayAmount('');
    setCustomerPayNotes('');
  };

  // Handle Create Customer
  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerData.name) return;

    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      name: newCustomerData.name,
      phone: newCustomerData.phone,
      email: newCustomerData.email || undefined,
      currentDebt: Number(newCustomerData.initialDebt) || 0,
      creditBalance: 0,
      debtLimit: Number(newCustomerData.debtLimit) || 200,
      notes: newCustomerData.notes || undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    dbService.saveCustomer(newCust);
    if (newCust.currentDebt > 0) {
      dbService.recordCustomerDebt(
        newCust.id,
        newCust.currentDebt,
        `OPEN-BAL-${newCust.id.slice(-4)}`,
        'Initial balance carried forward'
      );
    }

    onRefreshData();
    setIsAddCustomerOpen(false);
    setNewCustomerData({
      name: '',
      phone: '',
      email: '',
      debtLimit: 200,
      initialDebt: 0,
      notes: '',
    });
  };

  // Open Edit Customer Modal
  const openEditCustomerModal = (c: Customer) => {
    setEditingCustomer(c);
    setEditCustomerData({
      name: c.name,
      phone: c.phone,
      email: c.email || '',
      debtLimit: c.debtLimit,
      notes: c.notes || '',
    });
  };

  // Handle Edit Customer Submit
  const handleEditCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer || !editCustomerData.name.trim()) return;

    sound.success();
    dbService.saveCustomer({
      ...editingCustomer,
      name: editCustomerData.name.trim(),
      phone: editCustomerData.phone.trim(),
      email: editCustomerData.email.trim() || undefined,
      debtLimit: Number(editCustomerData.debtLimit) || 0,
      notes: editCustomerData.notes.trim() || undefined,
      updatedAt: Date.now(),
    });

    onRefreshData();
    setEditingCustomer(null);
  };

  // Handle Confirm Delete Customer
  const confirmDeleteCustomer = () => {
    if (!customerToDelete) return;
    setIsDeletingCustomer(true);
    try {
      sound.scan();
      dbService.deleteCustomer(customerToDelete.id);
      if (statementCustomer?.id === customerToDelete.id) {
        setStatementCustomer(null);
      }
      onRefreshData();
      setCustomerToDelete(null);
    } finally {
      setIsDeletingCustomer(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className={`text-xl font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {t.ledger.customerTitle}
            </h2>
            <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
              {t.ledger.customerSubtitle}
            </p>
          </div>
        </div>

        <button
          id="add-customer-top-btn"
          onClick={() => setIsAddCustomerOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-950/50 cursor-pointer transition-colors shrink-0 justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>{t.ledger.newCustomerBtn}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div
          className={`p-4 rounded-xl border shadow-xs ${
            isLight ? 'bg-white border-slate-200' : 'bg-neutral-900 border-neutral-800'
          }`}
        >
          <span className={`text-[11px] font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
            {t.ledger.totalCustomerDebt}
          </span>
          <div className="text-2xl font-bold font-mono text-orange-500 mt-1">
            {formatMoney(customerStats.totalDebt)}
          </div>
          <span className={`text-[10px] mt-0.5 block ${isLight ? 'text-slate-400' : 'text-neutral-500'}`}>
            {customerStats.activeDebtors} {t.ledger.accountsWithDebtCount}
          </span>
        </div>

        <div
          className={`p-4 rounded-xl border shadow-xs ${
            isLight ? 'bg-white border-slate-200' : 'bg-neutral-900 border-neutral-800'
          }`}
        >
          <span className={`text-[11px] font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
            {t.ledger.totalStoreCredit}
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-500 mt-1">
            {formatMoney(customerStats.totalCredit)}
          </div>
          <span className={`text-[10px] mt-0.5 block ${isLight ? 'text-slate-400' : 'text-neutral-500'}`}>
            {t.ledger.totalStoreCredit}
          </span>
        </div>

        <div
          className={`p-4 rounded-xl border shadow-xs ${
            isLight ? 'bg-white border-slate-200' : 'bg-neutral-900 border-neutral-800'
          }`}
        >
          <span className={`text-[11px] font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
            {t.ledger.totalAccounts}
          </span>
          <div className={`text-2xl font-bold font-mono mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {customers.length}
          </div>
          <span className={`text-[10px] mt-0.5 block ${isLight ? 'text-slate-400' : 'text-neutral-500'}`}>
            {t.ledger.activeCustomerLedgers}
          </span>
        </div>
      </div>

      {/* Search and Quick Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t.ledger.searchCustomers}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-9 pr-4 py-2 border rounded-lg text-xs font-medium focus:outline-hidden focus:border-emerald-600 shadow-xs ${
              isLight
                ? 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                : 'bg-[#0D0D0D] border-neutral-800 text-white placeholder-neutral-500'
            }`}
          />
        </div>
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((c) => {
          const creditLimit = Math.max(0, c.debtLimit);
          const currentDebt = Math.max(0, c.currentDebt);
          const availableCredit = Math.max(0, creditLimit - currentDebt);
          const usedPercent = creditLimit > 0 ? Math.min(100, Math.round((currentDebt / creditLimit) * 100)) : (currentDebt > 0 ? 100 : 0);
          const availablePercent = Math.max(0, 100 - usedPercent);
          const isOverLimit = currentDebt > creditLimit;

          return (
            <div
              key={c.id}
              className={`rounded-xl border p-4 shadow-xs transition-all flex flex-col justify-between space-y-3 ${
                isLight
                  ? 'bg-white border-slate-200 hover:border-slate-300'
                  : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div>
                {/* Customer Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>{c.name}</h4>
                    <div className={`flex items-center gap-1 text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                      <Phone className="w-3 h-3" />
                      <span>{c.phone}</span>
                    </div>
                  </div>
                </div>

                {c.notes && (
                  <p
                    className={`text-[11px] mt-2 p-2 rounded border ${
                      isLight
                        ? 'bg-slate-50 text-slate-700 border-slate-200'
                        : 'bg-[#0D0D0D] text-neutral-300 border-neutral-800'
                    }`}
                  >
                    {c.notes}
                  </p>
                )}

                {/* Credit Limit & Debt Breakdown */}
                <div
                  className={`mt-3 pt-3 border-t space-y-2 ${
                    isLight ? 'border-slate-100' : 'border-neutral-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className={`text-[10px] uppercase font-semibold block ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                        {t.ledger.currentDebtBadge}
                      </span>
                      <span className={`font-mono font-bold ${currentDebt > 0 ? 'text-orange-500' : (isLight ? 'text-slate-800' : 'text-white')}`}>
                        {formatMoney(currentDebt)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className={`text-[10px] uppercase font-semibold block ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                        {t.ledger.availableCreditBadge}
                      </span>
                      <span className={`font-mono font-bold ${isOverLimit ? 'text-red-500' : availableCredit > 0 ? 'text-emerald-500' : (isLight ? 'text-slate-600' : 'text-neutral-400')}`}>
                        {formatMoney(availableCredit)}
                        <span className="text-[10px] font-normal ml-1 opacity-90 font-sans">
                          ({availablePercent}% {t.ledger.availAbbr})
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar of Debt Used */}
                  <div className="space-y-1">
                    <div className={`w-full h-2 rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-neutral-800'}`}>
                      <div
                        className={`h-full rounded-full transition-all ${
                          isOverLimit
                            ? 'bg-red-500'
                            : usedPercent > 75
                            ? 'bg-orange-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(usedPercent > 0 ? 3 : 0, usedPercent))}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px]">
                      <span className={isLight ? 'text-slate-400' : 'text-neutral-500'}>
                        {isOverLimit ? (
                          <span className="text-red-500 font-semibold">
                            {`${t.ledger.limitExceededNotice} ${formatMoney(currentDebt - creditLimit)}!`}
                          </span>
                        ) : (
                          <span>
                            {t.ledger.usedLimitLabel} <strong className="font-mono">{usedPercent}%</strong> {t.ledger.ofLimitLabel}
                          </span>
                        )}
                      </span>
                      <span className={isLight ? 'text-slate-400' : 'text-neutral-500'}>
                        {t.ledger.totalLimitLabel} <strong className="font-mono">{formatMoney(creditLimit)}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div
                className={`pt-2.5 border-t flex items-center justify-between gap-2 ${
                  isLight ? 'border-slate-100' : 'border-neutral-800'
                }`}
              >
                <div className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                  {customerLedgers.filter((l) => l.customerId === c.id).length}{' '}
                  {t.ledger.recordsCount}
                </div>

                <div className="flex items-center gap-1.5">
                  {/* View Statement Button with Tooltip */}
                  <div className="relative group/statement flex items-center justify-center">
                    <button
                      id={`view-statement-btn-${c.id}`}
                      onClick={() => setStatementCustomer(c)}
                      className={`p-2 rounded-lg transition-colors cursor-pointer border flex items-center justify-center shadow-2xs ${
                        isLight
                          ? 'bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border-slate-200 hover:border-slate-300'
                          : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white border-neutral-700'
                      }`}
                      title={t.ledger.viewHistoryBtn}
                      aria-label={t.ledger.viewHistoryBtn}
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </button>

                    {/* Floating Tooltip */}
                    <div
                      role="tooltip"
                      className="pointer-events-none absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 hidden group-hover/statement:flex flex-col items-center z-30 whitespace-nowrap animate-in fade-in duration-100"
                    >
                      <div
                        className={`px-2 py-0.5 text-[10px] font-semibold rounded-md shadow-lg font-sans border ${
                          isLight
                            ? 'text-slate-800 bg-white border-slate-200 shadow-slate-200'
                            : 'text-white bg-neutral-900 border-neutral-700'
                        }`}
                      >
                        {t.ledger.viewHistoryBtn}
                      </div>
                      <div
                        className={`w-1.5 h-1 border-x-3 border-x-transparent border-t-3 -mt-px ${
                          isLight ? 'border-t-white' : 'border-t-neutral-900'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Edit Customer Button with Tooltip */}
                  <div className="relative group/edit flex items-center justify-center">
                    <button
                      id={`edit-customer-btn-${c.id}`}
                      onClick={() => openEditCustomerModal(c)}
                      className={`p-2 rounded-lg transition-colors cursor-pointer border flex items-center justify-center shadow-2xs ${
                        isLight
                          ? 'bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border-slate-200 hover:border-emerald-300'
                          : 'bg-neutral-800 hover:bg-emerald-950/40 text-neutral-400 hover:text-emerald-400 border-neutral-700 hover:border-emerald-800/60'
                      }`}
                      title={t.ledger.editCustomer}
                      aria-label={t.ledger.editCustomer}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Floating Tooltip */}
                    <div
                      role="tooltip"
                      className="pointer-events-none absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 hidden group-hover/edit:flex flex-col items-center z-30 whitespace-nowrap animate-in fade-in duration-100"
                    >
                      <div
                        className={`px-2 py-0.5 text-[10px] font-semibold rounded-md shadow-lg font-sans border ${
                          isLight
                            ? 'text-emerald-900 bg-white border-emerald-200 shadow-slate-200'
                            : 'text-white bg-neutral-900 border-neutral-700'
                        }`}
                      >
                        {t.ledger.editCustomer}
                      </div>
                      <div
                        className={`w-1.5 h-1 border-x-3 border-x-transparent border-t-3 -mt-px ${
                          isLight ? 'border-t-white' : 'border-t-neutral-900'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Delete Customer Button with Tooltip */}
                  <div className="relative group/delete flex items-center justify-center">
                    <button
                      id={`delete-customer-btn-${c.id}`}
                      onClick={() => setCustomerToDelete(c)}
                      className={`p-2 rounded-lg transition-colors cursor-pointer border flex items-center justify-center shadow-2xs ${
                        isLight
                          ? 'bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border-slate-200 hover:border-rose-200'
                          : 'bg-neutral-800 hover:bg-rose-950/40 text-neutral-400 hover:text-rose-400 border-neutral-700 hover:border-rose-800/50'
                      }`}
                      title={t.ledger.deleteCustomer}
                      aria-label={t.ledger.deleteCustomer}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Floating Tooltip */}
                    <div
                      role="tooltip"
                      className="pointer-events-none absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 hidden group-hover/delete:flex flex-col items-center z-30 whitespace-nowrap animate-in fade-in duration-100"
                    >
                      <div
                        className={`px-2 py-0.5 text-[10px] font-semibold rounded-md shadow-lg font-sans border ${
                          isLight
                            ? 'text-rose-700 bg-white border-rose-200 shadow-slate-200'
                            : 'text-rose-300 bg-neutral-900 border-rose-900/60'
                        }`}
                      >
                        {t.ledger.deleteCustomer}
                      </div>
                      <div
                        className={`w-1.5 h-1 border-x-3 border-x-transparent border-t-3 -mt-px ${
                          isLight ? 'border-t-white' : 'border-t-neutral-900'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Collect Payment Button with Tooltip */}
                  {c.currentDebt > 0 && (
                    <div className="relative group/collect flex items-center justify-center">
                      <button
                        id={`collect-payment-btn-${c.id}`}
                        onClick={() => {
                          setCustomerPayTarget(c);
                          setCustomerPayAmount(c.currentDebt.toFixed(2));
                          setIsCustomerPayModalOpen(true);
                        }}
                        className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-xs transition-colors cursor-pointer flex items-center justify-center border border-emerald-500/50"
                        title={t.ledger.collectPaymentBtn}
                        aria-label={t.ledger.collectPaymentBtn}
                      >
                        <Banknote className="w-3.5 h-3.5 text-white" />
                      </button>

                      {/* Floating Tooltip */}
                      <div
                        role="tooltip"
                        className="pointer-events-none absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 hidden group-hover/collect:flex flex-col items-center z-30 whitespace-nowrap animate-in fade-in duration-100"
                      >
                        <div
                          className={`px-2 py-0.5 text-[10px] font-semibold rounded-md shadow-lg font-sans border ${
                            isLight
                              ? 'text-emerald-800 bg-white border-emerald-200 shadow-slate-200'
                              : 'text-white bg-neutral-900 border-neutral-700'
                          }`}
                        >
                          {t.ledger.collectPaymentBtn}
                        </div>
                        <div
                          className={`w-1.5 h-1 border-x-3 border-x-transparent border-t-3 -mt-px ${
                            isLight ? 'border-t-white' : 'border-t-neutral-900'
                          }`}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Customer Ledger Statement / Transaction History Modal */}
      {statementCustomer && (
        <div
          id="customer-statement-modal-backdrop"
          className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150"
        >
          <div className="min-h-full flex items-center justify-center py-4">
            <div
              id="customer-statement-modal"
              className={`rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border flex flex-col my-auto max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3rem)] animate-in fade-in zoom-in-95 duration-150 ${
                isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#121212] border-neutral-800 text-neutral-300'
              }`}
            >
            {/* Modal Header */}
            <div className={`flex items-center justify-between pb-3 border-b shrink-0 ${isLight ? 'border-slate-200' : 'border-neutral-800'}`}>
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                  isLight
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    : 'bg-emerald-950/40 text-emerald-400 border-emerald-900/50'
                }`}>
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {t.ledger.transactionHistory}
                    </h3>
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold border ${
                      statementCustomer.currentDebt > 0
                        ? isLight
                          ? 'bg-orange-50 text-orange-700 border-orange-200'
                          : 'bg-orange-950/40 text-orange-400 border-orange-900/50'
                        : isLight
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-emerald-950/40 text-emerald-400 border-emerald-900/50'
                    }`}>
                      {statementCustomer.currentDebt > 0
                        ? `${t.register.customerDebt}: ${formatMoney(statementCustomer.currentDebt)}`
                        : t.ledger.zeroBalance}
                    </span>
                  </div>
                  <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                    {statementCustomer.name} {statementCustomer.phone ? `• ${statementCustomer.phone}` : ''}
                  </p>
                </div>
              </div>
              <button
                id="close-statement-btn"
                onClick={() => setStatementCustomer(null)}
                className={`p-1 rounded-lg transition-colors cursor-pointer ${
                  isLight ? 'text-slate-400 hover:text-slate-700' : 'text-neutral-400 hover:text-white'
                }`}
                title={t.common.close}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Financial Overview Cards inside Statement Modal */}
            <div className={`grid grid-cols-3 gap-2.5 p-3 rounded-xl border my-4 shrink-0 text-xs ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0D0D0D] border-neutral-800'
            }`}>
              <div>
                <span className={`text-[10px] uppercase font-semibold block ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                  {t.ledger.owesStore}
                </span>
                <span className="text-sm font-bold font-mono text-orange-500 mt-0.5 block">
                  {formatMoney(statementCustomer.currentDebt)}
                </span>
              </div>
              <div>
                <span className={`text-[10px] uppercase font-semibold block ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                  {t.ledger.creditLimit}
                </span>
                <span className={`text-sm font-bold font-mono mt-0.5 block ${isLight ? 'text-slate-800' : 'text-white'}`}>
                  {formatMoney(statementCustomer.debtLimit)}
                </span>
              </div>
              <div>
                <span className={`text-[10px] uppercase font-semibold block ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                  {t.ledger.availableCreditBadge}
                </span>
                <span className="text-sm font-bold font-mono text-emerald-500 mt-0.5 block">
                  {formatMoney(Math.max(0, statementCustomer.debtLimit - statementCustomer.currentDebt))}
                </span>
              </div>
            </div>

            {/* Transactions Header & List */}
            <div className="flex items-center justify-between pb-2 shrink-0">
              <h4 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-neutral-300'}`}>
                {t.ledger.transactionHistory}
              </h4>
              <span className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                {customerLedgers.filter((l) => l.customerId === statementCustomer.id).length}{' '}
                {t.ledger.recordsCount}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[160px] max-h-[380px]">
              {customerLedgers.filter((l) => l.customerId === statementCustomer.id).length === 0 ? (
                <div className={`py-12 text-center rounded-xl border border-dashed flex flex-col items-center justify-center gap-2 ${
                  isLight ? 'bg-slate-50/50 border-slate-200 text-slate-400' : 'bg-neutral-900/30 border-neutral-800 text-neutral-500'
                }`}>
                  <FileText className="w-8 h-8 opacity-40" />
                  <p className="text-xs italic">
                    {t.ledger.noTransactionsYet}
                  </p>
                </div>
              ) : (
                customerLedgers
                  .filter((l) => l.customerId === statementCustomer.id)
                  .map((entry) => (
                    <div
                      key={entry.id}
                      className={`p-3 rounded-xl border text-xs flex justify-between items-start transition-colors ${
                        isLight
                          ? 'bg-slate-50 hover:bg-slate-100/70 border-slate-200'
                          : 'bg-[#0D0D0D] hover:bg-neutral-900 border-neutral-800'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${
                          entry.type === 'sale_debt'
                            ? isLight
                              ? 'bg-orange-50 text-orange-600 border-orange-200'
                              : 'bg-orange-950/40 text-orange-400 border-orange-900/50'
                            : isLight
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                            : 'bg-emerald-950/40 text-emerald-400 border-emerald-900/50'
                        }`}>
                          {entry.type === 'sale_debt' ? (
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div>
                          <div className={`font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>
                            {entry.type === 'sale_debt'
                              ? t.ledger.chargeSaleDebt
                              : t.ledger.paymentReceived}
                          </div>
                          <div className={`text-[11px] font-mono mt-0.5 ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                            {new Date(entry.timestamp).toLocaleString()} • {entry.referenceReceiptNumber}
                          </div>
                          {entry.notes && (
                            <div className={`text-[11px] mt-1 p-1.5 rounded border ${
                              isLight ? 'bg-white border-slate-200 text-slate-600' : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                            }`}>
                              {entry.notes}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right font-mono shrink-0 pl-3">
                        <span
                          className={`text-sm font-bold block ${
                            entry.type === 'sale_debt' ? 'text-orange-500' : 'text-emerald-500'
                          }`}
                        >
                          {entry.type === 'sale_debt'
                            ? `+${formatMoney(entry.amount)}`
                            : `-${formatMoney(entry.amount)}`}
                        </span>
                        <span className={`block text-[10px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-neutral-500'}`}>
                          {t.common.status}: <strong className={isLight ? 'text-slate-700' : 'text-neutral-300'}>{formatMoney(entry.balanceAfter)}</strong>
                        </span>
                      </div>
                    </div>
                  ))
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className={`pt-4 border-t flex items-center justify-between gap-3 mt-4 shrink-0 ${
              isLight ? 'border-slate-200' : 'border-neutral-800'
            }`}>
              <button
                id="close-statement-btn"
                type="button"
                onClick={() => setStatementCustomer(null)}
                className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                  isLight
                    ? 'border-slate-300 text-slate-700 hover:bg-slate-100'
                    : 'border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                {t.common.close}
              </button>

              {statementCustomer.currentDebt > 0 && (
                <button
                  id="statement-modal-collect-payment-btn"
                  type="button"
                  onClick={() => {
                    const target = statementCustomer;
                    setStatementCustomer(null);
                    setCustomerPayTarget(target);
                    setCustomerPayAmount(target.currentDebt.toFixed(2));
                    setIsCustomerPayModalOpen(true);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/50 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Banknote className="w-4 h-4" />
                  <span>{t.ledger.collectPaymentBtn}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )}

      {/* Customer Payment Modal */}
      {isCustomerPayModalOpen && customerPayTarget && (
        <div
          id="customer-pay-modal-backdrop"
          className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs p-3 sm:p-4"
        >
          <div className="min-h-full flex items-center justify-center py-4">
            <div
              className={`rounded-2xl max-w-md w-full p-6 shadow-2xl border my-auto text-neutral-300 animate-in fade-in zoom-in-95 duration-150 ${
                isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#121212] border-neutral-800 text-neutral-300'
              }`}
            >
            <div className={`flex items-center justify-between pb-3 border-b ${isLight ? 'border-slate-200' : 'border-neutral-800'}`}>
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                  isLight ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-emerald-950/40 text-emerald-400 border-emerald-900/50'
                }`}>
                  <Banknote className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {t.ledger.collectPaymentModalTitle}
                  </h3>
                  <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                    {customerPayTarget.name} • {formatMoney(customerPayTarget.currentDebt)}
                  </p>
                </div>
              </div>
              <button
                id="close-customer-pay-modal-btn"
                onClick={() => setIsCustomerPayModalOpen(false)}
                className={`p-1 rounded-lg transition-colors cursor-pointer ${
                  isLight ? 'text-slate-400 hover:text-slate-700' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCustomerPaymentSubmit} className="mt-4 space-y-4">
              <div
                className={`p-3 rounded-lg border text-xs space-y-1 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0D0D0D] border-neutral-800'
                }`}
              >
                <div className="flex justify-between">
                  <span className={isLight ? 'text-slate-500' : 'text-neutral-400'}>{t.ledger.customerName}:</span>
                  <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{customerPayTarget.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isLight ? 'text-slate-500' : 'text-neutral-400'}>{t.ledger.owesStore}:</span>
                  <span className="font-mono font-bold text-orange-500">
                    {formatMoney(customerPayTarget.currentDebt)}
                  </span>
                </div>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                  {t.ledger.paymentAmount}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-mono">{currencySymbol}</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={customerPayAmount}
                    onChange={(e) => setCustomerPayAmount(e.target.value)}
                    className={`w-full pl-8 pr-4 py-2.5 border rounded-lg text-sm font-mono font-bold text-emerald-500 focus:outline-hidden focus:border-emerald-600 ${
                      isLight ? 'bg-slate-50 border-slate-300' : 'bg-[#0D0D0D] border-neutral-800'
                    }`}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                  {t.ledger.paymentMethod}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomerPayMethod('cash')}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                      customerPayMethod === 'cash'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/50'
                        : isLight
                        ? 'border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900'
                        : 'border-neutral-800 bg-[#0D0D0D] text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Banknote className="w-4 h-4 text-emerald-500" />
                    <span>{t.ledger.cashPayment}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomerPayMethod('card')}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                      customerPayMethod === 'card'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/50'
                        : isLight
                        ? 'border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900'
                        : 'border-neutral-800 bg-[#0D0D0D] text-neutral-400 hover:text-white'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-emerald-500" />
                    <span>{t.ledger.cardPayment}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                  {t.ledger.notesOptional}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Paid in full on Friday"
                  value={customerPayNotes}
                  onChange={(e) => setCustomerPayNotes(e.target.value)}
                  className={`w-full text-xs p-2.5 border rounded-lg focus:outline-hidden focus:border-emerald-600 ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                      : 'bg-[#0D0D0D] border-neutral-800 text-white placeholder-neutral-600'
                  }`}
                />
              </div>

              <div className={`pt-2 flex items-center justify-between gap-2 border-t ${isLight ? 'border-slate-200' : 'border-neutral-800'}`}>
                <button
                  id="cancel-customer-pay-btn"
                  type="button"
                  onClick={() => setIsCustomerPayModalOpen(false)}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                    isLight
                      ? 'border-slate-300 text-slate-700 hover:bg-slate-100'
                      : 'border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                  }`}
                >
                  {t.ledger.cancel}
                </button>
                <button
                  id="confirm-customer-pay-btn"
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/50 cursor-pointer transition-colors"
                >
                  {t.ledger.recordPayment}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )}

      {/* Add New Customer Modal */}
      {isAddCustomerOpen && (
        <div
          id="add-customer-modal-backdrop"
          className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs p-3 sm:p-4"
        >
          <div className="min-h-full flex items-center justify-center py-4">
            <div
              className={`rounded-2xl max-w-md w-full p-6 shadow-2xl border my-auto text-neutral-300 animate-in fade-in zoom-in-95 duration-150 ${
                isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#121212] border-neutral-800 text-neutral-300'
              }`}
            >
            <div className={`flex items-center justify-between pb-3 border-b ${isLight ? 'border-slate-200' : 'border-neutral-800'}`}>
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                  isLight ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-emerald-950/40 text-emerald-400 border-emerald-900/50'
                }`}>
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {t.ledger.newCustomerModalTitle}
                  </h3>
                  <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                    {t.ledger.createTabDescription}
                  </p>
                </div>
              </div>
              <button
                id="close-add-customer-modal-btn"
                onClick={() => setIsAddCustomerOpen(false)}
                className={`p-1 rounded-lg transition-colors cursor-pointer ${
                  isLight ? 'text-slate-400 hover:text-slate-700' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="mt-4 space-y-4">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                  {t.ledger.customerName}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Robert Taylor"
                  value={newCustomerData.name}
                  onChange={(e) => setNewCustomerData({ ...newCustomerData, name: e.target.value })}
                  className={`w-full text-xs p-2.5 border rounded-lg focus:outline-hidden focus:border-emerald-600 ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                      : 'bg-[#0D0D0D] border-neutral-800 text-white placeholder-neutral-600'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                    {t.ledger.phone}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="(555) 000-0000"
                    value={newCustomerData.phone}
                    onChange={(e) => setNewCustomerData({ ...newCustomerData, phone: e.target.value })}
                    className={`w-full text-xs p-2.5 border rounded-lg focus:outline-hidden focus:border-emerald-600 ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                        : 'bg-[#0D0D0D] border-neutral-800 text-white placeholder-neutral-600'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                    {t.ledger.creditLimit} ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newCustomerData.debtLimit}
                    onChange={(e) =>
                      setNewCustomerData({ ...newCustomerData, debtLimit: parseFloat(e.target.value) || 0 })
                    }
                    className={`w-full text-xs font-mono p-2.5 border rounded-lg focus:outline-hidden focus:border-emerald-600 ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-900'
                        : 'bg-[#0D0D0D] border-neutral-800 text-white'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                  {t.ledger.email} ({t.ledger.optionalLabel})
                </label>
                <input
                  type="email"
                  placeholder="robert@example.com"
                  value={newCustomerData.email}
                  onChange={(e) => setNewCustomerData({ ...newCustomerData, email: e.target.value })}
                  className={`w-full text-xs p-2.5 border rounded-lg focus:outline-hidden focus:border-emerald-600 ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                      : 'bg-[#0D0D0D] border-neutral-800 text-white placeholder-neutral-600'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                  {t.ledger.initialDebtLabel} ({currencySymbol})
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newCustomerData.initialDebt}
                  onChange={(e) =>
                    setNewCustomerData({ ...newCustomerData, initialDebt: parseFloat(e.target.value) || 0 })
                  }
                  className={`w-full text-xs font-mono p-2.5 border rounded-lg focus:outline-hidden focus:border-emerald-600 ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900'
                      : 'bg-[#0D0D0D] border-neutral-800 text-white'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                  {t.ledger.notesAndTermsLabel}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Regular customer, pays bi-weekly"
                  value={newCustomerData.notes}
                  onChange={(e) => setNewCustomerData({ ...newCustomerData, notes: e.target.value })}
                  className={`w-full text-xs p-2.5 border rounded-lg focus:outline-hidden focus:border-emerald-600 ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                      : 'bg-[#0D0D0D] border-neutral-800 text-white placeholder-neutral-600'
                  }`}
                />
              </div>

              <div className={`pt-2 flex items-center justify-between gap-2 border-t ${isLight ? 'border-slate-200' : 'border-neutral-800'}`}>
                <button
                  id="cancel-add-customer-btn"
                  type="button"
                  onClick={() => setIsAddCustomerOpen(false)}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                    isLight
                      ? 'border-slate-300 text-slate-700 hover:bg-slate-100'
                      : 'border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                  }`}
                >
                  {t.ledger.cancel}
                </button>
                <button
                  id="confirm-add-customer-btn"
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/50 cursor-pointer transition-colors"
                >
                  {t.ledger.saveCustomer}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )}

      {/* Edit Customer Modal */}
      {editingCustomer && (
        <div
          id="edit-customer-modal-backdrop"
          className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150"
        >
          <div className="min-h-full flex items-center justify-center py-4">
            <div
              id="edit-customer-modal"
              className={`rounded-2xl max-w-md w-full p-6 shadow-2xl border my-auto animate-in fade-in zoom-in-95 duration-150 ${
                isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#121212] border-neutral-800 text-neutral-300'
              }`}
            >
            <div className={`flex items-center justify-between pb-3 border-b ${isLight ? 'border-slate-200' : 'border-neutral-800'}`}>
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                  isLight ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-emerald-950/40 text-emerald-400 border-emerald-900/50'
                }`}>
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {t.ledger.editCustomerModalTitle}
                  </h3>
                  <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                    {editingCustomer.name}
                  </p>
                </div>
              </div>
              <button
                id="close-edit-customer-modal-btn"
                onClick={() => setEditingCustomer(null)}
                className={`p-1 rounded-lg transition-colors cursor-pointer ${
                  isLight ? 'text-slate-400 hover:text-slate-700' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Debt Info Callout */}
            <div className={`mt-4 p-3 rounded-xl border flex items-center justify-between text-xs ${
              editingCustomer.currentDebt > 0
                ? isLight
                  ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                  : 'bg-amber-950/20 border-amber-900/40 text-amber-300'
                : isLight
                ? 'bg-slate-50 border-slate-200 text-slate-600'
                : 'bg-neutral-900/40 border-neutral-800 text-neutral-400'
            }`}>
              <span className="font-medium">{t.ledger.owesStore}:</span>
              <span className="font-mono font-bold text-sm">
                {formatMoney(editingCustomer.currentDebt)}
              </span>
            </div>

            <form onSubmit={handleEditCustomerSubmit} className="mt-4 space-y-4">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                  {t.ledger.customerName}
                </label>
                <input
                  id="edit-customer-name-input"
                  type="text"
                  required
                  value={editCustomerData.name}
                  onChange={(e) => setEditCustomerData({ ...editCustomerData, name: e.target.value })}
                  className={`w-full text-xs p-2.5 border rounded-lg focus:outline-hidden focus:border-emerald-600 ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                      : 'bg-[#0D0D0D] border-neutral-800 text-white placeholder-neutral-600'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                    {t.ledger.phone}
                  </label>
                  <input
                    id="edit-customer-phone-input"
                    type="text"
                    required
                    value={editCustomerData.phone}
                    onChange={(e) => setEditCustomerData({ ...editCustomerData, phone: e.target.value })}
                    className={`w-full text-xs p-2.5 border rounded-lg focus:outline-hidden focus:border-emerald-600 ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                        : 'bg-[#0D0D0D] border-neutral-800 text-white placeholder-neutral-600'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                    {t.ledger.creditLimit} ({currencySymbol})
                  </label>
                  <input
                    id="edit-customer-limit-input"
                    type="number"
                    min="0"
                    step="1"
                    value={editCustomerData.debtLimit}
                    onChange={(e) =>
                      setEditCustomerData({ ...editCustomerData, debtLimit: parseFloat(e.target.value) || 0 })
                    }
                    className={`w-full text-xs font-mono p-2.5 border rounded-lg focus:outline-hidden focus:border-emerald-600 ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-900'
                        : 'bg-[#0D0D0D] border-neutral-800 text-white'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                  {t.ledger.email} ({t.ledger.optionalLabel})
                </label>
                <input
                  id="edit-customer-email-input"
                  type="email"
                  value={editCustomerData.email}
                  onChange={(e) => setEditCustomerData({ ...editCustomerData, email: e.target.value })}
                  className={`w-full text-xs p-2.5 border rounded-lg focus:outline-hidden focus:border-emerald-600 ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                      : 'bg-[#0D0D0D] border-neutral-800 text-white placeholder-neutral-600'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                  {t.ledger.notesAndTermsLabel}
                </label>
                <input
                  id="edit-customer-notes-input"
                  type="text"
                  value={editCustomerData.notes}
                  onChange={(e) => setEditCustomerData({ ...editCustomerData, notes: e.target.value })}
                  className={`w-full text-xs p-2.5 border rounded-lg focus:outline-hidden focus:border-emerald-600 ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                      : 'bg-[#0D0D0D] border-neutral-800 text-white placeholder-neutral-600'
                  }`}
                />
              </div>

              <div className={`pt-3 flex items-center justify-between gap-2 border-t ${isLight ? 'border-slate-200' : 'border-neutral-800'}`}>
                <button
                  id="cancel-edit-customer-btn"
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                    isLight
                      ? 'border-slate-300 text-slate-700 hover:bg-slate-100'
                      : 'border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                  }`}
                >
                  {t.ledger.cancel}
                </button>
                <button
                  id="save-edit-customer-btn"
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/50 cursor-pointer transition-colors"
                >
                  {t.ledger.saveChanges}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )}

      {/* Delete Customer Confirmation Modal */}
      {customerToDelete && (
        <div
          id="delete-customer-modal-backdrop"
          className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150"
        >
          <div className="min-h-full flex items-center justify-center py-4">
            <div
              id="delete-customer-modal"
              className={`rounded-2xl max-w-md w-full p-6 shadow-2xl border my-auto animate-in fade-in zoom-in-95 duration-150 ${
                isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#121212] border-neutral-800 text-neutral-300'
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
                    {t.ledger.confirmDeleteCustomerTitle}
                  </h3>
                  <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                    {customerToDelete.name}
                  </p>
                </div>
              </div>
              <button
                id="close-delete-customer-modal-btn"
                onClick={() => setCustomerToDelete(null)}
                className={`p-1 rounded-lg transition-colors cursor-pointer ${
                  isLight ? 'text-slate-400 hover:text-slate-700' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className={`text-xs mt-3 leading-relaxed ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
              {t.ledger.confirmDeleteCustomerMsg}
            </p>

            {/* Customer Details Box */}
            <div className={`mt-4 p-3.5 rounded-xl border space-y-2 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0D0D0D] border-neutral-800'
            }`}>
              <div className="flex justify-between items-center text-xs">
                <span className={`font-semibold ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                  {t.ledger.customerName}:
                </span>
                <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {customerToDelete.name}
                </span>
              </div>
              {customerToDelete.phone && (
                <div className="flex justify-between items-center text-xs">
                  <span className={`font-semibold ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                    {t.ledger.phone}:
                  </span>
                  <span className="font-mono">{customerToDelete.phone}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-xs pt-1 border-t border-dashed border-slate-200 dark:border-neutral-800">
                <span className={`font-semibold ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                  {t.ledger.owesStore}:
                </span>
                <span className={`font-bold font-mono ${customerToDelete.currentDebt > 0 ? 'text-orange-500' : 'text-emerald-500'}`}>
                  {formatMoney(customerToDelete.currentDebt)}
                </span>
              </div>
            </div>

            {customerToDelete.currentDebt > 0 && (
              <div className="mt-3 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>
                  {`${t.ledger.customerBalanceWarning} ${formatMoney(customerToDelete.currentDebt)}.`}
                </span>
              </div>
            )}

            {/* Actions */}
            <div className={`mt-6 pt-3 flex items-center justify-between gap-2.5 border-t ${
              isLight ? 'border-slate-200' : 'border-neutral-800'
            }`}>
              <button
                id="cancel-delete-customer-btn"
                type="button"
                onClick={() => setCustomerToDelete(null)}
                disabled={isDeletingCustomer}
                className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                  isLight
                    ? 'border-slate-300 text-slate-700 hover:bg-slate-100'
                    : 'border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                {t.ledger.cancel}
              </button>
              <button
                id="confirm-delete-customer-btn"
                type="button"
                onClick={confirmDeleteCustomer}
                disabled={isDeletingCustomer}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-950/50 cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t.ledger.deleteCustomerConfirmBtn}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </div>
  );
};
