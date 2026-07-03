/**
 * API pública del feature de turnos (appointments).
 * El resto de la app importa siempre desde acá (`@/features/appointments`),
 * nunca de los archivos internos.
 */
export {
  listForDentist,
  listPatientsForDentist,
  listForPatient,
  createAppointment,
  updateStatus,
} from './services/appointments-service';
export {
  useDentistAppointments,
  useDentistPatients,
  usePatientAppointments,
} from './hooks/use-appointments';
export type { Appointment, AppointmentStatus, CreateAppointmentInput, DentistPatient } from './types';
