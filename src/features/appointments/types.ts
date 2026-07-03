/** Contratos del dominio de turnos (appointments). */

/** Estados posibles de un turno, en su ciclo de vida. */
export type AppointmentStatus = 'pendiente' | 'confirmado' | 'completado' | 'cancelado';

/**
 * Un turno. Es la fuente única compartida entre ambos roles:
 * lo crea el booking del paciente y lo lee/gestiona la agenda del odontólogo.
 */
export type Appointment = {
  id: string;
  /** Usuario paciente dueño del turno (`auth.users.id`). */
  patientId: string;
  /** Usuario odontólogo que atiende (`auth.users.id`). */
  dentistId: string;
  /** Fecha y hora de inicio, en ISO 8601 (UTC). */
  startsAt: string;
  /** Duración en minutos. */
  durationMin: number;
  /** Tipo de turno (control, endodoncia, consulta…). */
  type: string;
  /**
   * Nombre del paciente, traído por embed con la tabla `profiles`.
   * Puede quedar `undefined` si el embed no está disponible o el perfil no es visible.
   */
  patientName?: string;
  status: AppointmentStatus;
  /** Nota opcional del turno. */
  note?: string;
  /** Fecha de creación, en ISO 8601. */
  createdAt: string;
};

/**
 * Un paciente del odontólogo, derivado de sus turnos.
 * No es una entidad propia: se obtiene agrupando los turnos por paciente
 * (pacientes distintos), tomando el turno más reciente de cada uno.
 */
export type DentistPatient = {
  /** Usuario paciente (`auth.users.id`). */
  id: string;
  /** Nombre del paciente, traído por embed con `profiles`. */
  name: string;
  /** Fecha/hora de inicio del turno más reciente con este paciente, ISO 8601. */
  lastVisitAt: string;
  /** Estado del turno más reciente. */
  lastStatus: AppointmentStatus;
};

/** Datos para crear un turno nuevo. El estado inicial lo pone la DB (`pendiente`). */
export type CreateAppointmentInput = {
  patientId: string;
  dentistId: string;
  startsAt: string;
  durationMin: number;
  type: string;
  note?: string;
};
