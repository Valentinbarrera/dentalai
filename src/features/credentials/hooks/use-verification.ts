import { useEffect, useState } from 'react';

import { getMyVerification } from '../services/credentials-service';
import type { VerificationStatus } from '../types';

/** Lo que expone el hook: estado de verificación de la matrícula. */
export type UseVerification = {
  /** Estado actual de la verificación (`pendiente` mientras carga). */
  status: VerificationStatus;
  /** `true` mientras se consulta el perfil. */
  loading: boolean;
};

/**
 * Devuelve el estado de verificación del odontólogo leyendo su perfil.
 * Se re-consulta si cambia el `userId`.
 */
export function useVerification(userId: string | null | undefined): UseVerification {
  const [status, setStatus] = useState<VerificationStatus>('pendiente');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    if (!userId) {
      setStatus('pendiente');
      setLoading(false);
      return;
    }

    setLoading(true);
    getMyVerification(userId)
      .then((value) => {
        if (active) setStatus(value);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    // Evita actualizar estado si el componente se desmontó o cambió el userId.
    return () => {
      active = false;
    };
  }, [userId]);

  return { status, loading };
}
