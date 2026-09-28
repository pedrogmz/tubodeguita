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
    settingsSubtitle: string;
    bcvTooltip: string;
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
    perUnit: string;
    discountShort: string;
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
    billsAndChange: string;
    cardPos: string;
    pagoMovilBs: string;
    chargeToTab: string;
    prepaidCredit: string;
    cardTerminalReady: string;
    cardTerminalInstructions: string;
    authorizedAmount: string;
    useCustomer: string;
    exactAmount: string;
    refDigitsHint: string;
    tabCustomerDescription: string;
    changeCustomer: string;
    currentDebtLabel: string;
    projectedDebtLabel: string;
    selectCustomerForTab: string;
    chooseCustomerForTabPlaceholder: string;
    tabExplanation: string;
    availableCreditLabel: string;
    remainingCreditLabel: string;
    selectCustomerCredit: string;
    chooseCustomerCreditPlaceholder: string;
    phoneRequired: string;
    cedulaRequired: string;
    validAmountRequired: string;
    validRefRequired: string;
    shortageWarning: string;
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
    defaultSubtitle: string;
    tableQtyItemTotal: string;
    pagoMovilDetailsHeader: string;
    phoneLabel: string;
    cedulaLabel: string;
    amountPaidLabel: string;
    refLast4Label: string;
    chargedToTabNotice: string;
    itemAndQty: string;
    discountAbbr: string;
    exemptTax: string;
    footerKeepReceipt: string;
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
    catalogSize: string;
    acrossCategories: string;
    shelfValue: string;
    needReplenishment: string;
    aiInsightsTitle: string;
    aiInsightsDismiss: string;
    actionLabel: string;
    unitsPerPack: string;
    noProductsFound: string;
    editProductDetails: string;
    addNewItem: string;
    catalogAndPricingSubtitle: string;
    productNameExample: string;
    createNewCategoryPrompt: string;
    bulkPackParams: string;
    calcAssistant: string;
    profitPerUnit: string;
    editableSuggested: string;
    scanOrTypeBarcode: string;
    deletingProduct: string;
    analyzingAi: string;
    aiLowStockTitle: string;
    aiLowStockMsg: string;
    aiLowStockAction: string;
    aiMarginTitle: string;
    aiMarginMsg: string;
    aiMarginAction: string;
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
    recordsCount: string;
    currentDebtBadge: string;
    availableCreditBadge: string;
    availAbbr: string;
    limitExceededNotice: string;
    usedLimitLabel: string;
    ofLimitLabel: string;
    totalLimitLabel: string;
    customerBalanceWarning: string;
    vendorBalanceWarning: string;
    chargeSaleDebt: string;
    paymentReceived: string;
    supplyInvoice: string;
    paymentDisbursed: string;
    cashPayment: string;
    cardPayment: string;
    bankTransferACH: string;
    companyCheck: string;
    corporateCard: string;
    registerCashPayment: string;
    paymentRefNumber: string;
    itemsSuppliedDesc: string;
    createTabDescription: string;
    registerVendorDescription: string;
    codTerms: string;
    dueOnReceiptTerms: string;
    initialDebtLabel: string;
    initialPayableLabel: string;
    notesAndTermsLabel: string;
    optionalLabel: string;
    accountsWithDebtCount: string;
    activeCustomerLedgers: string;
    suppliersWithBalanceCount: string;
    activeSuppliersCount: string;
    openBillsNotice: string;
    zeroBalanceNotice: string;
    deletingRecord: string;
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
    customerPrefix: string;
    walkInCustomer: string;
    itemSingular: string;
    itemsPlural: string;
    taxLabel: string;
    mobilePaymentLabel: string;
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
    cameraStarting: string;
    liveBadge: string;
    cameraDeviceLabel: string;
    torchTitle: string;
    uploadBarcodePhoto: string;
    cameraNotice: string;
    retryCamera: string;
    openNewTab: string;
    scannedSuccess: string;
    manualInputPlaceholder: string;
    hardwareScannerNotice: string;
    permissionDeniedError: string;
    noCameraDetectedError: string;
    cameraInUseError: string;
    cameraApiNotSupportedError: string;
    noBarcodeInImageError: string;
    couldNotDecodeImageError: string;
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
    sqliteSuccess: string;
    sqliteError: string;
    systemCurrenciesTitle: string;
    usdDescription: string;
    vesDescription: string;
    autoSyncActive: string;
    autoSyncDisabled: string;
    disableAutoSync: string;
    enableAutoSync: string;
    noCategoriesFound: string;
    categoryContainsProducts: string;
    noProductsInCategory: string;
    reassignAndDelete: string;
    simulateOffline: string;
    restoreOnline: string;
    offlineNoticeInSettings: string;
    clearSyncHistory: string;
    sqliteDbSection: string;
    sqliteDbDesc: string;
    dbEngine: string;
    diskLocation: string;
    fileSize: string;
    tableRecords: string;
    recordsProducts: string;
    recordsSales: string;
    recordsCustomers: string;
    recordsVendors: string;
    syncSqliteBtn: string;
    syncingSqliteBtn: string;
    sqlConsoleTitle: string;
    hideConsole: string;
    openConsole: string;
    runSql: string;
    runningSql: string;
    rowsFound: string;
    savedToast: string;
    justConfigured: string;
    inQueue: string;
  };
  excel: {
    noSheetsError: string;
    emptySheetError: string;
    missingNameError: string;
    invalidPriceError: string;
    clickToChangeFile: string;
    parsingFile: string;
    productsReady: string;
    stockBehaviorTitle: string;
    filterAll: string;
    filterNew: string;
    filterUpdate: string;
    filterErrors: string;
    statusCol: string;
    badgeNew: string;
    badgeUpdate: string;
    badgeError: string;
    showingRows: string;
    willBeSaved: string;
  };
  alerts: {
    networkRestored: string;
    networkDisconnected: string;
    syncSuccess: string;
    syncFailed: string;
    switchedToOnline: string;
    simulatingOffline: string;
    settingsSaved: string;
    settingsReset: string;
    queueCleared: string;
    productNotFound: string;
    productOutOfStock: string;
    cannotAddMoreStock: string;
    productScanned: string;
    saleSuccess: string;
    nameAndPriceRequired: string;
    validPaymentRequired: string;
    validInvoiceRequired: string;
    productDeletedToast: string;
    productsImportedToast: string;
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
    unitsAbbr: string;
    perUnitAbbr: string;
    discountAbbr: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    nav: {
      terminalBrand: 'TuBodeguita',
      terminalSubtitle: 'Register #01 • Local System',
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
      settingsSubtitle: 'Store params, network & sync',
      bcvTooltip: 'Official BCV Rate. Click to view in Settings',
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
      tax: 'Sales Tax',
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
      perUnit: 'ea',
      discountShort: 'off',
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
      customerTab: 'Customer Tab',
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
      billsAndChange: 'Bills & Change',
      cardPos: 'Chip / POS',
      pagoMovilBs: 'VES Instant',
      chargeToTab: 'Charge to Debt',
      prepaidCredit: 'Pre-paid Balance',
      cardTerminalReady: 'Card Terminal Ready',
      cardTerminalInstructions: 'Ready for contactless tap, EMV chip, or magnetic stripe on connected physical POS terminal.',
      authorizedAmount: 'Authorized Amount',
      useCustomer: 'Use customer',
      exactAmount: 'Exact amount',
      refDigitsHint: 'Exact 4 digits of confirmation reference',
      tabCustomerDescription: 'Saves debt to customer\'s offline ledger statement.',
      changeCustomer: 'Change',
      currentDebtLabel: 'Current Outstanding Debt:',
      projectedDebtLabel: 'New Balance After Sale:',
      selectCustomerForTab: 'Select Customer Account:',
      chooseCustomerForTabPlaceholder: '-- Choose a customer for credit --',
      tabExplanation: 'Select the customer account to add this debt to their ledger.',
      availableCreditLabel: 'Available Credit:',
      remainingCreditLabel: 'Remaining Balance After Sale:',
      selectCustomerCredit: 'Select Customer Account:',
      chooseCustomerCreditPlaceholder: '-- Choose a customer --',
      phoneRequired: 'Please enter the Pago Móvil phone number.',
      cedulaRequired: 'Please enter the ID (C.I. / RIF) of the payer.',
      validAmountRequired: 'Please enter a valid amount in Bolívares (Bs.).',
      validRefRequired: 'Please enter the last 4 digits of the reference (exactly 4 digits).',
      shortageWarning: 'Short by',
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
      defaultSubtitle: 'Point of Sale & Provisions',
      tableQtyItemTotal: 'QTY  ITEM                  TOTAL',
      pagoMovilDetailsHeader: 'PAGO MÓVIL DETAILS:',
      phoneLabel: 'Phone:',
      cedulaLabel: 'ID (C.I./RIF):',
      amountPaidLabel: 'Amount paid:',
      refLast4Label: 'Ref Last 4:',
      chargedToTabNotice: '[CHARGED TO CUSTOMER TAB / DEBT]',
      itemAndQty: 'Item & Qty',
      discountAbbr: 'Disc',
      exemptTax: 'Exempt',
      footerKeepReceipt: 'Keep your digital or paper receipt.',
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
      catalogSize: 'Catalog size',
      acrossCategories: 'Across all categories',
      shelfValue: 'Estimated shelf value',
      needReplenishment: 'Need replenishment',
      aiInsightsTitle: 'AI Stock & Supply Chain Insights',
      aiInsightsDismiss: 'Dismiss',
      actionLabel: 'Action:',
      unitsPerPack: 'units per pack',
      noProductsFound: 'No products matched your criteria.',
      editProductDetails: 'Edit Product Details',
      addNewItem: 'Add New Item',
      catalogAndPricingSubtitle: 'Inventory catalog and pricing',
      productNameExample: 'e.g. Colombian Roast Coffee 340g',
      createNewCategoryPrompt: '+ Create new category...',
      bulkPackParams: 'Bulk Pack Parameters',
      calcAssistant: 'Calculation assistant',
      profitPerUnit: 'Profit per unit:',
      editableSuggested: 'Editable suggested',
      scanOrTypeBarcode: 'Scan or type barcode',
      deletingProduct: 'Deleting...',
      analyzingAi: 'Analyzing...',
      aiLowStockTitle: '{count} Products At Or Below Reorder Level',
      aiLowStockMsg: 'Items ({items}) require vendor restocking immediately to prevent lost register sales.',
      aiLowStockAction: 'Create vendor purchase orders in the Vendor Ledger tab.',
      aiMarginTitle: 'High Margin Velocity',
      aiMarginMsg: 'Coffee & Tea items deliver >45% gross margin. Keep front display fully stocked.',
      aiMarginAction: 'Position high margin snacks beside coffee bags.',
    },
    ledger: {
      title: 'Credit & Accounts Ledger',
      subtitle: 'Customer store tabs and wholesale vendor payables management.',
      customerTitle: 'Customer Accounts & Credit Tabs',
      customerSubtitle: 'Manage customer credit limits, track unpaid balances, and record payments.',
      vendorTitle: 'Vendor Accounts & Payables',
      vendorSubtitle: 'Track wholesale supplier invoices, payment terms, and disbursements.',
      customerTabsBtn: 'Customer Store Tabs',
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
      recordsCount: 'records',
      currentDebtBadge: 'Current Debt',
      availableCreditBadge: 'Available Credit',
      availAbbr: 'avail.',
      limitExceededNotice: 'Exceeded by',
      usedLimitLabel: 'Used:',
      ofLimitLabel: 'of limit',
      totalLimitLabel: 'Total limit:',
      customerBalanceWarning: 'Warning: This customer currently has an unpaid balance of',
      vendorBalanceWarning: 'Warning: This vendor currently has an unpaid balance of',
      chargeSaleDebt: 'Charge / Sale on Tab',
      paymentReceived: 'Debt Payment Received',
      supplyInvoice: 'Supply Delivery Invoice',
      paymentDisbursed: 'Payment Disbursed',
      cashPayment: 'Cash',
      cardPayment: 'Card / POS',
      bankTransferACH: 'Bank Wire / ACH',
      companyCheck: 'Company Check',
      corporateCard: 'Corporate Card',
      registerCashPayment: 'Store Cash Register',
      paymentRefNumber: 'Payment Reference / Check #',
      itemsSuppliedDesc: 'Items / Description',
      createTabDescription: 'Open customer credit tab or account',
      registerVendorDescription: 'Register new vendor and terms',
      codTerms: 'COD (Cash on Delivery)',
      dueOnReceiptTerms: 'Due on Receipt',
      initialDebtLabel: 'Opening Tab Balance',
      initialPayableLabel: 'Initial Outstanding Payable',
      notesAndTermsLabel: 'Notes / Terms',
      optionalLabel: 'Optional',
      accountsWithDebtCount: 'accounts with open tabs',
      activeCustomerLedgers: 'Local ledger accounts',
      suppliersWithBalanceCount: 'Suppliers with Balance',
      activeSuppliersCount: 'Registered supplier accounts',
      openBillsNotice: 'Outstanding bills pending payment',
      zeroBalanceNotice: 'Account up to date (Zero balance)',
      deletingRecord: 'Deleting...',
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
      customerPrefix: 'Customer',
      walkInCustomer: 'Walk-In',
      itemSingular: 'item',
      itemsPlural: 'items',
      taxLabel: 'Tax',
      mobilePaymentLabel: 'Mobile Payment',
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
      cameraStarting: 'Starting camera...',
      liveBadge: 'LIVE',
      cameraDeviceLabel: 'Camera',
      torchTitle: 'Torch / Flash',
      uploadBarcodePhoto: 'Upload Barcode Image',
      cameraNotice: 'Camera Notice',
      retryCamera: 'Retry camera',
      openNewTab: 'Open in new tab',
      scannedSuccess: 'Scanned Successfully!',
      manualInputPlaceholder: 'Enter barcode (e.g. 793573192014) or SKU...',
      hardwareScannerNotice: 'Compatible with USB and Bluetooth scanners',
      permissionDeniedError: 'Camera permission denied. Please allow camera access in your browser or open the app in a new browser tab.',
      noCameraDetectedError: 'No video camera detected on this device.',
      cameraInUseError: 'Camera is currently in use by another application or browser tab.',
      cameraApiNotSupportedError: 'Camera API (getUserMedia) is not supported or restricted in this browser context.',
      noBarcodeInImageError: 'No readable barcode found in the uploaded image.',
      couldNotDecodeImageError: 'Could not decode a barcode from this image. Try a clearer image with uniform lighting.',
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
      sqliteSuccess: 'Successfully synchronized with SQLite!',
      sqliteError: 'Sync failed',
      systemCurrenciesTitle: 'System Currencies (USD & Bolivars)',
      usdDescription: 'Base prices are stored in USD ($) and converted to Bolivars in POS and inventory.',
      vesDescription: 'Base prices are stored in Bs. and converted to USD in POS and inventory.',
      autoSyncActive: 'ACTIVE',
      autoSyncDisabled: 'DISABLED',
      disableAutoSync: 'Disable automatic synchronization',
      enableAutoSync: 'Enable automatic synchronization',
      noCategoriesFound: 'No categories found.',
      categoryContainsProducts: 'This category contains {count} product(s) in catalog.',
      noProductsInCategory: 'There are no products assigned to this category. It will be removed immediately.',
      reassignAndDelete: 'Reassign & Delete',
      simulateOffline: 'Simulate Offline Mode',
      restoreOnline: 'Restore Online Connection',
      offlineNoticeInSettings: 'Terminal offline: changes safely buffered in local database until connection resumes.',
      clearSyncHistory: 'Clear synced history',
      sqliteDbSection: 'SQLite Local Database',
      sqliteDbDesc: 'Local high-performance storage engine preserving store data offline.',
      dbEngine: 'Database Engine',
      diskLocation: 'Disk Location',
      fileSize: 'File Size',
      tableRecords: 'SQLite Table Records',
      recordsProducts: 'Products',
      recordsSales: 'Sales',
      recordsCustomers: 'Customers',
      recordsVendors: 'Vendors',
      syncSqliteBtn: 'Sync SQLite',
      syncingSqliteBtn: 'Syncing...',
      sqlConsoleTitle: 'SQL Query Console (Advanced)',
      hideConsole: 'Hide ▲',
      openConsole: 'Open ▼',
      runSql: 'Run SQL',
      runningSql: 'Running...',
      rowsFound: 'rows returned',
      savedToast: 'Saved!',
      justConfigured: 'Just configured',
      inQueue: 'queued',
    },
    excel: {
      noSheetsError: 'The spreadsheet has no worksheets.',
      emptySheetError: 'The spreadsheet is empty or has no header rows.',
      missingNameError: 'Missing product name',
      invalidPriceError: 'Invalid price (must be > 0)',
      clickToChangeFile: 'Click to select another file',
      parsingFile: 'Parsing spreadsheet columns and rows...',
      productsReady: 'products ready',
      stockBehaviorTitle: 'Stock behavior for existing products:',
      filterAll: 'All',
      filterNew: 'New',
      filterUpdate: 'Update',
      filterErrors: 'Errors',
      statusCol: 'Status',
      badgeNew: 'NEW',
      badgeUpdate: 'UPDATE',
      badgeError: 'INVALID',
      showingRows: 'Showing first 50 rows of',
      willBeSaved: 'products will be saved to database',
    },
    alerts: {
      networkRestored: 'Network restored: Store is online. Cloud sync ready.',
      networkDisconnected: 'Internet disconnected. Offline mode active: All sales & stock saved locally.',
      syncSuccess: 'SQLite database synchronized successfully.',
      syncFailed: 'Sync failed: Saved changes will remain safe in local queue.',
      switchedToOnline: 'Switched to ONLINE mode. Automatic sync available.',
      simulatingOffline: 'Simulating OFFLINE mode (Network dropped). All POS tools remain 100% operational.',
      settingsSaved: 'Store settings saved successfully!',
      settingsReset: 'Settings reset to factory defaults.',
      queueCleared: 'Synced queue history cleared.',
      productNotFound: 'No product found in catalog matching barcode/SKU:',
      productOutOfStock: 'is OUT OF STOCK.',
      cannotAddMoreStock: 'Cannot add more. Only {stock} units available.',
      productScanned: 'Scanned:',
      saleSuccess: 'Sale recorded successfully! Receipt #',
      nameAndPriceRequired: 'Product name and price are required.',
      validPaymentRequired: 'Please enter a valid payment amount.',
      validInvoiceRequired: 'Please enter a valid invoice amount.',
      productDeletedToast: 'was successfully deleted.',
      productsImportedToast: 'products imported and saved successfully!',
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
      unitsAbbr: 'units',
      perUnitAbbr: 'ea',
      discountAbbr: 'off',
    },
  },
  es: {
    nav: {
      terminalBrand: 'TuBodeguita',
      terminalSubtitle: 'Caja #01 • Sistema Local',
      cloudSynced: 'Al día en la nube',
      offlineMode: 'Trabajando sin internet',
      register: 'Caja',
      inventory: 'Inventario',
      customerTabs: 'Libreta / Fiados',
      vendorLedger: 'Proveedores',
      dashboard: 'Resumen',
      online: 'En línea',
      offlineBadge: 'Sin internet (Modo local)',
      offlineAlert:
        'TRABAJANDO SIN INTERNET — Las ventas, cambios en inventario y fiados se guardan directamente en este equipo y se sincronizarán al volver la conexión.',
      queuedLocally: 'pendientes por guardar en la nube',
      toggleConnection: 'Simular corte de red',
      sync: 'Sincronizar',
      syncing: 'Sincronizando...',
      allSynced: 'Todo sincronizado al día',
      language: 'Idioma',
      english: 'English',
      spanish: 'Español',
      theme: 'Tema',
      themeDark: 'Oscuro',
      themeLight: 'Claro',
      switchToLight: 'Cambiar a modo claro',
      switchToDark: 'Cambiar a modo oscuro',
      settings: 'Ajustes',
      systemMenu: 'Configuración de la caja',
      networkStatus: 'Estado de conexión y sincronización',
      settingsSubtitle: 'Datos del negocio, red y sincronización',
      bcvTooltip: 'Tasa oficial BCV. Clic para configurar en Ajustes',
    },
    register: {
      searchPlaceholder: 'Buscar producto por nombre, código o SKU (Presiona "/" para escribir)...',
      scanBarcodeBtn: 'Escanear código',
      allCategories: 'Todas',
      stock: 'Stock',
      outOfStock: 'Agotado',
      lowStock: 'Por agotarse',
      unit: 'unidad',
      itemsAvailable: 'disponibles',
      customItemBtn: '+ Cobro manual / Varios',
      cartTitle: 'Ticket en caja',
      emptyCartTitle: 'No hay productos en el ticket',
      emptyCartDesc: 'Escanea un código de barras o toca productos del catálogo para armar la venta.',
      clearCart: 'Limpiar ticket',
      walkInCustomer: 'Cliente de mostrador (al contado)',
      selectCustomer: 'Buscar o anotar cliente',
      assignCustomer: 'Cliente / Libreta',
      customerDebt: 'Debe',
      customerCredit: 'A favor',
      customerLimit: 'Límite fiado',
      removeCustomer: 'Quitar cliente',
      subtotal: 'Subtotal',
      discount: 'Descuento',
      tax: 'IVA / Impuesto',
      grandTotal: 'Total a cobrar',
      chargeBtn: 'Cobrar ticket',
      shortcutBarcode: 'B Escanear',
      shortcutSearch: '/ Buscar',
      shortcutPay: 'Espacio Cobrar',
      addCustomItemTitle: 'Cobro manual / Producto no registrado',
      customItemName: 'Descripción del producto o concepto',
      customItemPrice: 'Precio ($)',
      customItemQty: 'Cantidad',
      addToCart: 'Agregar a la venta',
      cancel: 'Cancelar',
      aiSmartPairing: 'Sugerencias de compra recomendadas',
      aiInsightTitle: 'Suelen llevar también con esta compra:',
      addPairingBtn: 'Agregar al ticket',
      qtyShort: 'Cant.',
      perUnit: 'c/u',
      discountShort: 'desc.',
    },
    checkout: {
      title: 'Cobro de venta',
      itemCountSingular: 'artículo',
      itemCountPlural: 'artículos',
      grandTotal: 'Total a cobrar',
      paymentMethod: '¿Cómo va a pagar el cliente?',
      cash: 'Efectivo',
      cashDesc: 'Cobro en efectivo con cálculo automático de vuelto',
      card: 'Punto de venta (Tarjeta)',
      cardDesc: 'Tarjeta de débito, crédito o pago sin contacto',
      pagoMovil: 'Pago Móvil',
      pagoMovilDesc: 'Transferencia inmediata en Bolívares (Bs.)',
      pagoMovilPhone: 'Número de teléfono',
      pagoMovilPhonePlaceholder: 'Ej. 0414-1234567',
      pagoMovilCedula: 'Cédula de identidad / RIF',
      pagoMovilCedulaPlaceholder: 'Ej. V-12345678',
      pagoMovilAmount: 'Monto en Bolívares (Bs.)',
      pagoMovilRef: 'Últimos 4 dígitos de la referencia',
      pagoMovilRefPlaceholder: 'Ej. 4821',
      pagoMovilHelp: 'Anota los datos del comprobante de Pago Móvil para verificar y registrar el pago.',
      customerTab: 'Anotar en libreta (Fiado)',
      customerTabDesc: 'Cargar el importe a la cuenta pendiente del cliente en la libreta',
      storeCredit: 'Cobrar con saldo a favor',
      storeCreditDesc: 'Descontar del saldo o depósito previo que tiene el cliente',
      cashTendered: 'Paga con (efectivo recibido)',
      exact: 'Monto exacto',
      changeDue: 'Vuelto a entregar',
      insufficientCash: 'El efectivo recibido es menor al total a cobrar.',
      cashierName: 'Cajero de turno',
      notesOptional: 'Notas o comentarios de la venta (opcional)',
      notesPlaceholder: 'Ej. Despacho pendiente, nota del cliente...',
      completePayment: 'Registrar cobro e imprimir ticket',
      cancel: 'Cancelar',
      noCustomerSelectedWarning: 'Debes seleccionar un cliente para poder anotarle la venta al fiado.',
      creditLimitWarning: 'Atención: Esta compra superará el límite de fiado del cliente. ¿Autorizas la venta de todos modos?',
      insufficientCreditBalance: 'El cliente no tiene suficiente saldo a favor para cubrir esta compra.',
      billsAndChange: 'Efectivo y vuelto',
      cardPos: 'Punto de venta',
      pagoMovilBs: 'Pago Móvil (Bs.)',
      chargeToTab: 'Anotar en libreta (fiado)',
      prepaidCredit: 'Saldo a favor',
      cardTerminalReady: 'Punto de venta listo',
      cardTerminalInstructions: 'Pasa la tarjeta por el punto de venta o acerca el chip sin contacto en el dispositivo.',
      authorizedAmount: 'Monto a pasar por el punto',
      useCustomer: 'Usar este cliente',
      exactAmount: 'Monto exacto',
      refDigitsHint: 'Indica exactamente los 4 dígitos de la referencia',
      tabCustomerDescription: 'Se anotará la deuda en la libreta del cliente y quedará registrada en el sistema.',
      changeCustomer: 'Cambiar',
      currentDebtLabel: 'Deuda actual:',
      projectedDebtLabel: 'Quedará debiendo:',
      selectCustomerForTab: 'Buscar o elegir cliente:',
      chooseCustomerForTabPlaceholder: '-- Selecciona un cliente para fiarle --',
      tabExplanation: 'Elige el cliente para anotarle la compra en su libreta de fiados.',
      availableCreditLabel: 'Saldo a favor actual:',
      remainingCreditLabel: 'Le quedará a favor:',
      selectCustomerCredit: 'Seleccionar cliente con saldo a favor:',
      chooseCustomerCreditPlaceholder: '-- Selecciona el cliente --',
      phoneRequired: 'Ingresa el número de teléfono del Pago Móvil.',
      cedulaRequired: 'Ingresa la cédula o RIF del cliente.',
      validAmountRequired: 'Ingresa un monto válido en Bolívares (Bs.).',
      validRefRequired: 'Ingresa los últimos 4 dígitos del número de referencia.',
      shortageWarning: 'Faltan',
    },
    receipt: {
      saleCompleted: '¡Venta registrada con éxito!',
      print: 'Imprimir ticket',
      copy: 'Copiar ticket',
      close: 'Cerrar',
      receiptNumber: 'Ticket N°',
      receiptNum: 'N°',
      date: 'Fecha',
      time: 'Hora',
      cashier: 'Cajero',
      customer: 'Cliente',
      walkIn: 'Cliente general',
      qty: 'CANT',
      item: 'ARTÍCULO',
      price: 'PRECIO',
      total: 'TOTAL',
      subtotal: 'Subtotal',
      discount: 'Descuento',
      salesTax: 'IVA',
      grandTotal: 'TOTAL',
      paymentMethod: 'Forma de pago',
      tendered: 'Paga con',
      change: 'Vuelto entregado',
      amountTendered: 'Pagó con',
      changeReturned: 'Vuelto',
      offlineNotice: '*** GUARDADO EN MODO LOCAL (SIN INTERNET) ***',
      cloudNotice: '*** RESPALDADO EN LA NUBE ***',
      offlineStored: 'Guardado en el equipo local. Se subirá automáticamente al tener conexión.',
      cloudVerified: 'Registrado y respaldado en la nube.',
      status: 'Estado',
      cloudSynced: 'En la nube',
      cloudPending: 'Pendiente de subir',
      startNewSale: 'Cobrar otra venta',
      thankYou: '¡Muchas gracias por su compra! Vuelva pronto.',
      copiedNotice: '¡Ticket copiado al portapapeles!',
      reprintTitle: 'Reimprimir ticket de venta',
      defaultSubtitle: 'Punto de Venta y Abarrotes',
      tableQtyItemTotal: 'CANT ARTÍCULO              TOTAL',
      pagoMovilDetailsHeader: 'DATOS DEL PAGO MÓVIL:',
      phoneLabel: 'Teléfono:',
      cedulaLabel: 'Cédula / RIF:',
      amountPaidLabel: 'Monto pagado:',
      refLast4Label: 'Últimos 4 Ref:',
      chargedToTabNotice: '[ANOTADO EN LIBRETA / FIADO]',
      itemAndQty: 'Artículo y Cant.',
      discountAbbr: 'Desc',
      exemptTax: 'Exento',
      footerKeepReceipt: 'Conserve este comprobante para cualquier cambio o reclamo.',
    },
    inventory: {
      title: 'Control de Inventario y Mercancía',
      subtitle: 'Existencias actuales, costos, precios de venta y control de productos con o sin internet.',
      searchPlaceholder: 'Buscar producto por nombre, código o SKU...',
      allCategories: 'Todas las categorías',
      addProductBtn: '+ Nuevo producto',
      addProduct: 'Guardar producto',
      aiInsightsBtn: 'Sugerencias de reposición',
      activeSkus: 'Productos activos',
      unitsInStock: 'Unidades en existencia',
      lowStockWarnings: 'Por agotarse',
      totalSkus: 'Total de productos',
      lowStockAlerts: 'Alertas de poco stock',
      inventoryValue: 'Valor del inventario (PVP)',
      retailValue: 'A precio de venta',
      inventoryCost: 'A costo de compra',
      productAndSku: 'Producto y código',
      priceAndCost: 'Precio / Costo',
      quickRestockActions: 'Entrada rápida y opciones',
      restock: 'Agregar stock',
      unit: 'Unidad de venta',
      costPrice: 'Costo de compra (unitario)',
      stockQuantity: 'Cantidad disponible',
      generateBarcode: 'Generar código de barras',
      scanBarcodeBtn: 'Escanear con cámara',
      sku: 'Código / SKU',
      productName: 'Nombre del producto',
      category: 'Categoría',
      price: 'Precio de venta',
      cost: 'Costo de compra',
      margin: 'Ganancia',
      stockLevel: 'Existencia actual',
      actions: 'Acciones',
      adjustStock: 'Ajustar stock',
      editProduct: 'Editar producto',
      deleteProduct: 'Eliminar',
      addNewProductModalTitle: 'Registrar nuevo producto en inventario',
      editProductModalTitle: 'Modificar datos del producto',
      adjustStockModalTitle: 'Ajuste manual de existencias',
      barcode: 'Código de barras / SKU',
      minStockThreshold: 'Avisarme cuando queden menos de',
      unitType: 'Se vende por',
      description: 'Detalles o descripción (opcional)',
      saveProduct: 'Guardar producto',
      currentStock: 'Existencia actual en anaquel/depósito',
      adjustmentAmount: 'Cantidad a modificar (+ / -)',
      addStock: 'Entrada (+ sumar)',
      reduceStock: 'Salida (- descontar)',
      reason: 'Motivo del movimiento',
      reasonRestock: 'Llegó mercancía / Compra a proveedor',
      reasonDamaged: 'Mercancía rota, vencida o dañada',
      reasonAudit: 'Conteo físico (ajuste de inventario)',
      reasonReturn: 'Devolución de cliente',
      confirmAdjust: 'Guardar ajuste de existencia',
      confirmDeleteTitle: 'Eliminar producto',
      confirmDeleteMsg: '¿Seguro que deseas eliminar este producto del inventario? Esta acción no se puede deshacer.',
      cancel: 'Cancelar',
      delete: 'Sí, eliminar producto',
      importExcelBtn: 'Cargar desde Excel',
      importExcelModalTitle: 'Cargar productos desde archivo Excel',
      importExcelSubtitle: 'Sube un archivo .xlsx, .xls o .csv para registrar o actualizar varios productos a la vez.',
      downloadTemplate: 'Descargar plantilla de Excel (.xlsx)',
      downloadTemplateDesc: 'Archivo listo con las columnas de ejemplo para que solo pegues tus productos.',
      dragDropExcel: 'Arrastra tu archivo de Excel aquí, o',
      clickToUploadExcel: 'haz clic para buscarlo en tu equipo',
      excelFormats: 'Formatos soportados: Excel (.xlsx, .xls) o archivo de texto (.csv)',
      validationSummary: 'Revisión del archivo antes de importar',
      totalRowsDetected: 'Filas encontradas en el archivo',
      newProductsCount: 'Productos nuevos para agregar',
      updatedProductsCount: 'Productos existentes para actualizar',
      invalidRowsCount: 'Filas con errores o datos incompletos',
      updateExistingCheckbox: 'Actualizar los productos existentes si ya coinciden por código o nombre',
      stockStrategyReplace: 'Reemplazar la existencia actual con la cantidad del archivo',
      stockStrategyAdd: 'Sumar las cantidades del archivo al inventario que ya tienes',
      confirmImportBtn: 'Procesar e importar al inventario',
      importingProducts: 'Guardando productos en la base de datos...',
      previewTitle: 'Vista previa de los datos leídos',
      noFileSelected: 'No has seleccionado ningún archivo todavía',
      invalidFileError: 'No se pudo leer el archivo. Revisa que sea un archivo de Excel (.xlsx, .xls) o .csv válido.',
      importSuccessMsg: '¡Productos cargados con éxito al inventario!',
      pricingStrategyTitle: 'Cálculo de precio por bulto / fardo',
      bulkCostLabel: 'Costo del bulto o fardo',
      bulkCostPlaceholder: 'ej. 24.00',
      bulkUnitsLabel: 'Unidades que trae el bulto',
      bulkUnitsPlaceholder: 'ej. 12',
      profitMarginLabel: 'Margen de ganancia deseado (%)',
      profitMarginPlaceholder: 'ej. 30',
      calculatedUnitCost: 'Costo por unidad',
      suggestedSalePrice: 'Precio de venta sugerido',
      overridePriceNotice: 'Calculado: Costo por unidad + porcentaje de ganancia. Puedes redondearlo o cambiarlo manualmente como prefieras.',
      bulkPackBadge: 'Calculado por bulto',
      catalogSize: 'Catálogo activo',
      acrossCategories: 'En todas las categorías',
      shelfValue: 'Valor en anaquel',
      needReplenishment: 'Requieren reposición',
      aiInsightsTitle: 'Sugerencias de Inventario y Surtido',
      aiInsightsDismiss: 'Cerrar',
      actionLabel: 'Sugerencia:',
      unitsPerPack: 'unidades por bulto',
      noProductsFound: 'No se encontraron productos coincidentes.',
      editProductDetails: 'Modificar datos del producto',
      addNewItem: 'Registrar nuevo producto',
      catalogAndPricingSubtitle: 'Catálogo de inventario y precios',
      productNameExample: 'Ej. Harina Pan 1kg, Arroz Mary 1kg...',
      createNewCategoryPrompt: '+ Crear nueva categoría...',
      bulkPackParams: 'Parámetros del bulto / fardo',
      calcAssistant: 'Asistente de cálculo',
      profitPerUnit: 'Ganancia por unidad:',
      editableSuggested: 'Sugerido editable',
      scanOrTypeBarcode: 'Escanear o escribir código de barras',
      deletingProduct: 'Eliminando...',
      analyzingAi: 'Analizando...',
      aiLowStockTitle: '{count} productos con inventario al mínimo o agotándose',
      aiLowStockMsg: 'Mercancía ({items}) con pocas existencias. Conviene pedir reposición a los proveedores para no quedarse sin nada en el mostrador.',
      aiLowStockAction: 'Hacer pedido a proveedores desde la libreta de Proveedores.',
      aiMarginTitle: 'Productos con mejor ganancia',
      aiMarginMsg: 'Los productos de Café y Bebidas dejan más del 40% de ganancia limpia. Conviene mantener los anaqueles y la nevera bien surtidos.',
      aiMarginAction: 'Poner los productos de mayor ganancia a la vista cerca de la caja.',
    },
    ledger: {
      title: 'Libreta de Cuentas: Fiados y Proveedores',
      subtitle: 'Control de cobros a clientes (fiado en libreta) y cuentas pendientes por pagar a proveedores.',
      customerTitle: 'Libreta de Clientes y Fiados',
      customerSubtitle: 'Lleva el control de a quién le fías, cuánto te deben, límites y registro de abonos.',
      vendorTitle: 'Cuentas por Pagar a Proveedores',
      vendorSubtitle: 'Control de facturas de mercancía, plazos de pago y pagos realizados a distribuidores.',
      customerTabsBtn: 'Libreta de Fiados (Clientes)',
      vendorPayablesBtn: 'Deudas con Proveedores',
      totalCustomerDebt: 'Total pendiente por cobrar (Fiado)',
      totalStoreCredit: 'Total en saldos a favor',
      totalAccounts: 'Clientes en libreta',
      totalVendorPayables: 'Total pendiente por pagar',
      activeVendors: 'Proveedores registrados',
      searchCustomers: 'Buscar cliente por nombre o teléfono...',
      searchVendors: 'Buscar proveedor por nombre o contacto...',
      newCustomerBtn: '+ Anotar nuevo cliente',
      newVendorBtn: '+ Nuevo proveedor',
      owesStore: 'Debe a la bodega',
      zeroBalance: 'Al día (sin deuda)',
      storeCreditBalance: 'Tiene saldo a favor',
      creditLimit: 'Límite para fiarle',
      phone: 'Teléfono',
      email: 'Correo',
      collectPaymentBtn: 'Cobrar / Recibir abono',
      viewHistoryBtn: 'Ver movimientos',
      hideHistoryBtn: 'Ocultar movimientos',
      editCustomer: 'Editar datos',
      deleteCustomer: 'Eliminar cliente',
      editCustomerModalTitle: 'Editar ficha del cliente',
      confirmDeleteCustomerTitle: 'Eliminar cliente de la libreta',
      confirmDeleteCustomerMsg: '¿Seguro que deseas eliminar a este cliente? Se borrará su historial de la libreta de cuentas.',
      editVendor: 'Editar datos',
      deleteVendor: 'Eliminar proveedor',
      editVendorModalTitle: 'Editar datos del proveedor',
      confirmDeleteVendorTitle: 'Eliminar proveedor',
      confirmDeleteVendorMsg: '¿Seguro que deseas eliminar a este proveedor? Se borrará su registro de cuentas por pagar.',
      outstandingBill: 'Saldo por pagar',
      terms: 'Plazo acordado',
      recordBillBtn: 'Anotar factura por pagar',
      payVendorBtn: 'Registrar pago / abono',
      collectPaymentModalTitle: 'Recibir abono o pago del cliente',
      recordBillModalTitle: 'Registrar factura o nota de entrega del proveedor',
      payVendorModalTitle: 'Registrar pago o abono al proveedor',
      newCustomerModalTitle: 'Abrir cuenta en libreta a nuevo cliente',
      newVendorModalTitle: 'Registrar nuevo proveedor o distribuidor',
      customerName: 'Nombre del cliente',
      vendorName: 'Nombre de la empresa o distribuidor',
      contactPerson: 'Persona de contacto o vendedor',
      categorySupplied: 'Mercancía o rubro que surte',
      paymentAmount: 'Monto que abona ($)',
      invoiceAmount: 'Total de la factura ($)',
      invoiceNumber: 'N° de factura o nota de entrega',
      paymentMethod: 'Forma de pago',
      notesOptional: 'Observaciones o nota (opcional)',
      recordPayment: 'Guardar abono y actualizar deuda',
      recordBill: 'Guardar factura en cuentas por pagar',
      disbursePayment: 'Guardar pago realizado al proveedor',
      saveCustomer: 'Guardar en libreta',
      saveVendor: 'Guardar proveedor',
      saveChanges: 'Guardar cambios',
      deleteCustomerConfirmBtn: 'Sí, eliminar de la libreta',
      deleteVendorConfirmBtn: 'Sí, eliminar proveedor',
      cancel: 'Cancelar',
      transactionHistory: 'Historial de movimientos y abonos',
      noTransactionsYet: 'No hay movimientos registrados en esta cuenta todavía.',
      date: 'Fecha y hora',
      type: 'Concepto',
      amount: 'Monto',
      balanceAfter: 'Saldo resultante',
      reference: 'Detalle / Comprobante',
      recordsCount: 'movimientos',
      currentDebtBadge: 'Deuda actual',
      availableCreditBadge: 'Crédito disponible',
      availAbbr: 'disp.',
      limitExceededNotice: '¡Límite excedido por',
      usedLimitLabel: 'Usado:',
      ofLimitLabel: 'del límite',
      totalLimitLabel: 'Límite total:',
      customerBalanceWarning: 'Atención: El cliente tiene un saldo pendiente de',
      vendorBalanceWarning: 'Atención: Este proveedor tiene un saldo pendiente de pagar de',
      chargeSaleDebt: 'Compra fiada',
      paymentReceived: 'Abono recibido',
      supplyInvoice: 'Factura / Entrada de mercancía',
      paymentDisbursed: 'Pago / Abono realizado',
      cashPayment: 'Efectivo',
      cardPayment: 'Punto de venta (Tarjeta)',
      bankTransferACH: 'Transferencia bancaria / Pago Móvil',
      companyCheck: 'Cheque comercial',
      corporateCard: 'Tarjeta',
      registerCashPayment: 'Efectivo de la caja',
      paymentRefNumber: 'Referencia bancaria o de pago',
      itemsSuppliedDesc: 'Productos o descripción del pedido',
      createTabDescription: 'Abre una libreta de fiado o cuenta para este cliente',
      registerVendorDescription: 'Registrar nuevo proveedor o distribuidor',
      codTerms: 'Pago contra entrega',
      dueOnReceiptTerms: 'Pago inmediato',
      initialDebtLabel: 'Saldo inicial al fiado',
      initialPayableLabel: 'Saldo inicial por pagar',
      notesAndTermsLabel: 'Notas o condiciones acordadas',
      optionalLabel: 'Opcional',
      accountsWithDebtCount: 'cuentas con saldo pendiente',
      activeCustomerLedgers: 'Cuentas locales activas',
      suppliersWithBalanceCount: 'Proveedores con saldo por pagar',
      activeSuppliersCount: 'Proveedores y distribuidores activos',
      openBillsNotice: 'Facturas pendientes por liquidar',
      zeroBalanceNotice: 'Cuenta al día (sin saldo pendiente)',
      deletingRecord: 'Eliminando...',
    },
    dashboard: {
      title: 'Resumen del Negocio y Ventas',
      subtitle: 'Ventas en caja, ganancias estimadas, fiados por cobrar y estado de la mercancía.',
      queuedChanges: 'Hay movimientos pendientes por subir • Sincronizar ahora',
      allDataSynced: 'Todo el sistema está sincronizado al día',
      grossSales: 'Ventas totales cobradas',
      completedTickets: 'Tickets cobrados',
      avgTicket: 'Venta promedio por cliente',
      netProfit: 'Ganancia estimada',
      netProfitDesc: 'Ventas totales menos el costo de compra de la mercancía',
      customerTabsDebt: 'Dinero en la calle (Fiado por cobrar)',
      viewAccountsLedger: 'Ver libreta de fiados',
      wholesalePayables: 'Facturas por pagar a proveedores',
      manageVendorBills: 'Ver cuentas de proveedores',
      recentSales: 'Últimas ventas cobradas',
      openRegister: 'Ir a cobrar a caja',
      reprintReceipt: 'Reimprimir ticket',
      noSalesYet: 'Aún no se han cobrado ventas hoy',
      ringUpSalesDesc: 'Ve a la pantalla de Caja para cobrar la primera venta.',
      revenueByPayment: 'Ventas por forma de pago',
      cashRegister: 'Efectivo recibido',
      cardContactless: 'Punto de venta (Tarjetas)',
      customerTabDebt: 'Ventas fiadas (a crédito)',
      inventoryAlerts: 'Productos con poco stock',
      manageStock: 'Ir al inventario',
      unitsLeft: 'en existencia',
      minRequired: 'Mínimo',
      allStockHealthy: '¡Todo en orden! Todos los productos están por encima del mínimo.',
      topSellingProducts: 'Productos más vendidos',
      unitsSold: 'vendidos',
      customerPrefix: 'Cliente',
      walkInCustomer: 'Cliente casual',
      itemSingular: 'artículo',
      itemsPlural: 'artículos',
      taxLabel: 'IVA',
      mobilePaymentLabel: 'Pago Móvil',
    },
    scanner: {
      modalTitle: 'Escanear código de barras',
      modalSubtitle: 'Usa la cámara del equipo, una pistola lectora USB/Bluetooth o escribe el código a mano.',
      opticalScannerTitle: 'Pistola lectora o cámara lista',
      opticalScannerDesc: 'Puedes disparar con cualquier pistola lectora de código de barras o activar la cámara aquí abajo.',
      openCameraBtn: 'Encender cámara',
      closeCameraBtn: 'Apagar cámara',
      pointCameraGuide: 'Apunta el lente directamente al código de barras',
      manualInputLabel: 'O escribe el código o SKU a mano',
      scanCodeBtn: 'Buscar código',
      quickTestTitle: 'Prueba rápida: toca cualquier producto para probar',
      quickTestDesc: 'Prueba el lector con productos de tu inventario',
      clickToScan: 'Tocar para probar',
      cameraStarting: 'Iniciando cámara...',
      liveBadge: 'EN VIVO',
      cameraDeviceLabel: 'Cámara',
      torchTitle: 'Linterna / Flash',
      uploadBarcodePhoto: 'Subir foto del código',
      cameraNotice: 'Aviso de la cámara',
      retryCamera: 'Reintentar activación',
      openNewTab: 'Abrir en pestaña nueva',
      scannedSuccess: '¡Escaneado con éxito!',
      manualInputPlaceholder: 'Ingresa el código de barras (ej. 793573192014) o SKU...',
      hardwareScannerNotice: 'Compatible con lectores USB y Bluetooth',
      permissionDeniedError: 'Permiso de cámara denegado. Permite el acceso en tu navegador o abre la aplicación en una pestaña nueva.',
      noCameraDetectedError: 'No se detectó ninguna cámara de video disponible en este equipo.',
      cameraInUseError: 'La cámara está siendo utilizada por otra aplicación o pestaña del sistema.',
      cameraApiNotSupportedError: 'La cámara no es compatible o está restringida en este navegador.',
      noBarcodeInImageError: 'No se encontró ningún código de barras legible en la foto subida.',
      couldNotDecodeImageError: 'No se pudo leer el código en esta imagen. Intenta con una foto más nítida o con mejor iluminación.',
    },
    settings: {
      title: 'Configuración del Negocio y de la Caja',
      subtitle: 'Ajusta los datos del negocio, ticket impreso, tasa de cambio y sincronización.',
      storeInfoSection: 'Datos del Negocio o Bodega',
      storeInfoDesc: 'Nombre de la tienda, dirección y datos que saldrán impresos en el ticket del cliente.',
      storeName: 'Nombre del negocio',
      storeNamePlaceholder: 'ej. TuBodeguita',
      storeSubtitle: 'Ramo o descripción breve',
      storeSubtitlePlaceholder: 'ej. Víveres, Charcutería y Bebidas',
      address: 'Dirección del local',
      addressPlaceholder: 'ej. Av. Principal, Local 4, Al lado de la panadería',
      phone: 'Teléfono de contacto',
      phonePlaceholder: 'ej. 0414-1234567',
      taxId: 'RIF / Cédula / Documento fiscal',
      taxIdPlaceholder: 'ej. J-12345678-0',
      taxRate: 'Porcentaje de IVA (%)',
      currencySymbol: 'Símbolo monetario',
      primaryCurrency: 'Moneda de trabajo',
      primaryCurrencyDesc: 'Elige si los precios de tus productos se fijan en Dólares ($) o en Bolívares (Bs.).',
      currencyUSD: 'Dólares Estadounidenses ($ USD)',
      currencyVES: 'Bolívares (Bs. VES)',
      exchangeRate: 'Tasa de cambio BCV (Bs. por Dólar)',
      exchangeRateDesc: 'Tasa oficial del Banco Central de Venezuela para cobrar y mostrar precios en Bolívares y Dólares al mismo tiempo.',
      exchangeRatePlaceholder: 'ej. 842.21',
      exchangeRateAutoSync: 'Actualizar tasa automáticamente',
      exchangeRateAutoSyncDesc: 'Consulta y actualiza la tasa oficial del BCV cada 12 horas por internet.',
      pricingStrategySection: 'Modo de fijación de precios',
      pricingStrategyDesc: 'Elige cómo prefieres calcular y colocar los precios al agregar productos al inventario.',
      pricingMethodManual: 'Precio directo (manual)',
      pricingMethodManualDesc: 'Colocas el precio de venta tú mismo a cada producto como siempre.',
      pricingMethodBulk: 'Calcular por bulto o fardo',
      pricingMethodBulkDesc: 'Anotas el costo del bulto y cuántas unidades trae, y el sistema calcula el precio de venta con tu porcentaje de ganancia.',
      syncBcvRateBtn: 'Consultar tasa BCV ahora',
      syncingBcv: 'Consultando tasa oficial del BCV...',
      bcvLastUpdated: 'Última actualización de la tasa',
      bcvAutoNotice: 'Se actualiza cada 12 horas con la API oficial del BCV',
      bcvSyncSuccess: '¡Tasa oficial del BCV actualizada correctamente!',
      bcvSyncError: 'No se pudo consultar la tasa del BCV en este momento. Se mantiene la tasa que ya tenías.',
      bcvOfficialSource: 'Tasa Oficial BCV',
      dualCurrencyPreview: 'Ejemplo de conversión',
      cashierName: 'Nombre del cajero por defecto',
      cashierPlaceholder: 'ej. Juan Pérez (Caja 1)',
      terminalId: 'Número o código de caja',
      receiptFooter: 'Mensaje al final del ticket',
      receiptFooterPlaceholder: 'ej. ¡Gracias por preferirnos! Conserve su ticket.',
      saveSettings: 'Guardar configuración',
      savedSuccess: '¡Configuración guardada correctamente!',
      resetDefaults: 'Volver a los valores por defecto',
      resetConfirm: '¿Seguro que deseas restablecer toda la configuración a los valores iniciales?',
      systemColorSection: 'Color principal del sistema',
      systemColorDesc: 'Selecciona el color de los botones, pestañas activas y elementos destacados de la pantalla.',
      semanticColorsNotice: 'Los colores de advertencia (rojo para eliminar/peligro, verde para éxito, amarillo para alertas) se mantienen iguales para evitar confusiones al operar.',
      activeThemeLabel: 'Color seleccionado',
      networkSection: 'Conexión y modo sin internet',
      networkDesc: 'Comprueba cómo funciona la caja cuando se cae el internet o trabaja sin conexión.',
      currentStatus: 'Estado de la conexión',
      onlineMode: 'Conectado a internet',
      offlineSimulationMode: 'Simulando trabajo sin internet',
      toggleOfflineBtn: 'Simular que se fue el internet',
      toggleOfflineDesc: 'Prueba la caja sin internet para verificar que sigue cobrando y guardando todo en el equipo.',
      cloudSyncSection: 'Sincronización con la nube',
      cloudSyncDesc: 'Todo lo que cobres o modifiques se guarda al instante en tu equipo y se respalda en la nube cuando hay conexión.',
      syncNowBtn: 'Subir cambios a la nube ahora',
      syncInProgress: 'Subiendo registros a la nube...',
      pendingItemsCount: 'Registros pendientes por subir',
      allSyncedNotice: 'Todo está respaldado y al día en la nube.',
      lastSyncTime: 'Última sincronización',
      queueBreakdown: 'Detalle de registros pendientes',
      noPendingItems: 'No hay movimientos pendientes de sincronizar.',
      livePreview: 'Así se verá el encabezado de tu ticket impreso',
      categoriesSection: 'Categorías de productos',
      categoriesDesc: 'Organiza tu catálogo en rubros o departamentos (Bebidas, Víveres, Charcutería, etc.) para encontrarlos más rápido en caja.',
      addCategoryBtn: '+ Nueva categoría',
      newCategoryPlaceholder: 'Nombre de la categoría (ej. Víveres, Limpieza, Golosinas)...',
      editCategoryTitle: 'Modificar categoría',
      deleteCategoryTitle: 'Eliminar categoría',
      confirmDeleteCategory: '¿Seguro que deseas eliminar esta categoría?',
      reassignProductsTo: 'Pasar los productos de esta categoría a:',
      categoryNameLabel: 'Nombre de la categoría',
      productCountSingular: 'producto',
      productCountPlural: 'productos',
      categoryAddedSuccess: '¡Categoría agregada correctamente!',
      categoryUpdatedSuccess: '¡Categoría actualizada y productos organizados!',
      categoryDeletedSuccess: '¡Categoría eliminada con éxito!',
      categoryAlreadyExists: 'Ya existe una categoría con ese mismo nombre.',
      categoryEmptyError: 'Debes escribir un nombre para la categoría.',
      filterCategoriesPlaceholder: 'Buscar categoría...',
      totalCategories: 'Total de categorías',
      sqliteSuccess: '¡Sincronizado con la base de datos local SQLite con éxito!',
      sqliteError: 'Error al sincronizar con SQLite',
      systemCurrenciesTitle: 'Monedas de la tienda (Dólares y Bolívares)',
      usdDescription: 'Los precios base se guardan en USD ($) y se calculan a Bolívares al cobrar en caja e inventario.',
      vesDescription: 'Los precios base se guardan en Bs. y se calculan a Dólares al cobrar en caja e inventario.',
      autoSyncActive: 'ACTIVADA',
      autoSyncDisabled: 'DESACTIVADA',
      disableAutoSync: 'Desactivar sincronización automática',
      enableAutoSync: 'Activar sincronización automática',
      noCategoriesFound: 'No se encontraron categorías.',
      categoryContainsProducts: 'Esta categoría contiene {count} producto(s) en catálogo.',
      noProductsInCategory: 'No hay productos asociados a esta categoría. Se eliminará de inmediato.',
      reassignAndDelete: 'Reasignar y Eliminar',
      simulateOffline: 'Simular desconexión (Modo Offline)',
      restoreOnline: 'Reconectar a la red (Modo Online)',
      offlineNoticeInSettings: 'Caja sin conexión: los datos se mantienen seguros en este equipo hasta que vuelva el internet.',
      clearSyncHistory: 'Limpiar historial de sincronización',
      sqliteDbSection: 'Base de Datos Local SQLite',
      sqliteDbDesc: 'Motor de base de datos local de alto rendimiento que mantiene tus datos a salvo sin internet.',
      dbEngine: 'Motor de Base de Datos',
      diskLocation: 'Archivo en disco',
      fileSize: 'Tamaño del archivo',
      tableRecords: 'Registros en tablas SQLite',
      recordsProducts: 'Productos',
      recordsSales: 'Ventas',
      recordsCustomers: 'Clientes',
      recordsVendors: 'Proveedores',
      syncSqliteBtn: 'Sincronizar SQLite',
      syncingSqliteBtn: 'Sincronizando...',
      sqlConsoleTitle: 'Consola de Consultas SQL (Avanzado)',
      hideConsole: 'Ocultar ▲',
      openConsole: 'Abrir ▼',
      runSql: 'Ejecutar SQL',
      runningSql: 'Ejecutando...',
      rowsFound: 'filas encontradas',
      savedToast: '¡Guardado!',
      justConfigured: 'Recién ajustada',
      inQueue: 'en cola',
    },
    excel: {
      noSheetsError: 'El archivo Excel no contiene hojas de datos.',
      emptySheetError: 'La hoja de cálculo está vacía o no tiene nombres de columna.',
      missingNameError: 'Falta el nombre del producto',
      invalidPriceError: 'Precio no válido (debe ser mayor a 0)',
      clickToChangeFile: 'Haz clic para cambiar de archivo',
      parsingFile: 'Leyendo filas y columnas de la hoja de cálculo...',
      productsReady: 'productos listos',
      stockBehaviorTitle: 'Comportamiento de la existencia para productos existentes:',
      filterAll: 'Todos',
      filterNew: 'Nuevos',
      filterUpdate: 'Actualizar',
      filterErrors: 'Errores',
      statusCol: 'Estado',
      badgeNew: 'NUEVO',
      badgeUpdate: 'ACTUALIZAR',
      badgeError: 'ERROR',
      showingRows: 'Mostrando primeras 50 filas de',
      willBeSaved: 'productos serán guardados en la base de datos',
    },
    alerts: {
      networkRestored: 'Conexión restablecida: Tienda en línea. Respaldo en la nube activado.',
      networkDisconnected: 'Sin conexión a internet. Modo local activo: Todas las ventas y el inventario se guardan en el equipo.',
      syncSuccess: 'Base de datos sincronizada con éxito.',
      syncFailed: 'Error al sincronizar: Los cambios guardados permanecerán seguros en este equipo.',
      switchedToOnline: 'Cambiado a modo EN LÍNEA. Respaldo automático disponible.',
      simulatingOffline: 'Simulando modo SIN INTERNET. La caja y todas sus funciones siguen 100% operativas.',
      settingsSaved: '¡Configuración de la tienda guardada correctamente!',
      settingsReset: 'Parámetros restablecidos a los valores iniciales.',
      queueCleared: 'Historial de registros sincronizados limpiado.',
      productNotFound: 'No se encontró ningún producto con el código de barras o SKU:',
      productOutOfStock: 'está AGOTADO.',
      cannotAddMoreStock: 'No se puede agregar más. Solo quedan {stock} unidades disponibles.',
      productScanned: 'Escaneado:',
      saleSuccess: '¡Venta cobrada con éxito! Ticket N°',
      nameAndPriceRequired: 'El nombre y el precio del producto son obligatorios.',
      validPaymentRequired: 'Indica un monto de pago válido.',
      validInvoiceRequired: 'Indica un monto de factura válido.',
      productDeletedToast: 'eliminado correctamente del catálogo.',
      productsImportedToast: 'productos importados y guardados con éxito.',
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
      success: 'Listo',
      error: 'Error',
      unitsAbbr: 'uds',
      perUnitAbbr: 'c/u',
      discountAbbr: 'desc.',
    },
  },
};

export const categoryTranslations: Record<string, { en: string; es: string }> = {
  All: { en: 'All', es: 'Todas' },
  'Coffee & Tea': { en: 'Coffee & Tea', es: 'Café y Té' },
  'Dairy & Fresh': { en: 'Dairy & Fresh', es: 'Lácteos y Charcutería' },
  Bakery: { en: 'Bakery', es: 'Panadería' },
  'Snacks & Sweets': { en: 'Snacks & Sweets', es: 'Golosinas y Snacks' },
  Snacks: { en: 'Snacks', es: 'Snacks' },
  Beverages: { en: 'Beverages', es: 'Bebidas y Refrescos' },
  'Pantry & Grains': { en: 'Pantry & Grains', es: 'Víveres y Granos' },
  Household: { en: 'Household', es: 'Limpieza y Hogar' },
  Produce: { en: 'Produce', es: 'Frutas y Verduras' },
  Essentials: { en: 'Essentials', es: 'Básicos de Canasta' },
  Electronics: { en: 'Electronics', es: 'Electrónica y Pilas' },
  Groceries: { en: 'Groceries', es: 'Víveres' },
  General: { en: 'General', es: 'Varios' },
  Custom: { en: 'Custom', es: 'Cobro manual' },
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
  card: { en: 'Card', es: 'Punto de venta (Tarjeta)' },
  pago_movil: { en: 'Pago Móvil', es: 'Pago Móvil' },
  customer_debt: { en: 'Customer Tab (Debt)', es: 'Anotado en libreta (Fiado)' },
  store_credit: { en: 'Store Credit', es: 'Saldo a favor' },
  split: { en: 'Split Payment', es: 'Pago mixto' },
};
