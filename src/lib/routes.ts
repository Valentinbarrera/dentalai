import type { Href } from 'expo-router';

import type { UserRole } from '@/features/auth/types';

/**
 * Rutas de entrada (onboarding/login/home). Se castean a Href porque los
 * typed-routes de expo-router se regeneran recién con el dev server; en runtime
 * las rutas existen (`app/onboarding.tsx`, `app/login.tsx`, `(tabs)/home.tsx`).
 */
export const ROUTES = {
  home: '/home' as unknown as Href,
  login: '/login' as unknown as Href,
  onboarding: '/onboarding' as unknown as Href,
  portal: '/portal' as unknown as Href,
  admin: '/admin' as unknown as Href,
};

/** Ruta de inicio según el rol: admin→panel, odontólogo→portal, paciente→home. */
export function homeForRole(role: UserRole | null | undefined): Href {
  if (role === 'admin') return ROUTES.admin;
  if (role === 'odontologo') return ROUTES.portal;
  return ROUTES.home;
}
