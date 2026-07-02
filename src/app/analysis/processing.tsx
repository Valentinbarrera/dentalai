import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Reveal } from '@/components/ui/reveal';
import { palette, radius, spacing, typography } from '@/theme/tokens';

const DURATION = 4200;

const STAGES = [
  { icon: 'image-multiple-outline', label: 'Alineando fotos' },
  { icon: 'cube-scan', label: 'Reconstruyendo modelo 3D' },
  { icon: 'brain', label: 'Analizando con IA' },
  { icon: 'file-document-check-outline', label: 'Generando diagnóstico' },
] as const;

export default function ProcessingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ photos?: string; video?: string }>();
  const photoCount = Number(params.photos) || 0;
  const hasVideo = params.video === '1';

  const spin = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const [stage, setStage] = useState(0);

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

    const stepMs = DURATION / STAGES.length;
    const stageTimer = setInterval(
      () => setStage((s) => Math.min(s + 1, STAGES.length - 1)),
      stepMs,
    );

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
      clearInterval(stageTimer);
    };
  }, [spin, progress, router]);

  const assetsLabel = hasVideo
    ? `${photoCount} fotos + video 360°`
    : `${photoCount} ${photoCount === 1 ? 'foto' : 'fotos'}`;

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
            <MaterialCommunityIcons name="cube-scan" size={34} color={palette.primary} />
          </View>
        </View>

        <Reveal index={0} delay={200} style={styles.textBlock}>
          <Text style={styles.title}>Construyendo tu{'\n'}modelo 3D…</Text>
          <Text style={styles.subtitle}>
            La IA está fusionando tus capturas para analizar tu salud bucal con más precisión.
          </Text>
          <View style={styles.assetsPill}>
            <Ionicons name="cube-outline" size={14} color={palette.primary} />
            <Text style={styles.assetsText}>{assetsLabel}</Text>
          </View>
        </Reveal>

        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width }]} />
        </View>

        <Reveal index={1} delay={200} style={styles.stages}>
          {STAGES.map((s, i) => {
            const done = i < stage;
            const active = i === stage;
            return (
              <View key={s.label} style={styles.stageRow}>
                <View
                  style={[
                    styles.stageIcon,
                    active && styles.stageIconActive,
                    done && styles.stageIconDone,
                  ]}>
                  {done ? (
                    <Ionicons name="checkmark" size={14} color={palette.white} />
                  ) : (
                    <MaterialCommunityIcons
                      name={s.icon}
                      size={14}
                      color={active ? palette.white : palette.textMuted}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.stageLabel,
                    (active || done) && styles.stageLabelOn,
                  ]}>
                  {s.label}
                </Text>
              </View>
            );
          })}
        </Reveal>
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

  textBlock: { alignItems: 'center' },
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

  assetsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    backgroundColor: palette.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginTop: spacing.md,
  },
  assetsText: { ...typography.small, color: palette.primary, fontWeight: '700' },

  stages: { alignSelf: 'stretch', gap: spacing.md, marginTop: spacing['2xl'] },
  stageRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  stageIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: palette.surfaceAlt,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageIconActive: { backgroundColor: palette.primary, borderColor: palette.primary },
  stageIconDone: { backgroundColor: palette.teal, borderColor: palette.teal },
  stageLabel: { ...typography.body, color: palette.textMuted },
  stageLabelOn: { color: palette.textPrimary, fontWeight: '600' },
});
