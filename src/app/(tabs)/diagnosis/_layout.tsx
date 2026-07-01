import { Stack } from 'expo-router';

import { palette } from '@/theme/tokens';

/** Stack anidado del tab Diagnosis: Resultados → Comparador (la nav flotante queda visible). */
export default function DiagnosisLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: palette.background },
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="comparador" />
      <Stack.Screen name="presupuesto" />
      <Stack.Screen name="pago-opciones" />
    </Stack>
  );
}
