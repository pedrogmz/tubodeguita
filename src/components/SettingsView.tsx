import React, { useState, useMemo } from 'react';
import {
  Store,
  Wifi,
  WifiOff,
  Cloud,
  RefreshCw,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  FileText,
  Clock,
  Database,
  Sliders,
  Sparkles,
  Palette,
  Check,
  Download,
  Terminal,
  HardDrive,
  FileCode,
  Play,
  Table,
  Layers,
  DollarSign,
  Coins,
  ArrowRightLeft,
  Globe,
  Calculator,
  Boxes,
  Tag,
  Plus,
  Edit2,
  Trash2,
  Search,
  X,
} from 'lucide-react';
import { StoreSettings, SyncQueueItem, AccentColor, SqliteStats, SqlQueryResult, PrimaryCurrency, PricingMethod, Product } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../theme/ThemeContext';
import { useCurrency } from '../currency/CurrencyContext';
import { dbService } from '../services/db';

interface SettingsViewProps {
  storeSettings: StoreSettings;
  onSaveSettings: (newSettings: StoreSettings) => void;
  onResetDefaults: () => void;
  isOnline: boolean;
  onToggleOnlineSimulation: () => void;
  syncQueue: SyncQueueItem[];
  onTriggerSync: () => void;
  isSyncing: boolean;
  onClearSyncedQueue?: () => void;
  products?: Product[];
  onRefreshData?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  storeSettings,
  onSaveSettings,
  onResetDefaults,
  isOnline,
  onToggleOnlineSimulation,
  syncQueue,
  onTriggerSync,
  isSyncing,
  onClearSyncedQueue,
  products,
  onRefreshData,
}) => {
  const { t, language, translateCategory } = useLanguage();
  const { theme, accentColor, setAccentColor, availableAccentColors, accentColorOption } = useTheme();
  const isLight = theme === 'light';

  // Local form state initialized with storeSettings
  const [formData, setFormData] = useState<StoreSettings>({ ...storeSettings });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<boolean>(false);

  // Product categories management state
  const [categories, setCategories] = useState<string[]>(() => dbService.getCategories());
  const [newCatName, setNewCatName] = useState<string>('');
  const [catSearchQuery, setCatSearchQuery] = useState<string>('');
  const [catFeedback, setCatFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [editingCategory, setEditingCategory] = useState<{ oldName: string; newName: string } | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<{ name: string; productCount: number; reassignTarget: string } | null>(null);

  // Calculate product counts per category
  const productCountByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    const prods = products && products.length > 0 ? products : dbService.getProducts();
    for (const p of prods) {
      if (p.category) {
        counts[p.category] = (counts[p.category] || 0) + 1;
      }
    }
    return counts;
  }, [products]);

  // Filtered categories by search
  const filteredCategories = useMemo(() => {
    const q = catSearchQuery.toLowerCase().trim();
    if (!q) return categories;
    return categories.filter((c) => {
      const translated = translateCategory(c).toLowerCase();
      return c.toLowerCase().includes(q) || translated.includes(q);
    });
  }, [categories, catSearchQuery, translateCategory]);

  const handleAddCategory = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) {
      setCatFeedback({ type: 'error', message: t.settings.categoryEmptyError });
      return;
    }
    const result = dbService.addCategory(trimmed);
    if (!result.success) {
      setCatFeedback({ type: 'error', message: result.error || t.settings.categoryAlreadyExists });
      return;
    }
    setCategories(result.categories);
    setNewCatName('');
    setCatFeedback({ type: 'success', message: `${t.settings.categoryAddedSuccess} ("${trimmed}")` });
    setTimeout(() => setCatFeedback(null), 4000);
    onRefreshData?.();
  };

  const handleSaveEditCategory = () => {
    if (!editingCategory) return;
    const trimmed = editingCategory.newName.trim();
    if (!trimmed) {
      setCatFeedback({ type: 'error', message: t.settings.categoryEmptyError });
      return;
    }
    const result = dbService.updateCategory(editingCategory.oldName, trimmed);
    if (!result.success) {
      setCatFeedback({ type: 'error', message: result.error || t.settings.categoryAlreadyExists });
      return;
    }
    setCategories(result.categories);
    setCatFeedback({
      type: 'success',
      message: `${t.settings.categoryUpdatedSuccess} (${editingCategory.oldName} → ${trimmed})`,
    });
    setTimeout(() => setCatFeedback(null), 4000);
    setEditingCategory(null);
    onRefreshData?.();
  };

  const handleInitiateDelete = (catName: string) => {
    const count = productCountByCategory[catName] || 0;
    const otherCats = categories.filter((c) => c.toLowerCase() !== catName.toLowerCase());
    const defaultTarget = otherCats[0] || 'General';
    setDeletingCategory({
      name: catName,
      productCount: count,
      reassignTarget: defaultTarget,
    });
  };

  const handleConfirmDelete = () => {
    if (!deletingCategory) return;
    const result = dbService.deleteCategory(
      deletingCategory.name,
      deletingCategory.productCount > 0 ? deletingCategory.reassignTarget : undefined
    );
    setCategories(result.categories);
    setCatFeedback({
      type: 'success',
      message: `${t.settings.categoryDeletedSuccess} ("${deletingCategory.name}")`,
    });
    setTimeout(() => setCatFeedback(null), 4000);
    setDeletingCategory(null);
    onRefreshData?.();
  };

  const handleInputChange = (field: keyof StoreSettings, value: string | number | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setHasUnsavedChanges(true);
    setSavedSuccessMsg(false);
  };

  const { syncBcvRate, isSyncingBcv } = useCurrency();
  const [bcvFeedback, setBcvFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleCurrencySelect = (currency: PrimaryCurrency) => {
    setFormData((prev) => ({
      ...prev,
      primaryCurrency: currency,
      currencySymbol: currency === 'VES' ? 'Bs.' : '$',
    }));
    setHasUnsavedChanges(true);
    setSavedSuccessMsg(false);
  };

  const handleManualSyncBcv = async () => {
    setBcvFeedback(null);
    try {
      const result = await syncBcvRate(true);
      if (result.success && result.rate > 0) {
        setFormData((prev) => ({
          ...prev,
          exchangeRate: result.rate,
          exchangeRateLastUpdated: Date.now(),
        }));
        setHasUnsavedChanges(true);
        setBcvFeedback({
          type: 'success',
          message: `${t.settings.bcvSyncSuccess} (${result.rate.toFixed(2)} Bs./USD)`,
        });
      } else {
        setBcvFeedback({
          type: 'error',
          message: result.error || t.settings.bcvSyncError,
        });
      }
    } catch (err: any) {
      setBcvFeedback({
        type: 'error',
        message: err.message || t.settings.bcvSyncError,
      });
    }
    setTimeout(() => setBcvFeedback(null), 5000);
  };

  const handleAccentSelect = (selectedAccent: AccentColor) => {
    setAccentColor(selectedAccent);
    handleInputChange('accentColor', selectedAccent);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setHasUnsavedChanges(false);
    setSavedSuccessMsg(true);
    setTimeout(() => setSavedSuccessMsg(false), 3500);
  };

  const handleReset = () => {
    if (window.confirm(t.settings.resetConfirm)) {
      onResetDefaults();
      setAccentColor('emerald');
      setHasUnsavedChanges(false);
      setSavedSuccessMsg(true);
      setTimeout(() => setSavedSuccessMsg(false), 3000);
    }
  };

  // Keep form updated if storeSettings changes externally
  React.useEffect(() => {
    setFormData({ ...storeSettings });
  }, [storeSettings]);

  // SQLite Local Database Management State
  const [sqliteStats, setSqliteStats] = useState<SqliteStats | null>(null);
  const [loadingStats, setLoadingStats] = useState<boolean>(false);
  const [querySql, setQuerySql] = useState<string>('SELECT id, name, category, price, stock FROM products LIMIT 5;');
  const [queryResult, setQueryResult] = useState<SqlQueryResult | null>(null);
  const [queryRunning, setQueryRunning] = useState<boolean>(false);
  const [showQueryConsole, setShowQueryConsole] = useState<boolean>(false);
  const [isSyncingSqlite, setIsSyncingSqlite] = useState<boolean>(false);
  const [sqliteSyncMsg, setSqliteSyncMsg] = useState<string | null>(null);

  const loadSqliteStats = React.useCallback(async () => {
    setLoadingStats(true);
    try {
      const stats = await dbService.getSqliteStats();
      if (stats) setSqliteStats(stats);
    } catch (err) {
      console.warn('Could not fetch SQLite stats:', err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  React.useEffect(() => {
    loadSqliteStats();
  }, [loadSqliteStats]);

  const handleSyncWithSqlite = async () => {
    setIsSyncingSqlite(true);
    setSqliteSyncMsg(null);
    try {
      const res = await dbService.syncFromSqlite();
      if (res.success) {
        setSqliteSyncMsg(language === 'es' ? '¡Sincronizado con SQLite con éxito!' : 'Successfully synchronized with SQLite!');
        await loadSqliteStats();
        onTriggerSync();
      } else {
        setSqliteSyncMsg(res.error || (language === 'es' ? 'Error al sincronizar' : 'Sync failed'));
      }
    } catch (err: any) {
      setSqliteSyncMsg(err.message);
    } finally {
      setIsSyncingSqlite(false);
      setTimeout(() => setSqliteSyncMsg(null), 4000);
    }
  };

  const handleRunQuery = async () => {
    if (!querySql.trim()) return;
    setQueryRunning(true);
    try {
      const result = await dbService.executeSqlQuery(querySql);
      setQueryResult(result);
      // Reload stats in case DML changed rows
      loadSqliteStats();
    } catch (err: any) {
      setQueryResult({ success: false, error: err.message });
    } finally {
      setQueryRunning(false);
    }
  };

  const pendingItems = syncQueue.filter((item) => item.status === 'pending');
  const syncedItems = syncQueue.filter((item) => item.status === 'synced');

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400 shrink-0">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              {t.settings.title}
              <span className="text-xs px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-400 font-mono font-normal">
                {formData.terminalId || 'POS-01'}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400">{t.settings.subtitle}</p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            id="reset-settings-defaults-btn"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors border border-neutral-700 cursor-pointer"
            title={t.settings.resetDefaults}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.settings.resetDefaults}</span>
          </button>

          <button
            type="button"
            id="save-settings-btn"
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer ${
              savedSuccessMsg
                ? 'bg-emerald-600 text-white'
                : hasUnsavedChanges
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white ring-2 ring-emerald-400/60 shadow-emerald-950/40'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {savedSuccessMsg ? (
              <CheckCircle2 className="w-4 h-4 text-white" />
            ) : (
              <Save className="w-4 h-4 text-white" />
            )}
            <span className="text-white">
              {savedSuccessMsg
                ? language === 'es'
                  ? '¡Guardado!'
                  : 'Saved!'
                : t.settings.saveSettings}
            </span>
            {hasUnsavedChanges && !savedSuccessMsg && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse ml-0.5" />
            )}
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {savedSuccessMsg && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-xl flex items-center gap-3 text-emerald-300 text-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{t.settings.savedSuccess}</span>
        </div>
      )}

      {/* Main Grid: Settings & Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: Store Parameters Form */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSave} className="bg-[#121212] border border-neutral-800 rounded-2xl p-5 space-y-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white tracking-wide uppercase">
                  {t.settings.storeInfoSection}
                </h2>
              </div>
            </div>

            {/* Store Name & Tagline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  {t.settings.storeName} <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  id="setting-store-name-input"
                  required
                  value={formData.storeName}
                  onChange={(e) => handleInputChange('storeName', e.target.value)}
                  placeholder={t.settings.storeNamePlaceholder}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  {t.settings.storeSubtitle}
                </label>
                <input
                  type="text"
                  id="setting-store-subtitle-input"
                  value={formData.storeSubtitle}
                  onChange={(e) => handleInputChange('storeSubtitle', e.target.value)}
                  placeholder={t.settings.storeSubtitlePlaceholder}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            {/* Physical Location & Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  {t.settings.address}
                </label>
                <input
                  type="text"
                  id="setting-store-address-input"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder={t.settings.addressPlaceholder}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  {t.settings.phone}
                </label>
                <input
                  type="text"
                  id="setting-store-phone-input"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder={t.settings.phonePlaceholder}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            {/* Financial & Tax Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  {t.settings.taxId}
                </label>
                <input
                  type="text"
                  id="setting-store-tax-id-input"
                  value={formData.taxId}
                  onChange={(e) => handleInputChange('taxId', e.target.value)}
                  placeholder={t.settings.taxIdPlaceholder}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  {t.settings.taxRate}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    id="setting-store-tax-rate-input"
                    value={formData.taxRate}
                    onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors pr-7"
                  />
                  <span className="absolute right-2.5 top-2 text-xs font-bold text-neutral-500">%</span>
                </div>
              </div>
            </div>

            {/* Dual Currency & BCV Official Exchange Rate Configuration */}
            <div className="bg-[#0D0D0D] border border-neutral-800/90 rounded-xl p-4.5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400 shrink-0">
                    <ArrowRightLeft className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      {language === 'es' ? 'Monedas del Sistema (Dólares y Bolívares)' : 'System Currencies (USD & Bolivars)'}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Primary Currency Option: Dolares o Bolívares */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  {t.settings.primaryCurrency} <span className="text-emerald-400">*</span>
                </label>
                <p className="text-[11px] text-neutral-400 mb-3">
                  {t.settings.primaryCurrencyDesc}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option: Dólares ($) */}
                  <button
                    type="button"
                    id="select-primary-currency-usd"
                    onClick={() => handleCurrencySelect('USD')}
                    className={`flex items-start justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      formData.primaryCurrency === 'USD'
                        ? 'border-emerald-500 bg-emerald-950/30 text-white ring-1 ring-emerald-500/50 shadow-xs'
                        : 'border-neutral-800 bg-neutral-900/90 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${
                        formData.primaryCurrency === 'USD'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}>
                        $
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span>{t.settings.currencyUSD}</span>
                        </div>
                        <p className="text-[11px] text-neutral-500 mt-0.5">
                          {language === 'es'
                            ? 'Los precios base se guardan en USD ($) y se convierten a Bolívares en caja e inventario.'
                            : 'Base prices are stored in USD ($) and converted to Bolivars in POS and inventory.'}
                        </p>
                      </div>
                    </div>
                    {formData.primaryCurrency === 'USD' && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-xs shadow-emerald-400/80 shrink-0 mt-1" />
                    )}
                  </button>

                  {/* Option: Bolívares (Bs.) */}
                  <button
                    type="button"
                    id="select-primary-currency-ves"
                    onClick={() => handleCurrencySelect('VES')}
                    className={`flex items-start justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      formData.primaryCurrency === 'VES'
                        ? 'border-emerald-500 bg-emerald-950/30 text-white ring-1 ring-emerald-500/50 shadow-xs'
                        : 'border-neutral-800 bg-neutral-900/90 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        formData.primaryCurrency === 'VES'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}>
                        Bs.
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span>{t.settings.currencyVES}</span>
                        </div>
                        <p className="text-[11px] text-neutral-500 mt-0.5">
                          {language === 'es'
                            ? 'Los precios base se guardan en Bs. y se convierten a Dólares en caja e inventario.'
                            : 'Base prices are stored in Bs. and converted to USD in POS and inventory.'}
                        </p>
                      </div>
                    </div>
                    {formData.primaryCurrency === 'VES' && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-xs shadow-emerald-400/80 shrink-0 mt-1" />
                    )}
                  </button>
                </div>
              </div>

              {/* Tasa de Cambio Field & Manual Sync Button */}
              <div className="pt-3 border-t border-neutral-800/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                  <label className="text-xs font-semibold text-neutral-300">
                    {t.settings.exchangeRate} <span className="text-emerald-400">*</span>
                  </label>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    API: <a href="https://rates.dolarvzla.com/bcv/current.json" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">rates.dolarvzla.com/bcv/current.json</a>
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold font-mono text-neutral-500">
                      Bs.
                    </span>
                    <input
                      type="number"
                      step="0.0001"
                      min="0.0001"
                      required
                      id="setting-exchange-rate-input"
                      value={formData.exchangeRate || ''}
                      onChange={(e) => handleInputChange('exchangeRate', parseFloat(e.target.value) || 0)}
                      placeholder={t.settings.exchangeRatePlaceholder}
                      className="w-full pl-10 pr-16 py-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white font-mono font-bold text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-mono text-neutral-500">
                      / USD
                    </span>
                  </div>

                  <button
                    type="button"
                    id="sync-bcv-rate-btn"
                    onClick={handleManualSyncBcv}
                    disabled={isSyncingBcv}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-800 text-white text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0"
                    title={t.settings.syncBcvRateBtn}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingBcv ? 'animate-spin' : ''}`} />
                    <span>{isSyncingBcv ? t.settings.syncingBcv : t.settings.syncBcvRateBtn}</span>
                  </button>
                </div>

                {/* Feedback message if manual sync succeeded or failed */}
                {bcvFeedback && (
                  <div
                    className={`mt-2.5 p-2.5 rounded-lg text-xs flex items-center gap-2 animate-in fade-in duration-150 ${
                      bcvFeedback.type === 'success'
                        ? 'bg-emerald-950/60 border border-emerald-800/80 text-emerald-300'
                        : 'bg-rose-950/60 border border-rose-800/80 text-rose-300'
                    }`}
                  >
                    {bcvFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <span>{bcvFeedback.message}</span>
                  </div>
                )}

                {/* Conversion Preview & Last Sync Info */}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-neutral-900/60 border border-neutral-800/60 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-neutral-500 text-[11px] font-medium">{t.settings.dualCurrencyPreview}:</span>
                    <span className="font-mono font-bold text-emerald-400 text-[11px]">
                      1 USD = {(formData.exchangeRate || 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} Bs.
                    </span>
                    <span className="text-neutral-600">•</span>
                    <span className="font-mono font-semibold text-neutral-300 text-[11px]">
                      100 Bs. = ${(100 / (formData.exchangeRate || 1)).toFixed(2)} USD
                    </span>
                  </div>

                  <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-neutral-500" />
                    <span>
                      {t.settings.bcvLastUpdated}:{' '}
                      <span className="font-mono text-neutral-200 font-medium">
                        {formData.exchangeRateLastUpdated
                          ? new Date(formData.exchangeRateLastUpdated).toLocaleString(language === 'es' ? 'es-VE' : 'en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : language === 'es'
                          ? 'Recién configurada'
                          : 'Just configured'}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Auto-Sync Toggle */}
                <div className="mt-3 p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800/70 flex items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className={`p-2 rounded-lg shrink-0 transition-colors ${
                      formData.exchangeRateAutoSync !== false
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                        : 'bg-neutral-800/60 text-neutral-500 border border-neutral-700/60'
                    }`}>
                      <RefreshCw className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>{t.settings.exchangeRateAutoSync}</span>
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full transition-colors ${
                            formData.exchangeRateAutoSync !== false
                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                              : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                          }`}
                        >
                          {formData.exchangeRateAutoSync !== false
                            ? (language === 'es' ? 'ACTIVADA' : 'ACTIVE')
                            : (language === 'es' ? 'DESACTIVADA' : 'DISABLED')}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        {t.settings.exchangeRateAutoSyncDesc}
                      </p>
                    </div>
                  </div>

                  {/* Toggle Button Switch */}
                  <button
                    type="button"
                    id="toggle-exchange-rate-auto-sync-btn"
                    onClick={() => {
                      const nextVal = formData.exchangeRateAutoSync === false;
                      handleInputChange('exchangeRateAutoSync', nextVal);
                    }}
                    role="switch"
                    aria-checked={formData.exchangeRateAutoSync !== false}
                    className="cursor-pointer focus:outline-none shrink-0 p-1"
                    title={
                      formData.exchangeRateAutoSync !== false
                        ? (language === 'es' ? 'Desactivar sincronización automática' : 'Disable automatic synchronization')
                        : (language === 'es' ? 'Activar sincronización automática' : 'Enable automatic synchronization')
                    }
                  >
                    <div
                      className={`w-10 h-5 rounded-full p-0.5 flex items-center transition-colors ${
                        formData.exchangeRateAutoSync !== false ? 'bg-emerald-600 justify-end' : 'bg-neutral-700 justify-start'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Pricing Strategy Configuration */}
            <div className="bg-[#0D0D0D] border border-neutral-800/90 rounded-xl p-4.5 space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-800/80">
                <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400 shrink-0">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    {t.settings.pricingStrategySection}
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    {t.settings.pricingStrategyDesc}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Option: MANUAL */}
                <button
                  type="button"
                  id="select-pricing-method-manual"
                  onClick={() => handleInputChange('pricingMethod', 'MANUAL')}
                  className={`flex items-start justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    (formData.pricingMethod || 'MANUAL') === 'MANUAL'
                      ? 'border-emerald-500 bg-emerald-950/30 text-white ring-1 ring-emerald-500/50 shadow-xs'
                      : 'border-neutral-800 bg-neutral-900/90 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 ${
                      (formData.pricingMethod || 'MANUAL') === 'MANUAL'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-neutral-800 text-neutral-400'
                    }`}>
                      <Tag className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>{t.settings.pricingMethodManual}</span>
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                        {t.settings.pricingMethodManualDesc}
                      </p>
                    </div>
                  </div>
                  {(formData.pricingMethod || 'MANUAL') === 'MANUAL' && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-xs shadow-emerald-400/80 shrink-0 mt-1" />
                  )}
                </button>

                {/* Option: BULK_PACK */}
                <button
                  type="button"
                  id="select-pricing-method-bulk"
                  onClick={() => handleInputChange('pricingMethod', 'BULK_PACK')}
                  className={`flex items-start justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    formData.pricingMethod === 'BULK_PACK'
                      ? 'border-emerald-500 bg-emerald-950/30 text-white ring-1 ring-emerald-500/50 shadow-xs'
                      : 'border-neutral-800 bg-neutral-900/90 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 ${
                      formData.pricingMethod === 'BULK_PACK'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-neutral-800 text-neutral-400'
                    }`}>
                      <Boxes className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>{t.settings.pricingMethodBulk}</span>
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                        {t.settings.pricingMethodBulkDesc}
                      </p>
                    </div>
                  </div>
                  {formData.pricingMethod === 'BULK_PACK' && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-xs shadow-emerald-400/80 shrink-0 mt-1" />
                  )}
                </button>
              </div>
            </div>

            {/* Terminal Identifier */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                {t.settings.terminalId}
              </label>
              <input
                type="text"
                id="setting-store-terminal-id-input"
                value={formData.terminalId}
                onChange={(e) => handleInputChange('terminalId', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-xs placeholder-neutral-500 font-mono focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Receipt Footer Message */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                {t.settings.receiptFooter}
              </label>
              <textarea
                rows={2}
                id="setting-store-footer-input"
                value={formData.receiptFooterMessage}
                onChange={(e) => handleInputChange('receiptFooterMessage', e.target.value)}
                placeholder={t.settings.receiptFooterPlaceholder}
                className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
              />
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                type="submit"
                id="save-settings-submit-btn"
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                  savedSuccessMsg
                    ? 'bg-emerald-600 text-white'
                    : hasUnsavedChanges
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white ring-2 ring-emerald-400/60 shadow-emerald-950/40'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {savedSuccessMsg ? (
                  <CheckCircle2 className="w-4 h-4 text-white" />
                ) : (
                  <Save className="w-4 h-4 text-white" />
                )}
                <span className="text-white">
                  {savedSuccessMsg
                    ? language === 'es'
                      ? '¡Ajustes Guardados!'
                      : 'Settings Saved!'
                    : t.settings.saveSettings}
                </span>
                {hasUnsavedChanges && !savedSuccessMsg && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse ml-0.5" />
                )}
              </button>
            </div>
          </form>

          {/* Card: Product Categories Management (Agregar / Editar / Eliminar) */}
          <div
            id="product-categories-settings-card"
            className={`border rounded-2xl p-5 space-y-4 shadow-sm transition-colors ${
              isLight ? 'bg-white border-slate-200' : 'bg-[#121212] border-neutral-800'
            }`}
          >
            {/* Header */}
            <div
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b ${
                isLight ? 'border-slate-200' : 'border-neutral-800/80'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400 shrink-0">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h2
                    className={`text-sm font-bold uppercase tracking-wide flex items-center gap-2 ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    {t.settings.categoriesSection}
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                        isLight
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                      }`}
                    >
                      {categories.length} {language === 'es' ? 'categorías' : 'categories'}
                    </span>
                  </h2>
                </div>
              </div>
            </div>

            <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
              {t.settings.categoriesDesc}
            </p>

            {/* Notification Alert for Category Actions */}
            {catFeedback && (
              <div
                className={`p-3 rounded-xl flex items-center gap-2.5 text-xs animate-in fade-in duration-150 ${
                  catFeedback.type === 'success'
                    ? isLight
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-emerald-950/60 border border-emerald-800/80 text-emerald-300'
                    : isLight
                    ? 'bg-rose-50 border border-rose-200 text-rose-800'
                    : 'bg-rose-950/60 border border-rose-800/80 text-rose-300'
                }`}
              >
                {catFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                )}
                <span className="font-medium">{catFeedback.message}</span>
              </div>
            )}

            {/* Form: Add New Category */}
            <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  id="new-category-name-input"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder={t.settings.newCategoryPlaceholder}
                  className={`w-full px-3 py-2.5 rounded-xl text-xs transition-colors focus:outline-none focus:border-emerald-500 ${
                    isLight
                      ? 'bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400'
                      : 'bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500'
                  }`}
                />
              </div>
              <button
                type="submit"
                id="btn-add-category"
                disabled={!newCatName.trim()}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>{t.settings.addCategoryBtn}</span>
              </button>
            </form>

            {/* Filter Search Bar */}
            {categories.length > 4 && (
              <div className="relative">
                <Search
                  className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${
                    isLight ? 'text-slate-400' : 'text-neutral-500'
                  }`}
                />
                <input
                  type="text"
                  id="filter-categories-input"
                  value={catSearchQuery}
                  onChange={(e) => setCatSearchQuery(e.target.value)}
                  placeholder={t.settings.filterCategoriesPlaceholder}
                  className={`w-full pl-9 pr-8 py-1.5 rounded-lg text-xs transition-colors focus:outline-none focus:border-emerald-500 ${
                    isLight
                      ? 'bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400'
                      : 'bg-neutral-900/80 border border-neutral-800/80 text-neutral-300 placeholder-neutral-600'
                  }`}
                />
                {catSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setCatSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Categories List */}
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {filteredCategories.length === 0 ? (
                <div
                  className={`p-6 text-center rounded-xl border text-xs ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-500'
                      : 'bg-neutral-900/60 border-neutral-800 text-neutral-500'
                  }`}
                >
                  {language === 'es' ? 'No se encontraron categorías.' : 'No categories found.'}
                </div>
              ) : (
                filteredCategories.map((cat) => {
                  const isBeingEdited = editingCategory?.oldName === cat;
                  const productCount = productCountByCategory[cat] || 0;
                  const translated = translateCategory(cat);
                  const isDefaultTranslated = translated !== cat;

                  return (
                    <div
                      key={cat}
                      className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isLight
                          ? 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
                          : 'bg-neutral-900/70 border-neutral-800/90 hover:border-neutral-700/80'
                      }`}
                    >
                      {/* Left: Category Info or Inline Edit Input */}
                      {isBeingEdited ? (
                        <div className="flex-1 flex items-center gap-2">
                          <input
                            type="text"
                            value={editingCategory.newName}
                            onChange={(e) =>
                              setEditingCategory({
                                ...editingCategory,
                                newName: e.target.value,
                              })
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSaveEditCategory();
                              } else if (e.key === 'Escape') {
                                setEditingCategory(null);
                              }
                            }}
                            autoFocus
                            className={`flex-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold focus:outline-none focus:border-emerald-500 ${
                              isLight
                                ? 'bg-white border border-emerald-500 text-slate-900'
                                : 'bg-neutral-950 border border-emerald-500 text-white'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={handleSaveEditCategory}
                            className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
                            title={t.common.save}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCategory(null)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                            }`}
                            title={t.common.cancel}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                              productCount > 0
                                ? isLight
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                                : isLight
                                ? 'bg-slate-200 text-slate-600'
                                : 'bg-neutral-800 text-neutral-400'
                            }`}
                          >
                            <Tag className="w-3.5 h-3.5" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-xs font-bold truncate ${
                                  isLight ? 'text-slate-800' : 'text-neutral-100'
                                }`}
                              >
                                {cat}
                              </span>
                              {isDefaultTranslated && (
                                <span className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-neutral-500'}`}>
                                  ({translated})
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span
                                className={`text-[10px] font-mono px-2 py-0.2 rounded-md font-semibold ${
                                  productCount > 0
                                    ? isLight
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                                      : 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40'
                                    : isLight
                                    ? 'bg-slate-100 text-slate-500'
                                    : 'bg-neutral-800/80 text-neutral-500'
                                }`}
                              >
                                {productCount} {productCount === 1 ? t.settings.productCountSingular : t.settings.productCountPlural}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Right: Actions */}
                      {!isBeingEdited && (
                        <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                          <button
                            type="button"
                            onClick={() => setEditingCategory({ oldName: cat, newName: cat })}
                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                              isLight
                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700'
                            }`}
                            title={`${t.common.edit} "${cat}"`}
                          >
                            <Edit2 className="w-3 h-3 text-emerald-500" />
                            <span>{t.common.edit}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleInitiateDelete(cat)}
                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                              isLight
                                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                                : 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50'
                            }`}
                            title={`${t.common.delete} "${cat}"`}
                          >
                            <Trash2 className="w-3 h-3 text-rose-500" />
                            <span>{t.common.delete}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal: Delete Category Confirmation & Product Reassignment */}
            {deletingCategory && (
              <div
                id="delete-category-modal-backdrop"
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150"
              >
                <div
                  id="delete-category-modal"
                  className={`w-full max-w-md rounded-2xl p-5 border shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 ${
                    isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#141414] border-neutral-800 text-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 shrink-0">
                        <Trash2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold">{t.settings.deleteCategoryTitle}</h3>
                        <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                          "{deletingCategory.name}"
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDeletingCategory(null)}
                      className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-neutral-300'}`}>
                    {t.settings.confirmDeleteCategory}
                  </p>

                  {/* Warning if category has products */}
                  {deletingCategory.productCount > 0 ? (
                    <div
                      className={`p-3.5 rounded-xl border space-y-2.5 text-xs ${
                        isLight
                          ? 'bg-amber-50 border-amber-200 text-amber-900'
                          : 'bg-amber-950/40 border-amber-800/60 text-amber-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold">
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>
                          {language === 'es'
                            ? `Esta categoría contiene ${deletingCategory.productCount} producto(s) en catálogo.`
                            : `This category contains ${deletingCategory.productCount} product(s) in catalog.`}
                        </span>
                      </div>
                      <p className="text-[11px] opacity-90 leading-relaxed">
                        {t.settings.reassignProductsTo}
                      </p>

                      <select
                        value={deletingCategory.reassignTarget}
                        onChange={(e) =>
                          setDeletingCategory({
                            ...deletingCategory,
                            reassignTarget: e.target.value,
                          })
                        }
                        className={`w-full px-3 py-2 rounded-lg text-xs font-semibold focus:outline-none focus:border-emerald-500 ${
                          isLight
                            ? 'bg-white border border-slate-300 text-slate-900'
                            : 'bg-neutral-900 border border-neutral-700 text-white'
                        }`}
                      >
                        {categories
                          .filter((c) => c.toLowerCase() !== deletingCategory.name.toLowerCase())
                          .map((c) => (
                            <option key={c} value={c}>
                              {c} {translateCategory(c) !== c ? `(${translateCategory(c)})` : ''}
                            </option>
                          ))}
                      </select>
                    </div>
                  ) : (
                    <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                      {language === 'es'
                        ? 'No hay productos asociados a esta categoría. Se eliminará de inmediato.'
                        : 'There are no products assigned to this category. It will be removed immediately.'}
                    </p>
                  )}

                  {/* Modal Action Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800/80">
                    <button
                      type="button"
                      onClick={() => setDeletingCategory(null)}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        isLight
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                      }`}
                    >
                      {t.common.cancel}
                    </button>
                    <button
                      type="button"
                      id="confirm-delete-category-btn"
                      onClick={handleConfirmDelete}
                      className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
                    >
                      {deletingCategory.productCount > 0
                        ? language === 'es'
                          ? 'Reasignar y Eliminar'
                          : 'Reassign & Delete'
                        : t.common.delete}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Thermal Receipt Preview Card */}
          <div className={`border rounded-2xl p-5 space-y-3 transition-colors ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#121212] border-neutral-800'
          }`}>
            <div className="flex items-center gap-2 text-neutral-300 font-semibold text-xs uppercase tracking-wider">
              <Receipt className="w-4 h-4 text-emerald-400" />
              <span>{t.settings.livePreview}</span>
            </div>

            <div className="bg-white text-black p-4 rounded-xl font-mono text-[11px] shadow-sm border border-neutral-200 max-w-sm mx-auto text-center space-y-1">
              <div className="font-bold text-sm uppercase tracking-wider text-black">
                {formData.storeName || 'TuBodeguita'}
              </div>
              <div className="text-[10px] text-neutral-600">
                {formData.storeSubtitle || 'Point of Sale & Provisions'}
              </div>
              <div className="text-[9px] text-neutral-600">
                {formData.address || '742 Evergreen Terrace, Suite 100'}
              </div>
              <div className="text-[9px] text-neutral-600">
                Tel: {formData.phone || '(555) 902-1200'} • Tax ID: {formData.taxId || '94-204918'}
              </div>
              <div className="border-t border-dashed border-neutral-300 my-2 pt-1 text-[9px] text-neutral-500">
                Station: {formData.terminalId}
              </div>
              <div className="border-t border-dashed border-neutral-300 my-1 pt-1 text-[9px] text-neutral-700 italic">
                "{formData.receiptFooterMessage || 'Thank you for shopping local!'}"
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 Columns: System Color, Network & Cloud Sync */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 0: System-Wide Accent Color Selector */}
          <div
            id="accent-color-section"
            className={`border rounded-2xl p-5 space-y-4 shadow-sm transition-colors ${
              isLight ? 'bg-white border-slate-200' : 'bg-[#121212] border-neutral-800'
            }`}
          >
            <div className={`flex items-center justify-between pb-3 border-b ${
              isLight ? 'border-slate-200' : 'border-neutral-800/80'
            }`}>
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-emerald-400" />
                <h2 className={`text-sm font-bold tracking-wide uppercase ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}>
                  {t.settings.systemColorSection}
                </h2>
              </div>
            </div>

            <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-neutral-400'}`}>
              {t.settings.systemColorDesc}
            </p>

            {/* Color Swatch Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              {availableAccentColors.map((color) => {
                const isSelected = accentColor === color.id;
                return (
                  <button
                    key={color.id}
                    id={`accent-swatch-${color.id}`}
                    type="button"
                    onClick={() => handleAccentSelect(color.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer text-center relative group ${
                      isSelected
                        ? isLight
                          ? 'border-[var(--accent-border)] bg-[var(--accent-light-bg)] shadow-sm ring-2 ring-[var(--accent-border)]/40 text-slate-900 font-semibold'
                          : 'border-emerald-500 bg-neutral-800/90 shadow-md ring-2 ring-emerald-500/40 text-white'
                        : isLight
                        ? 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-slate-700'
                        : 'border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800 hover:border-neutral-700 text-neutral-300'
                    }`}
                  >
                    <div className="relative mb-2">
                      <span
                        className="w-6 h-6 rounded-full block shadow-sm group-hover:scale-110 transition-transform"
                        style={{ backgroundColor: color.hex }}
                      />
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center text-white drop-shadow-sm">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <span className={`text-xs font-semibold ${
                      isSelected
                        ? isLight ? 'text-slate-900 font-bold' : 'text-white'
                        : isLight ? 'text-slate-800' : 'text-white'
                    }`}>
                      {language === 'es' ? color.nameEs : color.name}
                    </span>
                    <span className={`text-[10px] font-mono mt-0.5 uppercase ${
                      isLight ? 'text-slate-400' : 'text-neutral-400'
                    }`}>
                      {color.hex}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 1: Network & Offline Simulation */}
          <div className="bg-[#121212] border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80">
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <Wifi className="w-4 h-4 text-emerald-400" />
                ) : (
                  <WifiOff className="w-4 h-4 text-amber-400" />
                )}
                <h2 className="text-sm font-bold text-white tracking-wide uppercase">
                  {t.settings.networkSection}
                </h2>
              </div>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5 ${
                  isOnline
                    ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/60'
                    : 'bg-amber-950 text-amber-300 border border-amber-800/60'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                {isOnline ? t.nav.online : t.nav.offlineBadge}
              </span>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              {t.settings.networkDesc}
            </p>

            {/* Offline Mode Toggle Button - MOVED FROM TOP NAVBAR */}
            <div className="p-3 bg-neutral-900/80 border border-neutral-800 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-200">
                  {isOnline ? t.settings.onlineMode : t.settings.offlineSimulationMode}
                </span>
                <span className="text-[10px] font-mono text-neutral-400">
                  {isOnline ? 'Network Active' : 'Offline Storage'}
                </span>
              </div>

              <button
                id="settings-toggle-offline-btn"
                onClick={onToggleOnlineSimulation}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer font-medium text-xs ${
                  isOnline
                    ? 'bg-neutral-900 border-neutral-700 hover:border-amber-500/60 hover:bg-neutral-800 text-neutral-200'
                    : 'bg-amber-950/50 border-amber-700 text-amber-300 hover:bg-amber-900/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isOnline
                        ? 'bg-emerald-950/60 border border-emerald-800/60 text-emerald-400'
                        : 'bg-amber-950 border border-amber-800 text-amber-400'
                    }`}
                  >
                    {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">
                      {isOnline
                        ? language === 'es'
                          ? 'Simular Desconexión (Modo Offline)'
                          : 'Simulate Offline Mode'
                        : language === 'es'
                        ? 'Reconectar a la Red (Modo Online)'
                        : 'Restore Online Connection'}
                    </div>
                    <div className="text-[10px] text-neutral-400">
                      {t.settings.toggleOfflineDesc}
                    </div>
                  </div>
                </div>

                {/* Animated Switch Pill */}
                <div
                  className={`w-10 h-5 rounded-full p-0.5 flex items-center transition-colors shrink-0 ${
                    isOnline ? 'bg-emerald-600 justify-end' : 'bg-neutral-700 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
                </div>
              </button>
            </div>
          </div>

          {/* Card 2: Cloud Sync Engine & Actions - MOVED FROM TOP NAVBAR */}
          <div className="bg-[#121212] border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white tracking-wide uppercase">
                  {t.settings.cloudSyncSection}
                </h2>
              </div>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  pendingItems.length > 0
                    ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                    : 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/60'
                }`}
              >
                {pendingItems.length} {language === 'es' ? 'en cola' : 'queued'}
              </span>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              {t.settings.cloudSyncDesc}
            </p>

            {/* Manual Sync Button - MOVED FROM TOP NAVBAR */}
            <div className="space-y-3">
              <button
                id="settings-manual-sync-btn"
                onClick={onTriggerSync}
                disabled={isSyncing || (!isOnline && pendingItems.length === 0)}
                className={`w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                  isSyncing
                    ? 'bg-neutral-800 text-neutral-400 border border-neutral-700 cursor-not-allowed'
                    : pendingItems.length > 0
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white ring-2 ring-emerald-500/40'
                    : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700'
                }`}
              >
                <RefreshCw
                  className={`w-4 h-4 ${isSyncing ? 'animate-spin text-emerald-400' : ''}`}
                />
                <span>
                  {isSyncing ? t.settings.syncInProgress : t.settings.syncNowBtn}
                </span>
                {pendingItems.length > 0 && !isSyncing && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-md bg-emerald-800 text-white text-[10px] font-mono">
                    {pendingItems.length}
                  </span>
                )}
              </button>

              {!isOnline && (
                <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-900/40 flex items-center gap-2 text-amber-300 text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {language === 'es'
                      ? 'Terminal sin conexión: los datos se mantienen a salvo en disco local hasta que se reanude el servicio.'
                      : 'Terminal offline: changes safely buffered in local database until connection resumes.'}
                  </span>
                </div>
              )}
            </div>

            {/* Sync Queue Breakdown List */}
            <div className="pt-2 border-t border-neutral-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-neutral-400" />
                  {t.settings.queueBreakdown}
                </span>
                {syncedItems.length > 0 && onClearSyncedQueue && (
                  <button
                    onClick={onClearSyncedQueue}
                    className="text-[10px] text-neutral-400 hover:text-neutral-200 underline cursor-pointer"
                  >
                    {language === 'es' ? 'Limpiar historial de sincronización' : 'Clear synced history'}
                  </button>
                )}
              </div>

              <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                {syncQueue.length === 0 ? (
                  <div className="p-3 text-center rounded-lg bg-neutral-900 border border-neutral-800/60 text-[11px] text-neutral-500">
                    {t.settings.noPendingItems}
                  </div>
                ) : (
                  syncQueue.slice(0, 10).map((item) => (
                    <div
                      key={item.id}
                      className="p-2 rounded-lg bg-neutral-900/90 border border-neutral-800 flex items-center justify-between text-[11px]"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            item.status === 'synced'
                              ? 'bg-emerald-400'
                              : item.status === 'syncing'
                              ? 'bg-indigo-400 animate-pulse'
                              : 'bg-amber-400'
                          }`}
                        />
                        <span className="font-mono text-neutral-200 font-semibold uppercase text-[10px]">
                          {item.type}
                        </span>
                        <span className="text-neutral-500 text-[10px]">
                          {new Date(item.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </span>
                      </div>

                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded capitalize ${
                          item.status === 'synced'
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/60'
                            : item.status === 'syncing'
                            ? 'bg-indigo-950 text-indigo-300 border border-indigo-900/60'
                            : 'bg-amber-950 text-amber-300 border border-amber-800/60'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Card 3: SQLite Local Database Persistence */}
          <div className="bg-[#121212] border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white tracking-wide uppercase">
                  {language === 'es' ? 'Base de Datos Local SQLite' : 'SQLite Local Database'}
                </h2>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-900/60 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {sqliteStats?.path ? sqliteStats.path.split('/').pop() : 'tubodeguita.sqlite'}
              </span>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              {language === 'es'
                ? 'Todos los productos, ventas, clientes, proveedores y movimientos de cuentas persisten en una base de datos local SQLite almacenada en disco.'
                : 'All products, sales, customers, vendors, and ledger accounts persist in a local SQLite database file stored on disk.'}
            </p>

            {/* SQLite File Info Box */}
            <div className="p-3 bg-neutral-900/80 border border-neutral-800 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-emerald-400" />
                  {language === 'es' ? 'Motor de Base de Datos' : 'Database Engine'}
                </span>
                <span className="font-mono text-[11px] text-neutral-200 font-semibold">
                  SQLite 3 ({sqliteStats?.engine || 'sql.js'})
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400 flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5 text-neutral-400" />
                  {language === 'es' ? 'Archivo en Disco' : 'Disk Location'}
                </span>
                <span className="font-mono text-[11px] text-neutral-300">
                  {sqliteStats?.path || 'data/tubodeguita.sqlite'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-neutral-400" />
                  {language === 'es' ? 'Tamaño del Archivo' : 'File Size'}
                </span>
                <span className="font-mono text-[11px] text-emerald-400 font-bold">
                  {sqliteStats?.sizeFormatted || (loadingStats ? '...' : '240 KB')}
                </span>
              </div>
            </div>

            {/* Table Records Grid */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
                {language === 'es' ? 'Registros en Tablas SQLite' : 'SQLite Table Records'}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
                <div className="p-2 rounded-lg bg-neutral-900/70 border border-neutral-800">
                  <div className="text-[10px] text-neutral-400 uppercase">{language === 'es' ? 'Productos' : 'Products'}</div>
                  <div className="text-sm font-bold text-white mt-0.5">{sqliteStats?.tableCounts?.products ?? '...'}</div>
                </div>
                <div className="p-2 rounded-lg bg-neutral-900/70 border border-neutral-800">
                  <div className="text-[10px] text-neutral-400 uppercase">{language === 'es' ? 'Ventas' : 'Sales'}</div>
                  <div className="text-sm font-bold text-emerald-400 mt-0.5">{sqliteStats?.tableCounts?.sales ?? '...'}</div>
                </div>
                <div className="p-2 rounded-lg bg-neutral-900/70 border border-neutral-800">
                  <div className="text-[10px] text-neutral-400 uppercase">{language === 'es' ? 'Clientes' : 'Customers'}</div>
                  <div className="text-sm font-bold text-blue-400 mt-0.5">{sqliteStats?.tableCounts?.customers ?? '...'}</div>
                </div>
                <div className="p-2 rounded-lg bg-neutral-900/70 border border-neutral-800">
                  <div className="text-[10px] text-neutral-400 uppercase">{language === 'es' ? 'Proveedores' : 'Vendors'}</div>
                  <div className="text-sm font-bold text-purple-400 mt-0.5">{sqliteStats?.tableCounts?.vendors ?? '...'}</div>
                </div>
              </div>
            </div>

            {/* Notification message if sync executed */}
            {sqliteSyncMsg && (
              <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>{sqliteSyncMsg}</span>
              </div>
            )}

            {/* Action Buttons: Sync and Downloads */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                id="btn-sync-sqlite"
                onClick={handleSyncWithSqlite}
                disabled={isSyncingSqlite}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSqlite ? 'animate-spin' : ''}`} />
                <span>{isSyncingSqlite ? (language === 'es' ? 'Sincronizando...' : 'Syncing...') : (language === 'es' ? 'Sincronizar SQLite' : 'Sync SQLite')}</span>
              </button>

              <button
                type="button"
                id="btn-download-sqlite"
                onClick={() => dbService.exportSqliteFile()}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs font-semibold transition-colors cursor-pointer"
                title="Descargar archivo SQLite binario"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>.sqlite File</span>
              </button>

              <button
                type="button"
                id="btn-download-sql"
                onClick={() => dbService.exportSqlDump()}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs font-semibold transition-colors cursor-pointer"
                title="Exportar archivo SQL estándar"
              >
                <FileCode className="w-3.5 h-3.5 text-blue-400" />
                <span>SQL Dump</span>
              </button>
            </div>

            {/* Collapsible SQL Query Console */}
            <div className="pt-2 border-t border-neutral-800/80">
              <button
                type="button"
                id="toggle-sql-console-btn"
                onClick={() => setShowQueryConsole(!showQueryConsole)}
                className="w-full flex items-center justify-between text-xs text-neutral-300 hover:text-white py-1 cursor-pointer"
              >
                <span className="font-semibold flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  {language === 'es' ? 'Consola de Consultas SQL (Avanzado)' : 'SQL Query Console (Advanced)'}
                </span>
                <span className="text-[10px] text-neutral-500 font-mono">
                  {showQueryConsole ? (language === 'es' ? 'Ocultar ▲' : 'Hide ▲') : (language === 'es' ? 'Abrir ▼' : 'Open ▼')}
                </span>
              </button>

              {showQueryConsole && (
                <div className="mt-3 space-y-2.5 pt-2 border-t border-neutral-800/60">
                  {/* Preset Query Chips */}
                  <div className="flex flex-wrap gap-1.5 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setQuerySql('SELECT id, name, category, price, stock FROM products LIMIT 5;')}
                      className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-mono cursor-pointer"
                    >
                      Top Products
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuerySql('SELECT paymentMethod, count(*) as count, round(sum(total),2) as revenue FROM sales GROUP BY paymentMethod;')}
                      className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-mono cursor-pointer"
                    >
                      Sales by Method
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuerySql('SELECT name, currentDebt, creditBalance FROM customers WHERE currentDebt > 0;')}
                      className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-mono cursor-pointer"
                    >
                      Customer Debts
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuerySql('SELECT name, outstandingPayable FROM vendors WHERE outstandingPayable > 0;')}
                      className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-mono cursor-pointer"
                    >
                      Vendor Payables
                    </button>
                  </div>

                  {/* SQL Input */}
                  <div className="relative font-mono">
                    <textarea
                      id="sql-query-input"
                      rows={3}
                      value={querySql}
                      onChange={(e) => setQuerySql(e.target.value)}
                      placeholder="SELECT * FROM products..."
                      className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-emerald-300 text-xs font-mono focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  {/* Execute Button */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      id="btn-run-sql-query"
                      onClick={handleRunQuery}
                      disabled={queryRunning || !querySql.trim()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold cursor-pointer shadow-xs"
                    >
                      <Play className={`w-3 h-3 ${queryRunning ? 'animate-pulse' : ''}`} />
                      <span>{queryRunning ? (language === 'es' ? 'Ejecutando...' : 'Running...') : (language === 'es' ? 'Ejecutar SQL' : 'Run SQL')}</span>
                    </button>
                  </div>

                  {/* Query Result Box */}
                  {queryResult && (
                    <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 max-h-48 overflow-auto text-xs font-mono">
                      {queryResult.error ? (
                        <div className="text-red-400">Error: {queryResult.error}</div>
                      ) : queryResult.columns && queryResult.values ? (
                        <div className="space-y-1">
                          <div className="text-[10px] text-neutral-400 mb-1">
                            {queryResult.rowCount} {language === 'es' ? 'filas encontradas' : 'rows returned'}
                          </div>
                          <table className="w-full text-left border-collapse text-[11px]">
                            <thead>
                              <tr className="border-b border-neutral-800 text-neutral-400">
                                {queryResult.columns.map((col, idx) => (
                                  <th key={idx} className="pb-1 px-1.5 font-semibold text-neutral-300">
                                    {col}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {queryResult.values.map((row, rIdx) => (
                                <tr key={rIdx} className="border-b border-neutral-900 hover:bg-neutral-900/50">
                                  {row.map((val: any, cIdx: number) => (
                                    <td key={cIdx} className="py-1 px-1.5 text-neutral-300">
                                      {val !== null && val !== undefined ? String(val) : '<null>'}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-emerald-400">
                          {queryResult.message || `Query executed successfully (${queryResult.rowsAffected ?? 0} rows affected)`}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
