import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  Smartphone,
  MoreVertical,
  Printer,
  Share2,
  MessageCircle,
  Check,
  ExternalLink,
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
  const { formatMoney, formatSecondaryMoney, currencySymbol, exchangeRate, secondarySymbol } = useCurrency();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [searchQuery, setSearchQuery] = useState('');
  const [statementCustomer, setStatementCustomer] = useState<Customer | null>(null);

  const [activeFilter, setActiveFilter] = useState<'all' | 'with_debt' | 'up_to_date'>('all');
  const [activeMenuCustomerId, setActiveMenuCustomerId] = useState<string | null>(null);

  // Internal Non-blocking Toast Notification
  const [internalToast, setInternalToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const notify = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setInternalToast({ message, type });
    setTimeout(() => setInternalToast(null), 3500);
  };

  // Customer Payment / Abono Modal State
  const [isCustomerPayModalOpen, setIsCustomerPayModalOpen] = useState(false);
  const [customerPayTarget, setCustomerPayTarget] = useState<Customer | null>(null);
  const [customerPayAmountUsd, setCustomerPayAmountUsd] = useState<string>('');
  const [customerPayAmountBs, setCustomerPayAmountBs] = useState<string>('');
  const [customerPayMethod, setCustomerPayMethod] = useState<'cash' | 'pago_movil' | 'card'>('cash');
  const [customerPayNotes, setCustomerPayNotes] = useState<string>('');
  const [pmPhone, setPmPhone] = useState<string>('');
  const [pmCedula, setPmCedula] = useState<string>('');
  const [pmReferenceLast4, setPmReferenceLast4] = useState<string>('');
  const [cashTenderedUsd, setCashTenderedUsd] = useState<string>('');

  // Post-Abono Receipt Voucher State
  const [completedAbonoReceipt, setCompletedAbonoReceipt] = useState<{
    customerName: string;
    phone?: string;
    amountUsd: number;
    amountBs: number;
    method: string;
    balanceAfterUsd: number;
    balanceAfterBs: number;
    referenceNumber: string;
    timestamp: number;
    notes?: string;
  } | null>(null);

  // Add Customer Modal State
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState({
    name: '',
    phone: '',
    idDocument: '',
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
    idDocument: '',
    email: '',
    debtLimit: 200,
    notes: '',
  });

  // Delete Customer Confirmation State
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [isDeletingCustomer, setIsDeletingCustomer] = useState(false);

  // Concurrency & Double-Tap Submission Locks
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [isSubmittingCustomer, setIsSubmittingCustomer] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Input Focus Refs for Counter Ergonomics
  const searchInputRef = useRef<HTMLInputElement>(null);
  const payAmountInputRef = useRef<HTMLInputElement>(null);
  const addCustomerNameRef = useRef<HTMLInputElement>(null);
  const editCustomerNameRef = useRef<HTMLInputElement>(null);

  // Modal active flag
  const isAnyModalOpen = Boolean(
    isCustomerPayModalOpen ||
    completedAbonoReceipt ||
    statementCustomer ||
    isAddCustomerOpen ||
    editingCustomer ||
    customerToDelete
  );

  // Modal background scroll locking (avoids background rubber-banding on iOS Safari & mobile Chrome)
  useEffect(() => {
    if (isAnyModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isAnyModalOpen]);

  // Autofocus input fields on modal open
  useEffect(() => {
    if (isCustomerPayModalOpen) {
      const timer = setTimeout(() => payAmountInputRef.current?.focus(), 60);
      return () => clearTimeout(timer);
    }
  }, [isCustomerPayModalOpen]);

  useEffect(() => {
    if (isAddCustomerOpen) {
      const timer = setTimeout(() => addCustomerNameRef.current?.focus(), 60);
      return () => clearTimeout(timer);
    }
  }, [isAddCustomerOpen]);

  useEffect(() => {
    if (editingCustomer) {
      const timer = setTimeout(() => editCustomerNameRef.current?.focus(), 60);
      return () => clearTimeout(timer);
    }
  }, [editingCustomer]);

  // Defensive array fallback
  const safeCustomers = useMemo(() => customers || [], [customers]);
  const safeLedgers = useMemo(() => customerLedgers || [], [customerLedgers]);

  // KPIs
  const customerStats = useMemo(() => {
    const totalDebt = safeCustomers.reduce((acc, c) => acc + (Number(c.currentDebt) || 0), 0);
    const totalCredit = safeCustomers.reduce((acc, c) => acc + (Number(c.creditBalance) || 0), 0);
    const activeDebtors = safeCustomers.filter((c) => (Number(c.currentDebt) || 0) > 0).length;
    return { totalDebt, totalCredit, activeDebtors };
  }, [safeCustomers]);

  // Filtered customer list by search query and debt status
  const filteredCustomers = useMemo(() => {
    let list = safeCustomers;
    if (activeFilter === 'with_debt') {
      list = list.filter((c) => (Number(c.currentDebt) || 0) > 0);
    } else if (activeFilter === 'up_to_date') {
      list = list.filter((c) => (Number(c.currentDebt) || 0) <= 0);
    }

    const q = (searchQuery || '').toLowerCase().trim();
    if (!q) return list;
    return list.filter(
      (c) =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.phone || '').includes(q) ||
        (c.notes && c.notes.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q))
    );
  }, [safeCustomers, searchQuery, activeFilter]);

  // Open Abono Modal with synchronized dual amounts and prefilled customer info
  const openCustomerPayModal = (customer: Customer) => {
    setCustomerPayTarget(customer);
    const initialUsd = customer.currentDebt > 0 ? customer.currentDebt.toFixed(2) : '10.00';
    const initialBs = (parseFloat(initialUsd) * (exchangeRate || 1)).toFixed(2);
    setCustomerPayAmountUsd(initialUsd);
    setCustomerPayAmountBs(initialBs);
    setCustomerPayMethod('cash');
    setCashTenderedUsd('');
    setCustomerPayNotes('');
    setPmPhone(customer.phone || '');
    // Extract ID/Cedula from notes if present
    const cedulaMatch = customer.notes?.match(/(?:c[eé]dula|id|rif)[:\s]+([VEJPvejpx0-9.-]+)/i);
    setPmCedula(cedulaMatch ? cedulaMatch[1].trim() : '');
    setPmReferenceLast4('');
    setActiveMenuCustomerId(null);
    setIsCustomerPayModalOpen(true);
  };

  // Synchronized amount updates
  const handleUsdAmountChange = (val: string) => {
    setCustomerPayAmountUsd(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      setCustomerPayAmountBs((num * (exchangeRate || 1)).toFixed(2));
    } else {
      setCustomerPayAmountBs('');
    }
  };

  const handleBsAmountChange = (val: string) => {
    setCustomerPayAmountBs(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0 && exchangeRate > 0) {
      setCustomerPayAmountUsd((num / exchangeRate).toFixed(2));
    } else {
      setCustomerPayAmountUsd('');
    }
  };

  const applyAmountPreset = (usdAmount: number) => {
    const clamped = Math.max(0, usdAmount);
    setCustomerPayAmountUsd(clamped.toFixed(2));
    setCustomerPayAmountBs((clamped * (exchangeRate || 1)).toFixed(2));
  };

  // Handle Customer Payment Submit
  const handleCustomerPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingPayment || !customerPayTarget) return;

    const amount = parseFloat(customerPayAmountUsd);
    if (isNaN(amount) || amount <= 0) {
      sound.error();
      notify(t.alerts.validPaymentRequired, 'error');
      return;
    }

    if (amount > 1000000) {
      sound.error();
      notify(
        language === 'es'
          ? 'El monto excede el límite permitido ($1,000,000)'
          : 'Amount exceeds allowed maximum ($1,000,000)',
        'error'
      );
      return;
    }

    if (customerPayMethod === 'pago_movil') {
      const cleanRef = pmReferenceLast4.trim();
      if (!cleanRef || cleanRef.length < 4) {
        sound.error();
        notify(
          language === 'es'
            ? 'Ingresa al menos 4 dígitos de la referencia bancaria'
            : 'Enter at least 4 digits of bank reference',
          'error'
        );
        return;
      }
    }

    setIsSubmittingPayment(true);
    try {
      const notesParts: string[] = [];
      if (customerPayMethod === 'pago_movil') {
        notesParts.push(`Pago Móvil • Ref: ${pmReferenceLast4.trim()}`);
        if (pmCedula.trim()) notesParts.push(`Cédula: ${pmCedula.trim()}`);
        if (pmPhone.trim()) notesParts.push(`Tel: ${pmPhone.trim()}`);
      } else if (customerPayMethod === 'cash') {
        notesParts.push(language === 'es' ? 'Efectivo en caja' : 'Cash in register');
        const tendered = parseFloat(cashTenderedUsd);
        if (!isNaN(tendered) && tendered > amount) {
          notesParts.push(
            language === 'es'
              ? `Entregado: $${tendered.toFixed(2)} (Vuelto: $${(tendered - amount).toFixed(2)})`
              : `Tendered: $${tendered.toFixed(2)} (Change: $${(tendered - amount).toFixed(2)})`
          );
        }
      } else {
        notesParts.push(language === 'es' ? 'Tarjeta / Punto de Venta' : 'Card / POS');
      }
      if (customerPayNotes.trim()) {
        notesParts.push(customerPayNotes.trim());
      }
      const finalNotes = notesParts.join(' | ');

      sound.success();
      const entry = dbService.recordCustomerPayment(
        customerPayTarget.id,
        amount,
        customerPayMethod,
        finalNotes
      );
      onRefreshData();

      const bcvBs = amount * (exchangeRate || 1);
      const remainingUsd = Math.max(0, customerPayTarget.currentDebt - amount);
      const remainingBs = remainingUsd * (exchangeRate || 1);

      setCompletedAbonoReceipt({
        customerName: customerPayTarget.name,
        phone: customerPayTarget.phone,
        amountUsd: amount,
        amountBs: bcvBs,
        method: customerPayMethod,
        balanceAfterUsd: remainingUsd,
        balanceAfterBs: remainingBs,
        referenceNumber: entry?.referenceReceiptNumber || `PAY-${Date.now().toString().slice(-6)}`,
        timestamp: Date.now(),
        notes: finalNotes,
      });

      setIsCustomerPayModalOpen(false);
      setCustomerPayAmountUsd('');
      setCustomerPayAmountBs('');
      setCustomerPayNotes('');
      notify(t.ledger.paymentSuccessToast, 'success');
    } catch (err) {
      console.error('Error submitting customer payment:', err);
      sound.error();
      notify(
        language === 'es' ? 'Error al procesar el abono' : 'Error processing payment',
        'error'
      );
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  // WhatsApp Dispatch Utilities
  const sendWhatsAppAbono = (receipt: NonNullable<typeof completedAbonoReceipt>) => {
    const rawPhone = (receipt.phone || '').replace(/[^0-9]/g, '');
    let phone = rawPhone;
    if (phone.startsWith('04') && phone.length === 11) {
      phone = '58' + phone.slice(1);
    } else if (phone.length === 10 && !phone.startsWith('58')) {
      phone = '58' + phone;
    }

    const isEs = language === 'es';
    const methodLabel = receipt.method === 'pago_movil'
      ? 'Pago Móvil'
      : receipt.method === 'cash'
      ? (isEs ? 'Efectivo' : 'Cash')
      : (isEs ? 'Tarjeta' : 'Card');

    const message = isEs
      ? [
          `🧾 *COMPROBANTE DE ABONO - TUBODEGUITA*`,
          `──────────────────────`,
          `👤 *Cliente:* ${receipt.customerName}`,
          `📅 *Fecha:* ${new Date(receipt.timestamp).toLocaleString()}`,
          `🔢 *Comprobante:* #${receipt.referenceNumber}`,
          `💳 *Método:* ${methodLabel}`,
          `💵 *Monto Abonado:* $${receipt.amountUsd.toFixed(2)} USD (Bs. ${receipt.amountBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`,
          `📊 *Saldo Pendiente:* $${receipt.balanceAfterUsd.toFixed(2)} USD (Bs. ${receipt.balanceAfterBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`,
          `──────────────────────`,
          `¡Gracias por su abono puntual! Cuentas claras conservan amistades. ✨`,
        ].join('\n')
      : [
          `🧾 *PAYMENT RECEIPT - TUBODEGUITA*`,
          `──────────────────────`,
          `👤 *Customer:* ${receipt.customerName}`,
          `📅 *Date:* ${new Date(receipt.timestamp).toLocaleString()}`,
          `🔢 *Receipt #:* #${receipt.referenceNumber}`,
          `💳 *Method:* ${methodLabel}`,
          `💵 *Amount Paid:* $${receipt.amountUsd.toFixed(2)} USD (Bs. ${receipt.amountBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`,
          `📊 *Remaining Balance:* $${receipt.balanceAfterUsd.toFixed(2)} USD (Bs. ${receipt.balanceAfterBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`,
          `──────────────────────`,
          `Thank you for your prompt payment! Clear accounts preserve good friendships. ✨`,
        ].join('\n');

    const url = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const sendWhatsAppStatement = (customer: Customer) => {
    const rawPhone = (customer.phone || '').replace(/[^0-9]/g, '');
    let phone = rawPhone;
    if (phone.startsWith('04') && phone.length === 11) {
      phone = '58' + phone.slice(1);
    } else if (phone.length === 10 && !phone.startsWith('58')) {
      phone = '58' + phone;
    }

    const bsDebt = customer.currentDebt * (exchangeRate || 1);
    const bsLimit = customer.debtLimit * (exchangeRate || 1);
    const isEs = language === 'es';

    const message = isEs
      ? [
          `📋 *ESTADO DE CUENTA - TUBODEGUITA*`,
          `──────────────────────`,
          `👤 *Cliente:* ${customer.name}`,
          `📅 *Fecha de consulta:* ${new Date().toLocaleDateString()}`,
          `⚠️ *Saldo Actual Pendiente:* $${customer.currentDebt.toFixed(2)} USD (Bs. ${bsDebt.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`,
          `🛡️ *Límite de Fiado:* $${customer.debtLimit.toFixed(2)} USD (Bs. ${bsLimit.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`,
          ...(customer.creditBalance > 0
            ? [`💰 *Saldo a Favor:* $${customer.creditBalance.toFixed(2)} USD`]
            : []),
          `──────────────────────`,
          `Para cualquier abono o consulta, estamos a la orden en el mostrador. ¡Gracias por su confianza!`,
        ].join('\n')
      : [
          `📋 *ACCOUNT STATEMENT - TUBODEGUITA*`,
          `──────────────────────`,
          `👤 *Customer:* ${customer.name}`,
          `📅 *Statement Date:* ${new Date().toLocaleDateString()}`,
          `⚠️ *Current Outstanding Balance:* $${customer.currentDebt.toFixed(2)} USD (Bs. ${bsDebt.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`,
          `🛡️ *Store Credit Limit:* $${customer.debtLimit.toFixed(2)} USD (Bs. ${bsLimit.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`,
          ...(customer.creditBalance > 0
            ? [`💰 *Prepaid Credit:* $${customer.creditBalance.toFixed(2)} USD`]
            : []),
          `──────────────────────`,
          `For any payment or inquiry, we are at your service at the counter. Thank you for your business!`,
        ].join('\n');

    const url = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Global Escape & Click-Outside Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Hotkey '/' to focus customer search when no modal is open and not typing in an input
      if (
        e.key === '/' &&
        !isAnyModalOpen &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      if (e.key === 'Escape') {
        if (completedAbonoReceipt) {
          setCompletedAbonoReceipt(null);
          return;
        }
        if (isCustomerPayModalOpen) {
          setIsCustomerPayModalOpen(false);
          return;
        }
        if (statementCustomer) {
          setStatementCustomer(null);
          return;
        }
        if (isAddCustomerOpen) {
          setIsAddCustomerOpen(false);
          return;
        }
        if (editingCustomer) {
          setEditingCustomer(null);
          return;
        }
        if (customerToDelete) {
          setCustomerToDelete(null);
          return;
        }
        if (activeMenuCustomerId) {
          setActiveMenuCustomerId(null);
          return;
        }
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (activeMenuCustomerId) {
        const target = e.target as HTMLElement;
        if (!target.closest('.customer-card-menu-container')) {
          setActiveMenuCustomerId(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [
    completedAbonoReceipt,
    isCustomerPayModalOpen,
    statementCustomer,
    isAddCustomerOpen,
    editingCustomer,
    customerToDelete,
    activeMenuCustomerId,
    isAnyModalOpen,
  ]);

  // Handle Create Customer
  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingCustomer) return;

    const cleanName = newCustomerData.name.trim();
    if (cleanName.length < 2) {
      sound.error();
      notify(
        language === 'es' ? 'El nombre debe tener al menos 2 caracteres' : 'Name must be at least 2 characters',
        'error'
      );
      return;
    }

    setIsSubmittingCustomer(true);
    try {
      let combinedNotes = newCustomerData.notes.trim();
      if (newCustomerData.idDocument.trim()) {
        const docNote = `Cédula/ID: ${newCustomerData.idDocument.trim().slice(0, 30)}`;
        combinedNotes = combinedNotes ? `${docNote} • ${combinedNotes}` : docNote;
      }

      const safeLimit = Math.max(0, Math.min(1000000, Number(newCustomerData.debtLimit) || 0));
      const safeInitialDebt = Math.max(0, Math.min(1000000, Number(newCustomerData.initialDebt) || 0));

      const newCust: Customer = {
        id: `cust-${Date.now()}`,
        name: cleanName.slice(0, 100),
        phone: newCustomerData.phone.trim().slice(0, 30),
        email: newCustomerData.email.trim().slice(0, 100) || undefined,
        currentDebt: safeInitialDebt,
        creditBalance: 0,
        debtLimit: safeLimit,
        notes: combinedNotes || undefined,
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

      sound.success();
      notify(
        language === 'es' ? 'Cliente registrado exitosamente' : 'Customer registered successfully',
        'success'
      );
      onRefreshData();
      setIsAddCustomerOpen(false);
      setNewCustomerData({
        name: '',
        phone: '',
        idDocument: '',
        email: '',
        debtLimit: 200,
        initialDebt: 0,
        notes: '',
      });
    } catch (err) {
      console.error('Error creating customer:', err);
      sound.error();
      notify(
        language === 'es' ? 'Error al registrar cliente' : 'Error registering customer',
        'error'
      );
    } finally {
      setIsSubmittingCustomer(false);
    }
  };

  // Open Edit Customer Modal
  const openEditCustomerModal = (c: Customer) => {
    setEditingCustomer(c);
    const cedulaMatch = c.notes?.match(/(?:c[eé]dula|id|rif)[:\s]+([VEJPvejpx0-9.-]+)/i);
    let remainingNotes = c.notes || '';
    if (cedulaMatch) {
      remainingNotes = remainingNotes.replace(/(?:c[eé]dula|id|rif)[:\s]+[VEJPvejpx0-9.-]+(\s*[•|,-]\s*)?/i, '').trim();
    }
    setEditCustomerData({
      name: c.name,
      phone: c.phone,
      idDocument: cedulaMatch ? cedulaMatch[1].trim() : '',
      email: c.email || '',
      debtLimit: c.debtLimit,
      notes: remainingNotes,
    });
  };

  // Handle Edit Customer Submit
  const handleEditCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingEdit || !editingCustomer) return;

    const cleanName = editCustomerData.name.trim();
    if (cleanName.length < 2) {
      sound.error();
      notify(
        language === 'es' ? 'El nombre debe tener al menos 2 caracteres' : 'Name must be at least 2 characters',
        'error'
      );
      return;
    }

    setIsSubmittingEdit(true);
    try {
      let combinedNotes = editCustomerData.notes.trim();
      if (editCustomerData.idDocument.trim()) {
        const docNote = `Cédula/ID: ${editCustomerData.idDocument.trim().slice(0, 30)}`;
        combinedNotes = combinedNotes ? `${docNote} • ${combinedNotes}` : docNote;
      }

      const safeLimit = Math.max(0, Math.min(1000000, Number(editCustomerData.debtLimit) || 0));

      sound.success();
      dbService.saveCustomer({
        ...editingCustomer,
        name: cleanName.slice(0, 100),
        phone: editCustomerData.phone.trim().slice(0, 30),
        email: editCustomerData.email.trim().slice(0, 100) || undefined,
        debtLimit: safeLimit,
        notes: combinedNotes || undefined,
        updatedAt: Date.now(),
      });

      notify(
        language === 'es' ? 'Cliente actualizado exitosamente' : 'Customer updated successfully',
        'success'
      );
      onRefreshData();
      setEditingCustomer(null);
    } catch (err) {
      console.error('Error updating customer:', err);
      sound.error();
      notify(
        language === 'es' ? 'Error al actualizar cliente' : 'Error updating customer',
        'error'
      );
    } finally {
      setIsSubmittingEdit(false);
    }
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
      notify(
        language === 'es' ? 'Cliente eliminado' : 'Customer deleted',
        'info'
      );
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
          className="flex items-center gap-2 min-h-[44px] px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-950/40 cursor-pointer transition-all shrink-0 justify-center focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-hidden"
        >
          <Plus className="w-4 h-4" />
          <span>{t.ledger.newCustomerBtn}</span>
        </button>
      </div>

      {/* Dual-Currency KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div
          className={`p-4 rounded-xl border shadow-xs transition-all ${
            isLight ? 'bg-white border-slate-200' : 'bg-neutral-900 border-neutral-800'
          }`}
        >
          <span className={`text-xs font-semibold uppercase tracking-wider block ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
            {t.ledger.totalCustomerDebt}
          </span>
          <div className="text-2xl font-bold font-mono text-orange-500 mt-1">
            {formatMoney(customerStats.totalDebt)}
          </div>
          <div className={`text-xs font-mono font-medium mt-0.5 ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
            {formatSecondaryMoney(customerStats.totalDebt)}
          </div>
          <span className={`text-xs mt-1.5 block ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
            {customerStats.activeDebtors} {t.ledger.accountsWithDebtCount}
          </span>
        </div>

        <div
          className={`p-4 rounded-xl border shadow-xs transition-all ${
            isLight ? 'bg-white border-slate-200' : 'bg-neutral-900 border-neutral-800'
          }`}
        >
          <span className={`text-xs font-semibold uppercase tracking-wider block ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
            {t.ledger.totalStoreCredit}
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-500 mt-1">
            {formatMoney(customerStats.totalCredit)}
          </div>
          <div className={`text-xs font-mono font-medium mt-0.5 ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
            {formatSecondaryMoney(customerStats.totalCredit)}
          </div>
          <span className={`text-xs mt-1.5 block ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
            {t.ledger.storeCreditBalance}
          </span>
        </div>

        <div
          className={`p-4 rounded-xl border shadow-xs transition-all ${
            isLight ? 'bg-white border-slate-200' : 'bg-neutral-900 border-neutral-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
              {t.ledger.totalAccounts}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              BCV {secondarySymbol} {exchangeRate.toFixed(2)}
            </span>
          </div>
          <div className={`text-2xl font-bold font-mono mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {safeCustomers.length}
          </div>
          <span className={`text-xs mt-1.5 block ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
            {t.ledger.activeCustomerLedgers}
          </span>
        </div>
      </div>

      {/* Search and Operational Quick Filter Tabs */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder={t.ledger.searchCustomers}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-9 pr-8 py-2.5 border rounded-xl text-xs font-medium focus:outline-hidden focus:border-emerald-600 shadow-xs transition-colors ${
              isLight
                ? 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                : 'bg-[#0D0D0D] border-neutral-800 text-white placeholder-neutral-500'
            }`}
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className={`hidden sm:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono rounded border pointer-events-none select-none ${
              isLight ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-neutral-800 text-neutral-500 border-neutral-700'
            }`}>
              /
            </kbd>
          )}
        </div>

        {/* Operational Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 shrink-0">
          <button
            onClick={() => setActiveFilter('all')}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-hidden ${
              activeFilter === 'all'
                ? 'bg-emerald-600 text-white shadow-xs'
                : isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800'
            }`}
          >
            {t.ledger.filterAll} ({safeCustomers.length})
          </button>
          <button
            onClick={() => setActiveFilter('with_debt')}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-hidden ${
              activeFilter === 'with_debt'
                ? 'bg-orange-600 text-white shadow-xs'
                : isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800'
            }`}
          >
            {t.ledger.filterWithDebt} ({customerStats.activeDebtors})
          </button>
          <button
            onClick={() => setActiveFilter('up_to_date')}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-hidden ${
              activeFilter === 'up_to_date'
                ? 'bg-emerald-600 text-white shadow-xs'
                : isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800'
            }`}
          >
            {t.ledger.filterUpToDate} ({safeCustomers.length - customerStats.activeDebtors})
          </button>
        </div>
      </div>

      {/* Customer Cards Grid / Granular Empty States */}
      {filteredCustomers.length === 0 ? (
        <div className={`py-16 text-center rounded-2xl border border-dashed flex flex-col items-center justify-center p-6 ${
          isLight ? 'bg-slate-50/60 border-slate-300 text-slate-500' : 'bg-neutral-900/40 border-neutral-800 text-neutral-400'
        }`}>
          <BookOpen className="w-12 h-12 opacity-30 mb-3 text-emerald-400" />
          <h4 className={`text-sm font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>
            {safeCustomers.length === 0
              ? t.ledger.emptyLedgerTitle
              : searchQuery
              ? t.ledger.emptySearchTitle
              : activeFilter === 'with_debt'
              ? t.ledger.emptyWithDebtTitle
              : t.ledger.emptyUpToDateTitle}
          </h4>
          <p className="text-xs mt-1.5 max-w-sm leading-relaxed">
            {safeCustomers.length === 0
              ? t.ledger.emptyLedgerDesc
              : searchQuery
              ? `${t.ledger.emptySearchDesc} ("${searchQuery}")`
              : activeFilter === 'with_debt'
              ? t.ledger.emptyWithDebtDesc
              : t.ledger.emptyUpToDateDesc}
          </p>
          <div className="mt-4 flex items-center gap-2">
            {safeCustomers.length === 0 ? (
              <button
                id="empty-ledger-new-customer-btn"
                onClick={() => setIsAddCustomerOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-950/40"
              >
                <Plus className="w-4 h-4" />
                <span>{t.ledger.newCustomerBtn}</span>
              </button>
            ) : searchQuery ? (
              <button
                id="clear-search-empty-btn"
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer border border-neutral-700"
              >
                {t.ledger.clearSearchBtn}
              </button>
            ) : (
              <button
                id="view-all-customers-empty-btn"
                onClick={() => setActiveFilter('all')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-md shadow-emerald-950/40"
              >
                {t.ledger.viewAllCustomersBtn}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((c) => {
            const creditLimit = Math.max(0, c.debtLimit);
            const currentDebt = Math.max(0, c.currentDebt);
            const isOverLimit = currentDebt > creditLimit && creditLimit > 0;

            return (
              <div
                key={c.id}
                className={`rounded-2xl border p-4 sm:p-5 shadow-xs transition-all flex flex-col justify-between space-y-4 ${
                  isLight
                    ? 'bg-white border-slate-200 hover:border-slate-300'
                    : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div>
                  {/* Customer Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h4
                        className={`font-bold text-base truncate ${isLight ? 'text-slate-900' : 'text-white'}`}
                        title={c.name}
                      >
                        {c.name}
                      </h4>
                      <div className={`flex items-center gap-1.5 text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                        <Phone className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-mono truncate" title={c.phone || undefined}>
                          {c.phone || (language === 'es' ? 'Sin teléfono' : 'No phone')}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0">
                      {isOverLimit ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-500 border border-rose-500/30">
                          {language === 'es' ? 'Excedido' : 'Over limit'}
                        </span>
                      ) : currentDebt > 0 ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30">
                          {language === 'es' ? 'Debe' : 'Owing'}
                        </span>
                      ) : c.creditBalance > 0 ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                          {language === 'es' ? 'Saldo a favor' : 'Credit'}
                        </span>
                      ) : (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          isLight ? 'bg-slate-100 text-slate-600' : 'bg-neutral-800 text-neutral-400'
                        }`}>
                          {t.ledger.zeroBalance}
                        </span>
                      )}
                    </div>
                  </div>

                  {c.notes && (
                    <p
                      title={c.notes}
                      className={`text-xs mt-2 leading-relaxed line-clamp-2 italic break-words ${
                        isLight ? 'text-slate-500' : 'text-neutral-400'
                      }`}
                    >
                      {c.notes}
                    </p>
                  )}

                  {/* Dual-Currency Debt & Limit Breakdown */}
                  <div className="mt-3 space-y-2.5">
                    <div className="flex items-end justify-between">
                      <div>
                        <span className={`text-xs uppercase tracking-wide font-semibold block ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                          {t.ledger.currentDebtBadge}
                        </span>
                        <div className="flex flex-col mt-0.5">
                          <span className={`text-xl font-bold font-mono ${currentDebt > 0 ? 'text-orange-500' : (isLight ? 'text-slate-800' : 'text-white')}`}>
                            {formatMoney(currentDebt)}
                          </span>
                          <span className={`text-xs font-mono font-medium ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                            {formatSecondaryMoney(currentDebt)}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`text-xs uppercase tracking-wide font-semibold block ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                          {t.ledger.creditLimit}
                        </span>
                        <div className="flex flex-col mt-0.5">
                          <span className={`text-sm font-bold font-mono ${isLight ? 'text-slate-700' : 'text-neutral-200'}`}>
                            {formatMoney(creditLimit)}
                          </span>
                          <span className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                            {formatSecondaryMoney(creditLimit)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions: 44px Primary "Abonar" CTA + Safe Overflow Menu "..." */}
                <div
                  className={`pt-3 border-t flex items-center justify-between gap-2.5 ${
                    isLight ? 'border-slate-100' : 'border-neutral-800'
                  }`}
                >
                  {/* 44px Touch-Friendly CTA Button */}
                  <button
                    id={`collect-payment-btn-${c.id}`}
                    onClick={() => openCustomerPayModal(c)}
                    className="flex-1 min-h-[44px] px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-950/40 transition-all cursor-pointer flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-hidden"
                  >
                    <Banknote className="w-4 h-4 shrink-0" />
                    <span>{currentDebt > 0 ? t.ledger.recordAbonoBtn : t.ledger.recordCreditDepositBtn}</span>
                  </button>

                  {/* Safe Menu Dropdown for Secondary Actions */}
                  <div className="relative customer-card-menu-container">
                    <button
                      id={`menu-customer-btn-${c.id}`}
                      onClick={() => setActiveMenuCustomerId(activeMenuCustomerId === c.id ? null : c.id)}
                      className={`min-h-[44px] min-w-[44px] px-3 py-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center active:scale-95 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-hidden ${
                        isLight
                          ? 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                          : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700'
                      }`}
                      title={t.ledger.actionsMenu}
                      aria-label={t.ledger.actionsMenu}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Safe Dropdown Menu */}
                    {activeMenuCustomerId === c.id && (
                      <div
                        className={`absolute right-0 bottom-full mb-2 w-56 rounded-xl shadow-2xl border p-1.5 z-40 animate-in fade-in zoom-in-95 duration-100 ${
                          isLight ? 'bg-white border-slate-200' : 'bg-[#141414] border-neutral-700'
                        }`}
                      >
                        <button
                          onClick={() => {
                            setActiveMenuCustomerId(null);
                            setStatementCustomer(c);
                          }}
                          className={`w-full min-h-[40px] text-left px-3 py-2.5 rounded-lg text-xs font-medium flex items-center gap-2.5 transition-all cursor-pointer active:scale-[0.99] focus-visible:ring-1 focus-visible:ring-emerald-500 focus-visible:outline-hidden ${
                            isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-neutral-200 hover:bg-neutral-800'
                          }`}
                        >
                          <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>{t.ledger.viewHistoryBtn}</span>
                        </button>

                        <button
                          onClick={() => {
                            setActiveMenuCustomerId(null);
                            sendWhatsAppStatement(c);
                          }}
                          className={`w-full min-h-[40px] text-left px-3 py-2.5 rounded-lg text-xs font-medium flex items-center gap-2.5 transition-all cursor-pointer active:scale-[0.99] focus-visible:ring-1 focus-visible:ring-emerald-500 focus-visible:outline-hidden ${
                            isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-neutral-200 hover:bg-neutral-800'
                          }`}
                        >
                          <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>{t.ledger.sendWhatsAppStatement}</span>
                        </button>

                        <button
                          onClick={() => {
                            setActiveMenuCustomerId(null);
                            openEditCustomerModal(c);
                          }}
                          className={`w-full min-h-[40px] text-left px-3 py-2.5 rounded-lg text-xs font-medium flex items-center gap-2.5 transition-all cursor-pointer active:scale-[0.99] focus-visible:ring-1 focus-visible:ring-emerald-500 focus-visible:outline-hidden ${
                            isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-neutral-200 hover:bg-neutral-800'
                          }`}
                        >
                          <Edit2 className="w-4 h-4 text-blue-400 shrink-0" />
                          <span>{t.ledger.editCustomer}</span>
                        </button>

                        <div className={`my-1 border-t ${isLight ? 'border-slate-100' : 'border-neutral-800'}`} />

                        <button
                          onClick={() => {
                            setActiveMenuCustomerId(null);
                            setCustomerToDelete(c);
                          }}
                          className={`w-full min-h-[40px] text-left px-3 py-2.5 rounded-lg text-xs font-medium flex items-center gap-2.5 transition-all cursor-pointer active:scale-[0.99] focus-visible:ring-1 focus-visible:ring-rose-500 focus-visible:outline-hidden ${
                            isLight ? 'text-rose-600 hover:bg-rose-50' : 'text-rose-400 hover:bg-rose-950/40'
                          }`}
                        >
                          <Trash2 className="w-4 h-4 text-rose-500 shrink-0" />
                          <span>{t.ledger.deleteCustomer}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Customer Ledger Statement / Transaction History Modal */}
      {statementCustomer && (
        <div
          id="customer-statement-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="customer-statement-modal-title"
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
                    <h3 id="customer-statement-modal-title" className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
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
                id="close-statement-header-btn"
                onClick={() => setStatementCustomer(null)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-hidden ${
                  isLight ? 'text-slate-400 hover:text-slate-700' : 'text-neutral-400 hover:text-white'
                }`}
                title={t.common.close}
                aria-label={t.common.close}
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
                {safeLedgers.filter((l) => l.customerId === statementCustomer.id).length}{' '}
                {t.ledger.recordsCount}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[160px] max-h-[380px]">
              {safeLedgers.filter((l) => l.customerId === statementCustomer.id).length === 0 ? (
                <div className={`py-12 text-center rounded-xl border border-dashed flex flex-col items-center justify-center gap-2 ${
                  isLight ? 'bg-slate-50/50 border-slate-200 text-slate-400' : 'bg-neutral-900/30 border-neutral-800 text-neutral-500'
                }`}>
                  <FileText className="w-8 h-8 opacity-40" />
                  <p className="text-xs italic">
                    {t.ledger.noTransactionsYet}
                  </p>
                </div>
              ) : (
                safeLedgers
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
                        <div className="min-w-0 flex-1">
                          <div className={`font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>
                            {entry.type === 'sale_debt'
                              ? t.ledger.chargeSaleDebt
                              : t.ledger.paymentReceived}
                          </div>
                          <div className={`text-[11px] font-mono mt-0.5 ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                            {new Date(entry.timestamp).toLocaleString()} • {entry.referenceReceiptNumber}
                          </div>
                          {entry.notes && (
                            <p className={`text-[11px] mt-0.5 italic break-words ${
                              isLight ? 'text-slate-500' : 'text-neutral-400'
                            }`}>
                              {entry.notes}
                            </p>
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
                        <span className={`text-xs font-mono font-medium block mt-0.5 ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                          {formatSecondaryMoney(entry.amount)}
                        </span>
                        <span className={`block text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                          {t.ledger.resultingBalance}: <strong className={`font-mono ${isLight ? 'text-slate-800' : 'text-neutral-200'}`}>{formatMoney(entry.balanceAfter)}</strong>
                        </span>
                      </div>
                    </div>
                  ))
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className={`pt-4 border-t flex flex-wrap items-center justify-between gap-3 mt-4 shrink-0 ${
              isLight ? 'border-slate-200' : 'border-neutral-800'
            }`}>
              <div className="flex items-center gap-2">
                <button
                  id="close-statement-btn"
                  type="button"
                  onClick={() => setStatementCustomer(null)}
                  className={`min-h-[44px] px-4 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:outline-hidden ${
                    isLight
                      ? 'border-slate-300 text-slate-700 hover:bg-slate-100'
                      : 'border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                  }`}
                >
                  {t.common.close}
                </button>

                <button
                  type="button"
                  onClick={() => sendWhatsAppStatement(statementCustomer)}
                  className={`min-h-[44px] px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer active:scale-[0.98] flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-hidden ${
                    isLight
                      ? 'border-emerald-200 text-emerald-800 hover:bg-emerald-50'
                      : 'border-emerald-800/60 text-emerald-300 hover:bg-emerald-950/40'
                  }`}
                >
                  <MessageCircle className="w-4 h-4 text-emerald-500" />
                  <span>{t.ledger.sendWhatsAppStatement}</span>
                </button>
              </div>

              {statementCustomer.currentDebt > 0 && (
                <button
                  id="statement-modal-collect-payment-btn"
                  type="button"
                  onClick={() => {
                    const target = statementCustomer;
                    setStatementCustomer(null);
                    openCustomerPayModal(target);
                  }}
                  className="min-h-[44px] px-5 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-950/40 transition-all cursor-pointer flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-hidden"
                >
                  <Banknote className="w-4 h-4" />
                  <span>{t.ledger.recordAbonoBtn}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )}

      {/* Customer Payment / Abono Modal */}
      {isCustomerPayModalOpen && customerPayTarget && (
        <div
          id="customer-pay-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="customer-pay-modal-title"
          className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150"
        >
          <div className="min-h-full flex items-center justify-center py-4">
            <div
              className={`rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border my-auto animate-in zoom-in-95 duration-150 ${
                isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#121212] border-neutral-800 text-neutral-300'
              }`}
            >
              <div className={`flex items-center justify-between pb-3 border-b ${isLight ? 'border-slate-200' : 'border-neutral-800'}`}>
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                    isLight ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-emerald-950/40 text-emerald-400 border-emerald-900/50'
                  }`}>
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 id="customer-pay-modal-title" className={`font-bold text-sm sm:text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {t.ledger.collectPaymentModalTitle}
                    </h3>
                    <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                      {customerPayTarget.name} {customerPayTarget.phone ? `• ${customerPayTarget.phone}` : ''}
                    </p>
                  </div>
                </div>
                <button
                  id="close-customer-pay-modal-btn"
                  onClick={() => setIsCustomerPayModalOpen(false)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isLight ? 'text-slate-400 hover:text-slate-700' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCustomerPaymentSubmit} className="mt-4 space-y-4">
                {/* Current Debt Telemetry Card */}
                <div
                  className={`p-3.5 rounded-xl border flex items-center justify-between ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0D0D0D] border-neutral-800'
                  }`}
                >
                  <div>
                    <span className={`text-xs uppercase tracking-wide font-semibold block ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                      {t.ledger.owesStore}
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="font-mono text-xl font-bold text-orange-500">
                        {formatMoney(customerPayTarget.currentDebt)}
                      </span>
                      <span className={`text-xs font-mono font-medium ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                        {formatSecondaryMoney(customerPayTarget.currentDebt)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[11px] font-mono px-2 py-0.5 rounded-md font-bold border ${
                      isLight ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-emerald-950/40 text-emerald-300 border-emerald-900/40'
                    }`}>
                      BCV: {secondarySymbol} {exchangeRate.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${isLight ? 'text-slate-700' : 'text-neutral-300'}`}>
                    {t.ledger.paymentMethod}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setCustomerPayMethod('cash')}
                      className={`min-h-[44px] py-2 px-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all select-none active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-hidden ${
                        customerPayMethod === 'cash'
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 ring-2 ring-emerald-500/40'
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
                      onClick={() => setCustomerPayMethod('pago_movil')}
                      className={`min-h-[44px] py-2 px-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all select-none active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-hidden ${
                        customerPayMethod === 'pago_movil'
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 ring-2 ring-emerald-500/40'
                          : isLight
                          ? 'border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900'
                          : 'border-neutral-800 bg-[#0D0D0D] text-neutral-400 hover:text-white'
                      }`}
                    >
                      <Smartphone className="w-4 h-4 text-emerald-500" />
                      <span>{t.ledger.pagoMovil}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCustomerPayMethod('card')}
                      className={`min-h-[44px] py-2 px-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all select-none active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-hidden ${
                        customerPayMethod === 'card'
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 ring-2 ring-emerald-500/40'
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

                {/* Dual-Currency Synchronized Amount Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-neutral-300'}`}>
                      {t.ledger.amountUsd} <span className="text-emerald-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-mono font-bold">$</span>
                      <input
                        ref={payAmountInputRef}
                        type="number"
                        step="0.01"
                        min="0.01"
                        required
                        value={customerPayAmountUsd}
                        onChange={(e) => handleUsdAmountChange(e.target.value)}
                        className={`w-full pl-8 pr-3 py-2.5 border rounded-xl text-sm font-mono font-bold text-emerald-500 focus:outline-hidden focus:border-emerald-600 transition-colors ${
                          isLight ? 'bg-slate-50 border-slate-300' : 'bg-[#0D0D0D] border-neutral-800'
                        }`}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-neutral-300'}`}>
                      {t.ledger.amountBs}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-mono font-bold text-xs">{secondarySymbol}</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={customerPayAmountBs}
                        onChange={(e) => handleBsAmountChange(e.target.value)}
                        className={`w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm font-mono font-bold text-emerald-500 focus:outline-hidden focus:border-emerald-600 transition-colors ${
                          isLight ? 'bg-slate-50 border-slate-300' : 'bg-[#0D0D0D] border-neutral-800'
                        }`}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                {/* 1-Tap Quick Amount Presets */}
                <div className="space-y-1.5">
                  <span className={`text-[11px] font-semibold block ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                    {t.ledger.quickShortcutsLabel}
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {customerPayTarget.currentDebt > 0 && (
                      <button
                        type="button"
                        onClick={() => applyAmountPreset(customerPayTarget.currentDebt)}
                        className="min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-bold bg-orange-500/10 hover:bg-orange-500/20 active:scale-95 text-orange-500 border border-orange-500/30 transition-all cursor-pointer font-mono select-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-hidden"
                      >
                        {t.ledger.payTotal}: ${customerPayTarget.currentDebt.toFixed(2)}
                      </button>
                    )}
                    {[5, 10, 20, 50].map((presetVal) => (
                      <button
                        key={presetVal}
                        type="button"
                        onClick={() => applyAmountPreset(presetVal)}
                        className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer font-mono select-none active:scale-95 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-hidden ${
                          isLight
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                            : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border-neutral-800'
                        }`}
                      >
                        ${presetVal}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pago Móvil Details */}
                {customerPayMethod === 'pago_movil' && (
                  <div className="space-y-3 pt-1 animate-in fade-in duration-150">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>{t.ledger.pagoMovilDesc}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                          {t.ledger.pmPhone}
                        </label>
                        <input
                          type="tel"
                          placeholder="0414-1234567"
                          value={pmPhone}
                          onChange={(e) => setPmPhone(e.target.value)}
                          className={`w-full text-xs p-2.5 border rounded-xl font-mono focus:outline-hidden focus:border-emerald-600 ${
                            isLight ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400' : 'bg-[#0D0D0D] border-neutral-800 text-white placeholder-neutral-600'
                          }`}
                        />
                      </div>

                      <div>
                        <label className={`block text-xs font-medium mb-1 ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                          {t.ledger.pmCedula}
                        </label>
                        <input
                          type="text"
                          placeholder="V-18.452.123"
                          value={pmCedula}
                          onChange={(e) => setPmCedula(e.target.value)}
                          className={`w-full text-xs p-2.5 border rounded-xl font-mono focus:outline-hidden focus:border-emerald-600 ${
                            isLight ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400' : 'bg-[#0D0D0D] border-neutral-800 text-white placeholder-neutral-600'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-neutral-300'}`}>
                        {t.ledger.pmReferenceLast4} <span className="text-emerald-500">*</span>
                      </label>
                      <input
                        type="text"
                        maxLength={8}
                        required
                        placeholder="Ej. 4589"
                        value={pmReferenceLast4}
                        onChange={(e) => setPmReferenceLast4(e.target.value)}
                        className={`w-full text-xs p-2.5 border rounded-xl font-mono font-bold tracking-widest text-emerald-400 focus:outline-hidden focus:border-emerald-600 ${
                          isLight ? 'bg-slate-50 border-slate-300 placeholder-slate-400' : 'bg-[#0D0D0D] border-neutral-800 placeholder-neutral-600'
                        }`}
                      />
                    </div>
                  </div>
                )}

                {/* Cash Tendered & Change Calculation */}
                {customerPayMethod === 'cash' && (
                  <div className="space-y-2.5 pt-1 animate-in fade-in duration-150">
                    <div>
                      <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-neutral-300'}`}>
                        {t.ledger.cashReceivedLabel}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-mono font-bold text-xs">$</span>
                        <input
                          type="number"
                          step="0.01"
                          placeholder={t.ledger.cashHandedPlaceholder}
                          value={cashTenderedUsd}
                          onChange={(e) => setCashTenderedUsd(e.target.value)}
                          className={`w-full pl-8 pr-3 py-2.5 border rounded-xl text-xs font-mono font-bold focus:outline-hidden focus:border-emerald-600 ${
                            isLight ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400' : 'bg-[#0D0D0D] border-neutral-800 text-white placeholder-neutral-600'
                          }`}
                        />
                      </div>
                    </div>
                    {parseFloat(cashTenderedUsd) > parseFloat(customerPayAmountUsd) && (
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
                        <span className="text-emerald-500 font-semibold">{t.ledger.changeDue}:</span>
                        <div className="text-right font-mono font-bold text-emerald-500">
                          ${(parseFloat(cashTenderedUsd) - parseFloat(customerPayAmountUsd)).toFixed(2)} USD
                          <span className={`text-[11px] block ${isLight ? 'text-emerald-700' : 'text-emerald-400/80'}`}>
                            Bs. {((parseFloat(cashTenderedUsd) - parseFloat(customerPayAmountUsd)) * exchangeRate).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Optional Note */}
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                    {t.ledger.notesOptional}
                  </label>
                  <input
                    type="text"
                    placeholder={language === 'es' ? 'Ej. Abono parcial quincena' : 'e.g. Partial bi-weekly payment'}
                    value={customerPayNotes}
                    onChange={(e) => setCustomerPayNotes(e.target.value)}
                    className={`w-full text-xs p-2.5 border rounded-xl focus:outline-hidden focus:border-emerald-600 ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                        : 'bg-[#0D0D0D] border-neutral-800 text-white placeholder-neutral-600'
                    }`}
                  />
                </div>

                {/* Form Actions */}
                <div className={`pt-3 flex items-center justify-between gap-2.5 border-t ${isLight ? 'border-slate-200' : 'border-neutral-800'}`}>
                  <button
                    id="cancel-customer-pay-btn"
                    type="button"
                    onClick={() => setIsCustomerPayModalOpen(false)}
                    className={`min-h-[44px] px-4 py-2.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:outline-hidden ${
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
                    disabled={isSubmittingPayment}
                    className="min-h-[44px] px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-950/40 cursor-pointer transition-all flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-hidden"
                  >
                    <Banknote className="w-4 h-4" />
                    <span>{isSubmittingPayment ? (language === 'es' ? 'Procesando...' : 'Processing...') : t.ledger.recordPayment}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Post-Abono Voucher / Receipt Modal */}
      {completedAbonoReceipt && (
        <div
          id="completed-abono-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="completed-abono-modal-title"
          className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150"
        >
          <div className="min-h-full flex items-center justify-center py-4">
            <div className="bg-white text-neutral-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-neutral-200 receipt-paper my-auto">
              <div id="printable-receipt" className="space-y-3">
                <div className="text-center border-b border-dashed border-neutral-300 pb-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                    <Check className="w-5 h-5" />
                  </div>
                  <h3 id="completed-abono-modal-title" className="font-bold text-base tracking-wide text-neutral-900">TUBODEGUITA</h3>
                  <p className="text-[11px] text-neutral-600 uppercase tracking-wider font-semibold">
                    {language === 'es' ? 'Comprobante de Abono a Libreta' : 'Customer Tab Payment Receipt'}
                  </p>
                  <p className="text-[10px] font-mono text-neutral-500 mt-1">
                    {new Date(completedAbonoReceipt.timestamp).toLocaleString()} • #{completedAbonoReceipt.referenceNumber}
                  </p>
                </div>

                <div className="space-y-1.5 text-xs py-2 border-b border-dashed border-neutral-300">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">{t.ledger.customerName}:</span>
                    <span className="font-bold text-neutral-900">{completedAbonoReceipt.customerName}</span>
                  </div>
                  {completedAbonoReceipt.phone && (
                    <div className="flex justify-between">
                      <span className="text-neutral-600">{t.ledger.phone}:</span>
                      <span className="font-mono">{completedAbonoReceipt.phone}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-neutral-600">{t.ledger.paymentMethod}:</span>
                    <span className="font-bold uppercase text-neutral-900">
                      {completedAbonoReceipt.method === 'pago_movil' ? 'Pago Móvil' : completedAbonoReceipt.method === 'cash' ? 'Efectivo' : 'Tarjeta'}
                    </span>
                  </div>
                  {completedAbonoReceipt.notes && (
                    <div className="text-[10px] text-neutral-500 pt-1 italic">
                      {completedAbonoReceipt.notes}
                    </div>
                  )}
                </div>

                <div className="space-y-2 py-2 border-b border-dashed border-neutral-300">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-bold text-neutral-700 uppercase">{language === 'es' ? 'Abonado:' : 'Paid:'}</span>
                    <div className="text-right font-mono">
                      <span className="text-lg font-bold text-emerald-700">${completedAbonoReceipt.amountUsd.toFixed(2)} USD</span>
                      <span className="text-xs text-neutral-600 block">Bs. {completedAbonoReceipt.amountBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-baseline pt-1">
                    <span className="text-xs font-semibold text-neutral-600">{language === 'es' ? 'Saldo Pendiente:' : 'Remaining Debt:'}</span>
                    <div className="text-right font-mono">
                      <span className="text-sm font-bold text-neutral-900">${completedAbonoReceipt.balanceAfterUsd.toFixed(2)} USD</span>
                      <span className="text-xs text-neutral-600 block">Bs. {completedAbonoReceipt.balanceAfterBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>

                <div className="text-center pt-2 text-[10px] text-neutral-500">
                  <p>{language === 'es' ? '¡Gracias por su abono puntual!' : 'Thank you for your prompt payment!'}</p>
                  <p className="font-semibold text-neutral-700">
                    {language === 'es' ? 'Cuentas claras conservan amistades' : 'Clear accounts preserve good friendships'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-neutral-200 flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => window.print()}
                    className="min-h-[44px] px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>{t.ledger.printThermalAbono}</span>
                  </button>

                  <button
                    id="whatsapp-abono-voucher-btn"
                    onClick={() => sendWhatsAppAbono(completedAbonoReceipt)}
                    className="min-h-[44px] px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-hidden"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{t.ledger.sendWhatsAppAbono}</span>
                  </button>
                </div>

                <button
                  id="close-abono-voucher-btn"
                  onClick={() => setCompletedAbonoReceipt(null)}
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-100 active:scale-[0.98] text-xs font-semibold transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:outline-hidden"
                >
                  {language === 'es' ? 'Listo / Cerrar' : 'Done / Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Customer Modal */}
      {isAddCustomerOpen && (
        <div
          id="add-customer-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-customer-modal-title"
          className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150"
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
                  <h3 id="add-customer-modal-title" className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
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
                  {t.ledger.customerName} <span className="text-emerald-500">*</span>
                </label>
                <input
                  ref={addCustomerNameRef}
                  id="new-customer-name-input"
                  type="text"
                  required
                  placeholder={language === 'es' ? 'Ej. Doña Carmen Silva' : 'e.g. Maria Gonzalez'}
                  value={newCustomerData.name}
                  onChange={(e) => setNewCustomerData({ ...newCustomerData, name: e.target.value })}
                  className={`w-full text-xs p-2.5 border rounded-xl focus:outline-hidden focus:border-emerald-600 ${
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
                    id="new-customer-phone-input"
                    type="tel"
                    required
                    placeholder={language === 'es' ? '0414-1234567' : '(555) 000-0000'}
                    value={newCustomerData.phone}
                    onChange={(e) => setNewCustomerData({ ...newCustomerData, phone: e.target.value })}
                    className={`w-full text-xs p-2.5 border rounded-xl focus:outline-hidden focus:border-emerald-600 ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                        : 'bg-[#0D0D0D] border-neutral-800 text-white placeholder-neutral-600'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                    {language === 'es' ? 'Cédula / RIF / ID' : 'ID / National ID'}
                  </label>
                  <input
                    id="new-customer-doc-input"
                    type="text"
                    placeholder={language === 'es' ? 'V-18.452.123' : 'ID-987654'}
                    value={newCustomerData.idDocument}
                    onChange={(e) => setNewCustomerData({ ...newCustomerData, idDocument: e.target.value })}
                    className={`w-full text-xs p-2.5 border rounded-xl focus:outline-hidden focus:border-emerald-600 font-mono ${
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
                    {t.ledger.creditLimit} ({currencySymbol})
                  </label>
                  <input
                    id="new-customer-limit-input"
                    type="number"
                    min="0"
                    step="1"
                    value={newCustomerData.debtLimit}
                    onChange={(e) =>
                      setNewCustomerData({ ...newCustomerData, debtLimit: parseFloat(e.target.value) || 0 })
                    }
                    className={`w-full text-xs font-mono p-2.5 border rounded-xl focus:outline-hidden focus:border-emerald-600 ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-900'
                        : 'bg-[#0D0D0D] border-neutral-800 text-white'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                    {t.ledger.initialDebtLabel} ({currencySymbol})
                  </label>
                  <input
                    id="new-customer-debt-input"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newCustomerData.initialDebt}
                    onChange={(e) =>
                      setNewCustomerData({ ...newCustomerData, initialDebt: parseFloat(e.target.value) || 0 })
                    }
                    className={`w-full text-xs font-mono p-2.5 border rounded-xl focus:outline-hidden focus:border-emerald-600 ${
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
                  id="new-customer-email-input"
                  type="email"
                  placeholder={language === 'es' ? 'cliente@ejemplo.com' : 'client@example.com'}
                  value={newCustomerData.email}
                  onChange={(e) => setNewCustomerData({ ...newCustomerData, email: e.target.value })}
                  className={`w-full text-xs p-2.5 border rounded-xl focus:outline-hidden focus:border-emerald-600 ${
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
                  id="new-customer-notes-input"
                  type="text"
                  placeholder={language === 'es' ? 'Ej. Vecina del piso 3, paga quincenas' : 'e.g. Regular customer, pays bi-weekly'}
                  value={newCustomerData.notes}
                  onChange={(e) => setNewCustomerData({ ...newCustomerData, notes: e.target.value })}
                  className={`w-full text-xs p-2.5 border rounded-xl focus:outline-hidden focus:border-emerald-600 ${
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
                  className={`min-h-[44px] px-4 py-2.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:outline-hidden ${
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
                  disabled={isSubmittingCustomer}
                  className="min-h-[44px] px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-950/40 cursor-pointer transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-hidden"
                >
                  {isSubmittingCustomer ? (language === 'es' ? 'Guardando...' : 'Saving...') : t.ledger.saveCustomer}
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
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-customer-modal-title"
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
                  <h3 id="edit-customer-modal-title" className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
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
                  {t.ledger.customerName} <span className="text-emerald-500">*</span>
                </label>
                <input
                  ref={editCustomerNameRef}
                  id="edit-customer-name-input"
                  type="text"
                  required
                  placeholder={language === 'es' ? 'Ej. Doña Carmen Silva' : 'e.g. Maria Gonzalez'}
                  value={editCustomerData.name}
                  onChange={(e) => setEditCustomerData({ ...editCustomerData, name: e.target.value })}
                  className={`w-full text-xs p-2.5 border rounded-xl focus:outline-hidden focus:border-emerald-600 ${
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
                    type="tel"
                    required
                    placeholder={language === 'es' ? '0414-1234567' : '(555) 000-0000'}
                    value={editCustomerData.phone}
                    onChange={(e) => setEditCustomerData({ ...editCustomerData, phone: e.target.value })}
                    className={`w-full text-xs p-2.5 border rounded-xl focus:outline-hidden focus:border-emerald-600 ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                        : 'bg-[#0D0D0D] border-neutral-800 text-white placeholder-neutral-600'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                    {language === 'es' ? 'Cédula / RIF / ID' : 'ID / National ID'}
                  </label>
                  <input
                    id="edit-customer-doc-input"
                    type="text"
                    placeholder={language === 'es' ? 'V-18.452.123' : 'ID-987654'}
                    value={editCustomerData.idDocument}
                    onChange={(e) => setEditCustomerData({ ...editCustomerData, idDocument: e.target.value })}
                    className={`w-full text-xs p-2.5 border rounded-xl focus:outline-hidden focus:border-emerald-600 font-mono ${
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
                    className={`w-full text-xs font-mono p-2.5 border rounded-xl focus:outline-hidden focus:border-emerald-600 ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-900'
                        : 'bg-[#0D0D0D] border-neutral-800 text-white'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                    {t.ledger.email} ({t.ledger.optionalLabel})
                  </label>
                  <input
                    id="edit-customer-email-input"
                    type="email"
                    placeholder={language === 'es' ? 'cliente@ejemplo.com' : 'client@example.com'}
                    value={editCustomerData.email}
                    onChange={(e) => setEditCustomerData({ ...editCustomerData, email: e.target.value })}
                    className={`w-full text-xs p-2.5 border rounded-xl focus:outline-hidden focus:border-emerald-600 ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                        : 'bg-[#0D0D0D] border-neutral-800 text-white placeholder-neutral-600'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
                  {t.ledger.notesAndTermsLabel}
                </label>
                <input
                  id="edit-customer-notes-input"
                  type="text"
                  placeholder={language === 'es' ? 'Ej. Vecina del piso 3, paga quincenas' : 'e.g. Regular neighbor, pays bi-weekly'}
                  value={editCustomerData.notes}
                  onChange={(e) => setEditCustomerData({ ...editCustomerData, notes: e.target.value })}
                  className={`w-full text-xs p-2.5 border rounded-xl focus:outline-hidden focus:border-emerald-600 ${
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
                  className={`min-h-[44px] px-4 py-2.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:outline-hidden ${
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
                  disabled={isSubmittingEdit}
                  className="min-h-[44px] px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-950/40 cursor-pointer transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-hidden"
                >
                  {isSubmittingEdit ? (language === 'es' ? 'Guardando...' : 'Saving...') : t.ledger.saveChanges}
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
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-customer-modal-title"
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
                  <h3 id="delete-customer-modal-title" className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
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
            <div className={`mt-4 p-3.5 rounded-xl border space-y-2.5 ${
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
              <div className={`flex justify-between items-center text-xs pt-2 border-t ${
                isLight ? 'border-slate-200' : 'border-neutral-800'
              }`}>
                <span className={`font-semibold ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                  {t.ledger.owesStore}:
                </span>
                <span className={`font-bold font-mono ${customerToDelete.currentDebt > 0 ? 'text-orange-500' : 'text-emerald-500'}`}>
                  {formatMoney(customerToDelete.currentDebt)}
                </span>
              </div>
            </div>

            {customerToDelete.currentDebt > 0 && (
              <div className="mt-3 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs flex items-center gap-2">
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
                className={`min-h-[44px] px-4 py-2.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:outline-hidden ${
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
                className="min-h-[44px] px-5 py-2.5 bg-rose-600 hover:bg-rose-500 active:scale-[0.98] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-950/40 cursor-pointer transition-all flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-hidden"
              >
                <Trash2 className="w-4 h-4" />
                <span>{t.ledger.deleteCustomerConfirmBtn}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

      {/* Floating Internal Toast Notification */}
      {internalToast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-4 sm:bottom-6 right-4 sm:right-6 left-4 sm:left-auto z-50 max-w-sm px-4 py-3 rounded-xl shadow-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200 backdrop-blur-md text-xs font-semibold select-none ${
            internalToast.type === 'success'
              ? isLight
                ? 'bg-emerald-50/95 border-emerald-500 text-emerald-900 shadow-emerald-500/10'
                : 'bg-emerald-950/90 border-emerald-500 text-emerald-200 shadow-emerald-950/50'
              : internalToast.type === 'error'
              ? isLight
                ? 'bg-rose-50/95 border-rose-500 text-rose-900 shadow-rose-500/10'
                : 'bg-rose-950/90 border-rose-500 text-rose-200 shadow-rose-950/50'
              : isLight
              ? 'bg-slate-50/95 border-slate-400 text-slate-900 shadow-slate-500/10'
              : 'bg-neutral-900/90 border-neutral-700 text-neutral-100 shadow-neutral-950/50'
          }`}
        >
          {internalToast.type === 'success' && <Check className="w-4 h-4 shrink-0 text-emerald-500" />}
          {internalToast.type === 'error' && <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />}
          {internalToast.type === 'info' && <ShieldAlert className="w-4 h-4 shrink-0 text-amber-500" />}
          <span className="flex-1">{internalToast.message}</span>
        </div>
      )}
    </div>
  );
};
