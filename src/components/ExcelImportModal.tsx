import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  X,
  FileText,
  RefreshCw,
  Plus,
  ArrowRight,
  HelpCircle,
  Check,
} from 'lucide-react';
import { Product } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../theme/ThemeContext';
import { useCurrency } from '../currency/CurrencyContext';

interface ParsedRowResult {
  rowNumber: number;
  status: 'new' | 'update' | 'invalid';
  errorMessage?: string;
  matchedProductId?: string;
  data: Partial<Product>;
  rawRow: Record<string, any>;
}

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingProducts: Product[];
  onImportProducts: (productsToSave: Product[]) => Promise<void> | void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  existingProducts,
  onImportProducts,
}) => {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const { formatMoney, currencySymbol } = useCurrency();
  const isLight = theme === 'light';

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRowResult[]>([]);
  const [updateExisting, setUpdateExisting] = useState<boolean>(true);
  const [stockStrategy, setStockStrategy] = useState<'replace' | 'add'>('replace');
  const [filterPreview, setFilterPreview] = useState<'all' | 'new' | 'update' | 'invalid'>('all');
  const [isImporting, setIsImporting] = useState<boolean>(false);

  if (!isOpen) return null;

  // 1. Download Sample Excel Template
  const handleDownloadTemplate = () => {
    const sampleHeaders = [
      {
        Nombre: 'Café Grano Tostado 500g',
        Categoría: 'Coffee & Tea',
        SKU: 'COF-GRN-500',
        'Código de Barras': '750103049101',
        'Precio de Venta': 9.5,
        'Stock Inicial': 35,
        'Stock Mínimo': 10,
        Descripción: 'Café de altura seleccionado 100% Arábica',
      },
      {
        Nombre: 'Leche Entera Orgánica 1L',
        Categoría: 'Dairy & Fresh',
        SKU: 'MLK-ORG-01',
        'Código de Barras': '750103049102',
        'Precio de Venta': 3.75,
        'Stock Inicial': 45,
        'Stock Mínimo': 12,
        Descripción: 'Leche fresca pasteurizada libre de hormonas',
      },
      {
        Nombre: 'Pan Artesanal de Masa Madre',
        Categoría: 'Bakery',
        SKU: 'BAK-SRD-01',
        'Código de Barras': '750103049103',
        'Precio de Venta': 5.5,
        'Stock Inicial': 20,
        'Stock Mínimo': 6,
        Descripción: 'Fermentación natural de 24 horas',
      },
      {
        Nombre: 'Chocolate Amargo 85% Cacao',
        Categoría: 'Snacks & Sweets',
        SKU: 'SNK-DRK-85',
        'Código de Barras': '750103049104',
        'Precio de Venta': 4.25,
        'Stock Inicial': 50,
        'Stock Mínimo': 15,
        Descripción: 'Barra artesanal sin azúcar añadida',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleHeaders);
    // Set auto column widths
    worksheet['!cols'] = [
      { wch: 32 }, // Nombre
      { wch: 18 }, // Categoría
      { wch: 16 }, // SKU
      { wch: 20 }, // Código de Barras
      { wch: 16 }, // Precio de Venta
      { wch: 14 }, // Stock Inicial
      { wch: 14 }, // Stock Mínimo
      { wch: 38 }, // Descripción
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Productos');
    XLSX.writeFile(workbook, 'plantilla_productos_tubodeguita.xlsx');
  };

  // Helper to normalize keys from spreadsheet
  const normalizeKey = (key: string): string => {
    return key
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');
  };

  // 2. Parse Excel File
  const processFile = async (file: File) => {
    setSelectedFile(file);
    setIsParsing(true);
    setParseError(null);
    setParsedRows([]);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        throw new Error(language === 'es' ? 'El archivo Excel no contiene hojas de datos.' : 'The spreadsheet has no worksheets.');
      }

      const worksheet = workbook.Sheets[firstSheetName];
      const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
        defval: '',
        raw: false,
      });

      if (!rawRows || rawRows.length === 0) {
        throw new Error(
          language === 'es'
            ? 'La hoja de cálculo está vacía o no contiene filas con encabezados.'
            : 'The spreadsheet is empty or has no header rows.'
        );
      }

      // Process each row
      const results: ParsedRowResult[] = rawRows.map((raw, index) => {
        const rowNumber = index + 2; // header is row 1
        const normalizedMap: Record<string, any> = {};
        Object.entries(raw).forEach(([k, v]) => {
          normalizedMap[normalizeKey(k)] = v;
        });

        // Helper to extract value with key aliases
        const findVal = (aliases: string[]) => {
          for (const alias of aliases) {
            const clean = normalizeKey(alias);
            if (normalizedMap[clean] !== undefined && normalizedMap[clean] !== '') {
              return normalizedMap[clean];
            }
          }
          return undefined;
        };

        const nameRaw = findVal(['nombre', 'name', 'producto', 'product', 'item', 'descripcionproducto', 'articulo']) || '';
        const name = String(nameRaw).trim();

        const categoryRaw = findVal(['categoria', 'category', 'departamento', 'department', 'rubro', 'familia', 'tipo']) || 'Groceries';
        const category = String(categoryRaw).trim() || 'Groceries';

        const skuRaw = findVal(['sku', 'codigo', 'code', 'ref', 'clave', 'cod']) || '';
        const sku = String(skuRaw).trim();

        const barcodeRaw = findVal(['codigodebarras', 'barcode', 'barras', 'upc', 'ean', 'ean13']) || '';
        const barcode = String(barcodeRaw).trim();

        const priceRaw = findVal(['precio', 'price', 'preciodeventa', 'precioventa', 'pvp', 'valor', 'preciounitario']) || '0';
        const priceNum = parseFloat(String(priceRaw).replace(/[^0-9.-]+/g, '')) || 0;

        const costRaw = findVal(['costo', 'cost', 'preciodecosto', 'preciocosto', 'compra', 'costounitario']) || '';
        const costNum = costRaw !== '' ? parseFloat(String(costRaw).replace(/[^0-9.-]+/g, '')) || 0 : Number((priceNum * 0.6).toFixed(2));

        const stockRaw = findVal(['stock', 'cantidad', 'quantity', 'qty', 'existencia', 'inventario', 'unidades', 'stockinicial']) || '0';
        const stockNum = Math.max(0, parseInt(String(stockRaw).replace(/[^0-9-]+/g, ''), 10) || 0);

        const minStockRaw = findVal(['stockminimo', 'minstock', 'alertastock', 'minimo', 'min']) || '5';
        const minStockNum = Math.max(0, parseInt(String(minStockRaw).replace(/[^0-9-]+/g, ''), 10) || 5);

        const unitRaw = findVal(['unidad', 'unit', 'medida', 'uom']) || 'pcs';
        const unit = String(unitRaw).trim().toLowerCase() || 'pcs';

        const descRaw = findVal(['descripcion', 'description', 'detalle', 'notas', 'detalles']) || '';
        const description = String(descRaw).trim();

        // Validation
        if (!name) {
          return {
            rowNumber,
            status: 'invalid',
            errorMessage: language === 'es' ? 'Falta el nombre del producto' : 'Missing product name',
            data: {},
            rawRow: raw,
          };
        }

        if (priceNum <= 0) {
          return {
            rowNumber,
            status: 'invalid',
            errorMessage: language === 'es' ? 'Precio inválido (debe ser > 0)' : 'Invalid price (must be > 0)',
            data: { name },
            rawRow: raw,
          };
        }

        // Match against existing products
        const existing = existingProducts.find((p) => {
          if (sku && p.sku && p.sku.toLowerCase() === sku.toLowerCase()) return true;
          if (barcode && p.barcode && p.barcode === barcode) return true;
          if (p.name.toLowerCase() === name.toLowerCase()) return true;
          return false;
        });

        if (existing) {
          return {
            rowNumber,
            status: 'update',
            matchedProductId: existing.id,
            data: {
              id: existing.id,
              name: name || existing.name,
              category: category || existing.category,
              sku: sku || existing.sku,
              barcode: barcode || existing.barcode,
              price: priceNum,
              costPrice: costNum,
              stock: stockNum,
              minStock: minStockNum,
              unit: unit || existing.unit,
              description: description || existing.description,
            },
            rawRow: raw,
          };
        }

        // Brand new product
        const randomCode = Math.floor(100000000000 + Math.random() * 900000000000).toString();
        const autoSku = sku || `SKU-${Date.now().toString().slice(-5)}${index}`;
        const autoBarcode = barcode || randomCode;

        return {
          rowNumber,
          status: 'new',
          data: {
            id: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            name,
            category,
            sku: autoSku,
            barcode: autoBarcode,
            price: priceNum,
            costPrice: costNum,
            stock: stockNum,
            minStock: minStockNum,
            unit,
            description,
          },
          rawRow: raw,
        };
      });

      setParsedRows(results);
    } catch (err: any) {
      console.error('Spreadsheet parse error:', err);
      setParseError(err.message || t.inventory.invalidFileError);
    } finally {
      setIsParsing(false);
    }
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Counts
  const newCount = parsedRows.filter((r) => r.status === 'new').length;
  const updateCount = parsedRows.filter((r) => r.status === 'update').length;
  const invalidCount = parsedRows.filter((r) => r.status === 'invalid').length;
  const validTotal = updateExisting ? newCount + updateCount : newCount;

  // Filtered rows for preview table
  const displayedRows = parsedRows.filter((r) => {
    if (filterPreview === 'all') return true;
    return r.status === filterPreview;
  });

  // 3. Confirm Import
  const handleConfirmImport = async () => {
    if (validTotal === 0) return;
    setIsImporting(true);

    try {
      const productsToSave: Product[] = [];

      for (const row of parsedRows) {
        if (row.status === 'invalid') continue;

        if (row.status === 'update') {
          if (!updateExisting) continue;
          const existing = existingProducts.find((p) => p.id === row.matchedProductId);
          if (!existing) continue;

          const calculatedStock =
            stockStrategy === 'add'
              ? existing.stock + (row.data.stock || 0)
              : (row.data.stock ?? existing.stock);

          productsToSave.push({
            ...existing,
            ...row.data,
            id: existing.id,
            stock: calculatedStock,
          } as Product);
        } else if (row.status === 'new') {
          productsToSave.push(row.data as Product);
        }
      }

      await onImportProducts(productsToSave);
      onClose();
    } catch (err: any) {
      console.error('Import confirmation error:', err);
      setParseError(err.message || 'Error saving products');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div
      id="excel-import-modal-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs p-3 sm:p-4"
    >
      <div className="min-h-full flex items-center justify-center py-4">
        <div
          id="excel-import-modal"
          className={`rounded-2xl w-full max-w-4xl max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3rem)] flex flex-col shadow-2xl overflow-hidden my-auto border animate-in fade-in zoom-in-95 duration-150 ${
            isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#121212] border-neutral-800 text-neutral-300'
          }`}
        >
          {/* Header */}
          <div className={`shrink-0 flex items-center justify-between px-6 py-4 border-b ${
            isLight ? 'border-slate-200 bg-slate-50' : 'border-neutral-800 bg-[#0D0D0D]'
          }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 ${
              isLight ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-emerald-950/40 text-emerald-400 border-emerald-900/50'
            }`}>
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {t.inventory.importExcelModalTitle}
              </h3>
              <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                {t.inventory.importExcelSubtitle}
              </p>
            </div>
          </div>
          <button
            id="close-excel-import-btn"
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-200' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Top Download Template Banner */}
          <div className="p-3.5 rounded-xl bg-neutral-900/90 border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400 shrink-0">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">
                  {t.inventory.downloadTemplate}
                </div>
                <div className="text-[11px] text-neutral-400">
                  {t.inventory.downloadTemplateDesc}
                </div>
              </div>
            </div>
            <button
              id="download-excel-template-btn"
              type="button"
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 text-xs font-semibold cursor-pointer transition-colors shadow-xs shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.inventory.downloadTemplate}</span>
            </button>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            id="excel-file-dropzone"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-emerald-500 bg-emerald-950/20 scale-[1.005]'
                : 'border-neutral-700/80 bg-neutral-900/50 hover:border-emerald-600/70 hover:bg-neutral-900/80'
            }`}
          >
            <input
              ref={fileInputRef}
              id="excel-file-upload-input"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-12 h-12 mx-auto rounded-2xl bg-neutral-800/90 border border-neutral-700 flex items-center justify-center text-emerald-400 mb-3 shadow-inner">
              <Upload className="w-6 h-6" />
            </div>

            {selectedFile ? (
              <div className="space-y-1">
                <div className="text-sm font-bold text-white flex items-center justify-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>{selectedFile.name}</span>
                </div>
                <p className="text-xs text-neutral-400">
                  {(selectedFile.size / 1024).toFixed(1)} KB · {language === 'es' ? 'Haz clic para cambiar de archivo' : 'Click to select another file'}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-sm font-semibold text-neutral-200">
                  {t.inventory.dragDropExcel}{' '}
                  <span className="text-emerald-400 underline underline-offset-2">
                    {t.inventory.clickToUploadExcel}
                  </span>
                </p>
                <p className="text-xs text-neutral-500">
                  {t.inventory.excelFormats}
                </p>
              </div>
            )}
          </div>

          {/* Parsing Spinner */}
          {isParsing && (
            <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center gap-3 text-xs text-neutral-300">
              <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />
              <span>{language === 'es' ? 'Analizando estructura de columnas y filas de Excel...' : 'Parsing spreadsheet columns and rows...'}</span>
            </div>
          )}

          {/* Parse Error Box */}
          {parseError && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-900/50 flex items-center gap-3 text-xs text-red-300">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <div className="flex-1">{parseError}</div>
            </div>
          )}

          {/* Analysis & Validation Dashboard */}
          {parsedRows.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                  {t.inventory.validationSummary}
                </h4>
                <span className="text-xs font-mono text-neutral-400">
                  {validTotal} {language === 'es' ? 'productos listos' : 'products ready'}
                </span>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-center">
                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                  <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-sans">
                    {t.inventory.totalRowsDetected}
                  </div>
                  <div className="text-xl font-bold text-white mt-0.5">
                    {parsedRows.length}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-neutral-900 border border-emerald-900/40">
                  <div className="text-[10px] text-emerald-400 uppercase tracking-wider font-sans">
                    {t.inventory.newProductsCount}
                  </div>
                  <div className="text-xl font-bold text-emerald-400 mt-0.5">
                    {newCount}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-neutral-900 border border-blue-900/40">
                  <div className="text-[10px] text-blue-400 uppercase tracking-wider font-sans">
                    {t.inventory.updatedProductsCount}
                  </div>
                  <div className="text-xl font-bold text-blue-400 mt-0.5">
                    {updateCount}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-neutral-900 border border-orange-900/40">
                  <div className="text-[10px] text-orange-400 uppercase tracking-wider font-sans">
                    {t.inventory.invalidRowsCount}
                  </div>
                  <div className="text-xl font-bold text-orange-400 mt-0.5">
                    {invalidCount}
                  </div>
                </div>
              </div>

              {/* Import Options & Strategies */}
              <div className="p-4 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-3">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    id="update-existing-checkbox"
                    checked={updateExisting}
                    onChange={(e) => setUpdateExisting(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 bg-neutral-800 border-neutral-700 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label
                    htmlFor="update-existing-checkbox"
                    className="text-xs font-semibold text-neutral-200 cursor-pointer"
                  >
                    {t.inventory.updateExistingCheckbox}
                  </label>
                </div>

                {updateExisting && updateCount > 0 && (
                  <div className="pl-6 pt-1 space-y-2">
                    <span className="text-[11px] font-semibold text-neutral-400 block">
                      {language === 'es' ? 'Comportamiento del Stock para productos existentes:' : 'Stock behavior for existing products:'}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <label
                        id="stock-replace-option"
                        className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                          stockStrategy === 'replace'
                            ? 'bg-emerald-950/40 border-emerald-700 text-emerald-300'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="stockStrategy"
                          checked={stockStrategy === 'replace'}
                          onChange={() => setStockStrategy('replace')}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>{t.inventory.stockStrategyReplace}</span>
                      </label>

                      <label
                        id="stock-add-option"
                        className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                          stockStrategy === 'add'
                            ? 'bg-emerald-950/40 border-emerald-700 text-emerald-300'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="stockStrategy"
                          checked={stockStrategy === 'add'}
                          onChange={() => setStockStrategy('add')}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>{t.inventory.stockStrategyAdd}</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Preview Table Header & Filter Tabs */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                    {t.inventory.previewTitle}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setFilterPreview('all')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                        filterPreview === 'all'
                          ? 'bg-neutral-700 text-white'
                          : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      {language === 'es' ? 'Todos' : 'All'} ({parsedRows.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterPreview('new')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                        filterPreview === 'new'
                          ? 'bg-emerald-800 text-emerald-200'
                          : 'bg-neutral-900 text-neutral-400 hover:text-emerald-300'
                      }`}
                    >
                      {language === 'es' ? 'Nuevos' : 'New'} ({newCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterPreview('update')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                        filterPreview === 'update'
                          ? 'bg-blue-800 text-blue-200'
                          : 'bg-neutral-900 text-neutral-400 hover:text-blue-300'
                      }`}
                    >
                      {language === 'es' ? 'Actualizar' : 'Update'} ({updateCount})
                    </button>
                    {invalidCount > 0 && (
                      <button
                        type="button"
                        onClick={() => setFilterPreview('invalid')}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                          filterPreview === 'invalid'
                            ? 'bg-orange-800 text-orange-200'
                            : 'bg-neutral-900 text-neutral-400 hover:text-orange-300'
                        }`}
                      >
                        {language === 'es' ? 'Errores' : 'Errors'} ({invalidCount})
                      </button>
                    )}
                  </div>
                </div>

                {/* Preview Table */}
                <div className="bg-[#0D0D0D] rounded-xl border border-neutral-800 overflow-hidden max-h-64 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-950 text-neutral-400 text-[10px] uppercase font-semibold tracking-wider sticky top-0 border-b border-neutral-800">
                      <tr>
                        <th className="py-2 px-3">#</th>
                        <th className="py-2 px-3">{language === 'es' ? 'Estado' : 'Status'}</th>
                        <th className="py-2 px-3">{t.inventory.productName}</th>
                        <th className="py-2 px-3">{t.inventory.category}</th>
                        <th className="py-2 px-3">{t.inventory.sku}</th>
                        <th className="py-2 px-3">{t.inventory.barcode}</th>
                        <th className="py-2 px-3 text-right">{t.inventory.price}</th>
                        <th className="py-2 px-3 text-right">{t.inventory.stockQuantity}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-900">
                      {displayedRows.slice(0, 50).map((row, idx) => (
                        <tr
                          key={idx}
                          className={`hover:bg-neutral-900/60 ${
                            row.status === 'invalid'
                              ? 'bg-red-950/20'
                              : row.status === 'update'
                              ? 'bg-blue-950/10'
                              : ''
                          }`}
                        >
                          <td className="py-2 px-3 font-mono text-neutral-500 text-[11px]">
                            {row.rowNumber}
                          </td>
                          <td className="py-2 px-3 whitespace-nowrap">
                            {row.status === 'new' && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono bg-emerald-950/80 text-emerald-400 border border-emerald-800/70">
                                {language === 'es' ? 'NUEVO' : 'NEW'}
                              </span>
                            )}
                            {row.status === 'update' && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono bg-blue-950/80 text-blue-400 border border-blue-800/70">
                                {language === 'es' ? 'ACTUALIZAR' : 'UPDATE'}
                              </span>
                            )}
                            {row.status === 'invalid' && (
                              <span
                                className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono bg-orange-950/80 text-orange-400 border border-orange-800/70"
                                title={row.errorMessage}
                              >
                                {language === 'es' ? 'ERROR' : 'INVALID'}
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 font-medium text-white max-w-[180px] truncate">
                            {row.data.name || (
                              <span className="text-orange-400 italic">
                                {row.errorMessage}
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-neutral-400">
                            {row.data.category || '-'}
                          </td>
                          <td className="py-2 px-3 font-mono text-[11px] text-neutral-400">
                            {row.data.sku || '-'}
                          </td>
                          <td className="py-2 px-3 font-mono text-[11px] text-neutral-400">
                            {row.data.barcode || '-'}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-semibold text-emerald-400">
                            {row.data.price !== undefined ? formatMoney(row.data.price) : '-'}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-neutral-300">
                            {row.data.stock !== undefined ? row.data.stock : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {displayedRows.length > 50 && (
                  <p className="text-[11px] text-neutral-500 text-center font-mono">
                    {language === 'es' ? `Mostrando primeras 50 filas de ${displayedRows.length}` : `Showing first 50 rows of ${displayedRows.length}`}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className={`shrink-0 px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 ${
          isLight ? 'border-slate-200 bg-slate-50' : 'border-neutral-800 bg-[#0D0D0D]'
        }`}>
          <button
            id="cancel-excel-import-btn"
            type="button"
            onClick={onClose}
            disabled={isImporting}
            className={`w-full sm:w-auto px-4 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
              isLight
                ? 'border-slate-300 text-slate-700 hover:bg-slate-100'
                : 'border-neutral-700 text-neutral-300 hover:bg-neutral-800'
            }`}
          >
            {t.inventory.cancel}
          </button>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 w-full sm:w-auto">
            <div className={`text-xs text-center sm:text-right ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
              {parsedRows.length > 0 ? (
                <span>
                  {validTotal} {language === 'es' ? 'productos serán importados a la base de datos' : 'products will be saved to database'}.
                </span>
              ) : (
                <span>{t.inventory.noFileSelected}</span>
              )}
            </div>

            <button
              id="confirm-excel-import-btn"
              type="button"
              onClick={handleConfirmImport}
              disabled={isImporting || validTotal === 0}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-emerald-950/50 cursor-pointer transition-all"
            >
              {isImporting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>{t.inventory.importingProducts}</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>
                    {t.inventory.confirmImportBtn} ({validTotal})
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);
};
