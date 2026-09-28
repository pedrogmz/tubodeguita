# SDD 03: Módulos y Lógica de Negocio

- **Documento:** SDD-03
- **Proyecto:** TuBodeguita
- **Versión:** 1.2.0
- **Estado:** Activo / Producción

---

## 1. Módulo 1: Punto de Venta y Caja Registradora (POS)

El punto de venta (`RegisterView.tsx`) es el componente central de interacción operativa del cajero.

### 1.1. Flujo de Trabajo del Registro de Venta
1. **Selección de Productos:**
   - Búsqueda en vivo por nombre, SKU o código de barras.
   - Filtrado por pestañas de categoría (cargadas dinámicamente desde la configuración de la tienda).
   - Acceso rápido a productos frecuentes.
2. **Escáner de Códigos de Barras (`BarcodeScannerModal.tsx`):**
   - Utiliza la cámara del dispositivo mediante `@zxing/library` para decodificar códigos EAN-13, UPC-A, Code128 y QR.
   - Al detectar un código coincidente, emite señal sonora/háptica y agrega o incrementa automáticamente el producto en el carrito.
3. **Cálculo Dinámico del Carrito:**
   - Control de cantidades con validación de stock disponible.
   - Descuentos por línea de producto (porcentual o monto fijo).
   - Aplicación de tasa de impuesto configurable (ej. IVA 16% o Tax 8%).
4. **Checkout y Cobro Multimodal (`CheckoutModal.tsx`):**
   - **Efectivo (Cash):** Con cálculo instantáneo de vuelto en la moneda seleccionada y su contravalor en moneda secundaria.
   - **Pago Móvil:** Captura de número telefónico, cédula/identificación, monto pagado y los últimos 4 dígitos de referencia bancaria.
   - **Tarjeta (Débito/Crédito):** Registro de autorización bancaria.
   - **Cuenta Corriente / Fiado (`customer_debt`):** Vinculación a un cliente registrado; valida que la compra no supere el límite de endeudamiento (`debtLimit`).
   - **Crédito de Tienda (`store_credit`):** Deducción del saldo a favor previamente depositado por el cliente.
5. **Emisión de Recibo Térmico (`ReceiptModal.tsx`):**
   - Generación de comprobante optimizado para impresoras térmicas ESC/POS de 58mm y 80mm.
   - Formato listo para impresión directa del navegador (`window.print`) y descarga en texto plano.

---

## 2. Módulo 2: Motor de Estrategias de Precios (Patrón Strategy)

Ubicado en `src/services/pricingStrategy.ts`, desacopla completamente el cálculo de precios de las vistas de usuario.

```text
               ┌───────────────────────────────┐
               │    <<interface>>              │
               │    PricingStrategy            │
               ├───────────────────────────────┤
               │ + id: PricingMethod           │
               │ + code: string                │
               │ + name: string                │
               │ + calculate(params): Result   │
               └───────────────▲───────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            │                                     │
┌───────────────────────────┐         ┌───────────────────────────┐
│   ManualPricingStrategy   │         │    BulkPricingStrategy    │
├───────────────────────────┤         ├───────────────────────────┤
│ Asignación directa de     │         │ Calcula costo unitario    │
│ precio de venta y costo.  │         │ = (costo_bulto / unidades)│
│ Sin fórmulas automáticas. │         │ + margen deseado en %     │
└───────────────────────────┘         └───────────────────────────┘
```

### 2.1. Estrategia 1: Fijación Manual (`MANUAL`)
- **Propósito:** Mantener compatibilidad absoluta con catálogos tradicionales donde el comerciante fija el precio final directamente.
- **Fórmula de Margen:**
  $$\text{ganancia} = \text{precio} - \text{costo}$$
  $$\text{margen\_porcentual} = \begin{cases} \left(\frac{\text{ganancia}}{\text{costo}}\right) \times 100 & \text{si } \text{costo} > 0 \\ 0 & \text{si } \text{costo} = 0 \end{cases}$$

### 2.2. Estrategia 2: Fijación Por Bulto / Mayorista (`BULK_PACK`)
- **Propósito:** Automatizar el precio de venta unitario cuando los productos se compran al por mayor por cajas, sacos o bultos.
- **Parámetros de Entrada:**
  - $U_{\text{bulto}}$ (`bulkUnits`): Unidades contenidas en el bulto (ej. 24 latas).
  - $C_{\text{bulto}}$ (`bulkCost`): Costo total de adquisición del bulto (ej. $18.00).
  - $M\%$ (`profitMarginPercent`): Margen neto deseado (ej. 30%).
- **Fórmulas de Cálculo:**
  $$C_{\text{unitario}} = \frac{C_{\text{bulto}}}{U_{\text{bulto}}}$$
  $$G_{\text{unitaria}} = C_{\text{unitario}} \times \left(\frac{M\%}{100}\right)$$
  $$P_{\text{venta\_sugerido}} = C_{\text{unitario}} + G_{\text{unitaria}}$$

---

## 3. Módulo 3: Inventario y Gestión de Categorías

Gestionado en `src/components/InventoryView.tsx`.

### 3.1. Operaciones de Inventario
- **Alta y Edición de Productos:** Formulario reactivo con selector de estrategia de precios. Si se elige la estrategia por bulto, el asistente calcula el precio unitario sugerido en tiempo real y permite transferirlo con un clic al campo canónico de venta.
- **Alertas de Stock Crítico:** Identificación visual de productos agotados o por debajo del umbral de seguridad (`minStock`).
- **Importación Masiva desde Excel (`ExcelImportModal.tsx`):**
  - Admite archivos `.xlsx`, `.xls` y `.csv` usando la biblioteca `xlsx` (SheetJS).
  - Mapeo flexible de columnas (Nombre, SKU, Código de barras, Categoría, Precio, Costo, Stock).
  - Opción de actualización acumulativa o reemplazo de existencias.

### 3.2. Gestión Dinámica de Categorías (Configuración)
Ubicada en `src/components/SettingsView.tsx`:
- **Creación:** Validación contra nombres vacíos y duplicados insensibles a mayúsculas/minúsculas.
- **Edición y Renombrado en Cascada:** Al cambiar el nombre de una categoría, el sistema actualiza automáticamente todos los productos vinculados y persiste los cambios localmente y en el servidor.
- **Eliminación Segura con Reasignación:** Si la categoría a eliminar contiene productos en el catálogo, el sistema exige seleccionar una categoría de destino para reasignar los productos antes de completar el borrado, garantizando integridad referencial.

---

## 4. Módulo 4: Libro de Clientes y Crédito ("Fiado")

Ubicado en `src/components/CustomerLedgerView.tsx`.

### 4.1. Reglas de Negocio
- Cada cliente posee una ficha con nombre, teléfono, notas, límite de crédito (`debtLimit`) y deuda actual (`currentDebt`).
- Cuando una venta se liquida como `customer_debt`:
  - Se genera un asiento contable de tipo `sale_debt`.
  - Se incrementa `currentDebt` del cliente.
  - Se valida que no exceda el límite establecido.
- Cuando el cliente abona dinero:
  - Se registra un asiento de tipo `debt_payment`.
  - Se reduce `currentDebt` del cliente.
  - Se genera un comprobante de abono imprimible con el saldo pendiente actualizado.

---

## 5. Módulo 5: Libro de Proveedores (Cuentas por Pagar)

Ubicado en `src/components/VendorLedgerView.tsx`.

### 5.1. Reglas de Negocio
- Directorio de proveedores mayoristas con información de contacto, términos de pago acordados (ej. *Net 15*, *Contado*) y deuda total (`outstandingPayable`).
- **Recepción de Factura (`supply_invoice`):** Incrementa el saldo adeudado con número de factura de referencia y fecha de vencimiento.
- **Pago a Proveedor (`vendor_payment`):** Registra el egreso de caja y disminuye el saldo pendiente.

---

## 6. Módulo 6: Dashboard y Analítica Comercial

Ubicado en `src/components/DashboardView.tsx`.

### 6.1. Indicadores Clave de Desempeño (KPIs)
- **Ventas Totales:** Suma acumulada en el rango temporal seleccionado (Día, Semana, Mes, Año).
- **Ganancia Neta Estimada:** $\sum (\text{precio} - \text{costo}) \times \text{cantidad}$.
- **Ticket Promedio:** $\frac{\text{Monto Total Vendido}}{\text{Número de Transacciones}}$.
- **Valorización de Inventario:** Valor monetario a costo y valor proyectado a precio de venta.
- **Riesgo Crediticio:** Total acumulado en cuentas por cobrar pendientes vs. cuentas por pagar a proveedores.
