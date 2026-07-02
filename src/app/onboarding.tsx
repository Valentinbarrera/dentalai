import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GradientIcon } from '@/components/ui/gradient-icon';
import { TextureGrid } from '@/components/ui/texture-grid';
import { ROUTES } from '@/lib/routes';
import { palette, radius, spacing, typography } from '@/theme/tokens';

type IconLib = 'ion' | 'mci';
type Slide = {
  key: string;
  lib: IconLib;
  icon: string;
  accent: readonly [string, string];
  title: string;
  subtitle: string;
};

const SLIDES: Slide[] = [
  {
    key: 'denta',
    lib: 'mci',
    icon: 'robot-happy',
    accent: [palette.teal, palette.primary],
    title: 'Conocé a DENTA',
    subtitle: 'Tu asistente dental con IA, siempre en tu bolsillo.',
  },
  {
    key: 'scan',
    lib: 'mci',
    icon: 'cube-scan',
    accent: [palette.primary, palette.navy],
    title: 'Escaneá tu sonrisa',
    subtitle: '3 fotos y un video: DENTA arma un modelo 3D de tu boca.',
  },
  {
    key: 'ai',
    lib: 'mci',
    icon: 'brain',
    accent: ['#6366F1', '#8B5CF6'],
    title: 'Orientación al instante',
    subtitle: 'Detectá señales tempranas y entendé tu salud bucal.',
  },
  {
    key: 'pros',
    lib: 'mci',
    icon: 'calendar-check',
    accent: [palette.teal, palette.tealDark],
    title: 'Conectá con profesionales',
    subtitle: 'Reservá turnos y llevá tu tratamiento al día.',
  },
];

const { width: SCREEN_W } = Dimensions.get('window');

export default function OnboardingScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [index, setIndex] = useState(0);

  const last = index === SLIDES.length - 1;

  const onScroll = Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
    useNativeDriver: true,
  });

  const finish = () => router.replace(ROUTES.login);

  const next = () => {
    if (last) return finish();
    scrollRef.current?.scrollTo({ x: (index + 1) * SCREEN_W, animated: true });
    setIndex((i) => Math.min(i + 1, SLIDES.length - 1));
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[palette.navy, palette.primary, palette.teal]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <FloatingBlobs />
      <TextureGrid opacity={0.08} />

      <SafeAreaView style={styles.safe}>
        {/* Saltar */}
        <View style={styles.topBar}>
          {!last ? (
            <Pressable
              onPress={finish}
              accessibilityRole="button"
              accessibilityLabel="Saltar introducción"
              hitSlop={8}
              style={({ pressed }) => [styles.skip, pressed && styles.skipPressed]}>
              <Text style={styles.skipText}>Saltar</Text>
            </Pressable>
          ) : (
            <View style={styles.skip} />
          )}
        </View>

        {/* Slides */}
        <Animated.ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={onScroll}
          onMomentumScrollEnd={(e) =>
            setIndex(Math.round(e.nativeEvent.contentOffset.x / SCREEN_W))
          }
          style={styles.flex}>
          {SLIDES.map((slide, i) => (
            <SlideView key={slide.key} slide={slide} index={i} scrollX={scrollX} />
          ))}
        </Animated.ScrollView>

        {/* Footer: dots + CTA */}
        <View style={styles.footer}>
          <View style={styles.dots}>
            {SLIDES.map((_, i) => {
              const inputRange = [(i - 1) * SCREEN_W, i * SCREEN_W, (i + 1) * SCREEN_W];
              const w = scrollX.interpolate({
                inputRange,
                outputRange: [8, 26, 8],
                extrapolate: 'clamp',
              });
              const opacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.4, 1, 0.4],
                extrapolate: 'clamp',
              });
              return <Animated.View key={i} style={[styles.dot, { width: w, opacity }]} />;
            })}
          </View>

          <Pressable
            onPress={next}
            accessibilityRole="button"
            accessibilityLabel={last ? 'Comenzar' : 'Siguiente'}
            style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}>
            <Text style={styles.ctaText}>{last ? 'Comenzar' : 'Siguiente'}</Text>
            <Ionicons
              name={last ? 'sparkles' : 'arrow-forward'}
              size={18}
              color={palette.primary}
            />
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

/* ---------------- Sub-componentes ---------------- */

function SlideView({
  slide,
  index,
  scrollX,
}: {
  slide: Slide;
  index: number;
  scrollX: Animated.Value;
}) {
  const inputRange = [(index - 1) * SCREEN_W, index * SCREEN_W, (index + 1) * SCREEN_W];
  const scale = scrollX.interpolate({ inputRange, outputRange: [0.6, 1, 0.6], extrapolate: 'clamp' });
  const opacity = scrollX.interpolate({ inputRange, outputRange: [0, 1, 0], extrapolate: 'clamp' });
  const translateY = scrollX.interpolate({ inputRange, outputRange: [50, 0, 50], extrapolate: 'clamp' });

  const Icon = slide.lib === 'ion' ? Ionicons : MaterialCommunityIcons;

  return (
    <View style={styles.slide}>
      <Animated.View style={[styles.slideInner, { opacity, transform: [{ scale }, { translateY }] }]}>
        <View style={styles.iconStage}>
          <View style={styles.iconGlow} pointerEvents="none" />
          <GradientIcon gradient={slide.accent} size={132} borderRadius={40} style={styles.iconTile}>
            <Icon name={slide.icon as never} size={62} color={palette.white} />
          </GradientIcon>
        </View>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.subtitle}>{slide.subtitle}</Text>
      </Animated.View>
    </View>
  );
}

/** Blobs que flotan suavemente en el fondo (dopamina). */
function FloatingBlobs() {
  const a = useRef(new Animated.Value(0)).current;
  const b = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const mk = (v: Animated.Value, dur: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, { toValue: 1, duration: dur, useNativeDriver: true }),
          Animated.timing(v, { toValue: 0, duration: dur, useNativeDriver: true }),
        ]),
      );
    const la = mk(a, 4200);
    const lb = mk(b, 5200);
    la.start();
    lb.start();
    return () => {
      la.stop();
      lb.stop();
    };
  }, [a, b]);

  const ty1 = a.interpolate({ inputRange: [0, 1], outputRange: [0, 40] });
  const ty2 = b.interpolate({ inputRange: [0, 1], outputRange: [0, -46] });

  return (
    <>
      <Animated.View
        pointerEvents="none"
        style={[styles.blobA, { transform: [{ translateY: ty1 }] }]}
      />
      <Animated.View
        pointerEvents="none"
        style={[styles.blobB, { transform: [{ translateY: ty2 }] }]}
      />
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.navy },
  safe: { flex: 1 },
  flex: { flex: 1 },

  blobA: {
    position: 'absolute',
    top: 80,
    right: -70,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  blobB: {
    position: 'absolute',
    bottom: 120,
    left: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(94,234,212,0.18)',
  },

  topBar: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.xl,
  },
  skip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  skipPressed: { opacity: 0.6 },
  skipText: { ...typography.bodyStrong, color: 'rgba(255,255,255,0.9)' },

  slide: { width: SCREEN_W, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing['3xl'] },
  slideInner: { alignItems: 'center' },
  iconStage: { width: 200, height: 200, alignItems: 'center', justifyContent: 'center' },
  iconGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  iconTile: {
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.25)',
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
    color: palette.white,
    textAlign: 'center',
    marginTop: spacing['2xl'],
  },
  subtitle: {
    ...typography.body,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginTop: spacing.md,
    maxWidth: 300,
  },

  footer: { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, gap: spacing.xl },
  dots: { flexDirection: 'row', alignSelf: 'center', gap: 8, alignItems: 'center' },
  dot: { height: 8, borderRadius: 4, backgroundColor: palette.white },

  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: palette.white,
    borderRadius: radius.pill,
    paddingVertical: spacing.lg,
    shadowColor: palette.navy,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaPressed: { opacity: 0.92, transform: [{ scale: 0.98 }] },
  ctaText: { ...typography.subtitle, color: palette.primary, fontWeight: '800' },
});
