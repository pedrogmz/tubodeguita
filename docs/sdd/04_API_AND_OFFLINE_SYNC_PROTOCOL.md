# SDD 04: Contratos de API y Protocolo de Sincronización

- **Documento:** SDD-04
- **Proyecto:** TuBodeguita
- **Versión:** 1.2.0
- **Estado:** Activo / Producción

---

## 1. Endpoints de la API REST (Servidor Express)

Todas las rutas del backend se sirven bajo el prefijo `/api` implementado en `server.ts`.

### 1.1. Catálogo de Productos
| Método | Ruta | Descripción | Payload / Parámetros |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Retorna todos los productos almacenados en SQLite. | Ninguno. |
| `POST` | `/api/products` | Crea o actualiza un producto (Upsert). | `{ id, name, sku, barcode, category, price, stock, ... }` |
| `POST` | `/api/products/batch` | Inserción/actualización masiva (Importación Excel). | `{ products: Product[] }` |
| `DELETE` | `/api/products/:id` | Elimina un producto por su identificador. | Ninguno. |
| `PATCH` | `/api/products/:id/stock` | Ajuste directo de existencias. | `{ delta: number }` |

### 1.2. Ventas y Transacciones
| Método | Ruta | Descripción | Payload / Parámetros |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/sales` | Retorna el historial de ventas con sus renglones. | Ninguno. |
| `POST` | `/api/sales` | Registra una nueva venta, guarda ítems y descuenta inventario de forma atómica en SQLite. | `SaleTransaction` completo con `items: CartItem[]`. |

### 1.3. Clientes y Libro de Crédito ("Fiado")
| Método | Ruta | Descripción | Payload / Parámetros |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/customers` | Obtiene el directorio de clientes y sus balances. | Ninguno. |
| `POST` | `/api/customers` | Crea o actualiza un cliente. | `Customer` |
| `DELETE` | `/api/customers/:id` | Elimina un cliente y sus registros vinculados. | Ninguno. |
| `GET` | `/api/customer-ledger` | Obtiene los asientos históricos del libro de clientes. | Ninguno. |
| `POST` | `/api/customer-ledger` | Registra un nuevo movimiento (crédito, abono). | `CustomerLedgerEntry` |

### 1.4. Proveedores y Cuentas por Pagar
| Método | Ruta | Descripción | Payload / Parámetros |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/vendors` | Obtiene los proveedores y sus saldos por pagar. | Ninguno. |
| `POST` | `/api/vendors` | Crea o actualiza un proveedor. | `Vendor` |
| `DELETE` | `/api/vendors/:id` | Elimina un proveedor de la base de datos. | Ninguno. |
| `GET` | `/api/vendor-ledger` | Obtiene los asientos históricos de facturas/pagos. | Ninguno. |
| `POST` | `/api/vendor-ledger` | Registra un asiento de libro de proveedores. | `VendorLedgerEntry` |

### 1.5. Configuración de Tienda
| Método | Ruta | Descripción | Payload / Parámetros |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/store-settings` | Obtiene la configuración comercial persistida. | Ninguno. |
| `POST` | `/api/store-settings` | Guarda la configuración comercial y categorías. | `StoreSettings` |

### 1.6. Administración y Diagnóstico de SQLite
| Método | Ruta | Descripción | Payload / Parámetros |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/sqlite/stats` | Estadísticas del archivo SQLite (tamaño, tablas). | Ninguno. |
| `GET` | `/api/sqlite/dump` | Genera un volcado completo de sentencias SQL DDL y DML. | Ninguno. |
| `GET` | `/api/sqlite/download` | Descarga el archivo binario `.sqlite` para copias de seguridad. | Ninguno. |
| `POST` | `/api/sqlite/query` | Ejecutor de sentencias SQL arbitrarias para soporte técnico. | `{ sql: string }` |

### 1.7. Asistente con Inteligencia Artificial (Gemini API)
| Método | Ruta | Descripción | Payload / Parámetros |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/ai/recommendations` | Sugiere productos complementarios para el carrito actual. | `{ currentItems: CartItem[] }` |
| `POST` | `/api/ai/inventory-insights`| Analiza rotación, sobrestock y alertas de reposición. | Ninguno. |

---

## 2. Protocolo de Sincronización Offline-First

### 2.1. Máquina de Estados de un Ítem de Sincronización
Cada mutación originada sin red se guarda en la cola local con la siguiente estructura:

```typescript
export interface SyncQueueItem {
  id: string;               // UUID local (ej: "sync-169823901")
  timestamp: number;
  type: 'SALE' | 'INVENTORY_UPDATE' | 'CUSTOMER_LEDGER' | 'VENDOR_LEDGER';
  payload: any;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  retryCount: number;
  error?: string;
}
```

```text
       [Mutación en Cliente sin conexión]
                      │
                      ▼
               ┌───────────────┐
               │    PENDING    │◄──────────────┐
               └───────┬───────┘               │
                       │ Conexión detectada    │
                       ▼                       │ Error recuperable
               ┌───────────────┐               │ (retryCount < 5)
               │    SYNCING    │───────────────┤
               └───────┬───────┘
                       │
         ┌─────────────┴─────────────┐
         ▼                           ▼
 ┌───────────────┐           ┌───────────────┐
 │    SYNCED     │           │    FAILED     │
 └───────────────┘           └───────────────┘
 (Procesado con éxito)       (Requiere revisión manual)
```

### 2.2. Reglas de Idempotencia y Resolución de Conflictos
1. **Identificadores Inmutables:** Los registros creados fuera de línea generan su `id` o `receiptNumber` antes de entrar a la cola. El servidor realiza operaciones de tipo **Upsert** (`INSERT INTO ... ON CONFLICT(id) DO UPDATE ...`), previniendo duplicados si un paquete de red se retransmite.
2. **Orden Cronológico Estricto:** La cola se procesa secuencialmente respetando el `timestamp` original de la operación para evitar inconsistencias en saldos de deudores o existencias de inventario.
3. **Respaldo Local Seguro:** Las mutaciones se reflejan en la interfaz de inmediato (optimistic UI), permitiendo al operador seguir vendiendo con fluidez.
