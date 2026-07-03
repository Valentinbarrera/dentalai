import { useEffect, useState } from 'react';

import { listVideos } from '../services/videos-service';
import type { Video } from '../types';

/** Resultado del hook: la lista, el estado de carga y un error opcional. */
export type UseVideosResult = {
  videos: Video[];
  loading: boolean;
  error: string | null;
};

/**
 * Lista los videos educativos de la biblioteca.
 * Hook de solo lectura: dispara la consulta al montar y expone el estado.
 */
export function useVideos(): UseVideosResult {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    listVideos()
      .then((data) => {
        if (!cancelled) setVideos(data);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error al cargar los videos.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { videos, loading, error };
}
