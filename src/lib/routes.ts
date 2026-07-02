import type { Href } from 'expo-router';

/**
 * Rutas de entrada (onboarding/login/home). Se castean a Href porque los
 * typed-routes de expo-router se regeneran recién con el dev server; en runtime
 * las rutas existen (`app/onboarding.tsx`, `app/login.tsx`, `(tabs)/home.tsx`).
 */
export const ROUTES = {
  home: '/home' as unknown as Href,
  login: '/login' as unknown as Href,
  onboarding: '/onboarding' as unknown as Href,
};
