import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react';
import { dbService } from '../services/db';
import { PrimaryCurrency, StoreSettings } from '../types';

export interface FormatMoneyOptions {
  showSign?: boolean;
  decimals?: number;
  currency?: PrimaryCurrency;
}

export interface CurrencyContextValue {
  primaryCurrency: PrimaryCurrency;
  secondaryCurrency: PrimaryCurrency;
  currencySymbol: string;
  secondarySymbol: string;
  exchangeRate: number; // Bs. per 1 USD
  exchangeRateLastUpdated?: number;
  exchangeRateAutoSync: boolean;
  isSyncingBcv: boolean;
  lastBcvDate?: string;
  syncBcvRate: (force?: boolean) => Promise<{ success: boolean; rate: number; date?: string; error?: string }>;
  formatMoney: (amount: number | undefined | null, options?: FormatMoneyOptions) => string;
  formatSecondaryMoney: (amountInPrimary: number | undefined | null, options?: FormatMoneyOptions) => string;
  formatBoth: (amountInPrimary: number | undefined | null) => { primary: string; secondary: string; combined: string };
  convertAmount: (amount: number, from: PrimaryCurrency, to: PrimaryCurrency) => number;
  toSecondary: (amountInPrimary: number) => number;
  toPrimary: (amountInSecondary: number) => number;
}

const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;
const BCV_DIRECT_URL = 'https://rates.dolarvzla.com/bcv/current.json';

const CurrencyContext = createContext<CurrencyContextValue>({
  primaryCurrency: 'USD',
  secondaryCurrency: 'VES',
  currencySymbol: '$',
  secondarySymbol: 'Bs.',
  exchangeRate: 842.21,
  exchangeRateAutoSync: true,
  isSyncingBcv: false,
  syncBcvRate: async () => ({ success: false, rate: 842.21 }),
  formatMoney: (amount) => `$${Number(amount || 0).toFixed(2)}`,
  formatSecondaryMoney: (amount) => `Bs. ${(Number(amount || 0) * 842.21).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  formatBoth: (amount) => ({
    primary: `$${Number(amount || 0).toFixed(2)}`,
    secondary: `Bs. ${(Number(amount || 0) * 842.21).toFixed(2)}`,
    combined: `$${Number(amount || 0).toFixed(2)} (Bs. ${(Number(amount || 0) * 842.21).toFixed(2)})`,
  }),
  convertAmount: (amount) => amount,
  toSecondary: (amount) => amount * 842.21,
  toPrimary: (amount) => amount / 842.21,
});

export const CurrencyProvider: React.FC<{
  storeSettings?: StoreSettings;
  onSettingsUpdated?: (updated: StoreSettings) => void;
  children: React.ReactNode;
}> = ({ storeSettings: propSettings, onSettingsUpdated, children }) => {
  const currentSettings = propSettings || dbService.getStoreSettings();

  const [primaryCurrency, setPrimaryCurrency] = useState<PrimaryCurrency>(
    currentSettings.primaryCurrency || (currentSettings.currencySymbol === 'Bs.' ? 'VES' : 'USD')
  );
  const [exchangeRate, setExchangeRate] = useState<number>(
    currentSettings.exchangeRate && currentSettings.exchangeRate > 0 ? currentSettings.exchangeRate : 842.21
  );
  const [exchangeRateLastUpdated, setExchangeRateLastUpdated] = useState<number | undefined>(
    currentSettings.exchangeRateLastUpdated
  );
  const [exchangeRateAutoSync, setExchangeRateAutoSync] = useState<boolean>(
    currentSettings.exchangeRateAutoSync !== undefined ? currentSettings.exchangeRateAutoSync : true
  );
  const [lastBcvDate, setLastBcvDate] = useState<string | undefined>();
  const [isSyncingBcv, setIsSyncingBcv] = useState<boolean>(false);

  // Synchronize when parent prop settings change
  useEffect(() => {
    if (propSettings) {
      const pCurr = propSettings.primaryCurrency || (propSettings.currencySymbol === 'Bs.' ? 'VES' : 'USD');
      setPrimaryCurrency(pCurr);
      if (propSettings.exchangeRate && propSettings.exchangeRate > 0) {
        setExchangeRate(propSettings.exchangeRate);
      }
      if (propSettings.exchangeRateLastUpdated) {
        setExchangeRateLastUpdated(propSettings.exchangeRateLastUpdated);
      }
      if (propSettings.exchangeRateAutoSync !== undefined) {
        setExchangeRateAutoSync(propSettings.exchangeRateAutoSync);
      }
    }
  }, [propSettings]);

  const secondaryCurrency: PrimaryCurrency = primaryCurrency === 'USD' ? 'VES' : 'USD';
  const currencySymbol = primaryCurrency === 'USD' ? '$' : 'Bs.';
  const secondarySymbol = primaryCurrency === 'USD' ? 'Bs.' : '$';

  // Function to sync from BCV endpoint or directly from rates.dolarvzla.com
  const syncBcvRate = useCallback(
    async (force: boolean = false): Promise<{ success: boolean; rate: number; date?: string; error?: string }> => {
      setIsSyncingBcv(true);
      try {
        let rate: number | null = null;
        let dateStr: string | undefined;

        // Try our server proxy first (avoids browser CORS issues)
        try {
          const resp = await fetch(`/api/bcv-rate${force ? '?force=true' : ''}`, {
            headers: { Accept: 'application/json' },
          });
          if (resp.ok) {
            const data = await resp.json();
            if (data && typeof data.rate === 'number' && data.rate > 0) {
              rate = data.rate;
              dateStr = data.date;
            }
          }
        } catch (serverErr) {
          console.warn('Server proxy /api/bcv-rate unavailable, attempting direct fetch...', serverErr);
        }

        // Direct fetch fallback if server proxy was not available
        if (!rate) {
          try {
            const directResp = await fetch(BCV_DIRECT_URL);
            if (directResp.ok) {
              const directData = await directResp.json();
              const usdVal = Number(directData?.current?.usd);
              if (usdVal && !isNaN(usdVal) && usdVal > 0) {
                rate = usdVal;
                dateStr = directData?.current?.date;
              }
            }
          } catch (directErr) {
            console.warn('Direct BCV fetch failed:', directErr);
          }
        }

        if (rate && rate > 0) {
          const now = Date.now();
          setExchangeRate(rate);
          setExchangeRateLastUpdated(now);
          if (dateStr) setLastBcvDate(dateStr);

          // Persist to store settings
          const latest = dbService.getStoreSettings();
          const updatedSettings: StoreSettings = {
            ...latest,
            exchangeRate: rate,
            exchangeRateLastUpdated: now,
          };
          dbService.saveStoreSettings(updatedSettings);
          if (onSettingsUpdated) {
            onSettingsUpdated(updatedSettings);
          }

          return { success: true, rate, date: dateStr };
        } else {
          throw new Error('No se pudo obtener una tasa válida desde la API del BCV');
        }
      } catch (err: any) {
        console.error('Failed to sync BCV rate:', err);
        return { success: false, rate: exchangeRate, error: err.message };
      } finally {
        setIsSyncingBcv(false);
      }
    },
    [exchangeRate, onSettingsUpdated]
  );

  // Automatic 12-hour scheduler:
  // 1. Trigger on initial mount if auto-sync is enabled and last update is > 12 hours ago (or missing)
  // 2. Run interval checking every 5 minutes whether 12h threshold is reached
  useEffect(() => {
    if (!exchangeRateAutoSync) {
      return;
    }

    const checkAndSync = () => {
      const last = exchangeRateLastUpdated || 0;
      const elapsed = Date.now() - last;
      if (elapsed >= TWELVE_HOURS_MS) {
        console.log(`[BCV Auto-Sync] 12 hours elapsed (${(elapsed / 3600000).toFixed(1)}h). Refreshing BCV rate...`);
        syncBcvRate(false);
      }
    };

    // Initial check
    checkAndSync();

    // Periodic check every 5 minutes
    const intervalId = setInterval(checkAndSync, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [exchangeRateAutoSync, exchangeRateLastUpdated, syncBcvRate]);

  // Conversion math
  const convertAmount = useCallback(
    (amount: number, from: PrimaryCurrency, to: PrimaryCurrency): number => {
      if (from === to) return amount;
      const rate = exchangeRate > 0 ? exchangeRate : 842.21;
      if (from === 'USD' && to === 'VES') {
        return amount * rate;
      }
      if (from === 'VES' && to === 'USD') {
        return amount / rate;
      }
      return amount;
    },
    [exchangeRate]
  );

  const toSecondary = useCallback(
    (amountInPrimary: number): number => {
      return convertAmount(amountInPrimary, primaryCurrency, secondaryCurrency);
    },
    [convertAmount, primaryCurrency, secondaryCurrency]
  );

  const toPrimary = useCallback(
    (amountInSecondary: number): number => {
      return convertAmount(amountInSecondary, secondaryCurrency, primaryCurrency);
    },
    [convertAmount, primaryCurrency, secondaryCurrency]
  );

  const value = useMemo(() => {
    const formatNumber = (val: number, decimals: number, isVes: boolean): string => {
      if (isVes) {
        return val.toLocaleString('es-VE', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        });
      }
      return val.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    };

    const formatMoney = (
      amount: number | undefined | null,
      options?: FormatMoneyOptions
    ): string => {
      const val = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
      const targetCurrency = options?.currency || primaryCurrency;
      const sym = targetCurrency === 'VES' ? 'Bs.' : '$';
      const isVes = targetCurrency === 'VES';
      const decimals = options?.decimals !== undefined ? options.decimals : 2;
      const isNegative = val < 0;
      const absFormatted = formatNumber(Math.abs(val), decimals, isVes);

      if (isNegative) {
        return `-${sym} ${absFormatted}`.replace('$-', '-$').replace('$ ', '$');
      }
      if (options?.showSign && val > 0) {
        return `+${sym} ${absFormatted}`.replace('$ ', '$');
      }
      return `${sym}${isVes ? ' ' : ''}${absFormatted}`;
    };

    const formatSecondaryMoney = (
      amountInPrimary: number | undefined | null,
      options?: FormatMoneyOptions
    ): string => {
      const val = typeof amountInPrimary === 'number' && !isNaN(amountInPrimary) ? amountInPrimary : 0;
      const converted = toSecondary(val);
      return formatMoney(converted, { ...options, currency: secondaryCurrency });
    };

    const formatBoth = (
      amountInPrimary: number | undefined | null
    ): { primary: string; secondary: string; combined: string } => {
      const prim = formatMoney(amountInPrimary);
      const sec = formatSecondaryMoney(amountInPrimary);
      return {
        primary: prim,
        secondary: sec,
        combined: `${prim} (${sec})`,
      };
    };

    return {
      primaryCurrency,
      secondaryCurrency,
      currencySymbol,
      secondarySymbol,
      exchangeRate,
      exchangeRateLastUpdated,
      exchangeRateAutoSync,
      isSyncingBcv,
      lastBcvDate,
      syncBcvRate,
      formatMoney,
      formatSecondaryMoney,
      formatBoth,
      convertAmount,
      toSecondary,
      toPrimary,
    };
  }, [
    primaryCurrency,
    secondaryCurrency,
    currencySymbol,
    secondarySymbol,
    exchangeRate,
    exchangeRateLastUpdated,
    exchangeRateAutoSync,
    isSyncingBcv,
    lastBcvDate,
    syncBcvRate,
    toSecondary,
    convertAmount,
    toPrimary,
  ]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    const defaultSettings = dbService.getStoreSettings();
    const sym = defaultSettings.currencySymbol || '$';
    return {
      primaryCurrency: (defaultSettings.primaryCurrency || 'USD') as PrimaryCurrency,
      secondaryCurrency: (defaultSettings.primaryCurrency === 'VES' ? 'USD' : 'VES') as PrimaryCurrency,
      currencySymbol: sym,
      secondarySymbol: sym === '$' ? 'Bs.' : '$',
      exchangeRate: defaultSettings.exchangeRate || 842.21,
      exchangeRateLastUpdated: defaultSettings.exchangeRateLastUpdated,
      isSyncingBcv: false,
      syncBcvRate: async () => ({ success: false, rate: 842.21 }),
      formatMoney: (amount: number | undefined | null) =>
        `${sym}${Number(amount || 0).toFixed(2)}`,
      formatSecondaryMoney: (amount: number | undefined | null) =>
        `${sym === '$' ? 'Bs. ' : '$'}${Number(amount || 0).toFixed(2)}`,
      formatBoth: (amount: number | undefined | null) => ({
        primary: `${sym}${Number(amount || 0).toFixed(2)}`,
        secondary: `${sym === '$' ? 'Bs. ' : '$'}${Number(amount || 0).toFixed(2)}`,
        combined: `${sym}${Number(amount || 0).toFixed(2)}`,
      }),
      convertAmount: (amount: number) => amount,
      toSecondary: (amount: number) => amount,
      toPrimary: (amount: number) => amount,
    };
  }
  return context;
};
