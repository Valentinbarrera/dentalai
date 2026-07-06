/**
 * Capa de datos del catálogo de precios: funciones puras contra Supabase.
 * No conoce React. La pantalla de administración y (Fase B) la Edge Function
 * del presupuesto la consumen.
 *
 * Lee/escribe la tabla `procedures`. RLS: lectura para autenticados; escritura
 * SOLO para el rol `admin` (ver migración 0009).
 */
import { supabase } from '@/services/supabase';

import type { Procedure, UpsertProcedureInput } from '../types';

const TABLE = 'procedures';
const COLUMNS = 'id, name, category, unit_price, unit, active, created_at';

/** Fila cruda de la tabla `procedures` (snake_case). */
type ProcedureRow = {
  id: string;
  name: string;
  category: string | null;
  unit_price: number | string;
  unit: string;
  active: boolean;
  created_at: string;
};

/** Mapea la fila de la DB (snake_case) al contrato del dominio (camelCase). */
function toProcedure(row: ProcedureRow): Procedure {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    // `numeric` puede volver como string; lo normalizamos a número.
    unitPrice: Number(row.unit_price),
    unit: row.unit,
    active: row.active,
    createdAt: row.created_at,
  };
}

/** Lista todo el catálogo (para el panel admin), por categoría y nombre. */
export async function listProcedures(): Promise<Procedure[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select(COLUMNS)
    .order('category', { ascending: true, nullsFirst: false })
    .order('name', { ascending: true });

  if (error) throw new Error(`No pudimos cargar los precios: ${error.message}`);
  return (data as ProcedureRow[]).map(toProcedure);
}

/** Lista solo los ítems activos (para armar presupuestos — Fase B). */
export async function listActiveProcedures(): Promise<Procedure[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select(COLUMNS)
    .eq('active', true)
    .order('category', { ascending: true, nullsFirst: false })
    .order('name', { ascending: true });

  if (error) throw new Error(`No pudimos cargar los precios: ${error.message}`);
  return (data as ProcedureRow[]).map(toProcedure);
}

/** Normaliza el input del dominio a columnas de la DB (snake_case). */
function toRow(input: UpsertProcedureInput) {
  return {
    name: input.name.trim(),
    category: input.category?.trim() || null,
    unit_price: input.unitPrice,
    unit: input.unit?.trim() || 'unidad',
    active: input.active ?? true,
  };
}

/** Crea un ítem del catálogo (solo admin, por RLS). */
export async function createProcedure(input: UpsertProcedureInput): Promise<Procedure> {
  const { data, error } = await supabase.from(TABLE).insert(toRow(input)).select(COLUMNS).single();
  if (error) throw new Error(`No pudimos crear el ítem: ${error.message}`);
  return toProcedure(data as ProcedureRow);
}

/** Edita un ítem del catálogo (solo admin, por RLS). */
export async function updateProcedure(
  id: string,
  input: UpsertProcedureInput,
): Promise<Procedure> {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...toRow(input), updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(COLUMNS)
    .single();
  if (error) throw new Error(`No pudimos guardar el ítem: ${error.message}`);
  return toProcedure(data as ProcedureRow);
}

/** Borra un ítem del catálogo (solo admin, por RLS). */
export async function deleteProcedure(id: string): Promise<void> {
  const { data, error } = await supabase.from(TABLE).delete().eq('id', id).select('id');
  if (error) throw new Error(`No pudimos borrar el ítem: ${error.message}`);
  if (!data || data.length === 0) {
    throw new Error('No pudimos borrar el ítem (no existe o no tenés permiso).');
  }
}
