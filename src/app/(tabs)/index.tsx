import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle as SvgCircle, Defs, Pattern, Rect } from 'react-native-svg';

import { Badge } from '@/components/ui/badge';
import { PressableCard } from '@/components/ui/pressable-card';
import { ProgressRing } from '@/components/ui/progress-ring';
import { Reveal } from '@/components/ui/reveal';
import { ScreenContainer } from '@/components/ui/screen-container';
import { palette, radius, shadow, spacing, typography } from '@/theme/tokens';

const USER = { name: 'Juan', initials: 'JG', healthScore: 85 };

const HEALTH_METRICS = [
  { label: 'Higiene', value: 90 },
  { label: 'Encías', value: 82 },
  { label: 'Alineación', value: 78 },
] as const;

/** Saludo según la hora del día. */
function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 6) return 'Buenas noches';
  if (h < 13) return 'Buenos días';
  if (h < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <ScreenContainer scroll padded={false} edges={[]} background={palette.background}>
      <StatusBar style="light" />

      {/* ============ HERO DE MARCA (banda inmersiva) ============ */}
      <LinearGradient
        colors={[palette.navy, palette.primary, palette.teal]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.band, { paddingTop: insets.top + spacing.lg }]}>
        {/* Blobs decorativos + textura de puntos */}
        <View style={styles.blobA} pointerEvents="none" />
        <View style={styles.blobB} pointerEvents="none" />
        <TextureGrid />

        {/* Marca + notificaciones */}
        <Reveal index={0}>
          <View style={styles.brandRow}>
            <View style={styles.brandLeft}>
              <View style={styles.brandMark}>
                <MaterialCommunityIcons name="tooth" size={20} color={palette.white} />
              </View>
              <Text style={styles.wordmark}>
                Dental<Text style={styles.wordmarkAccent}>AI</Text>
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Notificaciones"
              hitSlop={8}
              style={({ pressed }) => [styles.bellGlass, pressed && styles.pressedGlass]}>
              <Ionicons name="notifications-outline" size={22} color={palette.white} />
              <View style={styles.bellDot} />
            </Pressable>
          </View>
        </Reveal>

        {/* Saludo */}
        <Reveal index={1}>
          <Text style={styles.greetSmall}>{getGreeting()},</Text>
          <Text style={styles.greetName}>Hola {USER.name} 👋</Text>
        </Reveal>

        {/* DENTA IA */}
        <Reveal index={2}>
          <View style={styles.heroRow}>
            <HeroMascot />
            <View style={styles.heroText}>
              <View style={styles.heroChip}>
                <MaterialCommunityIcons name="robot-happy" size={13} color={palette.white} />
                <Text style={styles.heroChipText}>ASISTENTE IA</Text>
              </View>
              <Text style={styles.heroTitle}>DENTA está listo para ayudarte</Text>
              <Text style={styles.heroBody}>1 recomendación preventiva pendiente</Text>
            </View>
          </View>

          <Pressable
            onPress={() => router.push('/denta')}
            accessibilityRole="button"
            accessibilityLabel="Ver recomendaciones"
            style={({ pressed }) => [styles.heroCta, pressed && styles.pressed]}>
            <Text style={styles.heroCtaText}>Ver recomendaciones</Text>
            <Ionicons name="arrow-forward" size={18} color={palette.primary} />
          </Pressable>
        </Reveal>
      </LinearGradient>

      {/* ============ CUERPO ============ */}
      <View style={styles.body}>
        {/* Salud Dental (cockpit) */}
        <Reveal index={3}>
          <PressableCard onPress={() => router.push('/diagnosis')} style={styles.healthCard}>
            <View style={styles.healthHeader}>
              <View style={styles.headingRow}>
                <View style={styles.accentBar} />
                <Text style={styles.cardHeading}>Salud Dental</Text>
              </View>
              <Badge label="Óptimo" tone="success" />
            </View>
            <View style={styles.healthBody}>
              <ProgressRing value={USER.healthScore} size={104} strokeWidth={10} caption="/ 100" />
              <View style={styles.metricsCol}>
                {HEALTH_METRICS.map((m) => (
                  <MetricBar key={m.label} label={m.label} value={m.value} />
                ))}
              </View>
            </View>
            <View style={styles.healthFooter}>
              <Ionicons name="time-outline" size={13} color={palette.textMuted} />
              <Text style={styles.healthUpdated}>Actualizado hace 2 semanas</Text>
            </View>
          </PressableCard>
        </Reveal>

        {/* Último Diagnóstico */}
        <Reveal index={4}>
          <InfoCard
            icon={<MaterialCommunityIcons name="file-document-outline" size={20} color={palette.primary} />}
            eyebrow="Último Diagnóstico"
            title="Revisión General"
            subtitle="Hace 2 semanas"
            onPress={() => router.push('/diagnosis')}
            footer={
              <View style={styles.linkRow}>
                <Text style={styles.link}>Ver reporte</Text>
                <Ionicons name="arrow-forward" size={15} color={palette.primary} />
              </View>
            }
          />
        </Reveal>

        {/* Próxima Cita */}
        <Reveal index={5}>
          <InfoCard
            icon={<MaterialCommunityIcons name="calendar-clock" size={20} color={palette.primary} />}
            eyebrow="Próxima Cita"
            title="Limpieza Ultrasónica"
            subtitle="15 Nov, 10:30 AM"
            onPress={() => router.push('/schedule')}
            footer={
              <View style={styles.linkRow}>
                <Ionicons name="location-outline" size={15} color={palette.textSecondary} />
                <Text style={styles.locationText}>Clínica Centro</Text>
              </View>
            }
          />
        </Reveal>

        {/* Educación */}
        <Reveal index={6}>
          <Pressable
            onPress={() => router.push('/videos')}
            accessibilityRole="button"
            accessibilityLabel="Videos Educativos"
            style={({ pressed }) => pressed && styles.pressed}>
            <LinearGradient
              colors={[palette.teal, palette.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.eduCard}>
              <View style={styles.eduIcon}>
                <Ionicons name="school" size={24} color={palette.white} />
              </View>
              <View style={styles.eduTextCol}>
                <Text style={styles.eduTitle}>Videos Educativos</Text>
                <Text style={styles.eduSub}>Aprendé sobre tratamientos y el Rincón de los Chicos 🧒</Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color={palette.white} />
            </LinearGradient>
          </Pressable>
        </Reveal>

        {/* Acceso Rápido */}
        <Reveal index={7}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.accentBar} />
            <Text style={styles.sectionTitle}>Acceso Rápido</Text>
          </View>
          <View style={styles.quickGrid}>
            <QuickAction
              icon={<Ionicons name="camera-outline" size={24} color={palette.primary} />}
              label="Iniciar análisis"
              onPress={() => router.push('/analysis/tutorial')}
            />
            <QuickAction
              icon={<MaterialCommunityIcons name="message-text-outline" size={24} color={palette.teal} />}
              tint={palette.tealSoft}
              label="Hablar con DENTA"
              onPress={() => router.push('/denta')}
            />
            <QuickAction
              icon={<MaterialCommunityIcons name="medical-bag" size={24} color={palette.primary} />}
              label="Ver tratamientos"
              onPress={() => router.push('/diagnosis')}
            />
            <QuickAction
              icon={<Ionicons name="calendar-outline" size={24} color={palette.primary} />}
              label="Reservar turno"
              onPress={() => router.push('/schedule')}
            />
          </View>
        </Reveal>
      </View>
    </ScreenContainer>
  );
}

/* ---------------- Sub-componentes locales ---------------- */

/** Textura de puntos sutil para la banda de marca. */
function TextureGrid() {
  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <Pattern id="dots" width={22} height={22} patternUnits="userSpaceOnUse">
          <SvgCircle cx={2} cy={2} r={1.4} fill="rgba(255,255,255,0.55)" />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#dots)" opacity={0.1} />
    </Svg>
  );
}

/** Mascota DENTA con glow que respira, sobre la banda de marca. */
function HeroMascot() {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] });
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.5] });

  return (
    <View style={styles.mascotWrap}>
      <Animated.View style={[styles.mascotGlow, { opacity, transform: [{ scale }] }]} />
      <View style={styles.mascotCircle}>
        <MaterialCommunityIcons name="robot-happy" size={34} color={palette.primary} />
      </View>
    </View>
  );
}

/** Mini barra de sub-métrica con relleno animado al entrar. */
function MetricBar({ label, value }: { label: string; value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  const w = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const a = Animated.timing(w, {
      toValue: clamped,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });
    a.start();
    return () => a.stop();
  }, [clamped, w]);

  const width = w.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });

  return (
    <View style={styles.metricRow}>
      <Text style={styles.metricLabel}>{label}</Text>
      <View style={styles.metricTrack}>
        <Animated.View style={[styles.metricFill, { width }]} />
      </View>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function InfoCard({
  icon,
  eyebrow,
  title,
  subtitle,
  footer,
  onPress,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  subtitle: string;
  footer: React.ReactNode;
  onPress: () => void;
}) {
  return (
    <PressableCard onPress={onPress} style={styles.infoCard}>
      <View style={styles.infoHeader}>
        <View style={styles.infoIcon}>{icon}</View>
        <Text style={styles.infoEyebrow}>{eyebrow}</Text>
      </View>
      <Text style={styles.infoTitle}>{title}</Text>
      <Text style={styles.infoSubtitle}>{subtitle}</Text>
      <View style={styles.infoFooter}>{footer}</View>
    </PressableCard>
  );
}

function QuickAction({
  icon,
  label,
  tint = palette.primarySoft,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  tint?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.quickTile, shadow.card, pressed && styles.pressed]}>
      <View style={[styles.quickIcon, { backgroundColor: tint }]}>{icon}</View>
      <Text style={styles.quickLabel}>{label}</Text>
    </Pressable>
  );
}

/* ---------------- Estilos ---------------- */

const styles = StyleSheet.create({
  /* ===== Banda de marca ===== */
  band: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['2xl'],
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
    backgroundColor: 'rgba(94,234,212,0.25)',
  },

  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  brandMark: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: { fontSize: 20, fontWeight: '800', color: palette.white, letterSpacing: 0.3 },
  wordmarkAccent: { color: palette.tealLight },
  bellGlass: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressedGlass: { opacity: 0.6, backgroundColor: 'rgba(255,255,255,0.32)' },
  bellDot: {
    position: 'absolute',
    top: 11,
    right: 12,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#F87171',
    borderWidth: 1.5,
    borderColor: palette.primary,
  },

  greetSmall: { ...typography.body, color: 'rgba(255,255,255,0.85)', marginTop: spacing.xl },
  greetName: { fontSize: 28, lineHeight: 34, fontWeight: '800', color: palette.white, marginTop: 2 },

  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginTop: spacing.xl,
  },
  heroText: { flex: 1 },
  heroChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  heroChipText: { fontSize: 10, fontWeight: '800', color: palette.white, letterSpacing: 0.6 },
  heroTitle: { fontSize: 18, lineHeight: 23, fontWeight: '800', color: palette.white, marginTop: spacing.sm },
  heroBody: { ...typography.caption, color: 'rgba(255,255,255,0.85)', marginTop: 4 },

  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    alignSelf: 'stretch',
    backgroundColor: palette.white,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    marginTop: spacing.xl,
    shadowColor: palette.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  heroCtaText: { ...typography.subtitle, color: palette.primary, fontWeight: '700' },

  mascotWrap: { width: 72, height: 72, alignItems: 'center', justifyContent: 'center' },
  mascotGlow: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  mascotCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.6)',
  },

  /* ===== Cuerpo ===== */
  body: { paddingHorizontal: spacing.xl },

  headingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  accentBar: { width: 4, height: 18, borderRadius: radius.pill, backgroundColor: palette.teal },

  /* Salud Dental (cockpit) */
  healthCard: { marginTop: spacing.lg, paddingVertical: spacing.xl },
  healthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeading: { ...typography.subtitle, color: palette.textPrimary },
  healthBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
    marginTop: spacing.lg,
  },
  metricsCol: { flex: 1, gap: spacing.md },
  metricRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  metricLabel: { ...typography.caption, color: palette.textSecondary, width: 74 },
  metricTrack: {
    flex: 1,
    height: 7,
    borderRadius: radius.pill,
    backgroundColor: palette.border,
    overflow: 'hidden',
  },
  metricFill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: palette.primary,
  },
  metricValue: {
    ...typography.caption,
    fontWeight: '700',
    color: palette.textPrimary,
    width: 24,
    textAlign: 'right',
  },
  healthFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: spacing.lg,
  },
  healthUpdated: { ...typography.small, color: palette.textMuted },

  infoCard: { marginTop: spacing.lg },
  infoHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: palette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoEyebrow: { ...typography.caption, color: palette.textSecondary, fontWeight: '600' },
  infoTitle: { ...typography.subtitle, color: palette.textPrimary, marginTop: spacing.md },
  infoSubtitle: { ...typography.caption, color: palette.textSecondary, marginTop: 2 },
  infoFooter: { marginTop: spacing.md },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  link: { ...typography.bodyStrong, color: palette.primary },
  locationText: { ...typography.caption, color: palette.textSecondary, fontWeight: '600' },

  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing['2xl'],
    marginBottom: spacing.md,
  },
  sectionTitle: { ...typography.h2, fontSize: 20, color: palette.textPrimary },

  eduCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  eduIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eduTextCol: { flex: 1 },
  eduTitle: { ...typography.subtitle, color: palette.white },
  eduSub: { ...typography.caption, color: 'rgba(255,255,255,0.9)', marginTop: 2 },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  quickTile: {
    flexBasis: '47.5%',
    flexGrow: 1,
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
  },
  quickIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: { ...typography.bodyStrong, color: palette.textPrimary, textAlign: 'center' },
  pressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
});
