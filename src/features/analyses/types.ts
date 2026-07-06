/** Contratos del dominio de análisis (capturas + diagnóstico persistido). */

import type { AffectedZone, TreatmentOption } from '@/lib/diagnosis';

/**
 * Una captura del flujo de análisis: una foto guiada por ángulo o el video 360°.
 * La `uri` es local (la produce `analysis/camera.tsx`) hasta que se sube al bucket.
 */
export type Capture = {
  uri: string;
  kind: 'photo' | 'video';
  /** Ángulo de la foto (ej. 'frente', 'lat_der'); no aplica al video. */
  angle?: string;
};

/** Estado del ciclo de vida de un análisis. */
export type AnalysisStatus = 'subiendo' | 'procesando' | 'listo' | 'error';

/**
 * Puntaje de salud bucal (0-100) que devuelve la IA. Orientativo, no clínico.
 * `general` es el resumen; los otros tres son dimensiones específicas.
 */
export type HealthScore = {
  general: number;
  higiene: number;
  encias: number;
  alineacion: number;
};

/** Una línea del desglose del presupuesto (precio como string, ej. "$2,000"). */
export type BudgetItem = {
  label: string;
  price: string;
  note?: string;
  /** Cantidad, ej. "2x" (opcional). */
  qty?: string;
};

/** Una alternativa de financiación (ej. 12 cuotas). */
export type FinancingOption = {
  months: string;
  monthly: string;
  note?: string;
};

/** Presupuesto estimado del tratamiento recomendado. */
export type Budget = {
  items: BudgetItem[];
  subtotal: string;
  total: string;
  financing: FinancingOption[];
};

/**
 * Una línea de un plan de presupuesto, ya CALCULADA por el backend contra el
 * catálogo de precios (`procedures`). `name` y `unitPrice` salen del catálogo
 * (fuente de verdad, editable por el admin), NO de la IA. `lineTotal = unitPrice * qty`.
 */
export type BudgetPlanItem = {
  procedureId: string;
  name: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
};

/**
 * Uno de los 3 presupuestos (A/B/C) que resuelven el mismo problema. La IA elige
 * los ítems y cantidades del catálogo; el backend calcula `total` (suma de
 * `lineTotal`). Los montos NUNCA los inventa la IA.
 */
export type BudgetPlan = {
  id: string;
  title: string;
  description: string;
  recommended?: boolean;
  items: BudgetPlanItem[];
  /** Total calculado por el backend (en `currency`). */
  total: number;
  /** Moneda del catálogo (ej. "USD"). */
  currency?: string;
};

/** Un plan de pago concreto (pago completo, cuotas bancarias, financiación interna). */
export type PaymentPlan = {
  id: string;
  title: string;
  highlight?: string;
  total?: string;
  initial?: string;
  monthly?: string;
  monthlyNote?: string;
  /** Marca el plan destacado (CTA primario). */
  primary?: boolean;
};

/**
 * Resultado del diagnóstico que produce la IA (Edge Function `analyze`, Fase 3).
 * Es `null` mientras el análisis todavía no terminó de procesarse.
 *
 * `affectedZones` y `treatmentOptions` reusan el shape de `lib/diagnosis.ts`.
 * Los campos `summary`, `healthScore`, `budget` y `paymentPlans` son opcionales:
 * los agrega la IA en Fase 3. Toda la app enmarca esto como ORIENTACIÓN
 * PRELIMINAR, nunca como diagnóstico clínico.
 */
export type DiagnosisResult = {
  /** Resumen clínico preliminar en 1-2 frases (opcional). */
  summary?: string;
  affectedZones: AffectedZone[];
  treatmentOptions: TreatmentOption[];
  healthScore?: HealthScore;
  budget?: Budget;
  paymentPlans?: PaymentPlan[];
  /**
   * Los 3 presupuestos calculados con el catálogo de precios real (Fase B).
   * Cada uno resuelve el mismo problema con distinta relación costo/beneficio.
   */
  plans?: BudgetPlan[];
};

/** Una fila de la tabla `analyses`: un scan del paciente y su diagnóstico. */
export type Analysis = {
  id: string;
  userId: string;
  status: AnalysisStatus;
  /** Diagnóstico ya calculado, o `null` si aún no está listo. */
  result: DiagnosisResult | null;
  createdAt: string;
};
