import React, { useState, useRef, useEffect } from 'react';
import {
  Store,
  Wifi,
  WifiOff,
  RefreshCw,
  ShoppingBag,
  Package,
  BookOpen,
  Truck,
  BarChart3,
  Globe,
  ChevronDown,
  ChevronRight,
  Check,
  Sun,
  Moon,
  Settings,
  Sliders,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../theme/ThemeContext';
import { useCurrency } from '../currency/CurrencyContext';
import { StoreSettings } from '../types';

interface NavbarProps {
  activeTab: 'register' | 'inventory' | 'customer_ledger' | 'vendor_ledger' | 'dashboard' | 'settings';
  setActiveTab: (tab: 'register' | 'inventory' | 'customer_ledger' | 'vendor_ledger' | 'dashboard' | 'settings') => void;
  isOnline: boolean;
  onToggleOnlineSimulation: () => void;
  syncQueueCount: number;
  onTriggerSync: () => void;
  isSyncing: boolean;
  lowStockCount?: number;
  storeSettings?: StoreSettings;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isOnline,
  onToggleOnlineSimulation,
  syncQueueCount,
  onTriggerSync,
  isSyncing,
  lowStockCount = 0,
  storeSettings,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme, toggleTheme } = useTheme();
  const { exchangeRate, primaryCurrency } = useCurrency();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const navItems = [
    {
      id: 'nav-dashboard-btn',
      tab: 'dashboard' as const,
      label: t.nav.dashboard,
      icon: BarChart3,
    },
    {
      id: 'nav-register-btn',
      tab: 'register' as const,
      label: t.nav.register,
      icon: ShoppingBag,
    },
    {
      id: 'nav-inventory-btn',
      tab: 'inventory' as const,
      label: t.nav.inventory,
      icon: Package,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
    },
    {
      id: 'nav-customer-ledger-btn',
      tab: 'customer_ledger' as const,
      label: t.nav.customerTabs,
      icon: BookOpen,
    },
    {
      id: 'nav-vendor-ledger-btn',
      tab: 'vendor_ledger' as const,
      label: t.nav.vendorLedger,
      icon: Truck,
    },
  ];

  // Close dropdown on click outside or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <header className="bg-[#0D0D0D] border-b border-neutral-800 sticky top-0 z-30 shadow-md">
      {/* Offline Alert Strip */}
      {!isOnline && (
        <div
          id="offline-status-banner"
          className="bg-[#1a140a] text-amber-300 border-b border-amber-900/60 px-4 py-1.5 text-xs font-semibold flex items-center justify-between transition-all"
        >
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              {t.nav.offlineAlert}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {syncQueueCount > 0 && (
              <span className="bg-amber-950 text-amber-300 border border-amber-800/60 px-2 py-0.5 rounded-full text-[11px] font-mono font-bold">
                {syncQueueCount} {t.nav.queuedLocally}
              </span>
            )}
            <button
              onClick={onToggleOnlineSimulation}
              className="underline text-amber-400 hover:text-amber-200 text-[11px] font-bold cursor-pointer"
            >
              {t.nav.toggleConnection}
            </button>
          </div>
        </div>
      )}

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-emerald-950/40">
              {storeSettings?.storeName ? storeSettings.storeName.charAt(0).toUpperCase() : 'S'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white">
                  {storeSettings?.storeName || t.nav.terminalBrand}{' '}
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 font-mono">
                {storeSettings?.storeSubtitle || t.nav.terminalSubtitle}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-[#121212] p-1.5 rounded-xl border border-neutral-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.tab;
              return (
                <button
                  key={item.id}
                  id={item.id}
                  onClick={() => setActiveTab(item.tab)}
                  aria-label={item.label}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 relative ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40 font-bold'
                      : 'text-neutral-300 hover:text-white hover:bg-neutral-800/70'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="tracking-tight whitespace-nowrap">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="ml-0.5 bg-amber-500 text-black text-[10px] font-extrabold px-1.5 py-0.5 rounded-full font-mono shadow-xs">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Controls: Quick BCV rate pill and Unified System Dropdown */}
          <div className="flex items-center gap-2">
            {/* BCV Exchange Rate Quick Pill */}
            <button
              onClick={() => setActiveTab('settings')}
              id="navbar-bcv-rate-pill"
              title={t.nav.bcvTooltip}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-neutral-900/90 border border-neutral-800 hover:border-emerald-500/50 hover:bg-neutral-850 text-neutral-300 transition-all cursor-pointer shadow-xs group"
            >
              <span className="text-[10px] font-bold text-emerald-400 group-hover:text-emerald-300 uppercase tracking-wider">BCV</span>
              <span className="font-mono font-bold text-white text-xs">
                {(exchangeRate || 0).toLocaleString(language === 'es' ? 'es-VE' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-neutral-500 font-medium">Bs./$</span>
            </button>

            <div className="relative" ref={menuRef}>
            {/* Dropdown Trigger Button with Tooltip */}
            <div className="relative group flex items-center justify-center">
              <button
                id="system-menu-dropdown-btn"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                title={t.nav.systemMenu}
                aria-label={t.nav.systemMenu}
                aria-expanded={isMenuOpen}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-neutral-900 text-neutral-200 border border-neutral-800 hover:border-emerald-600/80 hover:text-white hover:bg-neutral-800 transition-all cursor-pointer shadow-xs"
              >
                <Settings className={`w-3.5 h-3.5 text-neutral-300 ${isSyncing ? 'animate-spin text-emerald-400' : ''}`} />

                <ChevronDown
                  className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-150 ${
                    isMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Floating Tooltip for System Menu */}
              {!isMenuOpen && (
                <div
                  role="tooltip"
                  className="pointer-events-none absolute right-0 top-full mt-2 hidden group-hover:flex group-focus-within:flex flex-col items-end z-50 transition-opacity duration-150 animate-in fade-in zoom-in-95"
                >
                  <div className="w-2 h-1 mr-3 border-x-4 border-x-transparent border-b-4 border-b-neutral-900" />
                  <span className="px-2.5 py-1 text-[11px] font-medium text-white bg-neutral-900 border border-neutral-700/80 rounded-md shadow-xl whitespace-nowrap">
                    {t.nav.systemMenu}
                  </span>
                </div>
              )}
            </div>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div
                id="system-menu-dropdown"
                className="absolute right-0 mt-2 w-72 bg-[#141414] border border-neutral-800 rounded-xl shadow-2xl p-3 z-50 text-xs space-y-3 animate-in fade-in zoom-in-95 duration-100"
              >
                {/* Quick Link to Settings Page */}
                <button
                  id="system-menu-open-settings-btn"
                  onClick={() => {
                    setActiveTab('settings');
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 hover:border-emerald-600/70 text-neutral-200 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                      <Sliders className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-xs text-white">
                        {t.settings.title}
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        {t.nav.settingsSubtitle}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* Theme Toggle */}
                <div className="border-t border-neutral-800/80 pt-2.5 space-y-1.5">
                  <div className="flex items-center justify-between px-0.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                      {t.nav.theme}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-neutral-950/80 border border-neutral-800 rounded-lg">
                    <button
                      id="theme-select-dark-btn"
                      onClick={() => setTheme('dark')}
                      className={`flex items-center justify-center gap-2 py-1.5 px-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                        theme === 'dark'
                          ? 'bg-neutral-800 text-white shadow-xs border border-neutral-700'
                          : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{t.nav.themeDark}</span>
                    </button>
                    <button
                      id="theme-select-light-btn"
                      onClick={() => setTheme('light')}
                      className={`flex items-center justify-center gap-2 py-1.5 px-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                        theme === 'light'
                          ? 'bg-neutral-800 text-emerald-400 shadow-xs border border-neutral-700'
                          : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      <span>{t.nav.themeLight}</span>
                    </button>
                  </div>
                </div>

                {/* Language Switcher */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between px-0.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                      {t.nav.language}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-neutral-950/80 border border-neutral-800 rounded-lg">
                    <button
                      id="lang-select-en-btn"
                      onClick={() => setLanguage('en')}
                      className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                        language === 'en'
                          ? 'bg-emerald-600/20 text-emerald-400 shadow-xs border border-emerald-500/60 font-bold'
                          : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                      }`}
                    >
                      <span className="text-sm">🇺🇸</span>
                      <span>{t.nav.english}</span>
                      {language === 'en' && <Check className="w-3 h-3 text-emerald-400" />}
                    </button>
                    <button
                      id="lang-select-es-btn"
                      onClick={() => setLanguage('es')}
                      className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                        language === 'es'
                          ? 'bg-emerald-600/20 text-emerald-400 shadow-xs border border-emerald-500/60 font-bold'
                          : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                      }`}
                    >
                      <span className="text-sm">🇪🇸</span>
                      <span>{t.nav.spanish}</span>
                      {language === 'es' && <Check className="w-3 h-3 text-emerald-400" />}
                    </button>
                  </div>
                </div>
              </div>
            )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden overflow-x-auto py-2 px-1 gap-1 border-t border-neutral-800 scrollbar-none justify-around items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.tab;
            return (
              <button
                key={`mobile-${item.id}`}
                id={`mobile-${item.id}`}
                onClick={() => setActiveTab(item.tab)}
                aria-label={item.label}
                className={`py-1.5 px-2 rounded-lg transition-all cursor-pointer flex flex-col items-center gap-1 relative min-w-[58px] ${
                  isActive
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                }`}
              >
                <div className="relative">
                  <Icon className="w-4 h-4" />
                  {item.badge !== undefined && (
                    <span className="absolute -top-1 -right-2 bg-amber-500 text-black text-[9px] font-extrabold w-3.5 h-3.5 rounded-full flex items-center justify-center font-mono">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] leading-tight font-medium tracking-tight whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
