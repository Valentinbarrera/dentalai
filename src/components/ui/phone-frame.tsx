import { ReactNode } from 'react';
import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native';

import { palette } from '@/theme/tokens';

/**
 * Tamaño de pantalla (en puntos) del iPhone de referencia que usa Apple para
 * las capturas del App Store: 6.9" (iPhone 16 Pro Max) = 440 x 956.
 * Es el mismo lienzo en el que se ve la app en un celular real.
 */
const DEVICE = { width: 440, height: 956 } as const;

/** Debajo de este ancho de ventana la app se muestra a pantalla completa (celular / tablet chica). */
const FRAME_BREAKPOINT = 820;

/** Margen mínimo entre el marco y los bordes de la ventana. */
const PAGE_PADDING = 32;

/**
 * En web y en pantallas grandes encuadra la app dentro de un marco con
 * proporciones de celular (como se ve en el App Store) en vez de estirarla a
 * todo el ancho del monitor. En native (y en navegadores de celular) no hace
 * nada: devuelve los hijos tal cual.
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  const { width, height } = useWindowDimensions();

  if (Platform.OS !== 'web') return <>{children}</>;

  const framed = width >= FRAME_BREAKPOINT && height >= 560;
  if (!framed) return <>{children}</>;

  // Si la ventana es más baja que el celular de referencia, el marco se recorta
  // a lo que entre (la app es responsive, no se deforma).
  const screenHeight = Math.min(DEVICE.height, height - PAGE_PADDING * 2);

  return (
    <View style={styles.page}>
      <View style={styles.bezel}>
        <View style={[styles.screen, { width: DEVICE.width, height: screenHeight }]}>
          {children}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: PAGE_PADDING,
    backgroundColor: '#E7EDF7',
  },
  bezel: {
    padding: 12,
    borderRadius: 60,
    backgroundColor: '#0B1220',
    // web-only: sombra de mockup
    boxShadow: '0 24px 70px rgba(11, 18, 32, 0.35)',
  } as any,
  screen: {
    borderRadius: 48,
    overflow: 'hidden',
    backgroundColor: palette.background,
  },
});
