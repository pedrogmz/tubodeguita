export type Language = 'en' | 'es';

export interface Translations {
  nav: {
    terminalBrand: string;
    terminalSubtitle: string;
    cloudSynced: string;
    offlineMode: string;
    register: string;
    inventory: string;
    customerTabs: string;
    vendorLedger: string;
    dashboard: string;
    online: string;
    offlineBadge: string;
    offlineAlert: string;
    queuedLocally: string;
    toggleConnection: string;
    sync: string;
    syncing: string;
    allSynced: string;
    language: string;
    english: string;
    spanish: string;
    theme: string;
    themeDark: string;
    themeLight: string;
    switchToLight: string;
    switchToDark: string;
    settings: string;
    systemMenu: string;
    networkStatus: string;
  };
  register: {
    searchPlaceholder: string;
    scanBarcodeBtn: string;
    allCategories: string;
    stock: string;
    outOfStock: string;
    lowStock: string;
    unit: string;
    itemsAvailable: string;
    customItemBtn: string;
    cartTitle: string;
    emptyCartTitle: string;
    emptyCartDesc: string;
    clearCart: string;
    walkInCustomer: string;
    selectCustomer: string;
    assignCustomer: string;
    customerDebt: string;
    customerCredit: string;
    customerLimit: string;
    removeCustomer: string;
    subtotal: string;
    discount: string;
    tax: string;
    grandTotal: string;
    chargeBtn: string;
    shortcutBarcode: string;
    shortcutSearch: string;
    shortcutPay: string;
    addCustomItemTitle: string;
    customItemName: string;
    customItemPrice: string;
    customItemQty: string;
    addToCart: string;
    cancel: string;
    aiSmartPairing: string;
    aiInsightTitle: string;
    addPairingBtn: string;
    qtyShort: string;
  };
  checkout: {
    title: string;
    itemCountSingular: string;
    itemCountPlural: string;
    grandTotal: string;
    paymentMethod: string;
    cash: string;
    cashDesc: string;
    card: string;
    cardDesc: string;
    pagoMovil: string;
    pagoMovilDesc: string;
    pagoMovilPhone: string;
    pagoMovilPhonePlaceholder: string;
    pagoMovilCedula: string;
    pagoMovilCedulaPlaceholder: string;
    pagoMovilAmount: string;
    pagoMovilRef: string;
    pagoMovilRefPlaceholder: string;
    pagoMovilHelp: string;
    customerTab: string;
    customerTabDesc: string;
    storeCredit: string;
    storeCreditDesc: string;
    cashTendered: string;
    exact: string;
    changeDue: string;
    insufficientCash: string;
    cashierName: string;
    notesOptional: string;
    notesPlaceholder: string;
    completePayment: string;
    cancel: string;
    noCustomerSelectedWarning: string;
    creditLimitWarning: string;
    insufficientCreditBalance: string;
  };
  receipt: {
    saleCompleted: string;
    print: string;
    copy: string;
    close: string;
    receiptNumber: string;
    receiptNum: string;
    date: string;
    time: string;
    cashier: string;
    customer: string;
    walkIn: string;
    qty: string;
    item: string;
    price: string;
    total: string;
    subtotal: string;
    discount: string;
    salesTax: string;
    grandTotal: string;
    paymentMethod: string;
    tendered: string;
    change: string;
    amountTendered: string;
    changeReturned: string;
    offlineNotice: string;
    cloudNotice: string;
    offlineStored: string;
    cloudVerified: string;
    status: string;
    cloudSynced: string;
    cloudPending: string;
    startNewSale: string;
    thankYou: string;
    copiedNotice: string;
    reprintTitle: string;
  };
  inventory: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    allCategories: string;
    addProductBtn: string;
    addProduct: string;
    aiInsightsBtn: string;
    activeSkus: string;
    unitsInStock: string;
    lowStockWarnings: string;
    totalSkus: string;
    lowStockAlerts: string;
    inventoryValue: string;
    retailValue: string;
    inventoryCost: string;
    productAndSku: string;
    priceAndCost: string;
    quickRestockActions: string;
    restock: string;
    unit: string;
    costPrice: string;
    stockQuantity: string;
    generateBarcode: string;
    scanBarcodeBtn: string;
    sku: string;
    productName: string;
    category: string;
    price: string;
    cost: string;
    margin: string;
    stockLevel: string;
    actions: string;
    adjustStock: string;
    editProduct: string;
    deleteProduct: string;
    addNewProductModalTitle: string;
    editProductModalTitle: string;
    adjustStockModalTitle: string;
    barcode: string;
    minStockThreshold: string;
    unitType: string;
    description: string;
    saveProduct: string;
    currentStock: string;
    adjustmentAmount: string;
    addStock: string;
    reduceStock: string;
    reason: string;
    reasonRestock: string;
    reasonDamaged: string;
    reasonAudit: string;
    reasonReturn: string;
    confirmAdjust: string;
    confirmDeleteTitle: string;
    confirmDeleteMsg: string;
    cancel: string;
    delete: string;
    importExcelBtn: string;
    importExcelModalTitle: string;
    importExcelSubtitle: string;
    downloadTemplate: string;
    downloadTemplateDesc: string;
    dragDropExcel: string;
    clickToUploadExcel: string;
    excelFormats: string;
    validationSummary: string;
    totalRowsDetected: string;
    newProductsCount: string;
    updatedProductsCount: string;
    invalidRowsCount: string;
    updateExistingCheckbox: string;
    stockStrategyReplace: string;
    stockStrategyAdd: string;
    confirmImportBtn: string;
    importingProducts: string;
    previewTitle: string;
    noFileSelected: string;
    invalidFileError: string;
    importSuccessMsg: string;
    pricingStrategyTitle: string;
    bulkCostLabel: string;
    bulkCostPlaceholder: string;
    bulkUnitsLabel: string;
    bulkUnitsPlaceholder: string;
    profitMarginLabel: string;
    profitMarginPlaceholder: string;
    calculatedUnitCost: string;
    suggestedSalePrice: string;
    overridePriceNotice: string;
    bulkPackBadge: string;
  };
  ledger: {
    title: string;
    subtitle: string;
    customerTitle: string;
    customerSubtitle: string;
    vendorTitle: string;
    vendorSubtitle: string;
    customerTabsBtn: string;
    vendorPayablesBtn: string;
    totalCustomerDebt: string;
    totalStoreCredit: string;
    totalAccounts: string;
    totalVendorPayables: string;
    activeVendors: string;
    searchCustomers: string;
    searchVendors: string;
    newCustomerBtn: string;
    newVendorBtn: string;
    owesStore: string;
    zeroBalance: string;
    storeCreditBalance: string;
    creditLimit: string;
    phone: string;
    email: string;
    collectPaymentBtn: string;
    viewHistoryBtn: string;
    hideHistoryBtn: string;
    editCustomer: string;
    deleteCustomer: string;
    editCustomerModalTitle: string;
    confirmDeleteCustomerTitle: string;
    confirmDeleteCustomerMsg: string;
    editVendor: string;
    deleteVendor: string;
    editVendorModalTitle: string;
    confirmDeleteVendorTitle: string;
    confirmDeleteVendorMsg: string;
    outstandingBill: string;
    terms: string;
    recordBillBtn: string;
    payVendorBtn: string;
    collectPaymentModalTitle: string;
    recordBillModalTitle: string;
    payVendorModalTitle: string;
    newCustomerModalTitle: string;
    newVendorModalTitle: string;
    customerName: string;
    vendorName: string;
    contactPerson: string;
    categorySupplied: string;
    paymentAmount: string;
    invoiceAmount: string;
    invoiceNumber: string;
    paymentMethod: string;
    notesOptional: string;
    recordPayment: string;
    recordBill: string;
    disbursePayment: string;
    saveCustomer: string;
    saveVendor: string;
    saveChanges: string;
    deleteCustomerConfirmBtn: string;
    deleteVendorConfirmBtn: string;
    cancel: string;
    transactionHistory: string;
    noTransactionsYet: string;
    date: string;
    type: string;
    amount: string;
    balanceAfter: string;
    reference: string;
  };
  dashboard: {
    title: string;
    subtitle: string;
    queuedChanges: string;
    allDataSynced: string;
    grossSales: string;
    completedTickets: string;
    avgTicket: string;
    netProfit: string;
    netProfitDesc: string;
    customerTabsDebt: string;
    viewAccountsLedger: string;
    wholesalePayables: string;
    manageVendorBills: string;
    recentSales: string;
    openRegister: string;
    reprintReceipt: string;
    noSalesYet: string;
    ringUpSalesDesc: string;
    revenueByPayment: string;
    cashRegister: string;
    cardContactless: string;
    customerTabDebt: string;
    inventoryAlerts: string;
    manageStock: string;
    unitsLeft: string;
    minRequired: string;
    allStockHealthy: string;
    topSellingProducts: string;
    unitsSold: string;
  };
  scanner: {
    modalTitle: string;
    modalSubtitle: string;
    opticalScannerTitle: string;
    opticalScannerDesc: string;
    openCameraBtn: string;
    closeCameraBtn: string;
    pointCameraGuide: string;
    manualInputLabel: string;
    scanCodeBtn: string;
    quickTestTitle: string;
    quickTestDesc: string;
    clickToScan: string;
  };
  settings: {
    title: string;
    subtitle: string;
    storeInfoSection: string;
    storeInfoDesc: string;
    storeName: string;
    storeNamePlaceholder: string;
    storeSubtitle: string;
    storeSubtitlePlaceholder: string;
    address: string;
    addressPlaceholder: string;
    phone: string;
    phonePlaceholder: string;
    taxId: string;
    taxIdPlaceholder: string;
    taxRate: string;
    currencySymbol: string;
    primaryCurrency: string;
    primaryCurrencyDesc: string;
    currencyUSD: string;
    currencyVES: string;
    exchangeRate: string;
    exchangeRateDesc: string;
    exchangeRatePlaceholder: string;
    exchangeRateAutoSync: string;
    exchangeRateAutoSyncDesc: string;
    pricingStrategySection: string;
    pricingStrategyDesc: string;
    pricingMethodManual: string;
    pricingMethodManualDesc: string;
    pricingMethodBulk: string;
    pricingMethodBulkDesc: string;
    syncBcvRateBtn: string;
    syncingBcv: string;
    bcvLastUpdated: string;
    bcvAutoNotice: string;
    bcvSyncSuccess: string;
    bcvSyncError: string;
    bcvOfficialSource: string;
    dualCurrencyPreview: string;
    cashierName: string;
    cashierPlaceholder: string;
    terminalId: string;
    receiptFooter: string;
    receiptFooterPlaceholder: string;
    saveSettings: string;
    savedSuccess: string;
    resetDefaults: string;
    resetConfirm: string;
    systemColorSection: string;
    systemColorDesc: string;
    semanticColorsNotice: string;
    activeThemeLabel: string;
    networkSection: string;
    networkDesc: string;
    currentStatus: string;
    onlineMode: string;
    offlineSimulationMode: string;
    toggleOfflineBtn: string;
    toggleOfflineDesc: string;
    cloudSyncSection: string;
    cloudSyncDesc: string;
    syncNowBtn: string;
    syncInProgress: string;
    pendingItemsCount: string;
    allSyncedNotice: string;
    lastSyncTime: string;
    queueBreakdown: string;
    noPendingItems: string;
    livePreview: string;
    categoriesSection: string;
    categoriesDesc: string;
    addCategoryBtn: string;
    newCategoryPlaceholder: string;
    editCategoryTitle: string;
    deleteCategoryTitle: string;
    confirmDeleteCategory: string;
    reassignProductsTo: string;
    categoryNameLabel: string;
    productCountSingular: string;
    productCountPlural: string;
    categoryAddedSuccess: string;
    categoryUpdatedSuccess: string;
    categoryDeletedSuccess: string;
    categoryAlreadyExists: string;
    categoryEmptyError: string;
    filterCategoriesPlaceholder: string;
    totalCategories: string;
  };
  common: {
    save: string;
    cancel: string;
    close: string;
    delete: string;
    edit: string;
    add: string;
    search: string;
    status: string;
    all: string;
    loading: string;
    success: string;
    error: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    nav: {
      terminalBrand: 'TuBodeguita',
      terminalSubtitle: 'Terminal #01 • Local Engine',
      cloudSynced: 'Cloud Synced',
      offlineMode: 'Offline Mode',
      register: 'Register',
      inventory: 'Inventory',
      customerTabs: 'Customer Tabs',
      vendorLedger: 'Vendor Ledger',
      dashboard: 'Dashboard',
      online: 'Online',
      offlineBadge: 'Offline Mode',
      offlineAlert:
        'OFFLINE MODE ACTIVE — All transactions, inventory adjustments & customer tabs are saved safely to local storage.',
      queuedLocally: 'queued locally',
      toggleConnection: 'Toggle Connection',
      sync: 'Sync',
      syncing: 'Syncing...',
      allSynced: 'All Local Data Synchronized',
      language: 'Language',
      english: 'English',
      spanish: 'Español',
      theme: 'Theme',
      themeDark: 'Dark',
      themeLight: 'Light',
      switchToLight: 'Switch to light theme',
      switchToDark: 'Switch to dark theme',
      settings: 'Settings',
      systemMenu: 'Terminal Settings',
      networkStatus: 'Network & Sync',
    },
    register: {
      searchPlaceholder: 'Search products by name, SKU, or barcode (Press "/" to focus)...',
      scanBarcodeBtn: 'Scan Barcode',
      allCategories: 'All',
      stock: 'Stock',
      outOfStock: 'Out of Stock',
      lowStock: 'Low Stock',
      unit: 'unit',
      itemsAvailable: 'available',
      customItemBtn: '+ Custom Item',
      cartTitle: 'Current Ticket',
      emptyCartTitle: 'Ticket is Empty',
      emptyCartDesc: 'Scan a barcode or click items from the catalog to build this order.',
      clearCart: 'Clear',
      walkInCustomer: 'Walk-In Customer (Cash/Card)',
      selectCustomer: 'Select or Assign Customer',
      assignCustomer: 'Customer / Tab',
      customerDebt: 'Debt',
      customerCredit: 'Credit',
      customerLimit: 'Limit',
      removeCustomer: 'Remove',
      subtotal: 'Subtotal',
      discount: 'Discounts',
      tax: 'Sales Tax (8.25%)',
      grandTotal: 'Grand Total',
      chargeBtn: 'Charge / Checkout',
      shortcutBarcode: 'B Barcode',
      shortcutSearch: '/ Search',
      shortcutPay: 'Space Checkout',
      addCustomItemTitle: 'Add Custom / Miscellaneous Item',
      customItemName: 'Item Description / Name',
      customItemPrice: 'Price ($)',
      customItemQty: 'Quantity',
      addToCart: 'Add to Ticket',
      cancel: 'Cancel',
      aiSmartPairing: 'AI Smart Upsell Recommendations',
      aiInsightTitle: 'Suggested pairings for this cart:',
      addPairingBtn: 'Add to Cart',
      qtyShort: 'Qty',
    },
    checkout: {
      title: 'Complete Payment & Checkout',
      itemCountSingular: 'item',
      itemCountPlural: 'items',
      grandTotal: 'Grand Total',
      paymentMethod: 'Select Payment Method',
      cash: 'Cash Tender',
      cashDesc: 'Cash register drawer with change calculator',
      card: 'Card Terminal',
      cardDesc: 'Debit, credit, contactless chip or mobile pay',
      pagoMovil: 'Pago Móvil',
      pagoMovilDesc: 'Instant interbank transfer in Bolívares (VES)',
      pagoMovilPhone: 'Phone Number',
      pagoMovilPhonePlaceholder: 'e.g. 0414-1234567',
      pagoMovilCedula: 'ID / Tax Document (C.I. / RIF)',
      pagoMovilCedulaPlaceholder: 'e.g. V-12345678',
      pagoMovilAmount: 'Amount in Bolívares (Bs.)',
      pagoMovilRef: 'Last 4 Digits of Reference',
      pagoMovilRefPlaceholder: 'e.g. 4821',
      pagoMovilHelp: 'Enter the mobile payment confirmation details to record and audit the transaction.',
      customerTab: 'Customer Tab (Khata)',
      customerTabDesc: 'Post purchase balance to store ledger account',
      storeCredit: 'Store Credit / Prepaid',
      storeCreditDesc: 'Deduct from existing prepaid customer deposit',
      cashTendered: 'Cash Received From Customer',
      exact: 'Exact',
      changeDue: 'Change Due to Customer',
      insufficientCash: 'Amount tendered is less than the total due.',
      cashierName: 'Cashier / Terminal Operator',
      notesOptional: 'Order Notes / PO Reference (Optional)',
      notesPlaceholder: 'e.g. Delivery instructions, invoice note...',
      completePayment: 'Complete Sale & Print Receipt',
      cancel: 'Cancel',
      noCustomerSelectedWarning: 'Please select a customer before charging to an account tab.',
      creditLimitWarning: 'Notice: Customer balance will exceed credit limit. Confirm override?',
      insufficientCreditBalance: 'Insufficient store credit balance for this customer.',
    },
    receipt: {
      saleCompleted: 'Sale Completed',
      print: 'Print Receipt',
      copy: 'Copy Text',
      close: 'Close',
      receiptNumber: 'Receipt #',
      receiptNum: 'Receipt #',
      date: 'Date',
      time: 'Time',
      cashier: 'Cashier',
      customer: 'Customer',
      walkIn: 'Walk-In Customer',
      qty: 'QTY',
      item: 'ITEM',
      price: 'PRICE',
      total: 'TOTAL',
      subtotal: 'Subtotal',
      discount: 'Discount',
      salesTax: 'Sales Tax',
      grandTotal: 'TOTAL',
      paymentMethod: 'Payment Method',
      tendered: 'Amount Tendered',
      change: 'Change Due',
      amountTendered: 'Tendered',
      changeReturned: 'Change',
      offlineNotice: '*** PROCESSED OFFLINE ON DEVICE ***',
      cloudNotice: '*** CLOUD SYNCHRONIZED ***',
      offlineStored: 'Locally stored offline. Queued for auto-sync.',
      cloudVerified: 'Synchronized with cloud database.',
      status: 'Status',
      cloudSynced: 'Cloud Synced',
      cloudPending: 'Offline Queue',
      startNewSale: 'Start New Sale',
      thankYou: 'Thank you for shopping local! Returns within 14 days with receipt.',
      copiedNotice: 'Receipt text copied to clipboard!',
      reprintTitle: 'Reprint Thermal Receipt',
    },
    inventory: {
      title: 'Inventory Catalog & Stock Control',
      subtitle: 'Real-time stock valuation, barcode tracking, and automated offline updates.',
      searchPlaceholder: 'Search catalog by SKU, name, or barcode...',
      allCategories: 'All Categories',
      addProductBtn: 'Add Product',
      addProduct: 'Add Product',
      aiInsightsBtn: 'AI Stock Advisor',
      activeSkus: 'Active SKUs',
      unitsInStock: 'Total Units in Stock',
      lowStockWarnings: 'Low Stock Alerts',
      totalSkus: 'Total Catalog SKUs',
      lowStockAlerts: 'Low Stock Alerts',
      inventoryValue: 'Total Inventory Valuation',
      retailValue: 'Retail Value',
      inventoryCost: 'Inventory Cost',
      productAndSku: 'Product & SKU',
      priceAndCost: 'Price / Cost',
      quickRestockActions: 'Quick Restock & Actions',
      restock: 'Restock',
      unit: 'Unit',
      costPrice: 'Wholesale Cost Price',
      stockQuantity: 'Current Stock Quantity',
      generateBarcode: 'Generate Random Code',
      scanBarcodeBtn: 'Scan with Camera',
      sku: 'SKU / Barcode',
      productName: 'Product Name',
      category: 'Category',
      price: 'Retail Price',
      cost: 'Cost Price',
      margin: 'Margin',
      stockLevel: 'Current Stock',
      actions: 'Actions',
      adjustStock: 'Adjust Stock',
      editProduct: 'Edit',
      deleteProduct: 'Delete',
      addNewProductModalTitle: 'Create New Inventory Product',
      editProductModalTitle: 'Edit Inventory Product',
      adjustStockModalTitle: 'Quick Stock Adjustment',
      barcode: 'Barcode / UPC / EAN',
      minStockThreshold: 'Low Stock Alert Threshold',
      unitType: 'Unit Measurement',
      description: 'Product Description',
      saveProduct: 'Save Product to Catalog',
      currentStock: 'Current On-Hand Quantity',
      adjustmentAmount: 'Quantity Adjustment (+ / -)',
      addStock: 'Add Units (+)',
      reduceStock: 'Reduce Units (-)',
      reason: 'Adjustment Reason',
      reasonRestock: 'Supplier Restock / Delivery',
      reasonDamaged: 'Damaged / Expired Product',
      reasonAudit: 'Physical Stock Count Audit',
      reasonReturn: 'Customer Return to Shelf',
      confirmAdjust: 'Apply Stock Adjustment',
      confirmDeleteTitle: 'Delete Product',
      confirmDeleteMsg: 'Are you sure you want to delete this product? This cannot be undone.',
      cancel: 'Cancel',
      delete: 'Delete Product',
      importExcelBtn: 'Import Excel',
      importExcelModalTitle: 'Import Products from Excel Spreadsheet',
      importExcelSubtitle: 'Upload a .xlsx, .xls, or .csv spreadsheet to add or update catalog items in bulk.',
      downloadTemplate: 'Download Sample Template (.xlsx)',
      downloadTemplateDesc: 'Pre-formatted with the correct columns, sample items, and data types.',
      dragDropExcel: 'Drag & drop your Excel spreadsheet here, or',
      clickToUploadExcel: 'browse files to upload',
      excelFormats: 'Supports Microsoft Excel (.xlsx, .xls) and Comma-Separated Values (.csv)',
      validationSummary: 'Spreadsheet Analysis & Validation',
      totalRowsDetected: 'Total Rows Found',
      newProductsCount: 'New Products to Add',
      updatedProductsCount: 'Existing Products to Update',
      invalidRowsCount: 'Incomplete / Invalid Rows',
      updateExistingCheckbox: 'Update existing products if SKU, Barcode, or Name matches',
      stockStrategyReplace: 'Replace stock with spreadsheet quantity',
      stockStrategyAdd: 'Add spreadsheet quantity to existing on-hand stock',
      confirmImportBtn: 'Import Products to Catalog',
      importingProducts: 'Importing & Persisting...',
      previewTitle: 'Spreadsheet Data Preview',
      noFileSelected: 'No file selected yet',
      invalidFileError: 'Could not parse file. Please verify it is a valid .xlsx, .xls, or .csv spreadsheet.',
      importSuccessMsg: 'Products imported successfully!',
      pricingStrategyTitle: 'Pricing Strategy & Calculation',
      bulkCostLabel: 'Bulk Pack Cost',
      bulkCostPlaceholder: 'e.g. 24.00',
      bulkUnitsLabel: 'Units per Bulk Pack',
      bulkUnitsPlaceholder: 'e.g. 12',
      profitMarginLabel: 'Desired Profit Margin (%)',
      profitMarginPlaceholder: 'e.g. 25 (25%)',
      calculatedUnitCost: 'Calculated Unit Cost',
      suggestedSalePrice: 'Suggested Selling Price',
      overridePriceNotice: 'Calculated automatically: Unit Cost + Desired Profit %. You can freely adjust the selling price if needed.',
      bulkPackBadge: 'Bulk Pack',
    },
    ledger: {
      title: 'Credit & Accounts Ledger',
      subtitle: 'Customer store tabs (Khata) and wholesale vendor payables management.',
      customerTitle: 'Customer Accounts & Credit Tabs (Khata)',
      customerSubtitle: 'Manage customer credit limits, track unpaid balances, and record payments.',
      vendorTitle: 'Vendor Accounts & Payables',
      vendorSubtitle: 'Track wholesale supplier invoices, payment terms, and disbursements.',
      customerTabsBtn: 'Customer Store Tabs (Khata)',
      vendorPayablesBtn: 'Vendor Accounts Payable',
      totalCustomerDebt: 'Total Customer Receivables',
      totalStoreCredit: 'Prepaid Store Credit',
      totalAccounts: 'Active Accounts',
      totalVendorPayables: 'Total Vendor Payables',
      activeVendors: 'Active Wholesale Vendors',
      searchCustomers: 'Search customer accounts by name or phone...',
      searchVendors: 'Search wholesale vendors by name or contact...',
      newCustomerBtn: 'New Customer Account',
      newVendorBtn: 'Add Wholesale Vendor',
      owesStore: 'Owes Store',
      zeroBalance: 'Paid in Full',
      storeCreditBalance: 'Store Credit Deposit',
      creditLimit: 'Credit Limit',
      phone: 'Phone',
      email: 'Email',
      collectPaymentBtn: 'Record Payment',
      viewHistoryBtn: 'View Ledger Statement',
      hideHistoryBtn: 'Hide Statement',
      editCustomer: 'Edit Customer',
      deleteCustomer: 'Delete Customer',
      editCustomerModalTitle: 'Edit Customer Account Details',
      confirmDeleteCustomerTitle: 'Delete Customer Account',
      confirmDeleteCustomerMsg: 'Are you sure you want to delete this customer account? This will remove the account from your credit ledger.',
      editVendor: 'Edit Vendor',
      deleteVendor: 'Delete Vendor',
      editVendorModalTitle: 'Edit Supplier / Vendor Details',
      confirmDeleteVendorTitle: 'Delete Supplier / Vendor',
      confirmDeleteVendorMsg: 'Are you sure you want to delete this supplier? This will remove the vendor from your payables ledger.',
      outstandingBill: 'Outstanding Payable',
      terms: 'Payment Terms',
      recordBillBtn: 'Record Vendor Invoice',
      payVendorBtn: 'Disburse Payment',
      collectPaymentModalTitle: 'Record Customer Account Payment',
      recordBillModalTitle: 'Record New Wholesale Supply Bill',
      payVendorModalTitle: 'Disburse Payment to Vendor',
      newCustomerModalTitle: 'Open New Customer Credit Tab',
      newVendorModalTitle: 'Register Wholesale Vendor',
      customerName: 'Customer Name',
      vendorName: 'Vendor / Company Name',
      contactPerson: 'Representative / Contact Person',
      categorySupplied: 'Primary Goods Category',
      paymentAmount: 'Payment Received ($)',
      invoiceAmount: 'Invoice Total ($)',
      invoiceNumber: 'Supplier Invoice / Reference #',
      paymentMethod: 'Payment Method',
      notesOptional: 'Transaction Notes (Optional)',
      recordPayment: 'Record Payment & Settle Tab',
      recordBill: 'Record Bill & Update Balance',
      disbursePayment: 'Record Disbursed Payment',
      saveCustomer: 'Open Customer Tab Account',
      saveVendor: 'Save Vendor Details',
      saveChanges: 'Save Changes',
      deleteCustomerConfirmBtn: 'Yes, Delete Customer',
      deleteVendorConfirmBtn: 'Yes, Delete Vendor',
      cancel: 'Cancel',
      transactionHistory: 'Account Statement & Activity Log',
      noTransactionsYet: 'No transactions recorded on this account yet.',
      date: 'Date & Time',
      type: 'Entry Type',
      amount: 'Amount',
      balanceAfter: 'Balance After',
      reference: 'Ref / Note',
    },
    dashboard: {
      title: 'Store Performance & Real-Time Analytics',
      subtitle: 'Offline-first local POS with instant offline logging & automatic cloud synchronization.',
      queuedChanges: 'Offline Changes Queued • Sync Now',
      allDataSynced: 'All Local Data Synchronized',
      grossSales: 'Gross Sales (Processed)',
      completedTickets: 'Completed Tickets',
      avgTicket: 'Avg Ticket',
      netProfit: 'Estimated Net Profit',
      netProfitDesc: 'Revenue minus inventory wholesale cost',
      customerTabsDebt: 'Customer Store Tabs (Debt)',
      viewAccountsLedger: 'View accounts ledger',
      wholesalePayables: 'Wholesale Accounts Payable',
      manageVendorBills: 'Manage vendor bills',
      recentSales: 'Recent POS Sales & Receipts',
      openRegister: 'Open Register',
      reprintReceipt: 'Reprint Thermal Receipt',
      noSalesYet: 'No sales recorded yet',
      ringUpSalesDesc: 'Ring up sales on the Register tab.',
      revenueByPayment: 'Revenue by Payment Channel',
      cashRegister: 'Cash Register',
      cardContactless: 'Card & Contactless',
      customerTabDebt: 'Customer Tab (Debt)',
      inventoryAlerts: 'Inventory Alerts',
      manageStock: 'Manage Stock',
      unitsLeft: 'left',
      minRequired: 'Min',
      allStockHealthy: 'All inventory items are currently above reorder thresholds.',
      topSellingProducts: 'Top Selling Products',
      unitsSold: 'sold',
    },
    scanner: {
      modalTitle: 'Scan Product Barcode / SKU',
      modalSubtitle: 'Camera scanner, USB scanner gun listener, or quick code selection',
      opticalScannerTitle: 'Hardware & Optical Scanner Active',
      opticalScannerDesc: 'Plug any standard USB/Bluetooth handheld barcode scanner gun, or activate camera viewfinder below.',
      openCameraBtn: 'Open Camera Scanner',
      closeCameraBtn: 'Stop Camera',
      pointCameraGuide: 'Point camera at barcode',
      manualInputLabel: 'Manual Barcode or SKU Number',
      scanCodeBtn: 'Scan Code',
      quickTestTitle: 'Quick Test: Click Any In-Stock Product Barcode',
      quickTestDesc: 'Simulates physical scan',
      clickToScan: 'Click to Scan',
    },
    settings: {
      title: 'System & Terminal Settings',
      subtitle: 'Configure store parameters, print metadata, network connectivity, and cloud synchronization.',
      storeInfoSection: 'Store Profile & Identity',
      storeInfoDesc: 'Store branding, contact information, and business parameters printed on thermal receipts.',
      storeName: 'Store Name',
      storeNamePlaceholder: 'e.g. TuBodeguita Market',
      storeSubtitle: 'Store Subtitle / Tagline',
      storeSubtitlePlaceholder: 'e.g. Point of Sale & Provisions',
      address: 'Store Address',
      addressPlaceholder: 'e.g. 742 Evergreen Terrace, Suite 100',
      phone: 'Phone Number',
      phonePlaceholder: 'e.g. (555) 902-1200',
      taxId: 'Tax ID / RFC / CIF',
      taxIdPlaceholder: 'e.g. 94-204918',
      taxRate: 'Sales Tax Rate (%)',
      currencySymbol: 'Currency Symbol',
      primaryCurrency: 'Primary Currency',
      primaryCurrencyDesc: 'Choose whether base product pricing and transactions default to US Dollars ($) or Venezuelan Bolivars (Bs.).',
      currencyUSD: 'US Dollars ($ USD)',
      currencyVES: 'Venezuelan Bolivars (Bs. VES)',
      exchangeRate: 'Exchange Rate (Bs. / USD)',
      exchangeRateDesc: 'Official exchange rate from Central Bank of Venezuela (BCV). Used for simultaneous dual currency operations.',
      exchangeRatePlaceholder: 'e.g. 842.21',
      exchangeRateAutoSync: 'Automatic Exchange Rate Sync',
      exchangeRateAutoSyncDesc: 'Automatically update the official BCV exchange rate every 12 hours from the official API.',
      pricingStrategySection: 'Default Pricing Strategy',
      pricingStrategyDesc: 'Select how selling prices are calculated and assisted when managing catalog products.',
      pricingMethodManual: 'Manual Pricing (Standard)',
      pricingMethodManualDesc: 'Direct entry of selling price. Backward-compatible with standard retail operation.',
      pricingMethodBulk: 'Bulk Pack Pricing (Wholesale)',
      pricingMethodBulkDesc: 'Auto-calculates unit cost from bulk pack cost and units, adding your desired unit profit.',
      syncBcvRateBtn: 'Sync BCV Rate Now',
      syncingBcv: 'Fetching BCV Rate...',
      bcvLastUpdated: 'Last BCV Sync',
      bcvAutoNotice: 'Auto-refreshed every 12 hours from BCV API (rates.dolarvzla.com)',
      bcvSyncSuccess: 'BCV exchange rate synchronized successfully!',
      bcvSyncError: 'Could not fetch BCV rate; preserving current exchange rate.',
      bcvOfficialSource: 'Official BCV Rate',
      dualCurrencyPreview: 'Conversion Preview',
      cashierName: 'Default Cashier Name',
      cashierPlaceholder: 'e.g. Alex Rivera (Terminal 01)',
      terminalId: 'Terminal ID / Register Code',
      receiptFooter: 'Receipt Footer Message',
      receiptFooterPlaceholder: 'Message printed at the bottom of customer receipts',
      saveSettings: 'Save Settings',
      savedSuccess: 'Store settings saved successfully!',
      resetDefaults: 'Reset to Factory Defaults',
      resetConfirm: 'Are you sure you want to reset all store settings to default?',
      systemColorSection: 'Uniform System Accent Color',
      systemColorDesc: 'Set a consistent primary brand color across all action buttons, active navigation tabs, selections, and highlights.',
      semanticColorsNotice: 'System status colors (Danger in red, Warning in amber, Success in green, Info in blue) remain untouched for clear operational safety.',
      activeThemeLabel: 'Active Accent Color',
      networkSection: 'Network & Connectivity Status',
      networkDesc: 'Control local offline resilience and simulate connectivity transitions.',
      currentStatus: 'Current Status',
      onlineMode: 'Connected Online',
      offlineSimulationMode: 'Simulated Offline Mode Active',
      toggleOfflineBtn: 'Toggle Offline Simulation',
      toggleOfflineDesc: 'Simulate network drop to test local-first offline POS capabilities.',
      cloudSyncSection: 'Cloud Synchronization Engine',
      cloudSyncDesc: 'Transactions and ledger entries are securely saved locally first, then synchronized to the cloud.',
      syncNowBtn: 'Sync to Cloud Now',
      syncInProgress: 'Syncing in Progress...',
      pendingItemsCount: 'Pending Records in Local Queue',
      allSyncedNotice: 'All local records are currently synchronized with the cloud database.',
      lastSyncTime: 'Last Sync',
      queueBreakdown: 'Pending Queue Breakdown',
      noPendingItems: 'No items currently queued for synchronization.',
      livePreview: 'Live Thermal Receipt Header Preview',
      categoriesSection: 'Product Categories Management',
      categoriesDesc: 'Create, rename, and delete catalog categories to keep products organized across the register and inventory.',
      addCategoryBtn: 'Add Category',
      newCategoryPlaceholder: 'Category name (e.g. Organic, Pet Supplies)...',
      editCategoryTitle: 'Edit Category',
      deleteCategoryTitle: 'Delete Category',
      confirmDeleteCategory: 'Are you sure you want to delete this category?',
      reassignProductsTo: 'Reassign linked products to:',
      categoryNameLabel: 'Category Name',
      productCountSingular: 'product',
      productCountPlural: 'products',
      categoryAddedSuccess: 'Category added successfully!',
      categoryUpdatedSuccess: 'Category updated and products synced!',
      categoryDeletedSuccess: 'Category deleted successfully!',
      categoryAlreadyExists: 'A category with this name already exists.',
      categoryEmptyError: 'Category name cannot be empty.',
      filterCategoriesPlaceholder: 'Search categories...',
      totalCategories: 'Total Categories',
    },
    common: {
      save: 'Save',
      cancel: 'Cancel',
      close: 'Close',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      search: 'Search',
      status: 'Status',
      all: 'All',
      loading: 'Loading...',
      success: 'Success',
      error: 'Error',
    },
  },
  es: {
    nav: {
      terminalBrand: 'TuBodeguita',
      terminalSubtitle: 'Terminal #01 • Motor Local',
      cloudSynced: 'Sincronizado en Nube',
      offlineMode: 'Modo Sin Conexión',
      register: 'Caja',
      inventory: 'Inventario',
      customerTabs: 'Cuentas Clientes',
      vendorLedger: 'Proveedores',
      dashboard: 'Panel de Control',
      online: 'En Línea',
      offlineBadge: 'Modo Fuera de Línea',
      offlineAlert:
        'MODO SIN CONEXIÓN ACTIVO — Todas las ventas, ajustes de stock y cuentas de clientes se guardan de forma segura localmente.',
      queuedLocally: 'en cola local',
      toggleConnection: 'Alternar Red',
      sync: 'Sincronizar',
      syncing: 'Sincronizando...',
      allSynced: 'Todos los Datos Sincronizados',
      language: 'Idioma',
      english: 'English',
      spanish: 'Español',
      theme: 'Tema',
      themeDark: 'Oscuro',
      themeLight: 'Claro',
      switchToLight: 'Cambiar a tema claro',
      switchToDark: 'Cambiar a tema oscuro',
      settings: 'Ajustes',
      systemMenu: 'Ajustes de Terminal',
      networkStatus: 'Red y Sincronización',
    },
    register: {
      searchPlaceholder: 'Buscar por nombre, SKU o código de barras (Presiona "/" para buscar)...',
      scanBarcodeBtn: 'Escanear Código',
      allCategories: 'Todos',
      stock: 'Stock',
      outOfStock: 'Agotado',
      lowStock: 'Poco Stock',
      unit: 'unidad',
      itemsAvailable: 'disponibles',
      customItemBtn: '+ Ítem Personalizado',
      cartTitle: 'Ticket Actual',
      emptyCartTitle: 'El Ticket está Vacío',
      emptyCartDesc: 'Escanea un código o haz clic en los productos del catálogo para agregarlos.',
      clearCart: 'Vaciar',
      walkInCustomer: 'Cliente Ocasional (Efectivo/Tarjeta)',
      selectCustomer: 'Seleccionar o Asignar Cliente',
      assignCustomer: 'Cliente / Cuenta',
      customerDebt: 'Deuda',
      customerCredit: 'Saldo a Favor',
      customerLimit: 'Límite',
      removeCustomer: 'Quitar',
      subtotal: 'Subtotal',
      discount: 'Descuentos',
      tax: 'Impuestos (8.25%)',
      grandTotal: 'Total General',
      chargeBtn: 'Cobrar / Pagar',
      shortcutBarcode: 'B Código',
      shortcutSearch: '/ Buscar',
      shortcutPay: 'Espacio Cobrar',
      addCustomItemTitle: 'Agregar Producto Personalizado / Varios',
      customItemName: 'Descripción / Nombre del Producto',
      customItemPrice: 'Precio ($)',
      customItemQty: 'Cantidad',
      addToCart: 'Agregar al Ticket',
      cancel: 'Cancelar',
      aiSmartPairing: 'Recomendaciones Inteligentes de Venta Cruzada',
      aiInsightTitle: 'Sugerencias para acompañar este pedido:',
      addPairingBtn: 'Agregar al Carrito',
      qtyShort: 'Cant',
    },
    checkout: {
      title: 'Completar Pago y Venta',
      itemCountSingular: 'artículo',
      itemCountPlural: 'artículos',
      grandTotal: 'Total a Cobrar',
      paymentMethod: 'Selecciona Método de Pago',
      cash: 'Efectivo',
      cashDesc: 'Cajón de dinero con cálculo de cambio',
      card: 'Terminal de Tarjeta',
      cardDesc: 'Débito, crédito, chip sin contacto o punto de venta',
      pagoMovil: 'Pago Móvil',
      pagoMovilDesc: 'Transferencia interbancaria instantánea en Bs.',
      pagoMovilPhone: 'Número Telefónico',
      pagoMovilPhonePlaceholder: 'Ej. 0414-1234567',
      pagoMovilCedula: 'Cédula de Identidad / RIF',
      pagoMovilCedulaPlaceholder: 'Ej. V-12345678',
      pagoMovilAmount: 'Monto en Bolívares (Bs.)',
      pagoMovilRef: 'Últimos 4 Dígitos de Referencia',
      pagoMovilRefPlaceholder: 'Ej. 4821',
      pagoMovilHelp: 'Ingresa los datos del comprobante de Pago Móvil para registrar la transacción.',
      customerTab: 'Cuenta Corriente (Fiado / Khata)',
      customerTabDesc: 'Cargar el saldo a la libreta / cuenta del cliente',
      storeCredit: 'Saldo a Favor / Prepago',
      storeCreditDesc: 'Descontar del depósito anticipado del cliente',
      cashTendered: 'Efectivo Recibido del Cliente',
      exact: 'Exacto',
      changeDue: 'Cambio / Vuelto a Entregar',
      insufficientCash: 'El monto entregado es menor que el total de la venta.',
      cashierName: 'Cajero / Operador de Terminal',
      notesOptional: 'Notas de la Venta / Referencia (Opcional)',
      notesPlaceholder: 'Ej: Instrucciones de entrega, factura...',
      completePayment: 'Finalizar Venta e Imprimir Recibo',
      cancel: 'Cancelar',
      noCustomerSelectedWarning: 'Por favor selecciona un cliente para cargar la venta a su cuenta.',
      creditLimitWarning: 'Aviso: La deuda del cliente superará su límite de crédito. ¿Deseas autorizar?',
      insufficientCreditBalance: 'Saldo a favor insuficiente para cubrir esta compra.',
    },
    receipt: {
      saleCompleted: 'Venta Completada con Éxito',
      print: 'Imprimir Recibo',
      copy: 'Copiar Texto',
      close: 'Cerrar',
      receiptNumber: 'Recibo #',
      receiptNum: 'Recibo #',
      date: 'Fecha',
      time: 'Hora',
      cashier: 'Cajero',
      customer: 'Cliente',
      walkIn: 'Cliente Ocasional',
      qty: 'CANT',
      item: 'ARTÍCULO',
      price: 'PRECIO',
      total: 'TOTAL',
      subtotal: 'Subtotal',
      discount: 'Descuento',
      salesTax: 'Impuestos',
      grandTotal: 'TOTAL',
      paymentMethod: 'Forma de Pago',
      tendered: 'Monto Recibido',
      change: 'Cambio Entregado',
      amountTendered: 'Recibido',
      changeReturned: 'Cambio',
      offlineNotice: '*** PROCESADO LOCALMENTE SIN CONEXIÓN ***',
      cloudNotice: '*** SINCRONIZADO CON LA NUBE ***',
      offlineStored: 'Guardado localmente sin conexión. En cola para sincronizar.',
      cloudVerified: 'Sincronizado con la base de datos en la nube.',
      status: 'Estado',
      cloudSynced: 'En la Nube',
      cloudPending: 'Cola Local',
      startNewSale: 'Nueva Venta',
      thankYou: '¡Gracias por su compra! Cambios o devoluciones dentro de 14 días con su recibo.',
      copiedNotice: '¡Texto del recibo copiado al portapapeles!',
      reprintTitle: 'Reimprimir Recibo Térmico',
    },
    inventory: {
      title: 'Catálogo de Inventario y Control de Stock',
      subtitle: 'Valuación en tiempo real, rastreo por código de barras y actualización fuera de línea.',
      searchPlaceholder: 'Buscar en catálogo por SKU, nombre o código de barras...',
      allCategories: 'Todas las Categorías',
      addProductBtn: 'Agregar Producto',
      addProduct: 'Agregar Producto',
      aiInsightsBtn: 'Asesor IA de Stock',
      activeSkus: 'SKUs Activos',
      unitsInStock: 'Unidades en Stock Total',
      lowStockWarnings: 'Alertas de Stock Bajo',
      totalSkus: 'Total de SKUs en Catálogo',
      lowStockAlerts: 'Alertas de Stock Bajo',
      inventoryValue: 'Valoración Total del Inventario',
      retailValue: 'Valor de Venta',
      inventoryCost: 'Costo Mayorista',
      productAndSku: 'Producto y SKU',
      priceAndCost: 'Precio / Costo',
      quickRestockActions: 'Reabastecer y Acciones',
      restock: 'Reabastecer',
      unit: 'Unidad',
      costPrice: 'Costo Mayorista Unitario',
      stockQuantity: 'Cantidad en Stock Actual',
      generateBarcode: 'Generar Código Aleatorio',
      scanBarcodeBtn: 'Escanear con Cámara',
      sku: 'SKU / Código',
      productName: 'Nombre del Producto',
      category: 'Categoría',
      price: 'Precio Venta',
      cost: 'Costo Mayorista',
      margin: 'Margen',
      stockLevel: 'Stock Actual',
      actions: 'Acciones',
      adjustStock: 'Ajustar Stock',
      editProduct: 'Editar',
      deleteProduct: 'Eliminar',
      addNewProductModalTitle: 'Crear Nuevo Producto en Inventario',
      editProductModalTitle: 'Editar Producto de Inventario',
      adjustStockModalTitle: 'Ajuste Rápido de Stock',
      barcode: 'Código de Barras / UPC / EAN',
      minStockThreshold: 'Umbral Mínimo de Alerta',
      unitType: 'Unidad de Medida',
      description: 'Descripción del Producto',
      saveProduct: 'Guardar Producto en Catálogo',
      currentStock: 'Cantidad Actual en Existencia',
      adjustmentAmount: 'Cantidad a Ajustar (+ / -)',
      addStock: 'Agregar Unidades (+)',
      reduceStock: 'Descontar Unidades (-)',
      reason: 'Motivo del Ajuste',
      reasonRestock: 'Reabastecimiento de Proveedor',
      reasonDamaged: 'Producto Dañado o Vencido',
      reasonAudit: 'Conteo Físico de Auditoría',
      reasonReturn: 'Devolución de Cliente',
      confirmAdjust: 'Aplicar Ajuste de Stock',
      confirmDeleteTitle: 'Eliminar Producto',
      confirmDeleteMsg: '¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.',
      cancel: 'Cancelar',
      delete: 'Eliminar Producto',
      importExcelBtn: 'Importar Excel',
      importExcelModalTitle: 'Importar Productos desde Hoja de Excel',
      importExcelSubtitle: 'Sube un archivo .xlsx, .xls o .csv para agregar o actualizar productos en lote.',
      downloadTemplate: 'Descargar Plantilla de Ejemplo (.xlsx)',
      downloadTemplateDesc: 'Preformateada con las columnas correctas, productos de ejemplo y tipos de datos.',
      dragDropExcel: 'Arrastra y suelta tu archivo Excel aquí, o',
      clickToUploadExcel: 'selecciona un archivo para subir',
      excelFormats: 'Compatible con Microsoft Excel (.xlsx, .xls) y valores separados por comas (.csv)',
      validationSummary: 'Análisis y Validación de la Hoja',
      totalRowsDetected: 'Total de Filas Detectadas',
      newProductsCount: 'Nuevos Productos a Crear',
      updatedProductsCount: 'Productos Existentes a Actualizar',
      invalidRowsCount: 'Filas Incompletas / Inválidas',
      updateExistingCheckbox: 'Actualizar productos existentes si coinciden por SKU, Código de Barras o Nombre',
      stockStrategyReplace: 'Reemplazar el stock con la cantidad del archivo Excel',
      stockStrategyAdd: 'Sumar la cantidad del archivo al stock actual en existencia',
      confirmImportBtn: 'Importar Productos al Catálogo',
      importingProducts: 'Importando y Guardando...',
      previewTitle: 'Vista Previa de Datos',
      noFileSelected: 'Ningún archivo seleccionado todavía',
      invalidFileError: 'No se pudo leer el archivo. Asegúrate de subir un archivo .xlsx, .xls o .csv válido.',
      importSuccessMsg: '¡Productos importados exitosamente!',
      pricingStrategyTitle: 'Estrategia de Fijación de Precios',
      bulkCostLabel: 'Costo del Bulto',
      bulkCostPlaceholder: 'ej. 24.00',
      bulkUnitsLabel: 'Unidades por Bulto',
      bulkUnitsPlaceholder: 'ej. 12',
      profitMarginLabel: 'Ganancia Deseada (%)',
      profitMarginPlaceholder: 'ej. 25 (25%)',
      calculatedUnitCost: 'Costo Unitario Calculado',
      suggestedSalePrice: 'Precio de Venta Sugerido',
      overridePriceNotice: 'Calculado automáticamente: Costo Unitario + % Ganancia. Puedes ajustar o redondear el precio final libremente.',
      bulkPackBadge: 'Por Bulto',
    },
    ledger: {
      title: 'Libro de Crédito y Cuentas Corrientes',
      subtitle: 'Gestión de cuentas corrientes de clientes (Fiado/Khata) y cuentas por pagar a proveedores.',
      customerTitle: 'Cuentas Corrientes y Fiado de Clientes',
      customerSubtitle: 'Gestión de crédito local, límites de fiado, saldos pendientes y abonos de clientes.',
      vendorTitle: 'Cuentas por Pagar a Proveedores',
      vendorSubtitle: 'Control de proveedores mayoristas, facturas de suministros y pagos comerciales.',
      customerTabsBtn: 'Cuentas Corrientes Clientes (Fiado)',
      vendorPayablesBtn: 'Cuentas por Pagar a Proveedores',
      totalCustomerDebt: 'Total a Cobrar a Clientes',
      totalStoreCredit: 'Saldos a Favor / Depósitos',
      totalAccounts: 'Cuentas Activas',
      totalVendorPayables: 'Total por Pagar a Proveedores',
      activeVendors: 'Proveedores Mayoristas Activos',
      searchCustomers: 'Buscar cuentas de clientes por nombre o teléfono...',
      searchVendors: 'Buscar proveedores mayoristas por nombre o contacto...',
      newCustomerBtn: 'Nueva Cuenta de Cliente',
      newVendorBtn: 'Agregar Proveedor',
      owesStore: 'Deuda Pendiente',
      zeroBalance: 'Al Día / Sin Deuda',
      storeCreditBalance: 'Saldo a Favor del Cliente',
      creditLimit: 'Límite de Crédito',
      phone: 'Teléfono',
      email: 'Correo',
      collectPaymentBtn: 'Registrar Abono',
      viewHistoryBtn: 'Ver Estado de Cuenta',
      hideHistoryBtn: 'Ocultar Estado',
      editCustomer: 'Editar Cliente',
      deleteCustomer: 'Eliminar Cliente',
      editCustomerModalTitle: 'Editar Datos de Cuenta del Cliente',
      confirmDeleteCustomerTitle: 'Eliminar Cuenta de Cliente',
      confirmDeleteCustomerMsg: '¿Está seguro de que desea eliminar la cuenta de este cliente? Esta acción removerá su ficha del libro de crédito.',
      editVendor: 'Editar Proveedor',
      deleteVendor: 'Eliminar Proveedor',
      editVendorModalTitle: 'Editar Datos del Proveedor',
      confirmDeleteVendorTitle: 'Eliminar Proveedor',
      confirmDeleteVendorMsg: '¿Está seguro de que desea eliminar este proveedor? Esta acción removerá su registro del libro de cuentas por pagar.',
      outstandingBill: 'Saldo por Pagar',
      terms: 'Condiciones de Pago',
      recordBillBtn: 'Registrar Factura Proveedor',
      payVendorBtn: 'Pagar a Proveedor',
      collectPaymentModalTitle: 'Registrar Abono / Pago de Cliente',
      recordBillModalTitle: 'Registrar Factura de Suministro Mayorista',
      payVendorModalTitle: 'Registrar Pago a Proveedor',
      newCustomerModalTitle: 'Abrir Cuenta de Crédito a Cliente',
      newVendorModalTitle: 'Registrar Proveedor Mayorista',
      customerName: 'Nombre del Cliente',
      vendorName: 'Nombre de Empresa / Proveedor',
      contactPerson: 'Representante o Contacto',
      categorySupplied: 'Categoría de Suministro',
      paymentAmount: 'Monto Recibido ($)',
      invoiceAmount: 'Monto de la Factura ($)',
      invoiceNumber: 'N° Factura / Remisión',
      paymentMethod: 'Forma de Pago',
      notesOptional: 'Notas de la Transacción (Opcional)',
      recordPayment: 'Registrar Abono y Actualizar Saldo',
      recordBill: 'Registrar Factura y Actualizar Deuda',
      disbursePayment: 'Registrar Desembolso de Pago',
      saveCustomer: 'Crear Cuenta de Cliente',
      saveVendor: 'Guardar Proveedor',
      saveChanges: 'Guardar Cambios',
      deleteCustomerConfirmBtn: 'Sí, Eliminar Cuenta',
      deleteVendorConfirmBtn: 'Sí, Eliminar Proveedor',
      cancel: 'Cancelar',
      transactionHistory: 'Historial de Transacciones y Movimientos',
      noTransactionsYet: 'No hay transacciones registradas en esta cuenta aún.',
      date: 'Fecha y Hora',
      type: 'Tipo de Movimiento',
      amount: 'Monto',
      balanceAfter: 'Saldo Posterior',
      reference: 'Referencia / Nota',
    },
    dashboard: {
      title: 'Rendimiento y Analítica de la Tienda en Tiempo Real',
      subtitle: 'POS local fuera de línea con registro instantáneo y sincronización automática en la nube.',
      queuedChanges: 'Cambios Locales en Espera • Sincronizar Ahora',
      allDataSynced: 'Todos los Datos Locales Sincronizados',
      grossSales: 'Ventas Brutas Procesadas',
      completedTickets: 'Tickets Cobrados',
      avgTicket: 'Ticket Promedio',
      netProfit: 'Ganancia Neta Estimada',
      netProfitDesc: 'Ingresos brutos menos el costo mayorista de los artículos',
      customerTabsDebt: 'Cuentas Corrientes Clientes (Deuda)',
      viewAccountsLedger: 'Ver libro de cuentas',
      wholesalePayables: 'Cuentas por Pagar a Proveedores',
      manageVendorBills: 'Gestionar facturas de proveedores',
      recentSales: 'Ventas y Recibos Recientes',
      openRegister: 'Abrir Caja',
      reprintReceipt: 'Reimprimir Recibo Térmico',
      noSalesYet: 'No hay ventas registradas aún',
      ringUpSalesDesc: 'Realiza cobros desde la pestaña de Caja.',
      revenueByPayment: 'Ingresos por Canal de Pago',
      cashRegister: 'Efectivo en Caja',
      cardContactless: 'Tarjetas y Pagos Móviles',
      customerTabDebt: 'Cuenta Corriente (Fiado)',
      inventoryAlerts: 'Alertas de Inventario',
      manageStock: 'Gestionar Stock',
      unitsLeft: 'restantes',
      minRequired: 'Mín',
      allStockHealthy: 'Todos los productos tienen niveles por encima del umbral mínimo.',
      topSellingProducts: 'Productos Más Vendidos',
      unitsSold: 'vendidos',
    },
    scanner: {
      modalTitle: 'Escanear Código de Barras / SKU',
      modalSubtitle: 'Lector por cámara, lector USB/Bluetooth o selección rápida de código',
      opticalScannerTitle: 'Lector Óptico y Hardware Activo',
      opticalScannerDesc: 'Conecta cualquier pistola lectora USB/Bluetooth o activa la cámara web a continuación.',
      openCameraBtn: 'Activar Cámara Lector',
      closeCameraBtn: 'Detener Cámara',
      pointCameraGuide: 'Apunta la cámara al código de barras',
      manualInputLabel: 'Ingreso Manual de Código o SKU',
      scanCodeBtn: 'Escanear',
      quickTestTitle: 'Prueba Rápida: Haz Clic en Cualquier Código en Stock',
      quickTestDesc: 'Simula un escaneo físico',
      clickToScan: 'Clic para Escanear',
    },
    settings: {
      title: 'Ajustes del Sistema y Terminal',
      subtitle: 'Configura parámetros de la tienda, datos del recibo, conectividad de red y sincronización en la nube.',
      storeInfoSection: 'Perfil e Identidad de la Tienda',
      storeInfoDesc: 'Nombre del establecimiento, datos de contacto y parámetros impresos en el recibo térmico.',
      storeName: 'Nombre de la Tienda',
      storeNamePlaceholder: 'ej. TuBodeguita',
      storeSubtitle: 'Subtítulo / Rubro',
      storeSubtitlePlaceholder: 'ej. Punto de Venta y Abarrotes',
      address: 'Dirección del Establecimiento',
      addressPlaceholder: 'ej. 742 Evergreen Terrace, Suite 100',
      phone: 'Teléfono de Contacto',
      phonePlaceholder: 'ej. (555) 902-1200',
      taxId: 'Identificación Fiscal / RIF / RFC',
      taxIdPlaceholder: 'ej. 94-204918',
      taxRate: 'Tasa de Impuesto / IVA (%)',
      currencySymbol: 'Símbolo Monetario',
      primaryCurrency: 'Moneda Principal',
      primaryCurrencyDesc: 'Selecciona si los precios base del inventario y operaciones se gestionan en Dólares ($) o en Bolívares (Bs.).',
      currencyUSD: 'Dólares Estadounidenses ($ USD)',
      currencyVES: 'Bolívares Digitales (Bs. VES)',
      exchangeRate: 'Tasa de Cambio Oficial BCV (Bs. / USD)',
      exchangeRateDesc: 'Tasa oficial del Banco Central de Venezuela. Permite operar simultáneamente en Bolívares y Dólares en caja, inventario y recibos.',
      exchangeRatePlaceholder: 'ej. 842.21',
      exchangeRateAutoSync: 'Sincronización Automática de Tasa',
      exchangeRateAutoSyncDesc: 'Actualizar automáticamente la tasa oficial del BCV cada 12 horas desde la API oficial.',
      pricingStrategySection: 'Estrategia de Fijación de Precios Predeterminada',
      pricingStrategyDesc: 'Selecciona cómo se calcula y asiste el precio de venta en el catálogo de productos.',
      pricingMethodManual: 'Fijación Manual (Estándar)',
      pricingMethodManualDesc: 'Ingreso directo del precio de venta para cada producto. Compatible con el esquema comercial habitual.',
      pricingMethodBulk: 'Por Bulto (Mayorista)',
      pricingMethodBulkDesc: 'Calcula el costo unitario a partir del costo del bulto y sus unidades, sumando la ganancia deseada.',
      syncBcvRateBtn: 'Actualizar Tasa BCV Ahora',
      syncingBcv: 'Consultando tasa oficial BCV...',
      bcvLastUpdated: 'Última sincronización BCV',
      bcvAutoNotice: 'Actualización automática cada 12 horas desde la API del BCV (rates.dolarvzla.com)',
      bcvSyncSuccess: '¡Tasa oficial del BCV actualizada con éxito!',
      bcvSyncError: 'No se pudo consultar el BCV; se mantiene la tasa configurada.',
      bcvOfficialSource: 'Tasa Oficial BCV',
      dualCurrencyPreview: 'Vista Previa de Conversión',
      cashierName: 'Cajero / Operador Predeterminado',
      cashierPlaceholder: 'ej. Alex Rivera (Terminal 01)',
      terminalId: 'Código de Caja / Terminal',
      receiptFooter: 'Mensaje al Pie del Recibo',
      receiptFooterPlaceholder: 'Mensaje de agradecimiento o política impreso al final del ticket',
      saveSettings: 'Guardar Ajustes',
      savedSuccess: '¡Parámetros de la tienda guardados con éxito!',
      resetDefaults: 'Restablecer Valores de Fábrica',
      resetConfirm: '¿Estás seguro de que deseas restablecer los parámetros a los valores por defecto?',
      systemColorSection: 'Color Uniforme del Sistema',
      systemColorDesc: 'Define un color primario homogéneo para todos los botones de acción, pestañas activas, selecciones y acentos del sistema.',
      semanticColorsNotice: 'Los colores semánticos de estado (Peligro en rojo, Alerta en ámbar, Éxito en verde e Información en azul) se conservan intactos por seguridad operativa.',
      activeThemeLabel: 'Color de Acento Activo',
      networkSection: 'Estado de Red y Conectividad',
      networkDesc: 'Controla la resiliencia fuera de línea y simula desconexiones de red.',
      currentStatus: 'Estado Actual',
      onlineMode: 'Conectado en Línea',
      offlineSimulationMode: 'Modo Fuera de Línea Simulado Activo',
      toggleOfflineBtn: 'Alternar Simulación Sin Conexión',
      toggleOfflineDesc: 'Simula pérdida de internet para verificar la autonomía y persistencia local del POS.',
      cloudSyncSection: 'Motor de Sincronización en la Nube',
      cloudSyncDesc: 'Las ventas y movimientos se guardan localmente primero de forma segura y luego se sincronizan a la nube.',
      syncNowBtn: 'Sincronizar a la Nube Ahora',
      syncInProgress: 'Sincronizando registros...',
      pendingItemsCount: 'Registros Pendientes en Cola Local',
      allSyncedNotice: 'Todos los datos locales se encuentran sincronizados con la base de datos en la nube.',
      lastSyncTime: 'Última Sincronización',
      queueBreakdown: 'Desglose de la Cola de Sincronización',
      noPendingItems: 'No hay elementos en espera de sincronización.',
      livePreview: 'Vista Previa del Encabezado de Recibo Térmico',
      categoriesSection: 'Gestión de Categorías de Productos',
      categoriesDesc: 'Agrega, edita, renombra y elimina las categorías del catálogo para organizar el inventario y punto de venta.',
      addCategoryBtn: 'Agregar Categoría',
      newCategoryPlaceholder: 'Nombre de la categoría (ej. Mascotas, Lácteos, Vinos)...',
      editCategoryTitle: 'Editar Categoría',
      deleteCategoryTitle: 'Eliminar Categoría',
      confirmDeleteCategory: '¿Estás seguro de que deseas eliminar esta categoría?',
      reassignProductsTo: 'Reasignar productos vinculados a:',
      categoryNameLabel: 'Nombre de la Categoría',
      productCountSingular: 'producto',
      productCountPlural: 'productos',
      categoryAddedSuccess: '¡Categoría agregada con éxito!',
      categoryUpdatedSuccess: '¡Categoría actualizada y productos sincronizados!',
      categoryDeletedSuccess: '¡Categoría eliminada con éxito!',
      categoryAlreadyExists: 'Ya existe una categoría con este nombre.',
      categoryEmptyError: 'El nombre de la categoría no puede estar vacío.',
      filterCategoriesPlaceholder: 'Buscar categorías...',
      totalCategories: 'Total de Categorías',
    },
    common: {
      save: 'Guardar',
      cancel: 'Cancelar',
      close: 'Cerrar',
      delete: 'Eliminar',
      edit: 'Editar',
      add: 'Agregar',
      search: 'Buscar',
      status: 'Estado',
      all: 'Todos',
      loading: 'Cargando...',
      success: 'Éxito',
      error: 'Error',
    },
  },
};

export const categoryTranslations: Record<string, { en: string; es: string }> = {
  All: { en: 'All', es: 'Todos' },
  'Coffee & Tea': { en: 'Coffee & Tea', es: 'Café y Té' },
  'Dairy & Fresh': { en: 'Dairy & Fresh', es: 'Lácteos y Frescos' },
  Bakery: { en: 'Bakery', es: 'Panadería' },
  'Snacks & Sweets': { en: 'Snacks & Sweets', es: 'Snacks y Dulces' },
  Snacks: { en: 'Snacks', es: 'Snacks' },
  Beverages: { en: 'Beverages', es: 'Bebidas' },
  'Pantry & Grains': { en: 'Pantry & Grains', es: 'Despensa y Granos' },
  Household: { en: 'Household', es: 'Artículos del Hogar' },
  Produce: { en: 'Produce', es: 'Frutas y Verduras' },
  Essentials: { en: 'Essentials', es: 'Artículos Básicos' },
  Electronics: { en: 'Electronics', es: 'Electrónica' },
  Groceries: { en: 'Groceries', es: 'Abarrotes' },
  General: { en: 'General', es: 'General' },
  Custom: { en: 'Custom', es: 'Personalizado' },
};

export const unitTranslations: Record<string, { en: string; es: string }> = {
  bag: { en: 'bag', es: 'bolsa' },
  bottle: { en: 'bottle', es: 'botella' },
  pcs: { en: 'pcs', es: 'pzs' },
  pack: { en: 'pack', es: 'pqte' },
  can: { en: 'can', es: 'lata' },
  box: { en: 'box', es: 'caja' },
  kg: { en: 'kg', es: 'kg' },
  unit: { en: 'unit', es: 'unidad' },
};

export const paymentMethodTranslations: Record<string, { en: string; es: string }> = {
  cash: { en: 'Cash', es: 'Efectivo' },
  card: { en: 'Card', es: 'Tarjeta' },
  pago_movil: { en: 'Pago Móvil', es: 'Pago Móvil' },
  customer_debt: { en: 'Customer Tab (Debt)', es: 'Cuenta Corriente (Fiado)' },
  store_credit: { en: 'Store Credit', es: 'Saldo a Favor' },
  split: { en: 'Split Payment', es: 'Pago Dividido' },
};
