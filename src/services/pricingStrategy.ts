import { PricingMethod } from '../types';

/**
 * Parámetros de entrada para el cálculo de precios.
 */
export interface PricingCalculationParams {
  price?: number; // Precio de venta manual / actual
  costPrice?: number; // Costo unitario manual o base
  bulkUnits?: number; // unidades_por_bulto
  bulkCost?: number; // costo_bulto
  profitMarginPercent?: number; // ganancia deseada en porcentaje (%) (ej. 30 para 30%)
  profitMarginValue?: number; // ganancia en monto fijo (compatibilidad)
}

/**
 * Resultado devuelto por una estrategia de cálculo de precios.
 */
export interface PricingCalculationResult {
  suggestedPrice: number; // Precio de venta sugerido (precio_venta canónico)
  calculatedUnitCost: number; // Costo unitario resultante
  profitValue: number; // Ganancia neta por unidad
  profitMarginPercent: number; // Margen de ganancia porcentual (%)
  formulaSummary: string; // Resumen legible de la fórmula aplicada
}

/**
 * Interfaz común para el Patrón Estrategia (Strategy Pattern) de Fijación de Precios.
 */
export interface PricingStrategy {
  readonly id: PricingMethod;
  readonly code: string;
  readonly name: string;
  readonly description: string;

  /**
   * Calcula el precio de venta sugerido, costo unitario y márgenes.
   */
  calculate(params: PricingCalculationParams): PricingCalculationResult;
}

/**
 * Estrategia 1: Fijación Manual (Compatibilidad hacia atrás obligatoria).
 * El usuario introduce directamente el precio_venta canónico y costo unitario.
 */
export class ManualPricingStrategy implements PricingStrategy {
  readonly id: PricingMethod = 'MANUAL';
  readonly code = 'MANUAL';
  readonly name = 'Fijación Manual';
  readonly description = 'El precio de venta se define y edita de forma directa.';

  calculate(params: PricingCalculationParams): PricingCalculationResult {
    const suggestedPrice = Math.max(0, Number(params.price) || 0);
    const calculatedUnitCost = Math.max(0, Number(params.costPrice) || 0);
    const profitValue = suggestedPrice - calculatedUnitCost;
    const profitMarginPercent =
      calculatedUnitCost > 0 ? (profitValue / calculatedUnitCost) * 100 : 0;

    return {
      suggestedPrice,
      calculatedUnitCost,
      profitValue,
      profitMarginPercent: Number(profitMarginPercent.toFixed(2)),
      formulaSummary: 'Precio Venta directo asignado manualmente.',
    };
  }
}

/**
 * Estrategia 2: Fijación Por Bulto / Mayorista.
 * Calcula el costo unitario a partir del costo total del bulto y las unidades,
 * y sugiere el precio de venta aplicando el porcentaje (%) de ganancia deseada:
 *   - Costo Unitario = Costo del Bulto / Unidades por Bulto
 *   - Ganancia Unitaria = Costo Unitario * (% Ganancia Deseada / 100)
 *   - Precio de Venta Sugerido = Costo Unitario + Ganancia Unitaria
 */
export class BulkPricingStrategy implements PricingStrategy {
  readonly id: PricingMethod = 'BULK_PACK';
  readonly code = 'POR_BULTO';
  readonly name = 'Por Bulto (Mayorista)';
  readonly description = 'Calcula costo unitario (Costo Bulto / Uds) y aplica el margen de ganancia porcentual (%) deseado.';

  calculate(params: PricingCalculationParams): PricingCalculationResult {
    const bulkUnits = Number(params.bulkUnits) || 0;
    const bulkCost = Math.max(0, Number(params.bulkCost) || 0);

    // Costo Unitario = Costo del Bulto / Unidades por Bulto
    const calculatedUnitCost =
      bulkUnits > 0 ? bulkCost / bulkUnits : Math.max(0, Number(params.costPrice) || 0);

    // Determinar porcentaje de ganancia deseada
    let profitMarginPercent = 0;
    if (params.profitMarginPercent !== undefined) {
      profitMarginPercent = Math.max(0, Number(params.profitMarginPercent) || 0);
    } else if (params.profitMarginValue !== undefined && calculatedUnitCost > 0) {
      // Retrocompatibilidad con montos fijos previos
      profitMarginPercent = (params.profitMarginValue / calculatedUnitCost) * 100;
    }

    // Ganancia en dinero = Costo Unitario * (% Ganancia / 100)
    const profitValue = calculatedUnitCost * (profitMarginPercent / 100);

    // Precio de Venta Sugerido = Costo Unitario + Ganancia Deseada
    const suggestedPrice = calculatedUnitCost + profitValue;

    return {
      suggestedPrice: Number(suggestedPrice.toFixed(2)),
      calculatedUnitCost: Number(calculatedUnitCost.toFixed(4)),
      profitValue: Number(profitValue.toFixed(2)),
      profitMarginPercent: Number(profitMarginPercent.toFixed(2)),
      formulaSummary:
        bulkUnits > 0
          ? `(${bulkCost.toFixed(2)} / ${bulkUnits} uds) = ${calculatedUnitCost.toFixed(2)} costo + ${profitMarginPercent}% ganancia (${profitValue.toFixed(2)}) = ${suggestedPrice.toFixed(2)}`
          : 'Ingrese unidades del bulto mayores a 0',
    };
  }
}

/**
 * Contexto de Estrategia para resolver cálculos dinámicos.
 */
export class PricingStrategyContext {
  private strategy: PricingStrategy;

  constructor(strategy?: PricingStrategy) {
    this.strategy = strategy || new ManualPricingStrategy();
  }

  setStrategy(strategy: PricingStrategy): void {
    this.strategy = strategy;
  }

  getStrategy(): PricingStrategy {
    return this.strategy;
  }

  calculate(params: PricingCalculationParams): PricingCalculationResult {
    return this.strategy.calculate(params);
  }
}

/**
 * Factoría / Selector para instanciar la estrategia correspondiente.
 */
export function getPricingStrategy(method: PricingMethod = 'MANUAL'): PricingStrategy {
  switch (method) {
    case 'BULK_PACK':
      return new BulkPricingStrategy();
    case 'MANUAL':
    default:
      return new ManualPricingStrategy();
  }
}

/**
 * Catálogo de estrategias disponibles en el sistema.
 */
export const AVAILABLE_PRICING_STRATEGIES: PricingStrategy[] = [
  new ManualPricingStrategy(),
  new BulkPricingStrategy(),
];

// Alias en español solicitados en requerimientos
export {
  ManualPricingStrategy as EstrategiaManual,
  BulkPricingStrategy as EstrategiaPorBulto,
};
