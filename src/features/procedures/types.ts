/** Contratos del dominio del catálogo de precios (procedimientos/insumos). */

/**
 * Un ítem del catálogo de precios: nombre, categoría y **precio unitario**.
 * La IA combina ítems + cantidades para armar los presupuestos y el backend
 * suma con estos precios (fuente de verdad, editable solo por el admin).
 */
export type Procedure = {
  id: string;
  name: string;
  /** Categoría con la que se agrupa (ej. "Implantes", "Prótesis"), o `null`. */
  category: string | null;
  /** Precio por unidad (en la moneda del catálogo). */
  unitPrice: number;
  /** Unidad (ej. "unidad", "sesión", "pieza"). */
  unit: string;
  /** Si está activo se ofrece en los presupuestos; inactivo queda oculto. */
  active: boolean;
  createdAt: string;
};

/** Datos para crear o editar un ítem del catálogo. */
export type UpsertProcedureInput = {
  name: string;
  category?: string | null;
  unitPrice: number;
  unit?: string;
  active?: boolean;
};
