import { useCallback, useEffect, useState } from 'react';

import { listProcedures } from '../services/procedures-service';
import type { Procedure } from '../types';

/** Estado del catálogo de precios: datos, carga, error y recarga manual. */
export type UseProceduresResult = {
  procedures: Procedure[];
  loading: boolean;
  error: string | null;
  reload: () => void;
};

/** Carga todo el catálogo de precios (para el panel admin). */
export function useProcedures(): UseProceduresResult {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    listProcedures()
      .then((data) => {
        if (!cancelled) setProcedures(data);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error al cargar los precios.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => load(), [load]);

  return { procedures, loading, error, reload: load };
}
