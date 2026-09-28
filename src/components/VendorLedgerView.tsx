import React, { useState, useMemo } from 'react';
import {
  Truck,
  Plus,
  Search,
  DollarSign,
  FileText,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  Phone,
  Building2,
  Receipt,
  CreditCard,
  Edit2,
  Trash2,
  Banknote,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react';
import { Vendor, VendorLedgerEntry } from '../types';
import { dbService } from '../services/db';
import { sound } from '../utils/audio';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../theme/ThemeContext';
import { useCurrency } from '../currency/CurrencyContext';

interface VendorLedgerViewProps {
  vendors: Vendor[];
  vendorLedgers: VendorLedgerEntry[];
  onRefreshData: () => void;
  isOnline: boolean;
}

export const VendorLedgerView: React.FC<VendorLedgerViewProps> = ({
  vendors,
  vendorLedgers,
  onRefreshData,
  isOnline,
}) => {
  const { t, language } = useLanguage();
  const { formatMoney, formatSecondaryMoney, currencySymbol } = useCurrency();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [searchQuery, setSearchQuery] = useState('');
  const [statementVendor, setStatementVendor] = useState<Vendor | null>(null);

  // Edit Vendor Modal State
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [editVendorData, setEditVendorData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    categorySupplied: '',
    paymentTerms: 'Net 30',
    notes: '',
  });

  // Delete Vendor Confirmation State
  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);
  const [isDeletingVendor, setIsDeletingVendor] = useState(false);

  // Vendor Payment Modal State
  const [isVendorPayModalOpen, setIsVendorPayModalOpen] = useState(false);
  const [vendorPayTarget, setVendorPayTarget] = useState<Vendor | null>(null);
  const [vendorPayAmount, setVendorPayAmount] = useState<string>('');
  const [vendorPayMethod, setVendorPayMethod] = useState<string>('Bank Transfer');
  const [vendorPayNotes, setVendorPayNotes] = useState<string>('');

  // New Vendor Supply Bill Modal
  const [isVendorBillModalOpen, setIsVendorBillModalOpen] = useState(false);
  const [vendorBillTarget, setVendorBillTarget] = useState<Vendor | null>(null);
  const [billAmount, setBillAmount] = useState<string>('');
  const [billInvoiceNo, setBillInvoiceNo] = useState<string>('');
  const [billNotes, setBillNotes] = useState<string>('');

  // Add Vendor Modal State
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);
  const [newVendorData, setNewVendorData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    categorySupplied: '',
    outstandingPayable: 0,
    paymentTerms: 'Net 30',
    notes: '',
  });

  // KPIs
  const vendorStats = useMemo(() => {
    const totalPayable = vendors.reduce((acc, v) => acc + v.outstandingPayable, 0);
    const pendingVendors = vendors.filter((v) => v.outstandingPayable > 0).length;
    const activeVendors = vendors.length;
    return { totalPayable, pendingVendors, activeVendors };
  }, [vendors]);

  // Filtered vendors
  const filteredVendors = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return vendors;
    return vendors.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.contactPerson.toLowerCase().includes(q) ||
        v.categorySupplied.toLowerCase().includes(q)
    );
  }, [vendors, searchQuery]);

  // Open Edit Vendor Modal
  const openEditVendorModal = (v: Vendor) => {
    setEditingVendor(v);
    setEditVendorData({
      name: v.name,
      contactPerson: v.contactPerson,
      phone: v.phone,
      email: v.email || '',
      categorySupplied: v.categorySupplied,
      paymentTerms: v.paymentTerms,
      notes: v.notes || '',
    });
  };

  // Handle Update Vendor
  const handleUpdateVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVendor) return;

    sound.success();
    const updated: Vendor = {
      ...editingVendor,
      name: editVendorData.name.trim(),
      contactPerson: editVendorData.contactPerson.trim(),
      phone: editVendorData.phone.trim(),
      email: editVendorData.email.trim() || undefined,
      categorySupplied: editVendorData.categorySupplied.trim() || 'General Supplies',
      paymentTerms: editVendorData.paymentTerms,
      notes: editVendorData.notes.trim() || undefined,
      updatedAt: Date.now(),
    };

    dbService.saveVendor(updated);
    if (statementVendor?.id === updated.id) {
      setStatementVendor(updated);
    }
    onRefreshData();
    setEditingVendor(null);
  };

  // Handle Confirm Delete Vendor
  const confirmDeleteVendor = () => {
    if (!vendorToDelete) return;
    setIsDeletingVendor(true);
    try {
      sound.scan();
      dbService.deleteVendor(vendorToDelete.id);
      if (statementVendor?.id === vendorToDelete.id) {
        setStatementVendor(null);
      }
      onRefreshData();
      setVendorToDelete(null);
    } finally {
      setIsDeletingVendor(false);
    }
  };

  // Handle Vendor Payment Submit
  const handleVendorPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorPayTarget) return;
    const amount = parseFloat(vendorPayAmount);
    if (isNaN(amount) || amount <= 0) {
      alert(t.alerts.validPaymentRequired);
      return;
    }

    sound.success();
    dbService.recordVendorPayment(
      vendorPayTarget.id,
      amount,
      vendorPayMethod,
      vendorPayNotes || undefined
    );
    onRefreshData();
    setIsVendorPayModalOpen(false);
    setVendorPayAmount('');
    setVendorPayNotes('');
    if (statementVendor?.id === vendorPayTarget.id) {
      const updated = dbService.getVendors().find((v) => v.id === vendorPayTarget.id) || null;
      setStatementVendor(updated);
    }
  };

  // Handle Vendor Bill Submit
  const handleVendorBillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorBillTarget) return;
    const amount = parseFloat(billAmount);
    if (isNaN(amount) || amount <= 0) {
      alert(t.alerts.validInvoiceRequired);
      return;
    }

    dbService.recordVendorSupplyBill(
      vendorBillTarget.id,
      amount,
      billInvoiceNo || `INV-${Date.now().toString().slice(-5)}`,
      billNotes || undefined
    );
    onRefreshData();
    setIsVendorBillModalOpen(false);
    setBillAmount('');
    setBillInvoiceNo('');
    setBillNotes('');
    if (statementVendor?.id === vendorBillTarget.id) {
      const updated = dbService.getVendors().find((v) => v.id === vendorBillTarget.id) || null;
      setStatementVendor(updated);
    }
  };

  // Handle Create Vendor
  const handleCreateVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendorData.name) return;

    const newVend: Vendor = {
      id: `vend-${Date.now()}`,
      name: newVendorData.name,
      contactPerson: newVendorData.contactPerson,
      phone: newVendorData.phone,
      email: newVendorData.email || undefined,
      categorySupplied: newVendorData.categorySupplied || 'General Supplies',
      outstandingPayable: Number(newVendorData.outstandingPayable) || 0,
      paymentTerms: newVendorData.paymentTerms || 'Net 30',
      notes: newVendorData.notes || undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    dbService.saveVendor(newVend);
    if (newVend.outstandingPayable > 0) {
      dbService.recordVendorSupplyBill(
        newVend.id,
        newVend.outstandingPayable,
        `OPEN-PAY-${newVend.id.slice(-4)}`,
        'Initial payable carried forward'
      );
    }

    onRefreshData();
    setIsAddVendorOpen(false);
    setNewVendorData({
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      categorySupplied: '',
      outstandingPayable: 0,
      paymentTerms: 'Net 30',
      notes: '',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h2 className={`text-xl font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {t.ledger.vendorTitle}
            </h2>
            <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
              {t.ledger.vendorSubtitle}
            </p>
          </div>
        </div>

        <button
          id="add-vendor-top-btn"
          onClick={() => setIsAddVendorOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-950/50 cursor-pointer transition-colors shrink-0 justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>{t.ledger.newVendorBtn}</span>
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
            {t.ledger.totalVendorPayables}
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-500 mt-1">
            {formatMoney(vendorStats.totalPayable)}
          </div>
          <span className={`text-[10px] mt-0.5 block ${isLight ? 'text-slate-400' : 'text-neutral-500'}`}>
            {`${vendorStats.pendingVendors} ${t.ledger.accountsWithDebtCount}`}
          </span>
        </div>

        <div
          className={`p-4 rounded-xl border shadow-xs ${
            isLight ? 'bg-white border-slate-200' : 'bg-neutral-900 border-neutral-800'
          }`}
        >
          <span className={`text-[11px] font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
            {t.ledger.suppliersWithBalanceCount}
          </span>
          <div className="text-2xl font-bold font-mono text-orange-500 mt-1">
            {vendorStats.pendingVendors}
          </div>
          <span className={`text-[10px] mt-0.5 block ${isLight ? 'text-slate-400' : 'text-neutral-500'}`}>
            {t.ledger.openBillsNotice}
          </span>
        </div>

        <div
          className={`p-4 rounded-xl border shadow-xs ${
            isLight ? 'bg-white border-slate-200' : 'bg-neutral-900 border-neutral-800'
          }`}
        >
          <span className={`text-[11px] font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
            {t.ledger.activeVendors}
          </span>
          <div className={`text-2xl font-bold font-mono mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {vendorStats.activeVendors}
          </div>
          <span className={`text-[10px] mt-0.5 block text-emerald-500 font-medium`}>
            {t.ledger.activeSuppliersCount}
          </span>
        </div>
      </div>

      {/* Search and Quick Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t.ledger.searchVendors}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-9 pr-4 py-2 border rounded-lg text-xs font-medium focus:outline-hidden focus:border-emerald-500 shadow-xs ${
              isLight
                ? 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                : 'bg-[#0D0D0D] border-neutral-800 text-white placeholder-neutral-500'
            }`}
          />
        </div>
      </div>

      {/* Vendor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVendors.map((v) => (
          <div
            key={v.id}
            id={`vendor-card-${v.id}`}
            className={`rounded-xl border p-4 shadow-xs transition-all flex flex-col justify-between space-y-3 ${
              isLight
                ? 'bg-white border-slate-200 hover:border-slate-300'
                : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
            }`}
          >
            <div>
              {/* Vendor Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h4 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>{v.name}</h4>
                  <div className={`flex items-center gap-1.5 text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                    <span>{v.contactPerson}</span>
                    <span>•</span>
                    <Phone className="w-3 h-3" />
                    <span>{v.phone}</span>
                  </div>
                  <span
                    className={`inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded border ${
                      isLight
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-emerald-950/40 text-emerald-300 border-emerald-900/50'
                    }`}
                  >
                    {v.categorySupplied}
                  </span>
                </div>
              </div>

              {v.notes && (
                <p
                  className={`text-[11px] mt-2 p-2 rounded border ${
                    isLight
                      ? 'bg-slate-50 text-slate-700 border-slate-200'
                      : 'bg-[#0D0D0D] text-neutral-300 border-neutral-800'
                  }`}
                >
                  {v.notes}
                </p>
              )}

              {/* Debt & Payment Terms Breakdown */}
              <div
                className={`mt-3 pt-3 border-t space-y-2 ${
                  isLight ? 'border-slate-100' : 'border-neutral-800'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className={`text-[10px] uppercase font-semibold block ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                      {t.ledger.outstandingBill}
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className={`font-mono font-bold text-sm ${v.outstandingPayable > 0 ? 'text-orange-500' : (isLight ? 'text-slate-800' : 'text-white')}`}>
                        {formatMoney(v.outstandingPayable)}
                      </span>
                      {v.outstandingPayable > 0 && (
                        <span className={`text-[10px] font-mono ${isLight ? 'text-slate-400' : 'text-neutral-500'}`}>
                          (≈ {formatSecondaryMoney(v.outstandingPayable)})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-[10px] uppercase font-semibold block ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                      {t.ledger.terms}
                    </span>
                    <span className={`font-mono font-bold text-xs ${isLight ? 'text-slate-700' : 'text-neutral-300'}`}>
                      {v.paymentTerms}
                    </span>
                  </div>
                </div>

                {/* Visual Status Indicator Bar */}
                <div className="space-y-1">
                  <div className={`w-full h-2 rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-neutral-800'}`}>
                    <div
                      className={`h-full rounded-full transition-all ${
                        v.outstandingPayable > 0 ? 'bg-orange-500 w-full' : 'bg-emerald-500 w-full'
                      }`}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px]">
                    <span className={v.outstandingPayable > 0 ? 'text-orange-500 font-medium' : 'text-emerald-500 font-medium'}>
                      {v.outstandingPayable > 0
                        ? t.ledger.openBillsNotice
                        : t.ledger.zeroBalanceNotice}
                    </span>
                    <span className={isLight ? 'text-slate-400' : 'text-neutral-500'}>
                      {t.ledger.terms}
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
                {vendorLedgers.filter((l) => l.vendorId === v.id).length}{' '}
                {t.ledger.recordsCount}
              </div>

              <div className="flex items-center gap-1.5">
                {/* View Statement Button with Tooltip */}
                <div className="relative group/statement flex items-center justify-center">
                  <button
                    id={`view-vendor-statement-btn-${v.id}`}
                    onClick={() => setStatementVendor(v)}
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

                {/* Record Bill Button with Tooltip */}
                <div className="relative group/bill flex items-center justify-center">
                  <button
                    id={`record-vendor-bill-btn-${v.id}`}
                    onClick={() => {
                      setVendorBillTarget(v);
                      setBillInvoiceNo(`INV-${Math.floor(1000 + Math.random() * 9000)}`);
                      setIsVendorBillModalOpen(true);
                    }}
                    className={`p-2 rounded-lg transition-colors cursor-pointer border flex items-center justify-center shadow-2xs ${
                      isLight
                        ? 'bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border-slate-200 hover:border-emerald-300'
                        : 'bg-neutral-800 hover:bg-emerald-950/40 text-neutral-400 hover:text-emerald-400 border-neutral-700 hover:border-emerald-800/60'
                    }`}
                    title={t.ledger.recordBillBtn}
                    aria-label={t.ledger.recordBillBtn}
                  >
                    <Receipt className="w-3.5 h-3.5" />
                  </button>

                  {/* Floating Tooltip */}
                  <div
                    role="tooltip"
                    className="pointer-events-none absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 hidden group-hover/bill:flex flex-col items-center z-30 whitespace-nowrap animate-in fade-in duration-100"
                  >
                    <div
                      className={`px-2 py-0.5 text-[10px] font-semibold rounded-md shadow-lg font-sans border ${
                        isLight
                          ? 'text-emerald-900 bg-white border-emerald-200 shadow-slate-200'
                          : 'text-white bg-neutral-900 border-neutral-700'
                      }`}
                    >
                      {t.ledger.recordBillBtn}
                    </div>
                    <div
                      className={`w-1.5 h-1 border-x-3 border-x-transparent border-t-3 -mt-px ${
                        isLight ? 'border-t-white' : 'border-t-neutral-900'
                      }`}
                    />
                  </div>
                </div>

                {/* Edit Vendor Button with Tooltip */}
                <div className="relative group/edit flex items-center justify-center">
                  <button
                    id={`edit-vendor-btn-${v.id}`}
                    onClick={() => openEditVendorModal(v)}
                    className={`p-2 rounded-lg transition-colors cursor-pointer border flex items-center justify-center shadow-2xs ${
                      isLight
                        ? 'bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border-slate-200 hover:border-emerald-300'
                        : 'bg-neutral-800 hover:bg-emerald-950/40 text-neutral-400 hover:text-emerald-400 border-neutral-700 hover:border-emerald-800/60'
                    }`}
                    title={t.ledger.editVendor}
                    aria-label={t.ledger.editVendor}
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
                      {t.ledger.editVendor}
                    </div>
                    <div
                      className={`w-1.5 h-1 border-x-3 border-x-transparent border-t-3 -mt-px ${
                        isLight ? 'border-t-white' : 'border-t-neutral-900'
                      }`}
                    />
                  </div>
                </div>

                {/* Delete Vendor Button with Tooltip */}
                <div className="relative group/delete flex items-center justify-center">
                  <button
                    id={`delete-vendor-btn-${v.id}`}
                    onClick={() => setVendorToDelete(v)}
                    className={`p-2 rounded-lg transition-colors cursor-pointer border flex items-center justify-center shadow-2xs ${
                      isLight
                        ? 'bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border-slate-200 hover:border-rose-200'
                        : 'bg-neutral-800 hover:bg-rose-950/40 text-neutral-400 hover:text-rose-400 border-neutral-700 hover:border-rose-800/50'
                    }`}
                    title={t.ledger.deleteVendor}
                    aria-label={t.ledger.deleteVendor}
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
                      {t.ledger.deleteVendor}
                    </div>
                    <div
                      className={`w-1.5 h-1 border-x-3 border-x-transparent border-t-3 -mt-px ${
                        isLight ? 'border-t-white' : 'border-t-neutral-900'
                      }`}
                    />
                  </div>
                </div>

                {/* Pay Vendor Button with Tooltip */}
                {v.outstandingPayable > 0 && (
                  <div className="relative group/pay flex items-center justify-center">
                    <button
                      id={`pay-vendor-btn-${v.id}`}
                      onClick={() => {
                        setVendorPayTarget(v);
                        setVendorPayAmount(v.outstandingPayable.toFixed(2));
                        setIsVendorPayModalOpen(true);
                      }}
                      className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-xs transition-colors cursor-pointer flex items-center justify-center border border-emerald-500/50"
                      title={t.ledger.payVendorBtn}
                      aria-label={t.ledger.payVendorBtn}
                    >
                      <Banknote className="w-3.5 h-3.5 text-white" />
                    </button>

                    {/* Floating Tooltip */}
                    <div
                      role="tooltip"
                      className="pointer-events-none absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 hidden group-hover/pay:flex flex-col items-center z-30 whitespace-nowrap animate-in fade-in duration-100"
                    >
                      <div
                        className={`px-2 py-0.5 text-[10px] font-semibold rounded-md shadow-lg font-sans border ${
                          isLight
                            ? 'text-emerald-800 bg-white border-emerald-200 shadow-slate-200'
                            : 'text-white bg-neutral-900 border-neutral-700'
                        }`}
                      >
                        {t.ledger.payVendorBtn}
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
        ))}
      </div>

      {/* 1. Vendor Payment Modal */}
      {isVendorPayModalOpen && vendorPayTarget && (
        <div
          id="vendor-pay-modal-backdrop"
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
                    {t.ledger.payVendorModalTitle}
                  </h3>
                  <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                    {vendorPayTarget.name} • {formatMoney(vendorPayTarget.outstandingPayable)}
                  </p>
                </div>
              </div>
              <button
                id="close-vendor-pay-modal-btn"
                onClick={() => setIsVendorPayModalOpen(false)}
                className={`p-1 rounded-lg transition-colors cursor-pointer ${
                  isLight ? 'text-slate-400 hover:text-slate-700' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleVendorPaymentSubmit} className="mt-4 space-y-4">
              <div
                className={`p-3 rounded-lg border text-xs space-y-1 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0D0D0D] border-neutral-800'
                }`}
              >
                <div className="flex justify-between">
                  <span className={isLight ? 'text-slate-500' : 'text-neutral-400'}>{t.ledger.vendorName}:</span>
                  <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{vendorPayTarget.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isLight ? 'text-slate-500' : 'text-neutral-400'}>{t.ledger.outstandingBill}:</span>
                  <span className="font-mono font-bold text-emerald-500">
                    {formatMoney(vendorPayTarget.outstandingPayable)}
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
                    value={vendorPayAmount}
                    onChange={(e) => setVendorPayAmount(e.target.value)}
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
                <select
                  value={vendorPayMethod}
                  onChange={(e) => setVendorPayMethod(e.target.value)}
                  className={`w-full text-xs p-2.5 border rounded-lg focus:outline-hidden focus:border-emerald-600 ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900'
                      : 'bg-[#0D0D0D] border-neutral-800 text-white'
                  }`}
                >
                  <option value="Bank Wire / ACH">
                    {t.ledger.bankTransferACH}
                  </option>
                  <option value="Company Check">
                    {t.ledger.companyCheck}
                  </option>
                  <option value="Corporate Card">
                    {t.ledger.corporateCard}
                  </option>
                  <option value="Store Cash">
                    {t.ledger.registerCashPayment}
                  </option>
                </select>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                  {t.ledger.paymentRefNumber}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Check #4092 or Wire Trans ID"
                  value={vendorPayNotes}
                  onChange={(e) => setVendorPayNotes(e.target.value)}
                  className={`w-full text-xs p-2.5 border rounded-lg focus:outline-hidden focus:border-emerald-600 ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                      : 'bg-[#0D0D0D] border-neutral-800 text-white placeholder-neutral-600'
                  }`}
                />
              </div>

              <div className={`pt-2 flex items-center justify-between gap-2 border-t ${isLight ? 'border-slate-200' : 'border-neutral-800'}`}>
                <button
                  id="cancel-vendor-pay-btn"
                  type="button"
                  onClick={() => setIsVendorPayModalOpen(false)}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                    isLight
                      ? 'border-slate-300 text-slate-700 hover:bg-slate-100'
                      : 'border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                  }`}
                >
                  {t.ledger.cancel}
                </button>
                <button
                  id="confirm-vendor-pay-btn"
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/50 cursor-pointer transition-colors"
                >
                  {t.ledger.disbursePayment}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )}

      {/* 2. Record Vendor Bill Modal */}
      {isVendorBillModalOpen && vendorBillTarget && (
        <div
          id="vendor-bill-modal-backdrop"
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
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {t.ledger.recordBillModalTitle}
                  </h3>
                  <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                    {vendorBillTarget.name}
                  </p>
                </div>
              </div>
              <button
                id="close-vendor-bill-modal-btn"
                onClick={() => setIsVendorBillModalOpen(false)}
                className={`p-1 rounded-lg transition-colors cursor-pointer ${
                  isLight ? 'text-slate-400 hover:text-slate-700' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleVendorBillSubmit} className="mt-4 space-y-4">
              <div
                className={`p-3 rounded-lg border text-xs ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0D0D0D] border-neutral-800'
                }`}
              >
                <span className={isLight ? 'text-slate-500' : 'text-neutral-400'}>{t.ledger.vendorName}:</span>
                <span className={`ml-1 font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{vendorBillTarget.name}</span>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                  {t.ledger.invoiceNumber}
                </label>
                <input
                  type="text"
                  required
                  value={billInvoiceNo}
                  onChange={(e) => setBillInvoiceNo(e.target.value)}
                  placeholder="e.g. INV-2026-881"
                  className={`w-full text-xs font-mono p-2.5 border rounded-lg focus:outline-hidden focus:border-emerald-600 ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                      : 'bg-[#0D0D0D] border-neutral-800 text-white placeholder-neutral-600'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                  {t.ledger.invoiceAmount}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-mono">{currencySymbol}</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={billAmount}
                    onChange={(e) => setBillAmount(e.target.value)}
                    className={`w-full pl-8 pr-4 py-2.5 border rounded-lg text-sm font-mono font-bold text-emerald-500 focus:outline-hidden focus:border-emerald-600 ${
                      isLight ? 'bg-slate-50 border-slate-300' : 'bg-[#0D0D0D] border-neutral-800'
                    }`}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                  {t.ledger.itemsSuppliedDesc}
                </label>
                <input
                  type="text"
                  placeholder="e.g. 10 cases sparkling water + 5 boxes tea"
                  value={billNotes}
                  onChange={(e) => setBillNotes(e.target.value)}
                  className={`w-full text-xs p-2.5 border rounded-lg focus:outline-hidden focus:border-emerald-600 ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                      : 'bg-[#0D0D0D] border-neutral-800 text-white placeholder-neutral-600'
                  }`}
                />
              </div>

              <div className={`pt-2 flex items-center justify-between gap-2 border-t ${isLight ? 'border-slate-200' : 'border-neutral-800'}`}>
                <button
                  id="cancel-vendor-bill-btn"
                  type="button"
                  onClick={() => setIsVendorBillModalOpen(false)}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                    isLight
                      ? 'border-slate-300 text-slate-700 hover:bg-slate-100'
                      : 'border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                  }`}
                >
                  {t.ledger.cancel}
                </button>
                <button
                  id="confirm-vendor-bill-btn"
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/50 cursor-pointer transition-colors"
                >
                  {t.ledger.recordBill}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )}

      {/* 3. Add New Vendor Modal */}
      {isAddVendorOpen && (
        <div
          id="add-vendor-modal-backdrop"
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
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {t.ledger.newVendorModalTitle}
                  </h3>
                  <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                    {t.ledger.registerVendorDescription}
                  </p>
                </div>
              </div>
              <button
                id="close-add-vendor-modal-btn"
                onClick={() => setIsAddVendorOpen(false)}
                className={`p-1 rounded-lg transition-colors cursor-pointer ${
                  isLight ? 'text-slate-400 hover:text-slate-700' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVendor} className="mt-4 space-y-4">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                  {t.ledger.vendorName}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pacific Coast Roasters Inc."
                  value={newVendorData.name}
                  onChange={(e) => setNewVendorData({ ...newVendorData, name: e.target.value })}
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
                    {t.ledger.contactPerson}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Connor"
                    value={newVendorData.contactPerson}
                    onChange={(e) => setNewVendorData({ ...newVendorData, contactPerson: e.target.value })}
                    className={`w-full text-xs p-2.5 border rounded-lg focus:outline-hidden focus:border-emerald-600 ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                        : 'bg-[#0D0D0D] border-neutral-800 text-white placeholder-neutral-600'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                    {t.ledger.phone}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="(555) 000-0000"
                    value={newVendorData.phone}
                    onChange={(e) => setNewVendorData({ ...newVendorData, phone: e.target.value })}
                    className={`w-full text-xs p-2.5 border rounded-lg focus:outline-hidden focus:border-emerald-600 ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                        : 'bg-[#0D0D0D] border-neutral-800 text-white placeholder-neutral-600'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                    {t.ledger.categorySupplied}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Coffee, Dairy, Produce"
                    value={newVendorData.categorySupplied}
                    onChange={(e) => setNewVendorData({ ...newVendorData, categorySupplied: e.target.value })}
                    className={`w-full text-xs p-2.5 border rounded-lg focus:outline-hidden focus:border-emerald-600 ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                        : 'bg-[#0D0D0D] border-neutral-800 text-white placeholder-neutral-600'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                    {t.ledger.terms}
                  </label>
                  <select
                    value={newVendorData.paymentTerms}
                    onChange={(e) => setNewVendorData({ ...newVendorData, paymentTerms: e.target.value })}
                    className={`w-full text-xs p-2.5 border rounded-lg focus:outline-hidden focus:border-emerald-600 ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-900'
                        : 'bg-[#0D0D0D] border-neutral-800 text-white'
                    }`}
                  >
                    <option value="Net 7">Net 7 Days</option>
                    <option value="Net 15">Net 15 Days</option>
                    <option value="Net 30">Net 30 Days</option>
                    <option value="COD (Cash on Delivery)">
                      {t.ledger.codTerms}
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                  {`${t.ledger.initialPayableLabel} (${currencySymbol})`}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newVendorData.outstandingPayable}
                  onChange={(e) =>
                    setNewVendorData({ ...newVendorData, outstandingPayable: parseFloat(e.target.value) || 0 })
                  }
                  className={`w-full text-xs font-mono p-2.5 border rounded-lg focus:outline-hidden focus:border-emerald-600 ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900'
                      : 'bg-[#0D0D0D] border-neutral-800 text-white'
                  }`}
                />
              </div>

              <div className={`pt-2 flex items-center justify-between gap-2 border-t ${isLight ? 'border-slate-200' : 'border-neutral-800'}`}>
                <button
                  id="cancel-add-vendor-btn"
                  type="button"
                  onClick={() => setIsAddVendorOpen(false)}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                    isLight
                      ? 'border-slate-300 text-slate-700 hover:bg-slate-100'
                      : 'border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                  }`}
                >
                  {t.ledger.cancel}
                </button>
                <button
                  id="confirm-add-vendor-btn"
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/50 cursor-pointer transition-colors"
                >
                  {t.ledger.saveVendor}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )}

      {/* 4. Vendor Ledger Statement / Transaction History Modal */}
      {statementVendor && (
        <div
          id="vendor-statement-modal-backdrop"
          className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150"
        >
          <div className="min-h-full flex items-center justify-center py-4">
            <div
              id="vendor-statement-modal"
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
                      statementVendor.outstandingPayable > 0
                        ? isLight
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-amber-950/40 text-amber-400 border border-amber-900/50'
                        : isLight
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/50'
                    }`}>
                      {statementVendor.outstandingPayable > 0
                        ? `${t.ledger.outstandingBill}: ${formatMoney(statementVendor.outstandingPayable)}`
                        : t.ledger.zeroBalance}
                    </span>
                  </div>
                  <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                    {statementVendor.name} • {statementVendor.contactPerson} {statementVendor.phone ? `• ${statementVendor.phone}` : ''}
                  </p>
                </div>
              </div>

              <button
                id="close-vendor-statement-modal-btn"
                onClick={() => setStatementVendor(null)}
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
                  {t.ledger.outstandingBill}
                </span>
                <span className="text-sm font-bold font-mono text-amber-500 mt-0.5 block">
                  {formatMoney(statementVendor.outstandingPayable)}
                </span>
              </div>
              <div>
                <span className={`text-[10px] uppercase font-semibold block ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                  {t.ledger.terms}
                </span>
                <span className={`text-sm font-bold font-mono mt-0.5 block ${isLight ? 'text-slate-800' : 'text-white'}`}>
                  {statementVendor.paymentTerms}
                </span>
              </div>
              <div>
                <span className={`text-[10px] uppercase font-semibold block ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                  {t.ledger.categorySupplied}
                </span>
                <span className="text-sm font-bold mt-0.5 block truncate text-emerald-500">
                  {statementVendor.categorySupplied}
                </span>
              </div>
            </div>

            {/* Transactions Header & List */}
            <div className="flex items-center justify-between pb-2 shrink-0">
              <h4 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-neutral-300'}`}>
                {t.ledger.transactionHistory}
              </h4>
              <span className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                {vendorLedgers.filter((l) => l.vendorId === statementVendor.id).length}{' '}
                {t.ledger.recordsCount}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[160px] max-h-[380px]">
              {vendorLedgers.filter((l) => l.vendorId === statementVendor.id).length === 0 ? (
                <div className={`py-12 text-center rounded-xl border border-dashed flex flex-col items-center justify-center gap-2 ${
                  isLight ? 'bg-slate-50/50 border-slate-200 text-slate-400' : 'bg-neutral-900/30 border-neutral-800 text-neutral-500'
                }`}>
                  <FileText className="w-8 h-8 opacity-40" />
                  <p className="text-xs italic">
                    {t.ledger.noTransactionsYet}
                  </p>
                </div>
              ) : (
                vendorLedgers
                  .filter((l) => l.vendorId === statementVendor.id)
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
                          entry.type === 'supply_invoice'
                            ? isLight
                              ? 'bg-amber-50 text-amber-600 border-amber-200'
                              : 'bg-amber-950/40 text-amber-400 border-amber-900/50'
                            : isLight
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                            : 'bg-emerald-950/40 text-emerald-400 border-emerald-900/50'
                        }`}>
                          {entry.type === 'supply_invoice' ? (
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div>
                          <div className={`font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>
                            {entry.type === 'supply_invoice'
                              ? t.ledger.supplyInvoice
                              : t.ledger.paymentDisbursed}
                          </div>
                          <div className={`text-[11px] font-mono mt-0.5 ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                            {new Date(entry.timestamp).toLocaleString()} • Ref: {entry.referenceInvoiceNumber}
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
                            entry.type === 'supply_invoice' ? 'text-amber-500' : 'text-emerald-500'
                          }`}
                        >
                          {entry.type === 'supply_invoice'
                            ? `+${formatMoney(entry.amount)}`
                            : `-${formatMoney(entry.amount)}`}
                        </span>
                        <span className={`block text-[10px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-neutral-500'}`}>
                          {t.ledger.balanceAfter}: <strong className={isLight ? 'text-slate-700' : 'text-neutral-300'}>{formatMoney(entry.balanceAfter)}</strong>
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
                id="close-vendor-statement-btn"
                type="button"
                onClick={() => setStatementVendor(null)}
                className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                  isLight
                    ? 'border-slate-300 text-slate-700 hover:bg-slate-100'
                    : 'border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                {t.common.close}
              </button>

              <div className="flex items-center gap-2">
                <button
                  id="statement-modal-record-bill-btn"
                  type="button"
                  onClick={() => {
                    const target = statementVendor;
                    setStatementVendor(null);
                    setVendorBillTarget(target);
                    setBillInvoiceNo(`INV-${Math.floor(1000 + Math.random() * 9000)}`);
                    setIsVendorBillModalOpen(true);
                  }}
                  className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer flex items-center gap-1.5 ${
                    isLight
                      ? 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      : 'border-neutral-700 bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  <Receipt className="w-4 h-4" />
                  <span>{t.ledger.recordBillBtn}</span>
                </button>

                {statementVendor.outstandingPayable > 0 && (
                  <button
                    id="statement-modal-pay-vendor-btn"
                    type="button"
                    onClick={() => {
                      const target = statementVendor;
                      setStatementVendor(null);
                      setVendorPayTarget(target);
                      setVendorPayAmount(target.outstandingPayable.toFixed(2));
                      setIsVendorPayModalOpen(true);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/50 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Banknote className="w-4 h-4" />
                    <span>{t.ledger.payVendorBtn}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

      {/* 5. Edit Vendor Modal */}
      {editingVendor && (
        <div
          id="edit-vendor-modal-backdrop"
          className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150"
        >
          <div className="min-h-full flex items-center justify-center py-4">
            <div
              id="edit-vendor-modal"
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
                    {t.ledger.editVendorModalTitle}
                  </h3>
                  <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                    {editingVendor.name}
                  </p>
                </div>
              </div>
              <button
                id="close-edit-vendor-modal-btn"
                onClick={() => setEditingVendor(null)}
                className={`p-1 rounded-lg transition-colors cursor-pointer ${
                  isLight ? 'text-slate-400 hover:text-slate-700' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Payable Info Callout */}
            <div className={`mt-4 p-3 rounded-xl border flex items-center justify-between text-xs ${
              editingVendor.outstandingPayable > 0
                ? isLight
                  ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                  : 'bg-amber-950/20 border-amber-900/40 text-amber-300'
                : isLight
                ? 'bg-slate-50 border-slate-200 text-slate-600'
                : 'bg-neutral-900/40 border-neutral-800 text-neutral-400'
            }`}>
              <span className="font-medium">{t.ledger.outstandingBill}:</span>
              <span className="font-mono font-bold text-sm text-emerald-500">
                {formatMoney(editingVendor.outstandingPayable)}
              </span>
            </div>

            <form onSubmit={handleUpdateVendor} className="mt-4 space-y-4">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                  {t.ledger.vendorName}
                </label>
                <input
                  id="edit-vendor-name-input"
                  type="text"
                  required
                  value={editVendorData.name}
                  onChange={(e) => setEditVendorData({ ...editVendorData, name: e.target.value })}
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
                    {t.ledger.contactPerson}
                  </label>
                  <input
                    id="edit-vendor-contact-input"
                    type="text"
                    required
                    value={editVendorData.contactPerson}
                    onChange={(e) => setEditVendorData({ ...editVendorData, contactPerson: e.target.value })}
                    className={`w-full text-xs p-2.5 border rounded-lg focus:outline-hidden focus:border-emerald-600 ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                        : 'bg-[#0D0D0D] border-neutral-800 text-white placeholder-neutral-600'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                    {t.ledger.phone}
                  </label>
                  <input
                    id="edit-vendor-phone-input"
                    type="text"
                    required
                    value={editVendorData.phone}
                    onChange={(e) => setEditVendorData({ ...editVendorData, phone: e.target.value })}
                    className={`w-full text-xs p-2.5 border rounded-lg focus:outline-hidden focus:border-emerald-600 ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                        : 'bg-[#0D0D0D] border-neutral-800 text-white placeholder-neutral-600'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                    {t.ledger.categorySupplied}
                  </label>
                  <input
                    id="edit-vendor-category-input"
                    type="text"
                    value={editVendorData.categorySupplied}
                    onChange={(e) => setEditVendorData({ ...editVendorData, categorySupplied: e.target.value })}
                    className={`w-full text-xs p-2.5 border rounded-lg focus:outline-hidden focus:border-emerald-600 ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                        : 'bg-[#0D0D0D] border-neutral-800 text-white placeholder-neutral-600'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                    {t.ledger.terms}
                  </label>
                  <select
                    id="edit-vendor-terms-select"
                    value={editVendorData.paymentTerms}
                    onChange={(e) => setEditVendorData({ ...editVendorData, paymentTerms: e.target.value })}
                    className={`w-full text-xs p-2.5 border rounded-lg focus:outline-hidden focus:border-emerald-600 ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-900'
                        : 'bg-[#0D0D0D] border-neutral-800 text-white'
                    }`}
                  >
                    <option value="Net 7">Net 7 Days</option>
                    <option value="Net 15">Net 15 Days</option>
                    <option value="Net 30">Net 30 Days</option>
                    <option value="Net 60">Net 60 Days</option>
                    <option value="Due on Receipt">
                      {t.ledger.dueOnReceiptTerms}
                    </option>
                    <option value="COD (Cash on Delivery)">
                      {t.ledger.codTerms}
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                  {t.ledger.email} ({t.ledger.optionalLabel})
                </label>
                <input
                  id="edit-vendor-email-input"
                  type="email"
                  value={editVendorData.email}
                  onChange={(e) => setEditVendorData({ ...editVendorData, email: e.target.value })}
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
                  id="edit-vendor-notes-input"
                  type="text"
                  value={editVendorData.notes}
                  onChange={(e) => setEditVendorData({ ...editVendorData, notes: e.target.value })}
                  className={`w-full text-xs p-2.5 border rounded-lg focus:outline-hidden focus:border-emerald-600 ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                      : 'bg-[#0D0D0D] border-neutral-800 text-white placeholder-neutral-600'
                  }`}
                />
              </div>

              <div className={`pt-3 flex items-center justify-between gap-2 border-t ${isLight ? 'border-slate-200' : 'border-neutral-800'}`}>
                <button
                  id="cancel-edit-vendor-btn"
                  type="button"
                  onClick={() => setEditingVendor(null)}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                    isLight
                      ? 'border-slate-300 text-slate-700 hover:bg-slate-100'
                      : 'border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                  }`}
                >
                  {t.ledger.cancel}
                </button>
                <button
                  id="save-edit-vendor-btn"
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

      {/* 6. Delete Vendor Confirmation Modal */}
      {vendorToDelete && (
        <div
          id="delete-vendor-modal-backdrop"
          className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150"
        >
          <div className="min-h-full flex items-center justify-center py-4">
            <div
              id="delete-vendor-modal"
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
                    {t.ledger.confirmDeleteVendorTitle}
                  </h3>
                  <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                    {vendorToDelete.name}
                  </p>
                </div>
              </div>
              <button
                id="close-delete-vendor-modal-btn"
                onClick={() => setVendorToDelete(null)}
                className={`p-1 rounded-lg transition-colors cursor-pointer ${
                  isLight ? 'text-slate-400 hover:text-slate-700' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className={`text-xs mt-3 leading-relaxed ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
              {t.ledger.confirmDeleteVendorMsg}
            </p>

            {/* Vendor Details Box */}
            <div className={`mt-4 p-3.5 rounded-xl border space-y-2 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0D0D0D] border-neutral-800'
            }`}>
              <div className="flex justify-between items-center text-xs">
                <span className={`font-semibold ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                  {t.ledger.vendorName}:
                </span>
                <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {vendorToDelete.name}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className={`font-semibold ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                  {t.ledger.contactPerson}:
                </span>
                <span>{vendorToDelete.contactPerson} • {vendorToDelete.phone}</span>
              </div>
              <div className="flex justify-between items-center text-xs pt-1 border-t border-dashed border-slate-200 dark:border-neutral-800">
                <span className={`font-semibold ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                  {t.ledger.outstandingBill}:
                </span>
                <span className={`font-bold font-mono ${vendorToDelete.outstandingPayable > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                  {formatMoney(vendorToDelete.outstandingPayable)}
                </span>
              </div>
            </div>

            {vendorToDelete.outstandingPayable > 0 && (
              <div className="mt-3 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>
                  {`${t.ledger.vendorBalanceWarning} ${formatMoney(vendorToDelete.outstandingPayable)}.`}
                </span>
              </div>
            )}

            {/* Actions */}
            <div className={`mt-6 pt-3 flex items-center justify-between gap-2.5 border-t ${
              isLight ? 'border-slate-200' : 'border-neutral-800'
            }`}>
              <button
                id="cancel-delete-vendor-btn"
                type="button"
                onClick={() => setVendorToDelete(null)}
                disabled={isDeletingVendor}
                className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                  isLight
                    ? 'border-slate-300 text-slate-700 hover:bg-slate-100'
                    : 'border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                {t.ledger.cancel}
              </button>
              <button
                id="confirm-delete-vendor-btn"
                type="button"
                onClick={confirmDeleteVendor}
                disabled={isDeletingVendor}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-950/50 cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeletingVendor ? t.ledger.deletingRecord : t.ledger.deleteVendorConfirmBtn}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </div>
  );
};
