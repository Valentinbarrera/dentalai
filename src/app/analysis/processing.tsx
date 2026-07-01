import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette, radius, spacing, typography } from '@/theme/tokens';

const DURATION = 3200;

export default function ProcessingScreen() {
  const router = useRouter();
  const spin = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();

    const bar = Animated.timing(progress, {
      toValue: 1,
      duration: DURATION,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    });
    bar.start(({ finished }) => {
      if (finished) router.replace('/diagnosis');
    });

    return () => {
      loop.stop();
      bar.stop();
    };
  }, [spin, progress, router]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const width = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <View style={styles.ringWrap}>
          {/* Anillos estáticos */}
          <View style={[styles.ring, styles.ringOuter]} />
          <View style={[styles.ring, styles.ringInner]} />
          {/* Anillo giratorio con puntos */}
          <Animated.View style={[styles.ring, styles.ringOuter, styles.spinner, { transform: [{ rotate }] }]}>
            <View style={[styles.dot, styles.dotTop]} />
            <View style={[styles.dot, styles.dotBottom]} />
          </Animated.View>
          {/* Centro */}
          <View style={styles.core}>
            <MaterialCommunityIcons name="microscope" size={34} color={palette.primary} />
          </View>
        </View>

        <Text style={styles.title}>Analizando imágenes{'\n'}y antecedentes…</Text>
        <Text style={styles.subtitle}>
          La Inteligencia Artificial está procesando sus estudios clínicos.
        </Text>

        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width }]} />
        </View>

        <View style={styles.timer}>
          <Ionicons name="timer-outline" size={15} color={palette.textSecondary} />
          <Text style={styles.timerText}>30 SEGUNDOS</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const RING = 150;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing['3xl'] },
  ringWrap: { width: RING, height: RING, alignItems: 'center', justifyContent: 'center', marginBottom: spacing['2xl'] },
  ring: { position: 'absolute', borderRadius: RING / 2 },
  ringOuter: { width: RING, height: RING, borderWidth: 2, borderColor: palette.tealLight },
  ringInner: { width: RING - 26, height: RING - 26, borderWidth: 2, borderColor: palette.primaryLight },
  spinner: { borderColor: 'transparent' },
  dot: { position: 'absolute', width: 10, height: 10, borderRadius: 5, left: RING / 2 - 5 },
  dotTop: { top: -5, backgroundColor: palette.primary },
  dotBottom: { bottom: -5, backgroundColor: palette.teal },
  core: {
    width: RING - 58,
    height: RING - 58,
    borderRadius: (RING - 58) / 2,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: palette.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },

  title: { ...typography.h2, color: palette.primary, textAlign: 'center' },
  subtitle: {
    ...typography.body,
    color: palette.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
    maxWidth: 300,
  },
  progressTrack: {
    width: 200,
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: palette.primaryLight,
    marginTop: spacing['2xl'],
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: radius.pill, backgroundColor: palette.primary },
  timer: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.lg },
  timerText: { ...typography.small, color: palette.textSecondary, fontWeight: '700', letterSpacing: 1 },
});
