# SDD 05: Guía Práctica de Spec-Driven Development (SDD)

- **Documento:** SDD-05
- **Proyecto:** TuBodeguita
- **Versión:** 1.2.0
- **Estado:** Activo / Producción

---

## 1. ¿Qué es Spec-Driven Development (SDD)?

**Spec-Driven Development (Desarrollo Guiado por Especificaciones)** es una disciplina de ingeniería de software en la cual **ningún código nuevo se escribe hasta que su especificación formal haya sido documentada y acordada**.

En proyectos comerciales complejos como un sistema de punto de venta (POS) con manejo de inventario, deudas, impuestos, multi-moneda y modo offline, programar "sobre la marcha" introduce regresiones graves (pérdida de datos en sincronización, cálculo erróneo de impuestos, estados inconsistentes de caja).

### Beneficios en TuBodeguita:
- **Cero Ambigüedad:** Los tipos de datos, rutas de API y comportamiento ante cortes de conexión se definen por adelantado.
- **Retrocompatibilidad Garantizada:** Todo cambio de esquema respeta las versiones anteriores de `LocalStorage` y `SQLite`.
- **Bilingüismo Completo:** Toda nueva interfaz contempla strings en Español e Inglés (`src/i18n/translations.ts`).
- **Verificación Determinista:** Cada criterio de aceptación se traduce en una prueba manual o automatizada antes de desplegar.

---

## 2. El Ciclo de Vida SDD (Paso a Paso)

```text
┌────────────────────────────────────────────────────────┐
│                   1. REDACTAR ESPECIFICACIÓN           │
│  Completar plantilla formal de requerimiento (RFC).    │
│  Definir impacto en tipos, almacenamiento e interfaz.  │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                   2. REVISIÓN DE CONTRATOS             │
│  ¿Afecta SQLite? ¿Afecta LocalStorage?                 │
│  ¿Rompe el modo Offline? ¿Cumple bi-moneda USD/VES?    │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                   3. IMPLEMENTACIÓN GUIADA             │
│  1. `src/types.ts` (Tipos e interfaces)                │
│  2. `server/sqlite.ts` & `server.ts` (Persistencia/API)│
│  3. `src/services/` (Lógica de dominio/estrategias)    │
│  4. `src/i18n/translations.ts` (ES/EN)                 │
│  5. `src/components/` (Interfaz visual accesible)      │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                   4. VERIFICACIÓN Y COMPILACIÓN        │
│  Ejecutar `npm run lint` y `npm run build`.            │
│  Comprobar cada Criterio de Aceptación del documento.  │
└────────────────────────────────────────────────────────┘
```

---

## 3. Plantilla Oficial de Especificación de Funcionalidad (RFC / Spec)

Copia esta plantilla cada vez que vayas a diseñar o proponer una nueva característica en el proyecto:

```markdown
# SPEC-XXX: [Título de la Característica / Módulo]

- **Autor:** [Nombre / Rol]
- **Fecha:** YYYY-MM-DD
- **Estado:** [Borrador | Aprobado | Implementado]
- **Módulos Afectados:** [POS | Inventario | Clientes | Proveedores | Ajustes | Servidor]

---

## 1. Contexto y Problema de Negocio
*¿Qué necesidad operativa del comerciante o cajero resuelve esta especificación? ¿Por qué es necesaria?*

---

## 2. Historias de Usuario
- **Como** [cajero / dueño de tienda / cliente],
- **quiero** [acción específica en el sistema],
- **para** [beneficio operativo o contable concreto].

---

## 3. Contratos de Datos y Esquemas

### 3.1. Modificaciones a `src/types.ts`
\`\`\`typescript
// Nuevos tipos o campos agregados a interfaces existentes
\`\`\`

### 3.2. Modificaciones a Base de Datos (SQLite DDL)
\`\`\`sql
-- Sentencias de migración o nuevas tablas necesarias
ALTER TABLE ... ADD COLUMN ...;
\`\`\`

### 3.3. Claves de LocalStorage Afectadas
- `smartshop_...`: [Detalle del nuevo payload o migración local]

---

## 4. Diseño de Endpoints de Servidor (Si aplica)
- **Método / Ruta:** `POST /api/...`
- **Request Body:**
\`\`\`json
{
  "campo": "valor"
}
\`\`\`
- **Response (200 OK):**
\`\`\`json
{
  "success": true
}
\`\`\`

---

## 5. Diseño de Interfaz y Experiencia de Usuario (UI/UX)
- **Vistas afectadas:** [ej. `SettingsView.tsx`, `RegisterView.tsx`]
- **Componentes nuevos:** [ej. Modal de confirmación, selector desplegable]
- **Internacionalización (i18n):** Claves requeridas en `src/i18n/translations.ts` (ambos idiomas: ES y EN).

---

## 6. Comportamiento en Modo Fuera de Línea (Offline)
*¿Cómo opera la función si se interrumpe la conexión a internet? ¿Se registra en `SyncQueueItem`? ¿Cómo se resuelve una eventual colisión de datos?*

---

## 7. Criterios de Aceptación (Checklist de Verificación)
- [ ] Criterio 1: [Acción de prueba esperada con resultado cuantificable]
- [ ] Criterio 2: [Validación ante error o entrada inválida]
- [ ] Criterio 3: [Comprobación de sincronización al volver a estar online]
- [ ] Criterio 4: [Compilación limpia sin errores de TypeScript (`npm run lint`)]
```

---

## 4. Caso Práctico Aplicado: Gestión de Categorías de Productos

Para ilustrar cómo se aplicó SDD en este proyecto, examinemos el caso real de la **Gestión de Categorías**:

1. **Requerimiento:** El usuario necesitaba poder agregar, editar y eliminar categorías de productos desde la vista de Ajustes.
2. **Análisis de Invariantes Previos:**
   - Si se renombra una categoría (ej. *"Bebidas"* $\to$ *"Bebidas Frías"*), los productos existentes quedarían huérfanos con el nombre anterior si solo se modifica una lista estática.
   - Si se elimina una categoría que contiene 10 productos, ¿qué ocurre con esos productos?
3. **Decisión de Diseño en la Especificación:**
   - Se definió que la edición ejecuta una actualización en cascada sobre el catálogo (`Product.category`).
   - Se diseñó un modal de confirmación con **reasignación obligatoria de productos**: el usuario no puede borrar una categoría con productos asignados sin elegir antes a qué categoría existente transferirlos.
4. **Resultado:** Cero errores de referencia, sincronización inmediata con la caja registradora y el inventario, y código libre de deuda técnica.

---

## 5. Reglas de Oro para Desarrolladores y Agentes de IA

1. **Nunca programes a ciegas:** Si la tarea modifica datos de inventario, ventas o dinero, redacta primero la estructura de tipos.
2. **Cero texto hardcodeado en la UI:** Todo texto visible para el usuario debe registrarse en `src/i18n/translations.ts` con sus variantes en Español e Inglés.
3. **Validación de Compilación Obligatoria:** Tras realizar modificaciones en archivos de código, ejecuta siempre la herramienta de compilación/lint para garantizar integridad sintáctica y tipado estricto.
