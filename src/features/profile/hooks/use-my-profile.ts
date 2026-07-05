import { useCallback, useEffect, useState } from 'react';

import { getMyProfile } from '../services/profile-service';
import type { Profile } from '../types';

/** Resultado del hook: el perfil, el estado de carga, un error y un reload. */
export type UseMyProfileResult = {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  /** Vuelve a pedir el perfil a la DB (ej. tras guardar). */
  reload: () => void;
};

/**
 * Carga el perfil del usuario autenticado al montar y expone el estado.
 * `reload` permite refrescar bajo demanda.
 */
export function useMyProfile(): UseMyProfileResult {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getMyProfile()
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error al cargar tu perfil.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const cleanup = load();
    return cleanup;
  }, [load]);

  return { profile, loading, error, reload: load };
}
