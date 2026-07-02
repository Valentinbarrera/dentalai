import { Redirect } from 'expo-router';

import { ROUTES } from '@/lib/routes';
import { session } from '@/lib/session';

/** Puerta de entrada: onboarding/login si no hay sesión, Home si la hay. */
export default function Index() {
  return <Redirect href={session.authed ? ROUTES.home : ROUTES.onboarding} />;
}
