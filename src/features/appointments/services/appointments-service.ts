/**
 * Capa de datos de turnos: funciones puras contra Supabase.
 * No conoce React. Los hooks las orquestan y las exponen como estado.
 *
 * La tabla `appointments` es la fuente única compartida por ambos roles
 * (ver `supabase/migrations/0003_appointments.sql`). El RLS decide qué
 * filas ve cada usuario según `auth.uid()`.
 */
import {
  demoDentistAppointments,
  demoDentistPatients,
  demoPatientAppointments,
  isDemoActive,
} from '@/features/demo';
import { supabase } from '@/services/supabase';

import type { Appointment, AppointmentStatus, CreateAppointmentInput, DentistPatient } from '../types';

/** Perfil embebido del paciente (join con `public.profiles`). */
type PatientEmbed = { full_name: string | null } | null;

/** Columnas de la tabla, tal como viven en Postgres (snake_case). */
type AppointmentRow = {
  id: string;
  patient_id: string;
  dentist_id: string;
  starts_at: string;
  duration_min: number;
  type: string;
  status: AppointmentStatus;
  note: string | null;
  created_at: string;
  /**
   * Perfil del paciente traído por embed. PostgREST devuelve un objeto (to-one)
   * o, según cómo resuelva la cardinalidad, un array; contemplamos ambos.
   */
  patient?: PatientEmbed | PatientEmbed[];
};

const TABLE = 'appointments';

/** Todas las columnas que seleccionamos, en orden. */
const COLUMNS = 'id, patient_id, dentist_id, starts_at, duration_min, type, status, note, created_at';

/**
 * Columnas + embed con el perfil del paciente para traer su nombre.
 * El nombre del FK (`appointments_patient_id_fkey`) sigue el naming por defecto
 * de la migración 0003. Requiere la policy de la migración 0005 para que el
 * odontólogo pueda leer el perfil del paciente con el que tiene turno.
 */
const COLUMNS_WITH_PATIENT = `${COLUMNS}, patient:profiles!appointments_patient_id_fkey(full_name)`;

/** Extrae el nombre del paciente del embed, tolerando objeto o array. */
function embeddedPatientName(patient: AppointmentRow['patient']): string | undefined {
  if (!patient) return undefined;
  const profile = Array.isArray(patient) ? patient[0] : patient;
  return profile?.full_name ?? undefined;
}

/** Mapea una fila de la DB (snake_case) al contrato del dominio (camelCase). */
function toAppointment(row: AppointmentRow): Appointment {
  return {
    id: row.id,
    patientId: row.patient_id,
    dentistId: row.dentist_id,
    startsAt: row.starts_at,
    durationMin: row.duration_min,
    type: row.type,
    patientName: embeddedPatientName(row.patient),
    status: row.status,
    note: row.note ?? undefined,
    createdAt: row.created_at,
  };
}

/**
 * Turnos de un odontólogo, ordenados por fecha de inicio (asc).
 *
 * La agenda del portal (`src/app/portal.tsx`) lo consume vía
 * `useDentistAppointments(dentistId)`, y `listPatientsForDentist` lo reutiliza
 * para derivar la lista de pacientes.
 */
export async function listForDentist(dentistId: string): Promise<Appointment[]> {
  if (isDemoActive()) return demoDentistAppointments();
  // Intentamos traer el nombre del paciente con un embed a `profiles`.
  const { data, error } = await supabase
    .from(TABLE)
    .select(COLUMNS_WITH_PATIENT)
    .eq('dentist_id', dentistId)
    .order('starts_at', { ascending: true });

  if (!error) {
    return (data as AppointmentRow[] | null)?.map(toAppointment) ?? [];
  }

  // Si el embed no está disponible (relación no reconocida por PostgREST),
  // reintentamos sin él para no romper la agenda; `patientName` queda undefined.
  const fallback = await supabase
    .from(TABLE)
    .select(COLUMNS)
    .eq('dentist_id', dentistId)
    .order('starts_at', { ascending: true });

  if (fallback.error) throw new Error(fallback.error.message);
  return (fallback.data as AppointmentRow[] | null)?.map(toAppointment) ?? [];
}

/**
 * Pacientes de un odontólogo, derivados de sus turnos.
 *
 * No hay tabla de pacientes: la lista sale de agrupar los turnos por paciente
 * (distintos), quedándonos con el turno más reciente de cada uno. El nombre
 * viene del mismo embed con `profiles` que usa `listForDentist`. Se ordena por
 * visita más reciente primero (para la sección "Pacientes recientes").
 */
export async function listPatientsForDentist(dentistId: string): Promise<DentistPatient[]> {
  if (isDemoActive()) return demoDentistPatients();
  // Reutilizamos la lectura de turnos (ya viene con el nombre embebido y
  // ordenada asc por `starts_at`), y derivamos los pacientes distintos.
  const appointments = await listForDentist(dentistId);

  const byPatient = new Map<string, DentistPatient>();
  for (const appt of appointments) {
    // Como los turnos vienen en orden ascendente, cada iteración sobrescribe
    // al anterior del mismo paciente → al final queda el más reciente.
    byPatient.set(appt.patientId, {
      id: appt.patientId,
      name: appt.patientName ?? 'Paciente',
      lastVisitAt: appt.startsAt,
      lastStatus: appt.status,
    });
  }

  return [...byPatient.values()].sort((a, b) => b.lastVisitAt.localeCompare(a.lastVisitAt));
}

/**
 * Turnos de un paciente, ordenados por fecha de inicio (asc).
 */
export async function listForPatient(patientId: string): Promise<Appointment[]> {
  if (isDemoActive()) return demoPatientAppointments();
  const { data, error } = await supabase
    .from(TABLE)
    .select(COLUMNS)
    .eq('patient_id', patientId)
    .order('starts_at', { ascending: true });

  if (error) throw new Error(error.message);
  return (data as AppointmentRow[] | null)?.map(toAppointment) ?? [];
}

/**
 * Crea un turno nuevo. El estado inicial lo define la DB (`pendiente`).
 *
 * TODO(wiring): el flujo de booking del paciente
 * (`src/app/booking/confirmation.tsx`, al confirmar la reserva) llamará a esto
 * con el paciente, el odontólogo y el horario elegidos. NO conectar todavía.
 */
export async function createAppointment(input: CreateAppointmentInput): Promise<Appointment> {
  if (isDemoActive()) {
    // Modo demo: no persistimos; devolvemos un turno sintético "reservado".
    return {
      id: `demo-appt-${input.startsAt}`,
      patientId: input.patientId,
      dentistId: input.dentistId,
      startsAt: input.startsAt,
      durationMin: input.durationMin,
      type: input.type,
      status: 'pendiente',
      note: input.note,
      createdAt: new Date().toISOString(),
    };
  }
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      patient_id: input.patientId,
      dentist_id: input.dentistId,
      starts_at: input.startsAt,
      duration_min: input.durationMin,
      type: input.type,
      note: input.note ?? null,
    })
    .select(COLUMNS)
    .single();

  if (error) throw new Error(error.message);
  return toAppointment(data as AppointmentRow);
}

/**
 * Cambia el estado de un turno (confirmar, completar, cancelar).
 *
 * TODO(wiring): la agenda del odontólogo (`src/app/portal.tsx`) usará esto
 * para confirmar/cancelar turnos desde el portal.
 */
export async function updateStatus(id: string, status: AppointmentStatus): Promise<Appointment> {
  if (isDemoActive()) {
    // Modo demo: el cambio de estado es local (la agenda ya actualiza optimista).
    const source = [...demoDentistAppointments(), ...demoPatientAppointments()];
    const found = source.find((a) => a.id === id);
    return { ...(found ?? source[0]), id, status };
  }
  const { data, error } = await supabase
    .from(TABLE)
    .update({ status })
    .eq('id', id)
    .select(COLUMNS)
    .single();

  if (error) throw new Error(error.message);
  return toAppointment(data as AppointmentRow);
}
