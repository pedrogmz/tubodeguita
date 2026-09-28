# TuBodeguita — Documentación y Metodología SDD

Bienvenido al repositorio de documentación técnica y guía de arquitectura de **TuBodeguita**.

Este conjunto de documentos está diseñado para adoptar y practicar **SDD (Spec-Driven Development / Software Design Document)** como estándar de ingeniería de software para el ciclo de vida, evolución y mantenimiento de la plataforma.

---

## 📚 Índice de Documentación SDD

La documentación se encuentra organizada de forma modular en el directorio `docs/sdd/`:

| Documento | Título | Descripción |
| :--- | :--- | :--- |
| [**01. Visión y Arquitectura**](docs/sdd/01_SYSTEM_OVERVIEW_AND_ARCHITECTURE.md) | *System Overview & Architecture* | Visión del producto, arquitectura híbrida offline-first, stack tecnológico, topología de datos y diagrama de componentes. |
| [**02. Modelos de Datos y Esquemas**](docs/sdd/02_DATA_MODELS_AND_SCHEMAS.md) | *Data Models & Schemas* | Diccionario de tipos TypeScript, DDL relacional de SQLite, contratos de LocalStorage, estados e invariantes matemáticas. |
| [**03. Módulos y Lógica de Negocio**](docs/sdd/03_MODULES_AND_BUSINESS_LOGIC.md) | *Modules & Business Logic* | Especificación técnica de cada módulo: Punto de Venta (POS), Motor de Estrategias de Precios (Patrón Strategy), Inventario y Categorías, Libro de Clientes (Fiado), Libro de Proveedores y Dashboard. |
| [**04. Contratos de API y Protocolo de Sincronización**](docs/sdd/04_API_AND_OFFLINE_SYNC_PROTOCOL.md) | *API & Offline Sync Protocol* | Endpoints REST de Express, máquina de estados de la cola de sincronización offline-first, resolución de conflictos y API de SQLite. |
| [**05. Guía Práctica de Spec-Driven Development**](docs/sdd/05_SPEC_DRIVEN_DEVELOPMENT_GUIDE.md) | *SDD Practical Guide & RFC Template* | Metodología paso a paso para diseñar antes de programar, plantilla estándar de RFC / Especificación y casos de estudio aplicados. |

---

## ⚡ Guía de Instalación y Ejecución

Sigue estos pasos para configurar y levantar el proyecto en tu entorno local.

### 📋 Prerrequisitos

- **Node.js**: v18.0.0 o superior (recomendado v20+) o **Bun** v1.0+.
- **npm** (incluido con Node.js), **pnpm** o **bun** como gestor de paquetes.

---

### 1️⃣ Clonar el repositorio e instalar dependencias

Navega hasta la carpeta del proyecto e instala las dependencias:

```bash
# Con npm
npm install

# O con bun
bun install
```

---

### 2️⃣ Configurar las variables de entorno

Copia el archivo de ejemplo `.env.example` a un nuevo archivo `.env`:

```bash
cp .env.example .env
```

Configura tus credenciales en el archivo `.env`:

```env
# Clave de API de Google Gemini (requerida para las funciones de IA)
GEMINI_API_KEY="tu_api_key_de_gemini"

# URL base de la aplicación (opcional para entornos de despliegue)
APP_URL="http://localhost:3000"
```

> [!NOTE]
> La aplicación puede inicializarse y funcionar sin `GEMINI_API_KEY`. En caso de no proporcionarla, los asistentes de IA (análisis de inventario y recomendaciones de venta cruzada) usarán respuestas heurísticas de contingencia (*fallbacks*).

---

### 3️⃣ Iniciar en Modo Desarrollo

Levanta el servidor Express con el entorno de desarrollo Vite integrado (con HMR - Hot Module Replacement):

```bash
# Con npm
npm run dev

# O con bun
bun dev
```

La aplicación estará disponible de inmediato en:
👉 **[http://localhost:3000](http://localhost:3000)** (o `http://0.0.0.0:3000`)

> [!TIP]
> Al arrancar el servidor por primera vez, la base de datos local SQLite se creará e inicializará automáticamente en `data/tubodeguita.sqlite`.

---

### 4️⃣ Compilación y Modo Producción

Para generar el bundle optimizado para despliegue en producción:

```bash
# 1. Compilar frontend (Vite) y servidor (esbuild)
npm run build

# 2. Iniciar el servidor compilado
npm run start
```

---

### 🛠️ Scripts Disponibles en `package.json`

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor en modo desarrollo (`tsx server.ts`) con Vite HMR en el puerto 3000. |
| `npm run build` | Compila los assets estáticos del cliente en `dist/` y empaqueta el backend en `dist/server.cjs`. |
| `npm run start` | Ejecuta el servidor compilado de producción (`node dist/server.cjs`). |
| `npm run lint` | Ejecuta la verificación estática de tipos con TypeScript (`tsc --noEmit`). |
| `npm run clean` | Elimina la carpeta `dist/` y archivos de compilación anteriores. |

---

## 🎯 ¿Qué es SDD en este proyecto?

En este proyecto, **SDD** opera en dos dimensiones complementarias:

1. **Software Design Document (SDD):** El mapa técnico canónico del sistema que describe la realidad arquitectónica, los límites de responsabilidad de cada capa y los contratos de datos existentes.
2. **Spec-Driven Development (Desarrollo Guiado por Especificaciones):** La disciplina de ingeniería en la que **ninguna característica nueva, cambio de esquema o endpoint se programa directamente** sin antes haber redactado su especificación técnica formal (RFC/Spec), identificando invariantes, casos borde, retrocompatibilidad e impacto en bilingüismo (i18n).

---

## 🚀 Flujo de Trabajo Rápido para Desarrolladores

```text
[Requerimiento de Negocio / Issue]
                │
                ▼
      [1. Redactar Spec / RFC]
  (Copiar plantilla de 05_SPEC_DRIVEN_DEVELOPMENT_GUIDE.md)
                │
                ▼
  [2. Validación de Invariantes y Contratos]
  (Verificar tipos en types.ts, SQLite en server/sqlite.ts y persistencia)
                │
                ▼
      [3. Implementación de Código]
  (Servicios -> Componentes UI -> i18n -> Rutas Express)
                │
                ▼
    [4. Verificación y Compilación]
  (npm run lint && npm run build)
```

---

## 🛠️ Stack Tecnológico Resumido

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide Icons, ZXing Barcode Scanner, SheetJS (XLSX).
- **Backend:** Node.js, Express, TSX.
- **Persistencia Híbrida:**
  - **Cliente:** `LocalStorage` con cola de sincronización resiliente (*offline-first*).
  - **Servidor:** Base de datos relacional SQLite integrada (`sql.js`) persistida en disco (`/data/tubodeguita.sqlite`).
- **Inteligencia Artificial:** SDK oficial `@google/genai` (Gemini API) con endpoints de proxy en servidor para análisis de inventario y recomendaciones de ventas.
- **Multi-Moneda:** Soporte nativo y simultáneo de USD ($) y Bolívares (Bs. VES) con tasa oficial BCV y conversor en tiempo real.
