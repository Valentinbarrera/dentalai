import { useEffect, useState } from 'react';

import { listForDentist, listForPatient, listPatientsForDentist } from '../services/appointments-service';
import type { Appointment, DentistPatient } from '../types';

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

/** Estado de la lista de pacientes de un odontólogo: datos, carga y error. */
type DentistPatientsState = {
  patients: DentistPatient[];
  loading: boolean;
  error: string | null;
};

const PATIENTS_INITIAL: DentistPatientsState = { patients: [], loading: true, error: null };

/** Pacientes de un odontólogo (derivados de sus turnos). Se recargan al cambiar `dentistId`. */
export function useDentistPatients(dentistId: string | null | undefined): DentistPatientsState {
  const [state, setState] = useState<DentistPatientsState>(PATIENTS_INITIAL);

  useEffect(() => {
    if (!dentistId) {
      setState({ patients: [], loading: false, error: null });
      return;
    }

    let active = true;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    listPatientsForDentist(dentistId)
      .then((patients) => {
        if (active) setState({ patients, loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (active) {
          setState({
            patients: [],
            loading: false,
            error: err instanceof Error ? err.message : 'No pudimos cargar los pacientes.',
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
