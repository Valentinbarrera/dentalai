/**
 * Capa de datos de odontólogos: funciones puras contra Supabase.
 * No conoce React. Los hooks las orquestan y las exponen como estado.
 *
 * Los odontólogos son usuarios reales de `auth.users` con rol `odontologo`
 * en `public.profiles`. La policy de SELECT de la migración 0006 permite que
 * cualquier usuario autenticado los lea para elegirlos al reservar un turno.
 */
import { supabase } from '@/services/supabase';

import type { Dentist } from '../types';

/** Columnas de la tabla `profiles` que necesitamos, tal como viven en Postgres. */
type DentistRow = {
  id: string;
  full_name: string | null;
  specialty: string | null;
  verified: string;
};

const TABLE = 'profiles';

/** Columnas que seleccionamos para listar odontólogos. */
const COLUMNS = 'id, full_name, specialty, verified';

/** Mapea una fila de la DB (snake_case) al contrato del dominio (camelCase). */
function toDentist(row: DentistRow): Dentist {
  return {
    id: row.id,
    fullName: row.full_name,
    specialty: row.specialty,
    verified: row.verified === 'verificado',
  };
}

/**
 * Todos los odontólogos disponibles para reservar, ordenados por nombre.
 *
 * Los consume el flujo de booking del paciente
 * (`src/app/booking/specialist.tsx`) vía `useDentists()`.
 */
export async function listDentists(): Promise<Dentist[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select(COLUMNS)
    .eq('role', 'odontologo')
    .order('full_name', { ascending: true });

  if (error) throw new Error(error.message);
  return (data as DentistRow[] | null)?.map(toDentist) ?? [];
}
