import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { palette, radius, spacing, typography } from '@/theme/tokens';
import { TextureGrid } from './texture-grid';

type BrandBandProps = {
  title: string;
  subtitle?: string;
  /** Muestra un botón de volver a la izquierda. */
  onBack?: () => void;
  /** Slot a la derecha (ej. campana de notificaciones). */
  right?: ReactNode;
  /** Contenido extra debajo del título (dentro de la banda). */
  children?: ReactNode;
};

/**
 * Header de marca inmersivo: gradiente navy→azul→teal, textura de puntos,
 * blobs y esquinas inferiores redondeadas. Va como PRIMER hijo de un
 * <ScreenContainer padded={false} edges={[]}>. El resto del contenido se
 * envuelve en una View con paddingHorizontal.
 */
export function BrandBand({ title, subtitle, onBack, right, children }: BrandBandProps) {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={[palette.navy, palette.primary, palette.teal]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.band, { paddingTop: insets.top + spacing.lg }]}>
      <View style={styles.blobA} pointerEvents="none" />
      <View style={styles.blobB} pointerEvents="none" />
      <TextureGrid />

      <View style={styles.row}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Volver"
            hitSlop={8}
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}>
            <Ionicons name="arrow-back" size={22} color={palette.white} />
          </Pressable>
        ) : null}
        <View style={styles.titleCol}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {right ?? null}
      </View>

      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  band: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: radius['2xl'],
    borderBottomRightRadius: radius['2xl'],
    overflow: 'hidden',
  },
  blobA: {
    position: 'absolute',
    top: -50,
    right: -40,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  blobB: {
    position: 'absolute',
    bottom: -60,
    left: -50,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(94,234,212,0.22)',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.6, backgroundColor: 'rgba(255,255,255,0.32)' },
  titleCol: { flex: 1 },
  title: { ...typography.h2, fontSize: 22, color: palette.white, fontWeight: '800' },
  subtitle: { ...typography.caption, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
});
