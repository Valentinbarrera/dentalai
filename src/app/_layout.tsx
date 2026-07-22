import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { PhoneFrame } from '@/components/ui/phone-frame';
import { AuthProvider } from '@/features/auth';
import { palette } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <AuthProvider>
      <AnimatedSplashOverlay />
      <PhoneFrame>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: palette.background },
          }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
      </PhoneFrame>
      <StatusBar style="dark" />
    </AuthProvider>
  );
}
