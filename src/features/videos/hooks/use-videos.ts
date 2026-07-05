import { useCallback, useEffect, useState } from 'react';

import { listMyVideos, listVideos } from '../services/videos-service';
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

/** Resultado del hook de "mis videos": incluye un `reload` para refrescar tras publicar/borrar. */
export type UseMyVideosResult = UseVideosResult & {
  reload: () => void;
};

/**
 * Lista los videos cargados por el odontólogo autenticado (`authorId`).
 * Expone `reload` para volver a consultar tras publicar o borrar un video.
 * Si `authorId` es `null`/`undefined` (sin sesión aún), no consulta y queda vacío.
 */
export function useMyVideos(authorId: string | null | undefined): UseMyVideosResult {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;

    if (!authorId) {
      setVideos([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    listMyVideos(authorId)
      .then((data) => {
        if (!cancelled) setVideos(data);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error al cargar tus videos.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authorId, nonce]);

  return { videos, loading, error, reload };
}
