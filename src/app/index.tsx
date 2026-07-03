import { Redirect } from 'expo-router';
import { View } from 'react-native';

import { useAuth } from '@/features/auth';
import { ROUTES } from '@/lib/routes';
import { palette } from '@/theme/tokens';

/** Puerta de entrada: onboarding si no hay sesión; según el rol, portal u Home. */
export default function Index() {
  const { session, role, loading } = useAuth();

  // Mientras leemos la sesión guardada, el splash sigue cubriendo la pantalla.
  if (loading) return <View style={{ flex: 1, backgroundColor: palette.background }} />;

  if (!session) return <Redirect href={ROUTES.onboarding} />;

  return <Redirect href={role === 'odontologo' ? ROUTES.portal : ROUTES.home} />;
}
