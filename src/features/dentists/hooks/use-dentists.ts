import { useEffect, useState } from 'react';

import { listDentists } from '../services/dentists-service';
import type { Dentist } from '../types';

/** Estado de la lista de odontólogos: datos, carga y error. */
export type DentistsState = {
  dentists: Dentist[];
  loading: boolean;
  error: string | null;
};

const INITIAL: DentistsState = { dentists: [], loading: true, error: null };

/** Odontólogos disponibles para reservar. Se cargan una vez al montar. */
export function useDentists(): DentistsState {
  const [state, setState] = useState<DentistsState>(INITIAL);

  useEffect(() => {
    let active = true;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    listDentists()
      .then((dentists) => {
        if (active) setState({ dentists, loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (active) {
          setState({
            dentists: [],
            loading: false,
            error: err instanceof Error ? err.message : 'No pudimos cargar los profesionales.',
          });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return state;
}
