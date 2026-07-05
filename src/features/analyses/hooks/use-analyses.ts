import { useEffect, useState } from 'react';

import { listAnalysesForUser, listMyAnalyses } from '../services/analyses-service';
import type { Analysis } from '../types';

/** Resultado del hook: la lista, el estado de carga y un error opcional. */
export type UseMyAnalysesResult = {
  analyses: Analysis[];
  loading: boolean;
  error: string | null;
};

/** Mismo contrato que `UseMyAnalysesResult`, para los análisis de un paciente puntual. */
export type UseUserAnalysesResult = UseMyAnalysesResult;

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

/**
 * Lista los análisis de un usuario puntual (`userId`), del más nuevo al más viejo.
 * Pensado para la ficha del paciente que ve el odontólogo (RLS lo autoriza si
 * comparten un turno). Si no hay `userId`, no consulta y devuelve la lista vacía.
 */
export function useUserAnalyses(userId: string | null | undefined): UseUserAnalysesResult {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState<boolean>(Boolean(userId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setAnalyses([]);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    listAnalysesForUser(userId)
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
  }, [userId]);

  return { analyses, loading, error };
}
