import { useEffect, useState } from 'react';

import { listMyAnalyses } from '../services/analyses-service';
import type { Analysis } from '../types';

/** Resultado del hook: la lista, el estado de carga y un error opcional. */
export type UseMyAnalysesResult = {
  analyses: Analysis[];
  loading: boolean;
  error: string | null;
};

/**
 * Lista los análisis del usuario autenticado.
 * Hook de solo lectura: dispara la consulta al montar y expone el estado.
 */
export function useMyAnalyses(): UseMyAnalysesResult {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    listMyAnalyses()
      .then((data) => {
        if (!cancelled) setAnalyses(data);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error al cargar los análisis.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { analyses, loading, error };
}
