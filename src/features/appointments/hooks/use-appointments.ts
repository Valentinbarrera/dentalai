import { useEffect, useState } from 'react';

import { listForDentist, listForPatient } from '../services/appointments-service';
import type { Appointment } from '../types';

/** Estado de una lista de turnos: datos, carga y error. */
type AppointmentsState = {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
};

const INITIAL: AppointmentsState = { appointments: [], loading: true, error: null };

/** Turnos de un odontólogo. Se recargan cuando cambia `dentistId`. */
export function useDentistAppointments(dentistId: string | null | undefined): AppointmentsState {
  const [state, setState] = useState<AppointmentsState>(INITIAL);

  useEffect(() => {
    if (!dentistId) {
      setState({ appointments: [], loading: false, error: null });
      return;
    }

    let active = true;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    listForDentist(dentistId)
      .then((appointments) => {
        if (active) setState({ appointments, loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (active) {
          setState({
            appointments: [],
            loading: false,
            error: err instanceof Error ? err.message : 'No pudimos cargar los turnos.',
          });
        }
      });

    return () => {
      active = false;
    };
  }, [dentistId]);

  return state;
}

/** Turnos de un paciente. Se recargan cuando cambia `patientId`. */
export function usePatientAppointments(patientId: string | null | undefined): AppointmentsState {
  const [state, setState] = useState<AppointmentsState>(INITIAL);

  useEffect(() => {
    if (!patientId) {
      setState({ appointments: [], loading: false, error: null });
      return;
    }

    let active = true;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    listForPatient(patientId)
      .then((appointments) => {
        if (active) setState({ appointments, loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (active) {
          setState({
            appointments: [],
            loading: false,
            error: err instanceof Error ? err.message : 'No pudimos cargar los turnos.',
          });
        }
      });

    return () => {
      active = false;
    };
  }, [patientId]);

  return state;
}
