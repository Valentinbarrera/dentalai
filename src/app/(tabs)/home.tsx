import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge } from '@/components/ui/badge';
import { PressableCard } from '@/components/ui/pressable-card';
import { Reveal } from '@/components/ui/reveal';
import { ScreenContainer } from '@/components/ui/screen-container';
import { TextureGrid } from '@/components/ui/texture-grid';
import { useMyAnalyses } from '@/features/analyses';
import type { AnalysisStatus } from '@/features/analyses';
import { usePatientAppointments } from '@/features/appointments';
import { useAuth } from '@/features/auth';
import { palette, radius, shadow, spacing, typography } from '@/theme/tokens';

type MciName = keyof typeof MaterialCommunityIcons.glyphMap;

const MONTHS_ES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/** Saludo según la hora del día. */
function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 6) return 'Buenas noches';
  if (h < 13) return 'Buenos días';
  if (h < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

/** Fecha corta legible, ej. "3 jul 2026". Devuelve '' si el ISO es inválido. */
function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getDate()} ${MONTHS_ES[d.getMonth()]} ${d.getFullYear()}`;
}

/** Fecha + hora, ej. "15 nov · 10:30". Devuelve '' si el ISO es inválido. */
function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const hh = d.getHours().toString().padStart(2, '0');
  const mm = d.getMinutes().toString().padStart(2, '0');
  return `${d.getDate()} ${MONTHS_ES[d.getMonth()]} · ${hh}:${mm}`;
}

/** Etiqueta legible del estado de un análisis. */
function analysisStatusLabel(status: AnalysisStatus): string {
  switch (status) {
    case 'subiendo':
      return 'Subiendo capturas';
    case 'procesando':
      return 'Procesando análisis';
    case 'listo':
      return 'Diagnóstico listo';
    case 'error':
      return 'Análisis con error';
  }
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { user } = useAuth();
  const { analyses, loading: analysesLoading } = useMyAnalyses();
  const { appointments, loading: appointmentsLoading } = usePatientAppointments(user?.id);

  const fullName = ((user?.user_metadata?.full_name as string | undefined) ?? '').trim();
  const firstName = fullName ? fullName.split(/\s+/)[0] : '';

  // Los análisis vienen del más nuevo al más viejo (ver analyses-service).
  const latestAnalysis = analyses[0] ?? null;
  // Diagnóstico con resultado real (hoy `result` es null hasta que exista la IA).
  const latestDiagnosis = analyses.find((a) => a.result) ?? null;

  // Turnos ordenados asc: el primero a futuro y no cancelado es el próximo.
  const now = Date.now();
  const nextAppointment =
    appointments.find(
      (a) => a.status !== 'cancelado' && new Date(a.startsAt).getTime() >= now,
    ) ?? null;

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
          <Text style={styles.greetName}>{firstName ? `Hola ${firstName} 👋` : '¡Hola! 👋'}</Text>
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
              <Text style={styles.heroBody}>Preguntale lo que quieras sobre tu salud bucal</Text>
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
        {/* Salud Dental */}
        <Reveal index={3}>
          {analysesLoading ? (
            <LoadingCard heading="Salud Dental" />
          ) : latestDiagnosis?.result ? (
            // Hay un diagnóstico real: mostramos datos reales del resultado.
            <PressableCard
              onPress={() =>
                router.push({ pathname: '/diagnosis', params: { analysisId: latestDiagnosis.id } })
              }
              style={styles.healthCard}>
              <View style={styles.healthHeader}>
                <View style={styles.headingRow}>
                  <View style={styles.accentBar} />
                  <Text style={styles.cardHeading}>Salud Dental</Text>
                </View>
                <Badge label="Listo" tone="success" />
              </View>

              <Text style={styles.healthReadyText}>
                Tu último diagnóstico revisó {latestDiagnosis.result.affectedZones.length} zona
                {latestDiagnosis.result.affectedZones.length === 1 ? '' : 's'}.
              </Text>

              <View style={styles.divider} />
              <View style={styles.healthFooter}>
                <View style={styles.linkRow}>
                  <Ionicons name="time-outline" size={13} color={palette.textMuted} />
                  <Text style={styles.healthUpdated}>{formatDate(latestDiagnosis.createdAt)}</Text>
                </View>
                <View style={styles.linkRow}>
                  <Text style={styles.link}>Ver reporte</Text>
                  <Ionicons name="arrow-forward" size={15} color={palette.primary} />
                </View>
              </View>
            </PressableCard>
          ) : (
            // Sin diagnóstico todavía: estado vacío honesto con CTA al análisis.
            <PressableCard onPress={() => router.push('/analysis/tutorial')} style={styles.healthCard}>
              <View style={styles.headingRow}>
                <View style={styles.accentBar} />
                <Text style={styles.cardHeading}>Salud Dental</Text>
              </View>
              <View style={styles.healthEmptyBody}>
                <View style={styles.healthEmptyIcon}>
                  <MaterialCommunityIcons name="tooth-outline" size={30} color={palette.primary} />
                </View>
                <Text style={styles.healthEmptyTitle}>Todavía no tenés tu salud dental</Text>
                <Text style={styles.healthEmptyText}>
                  Hacé tu primer análisis para conocer tu diagnóstico y tu score.
                </Text>
              </View>
              <View style={styles.emptyCtaRow}>
                <Text style={styles.emptyCtaText}>Hacer mi primer análisis</Text>
                <Ionicons name="arrow-forward" size={16} color={palette.white} />
              </View>
            </PressableCard>
          )}
        </Reveal>

        {/* Último Diagnóstico */}
        <Reveal index={4}>
          {analysesLoading ? (
            <LoadingCard heading="Último Diagnóstico" />
          ) : latestAnalysis ? (
            <InfoCard
              iconName="file-document-outline"
              gradient={[palette.teal, palette.primary]}
              eyebrow="Último Diagnóstico"
              title={analysisStatusLabel(latestAnalysis.status)}
              subtitle={formatDate(latestAnalysis.createdAt)}
              onPress={() =>
                router.push({ pathname: '/diagnosis', params: { analysisId: latestAnalysis.id } })
              }
              footer={
                latestAnalysis.result ? (
                  <View style={styles.linkRow}>
                    <Text style={styles.link}>Ver reporte</Text>
                    <Ionicons name="arrow-forward" size={15} color={palette.primary} />
                  </View>
                ) : (
                  <View style={styles.linkRow}>
                    <Ionicons name="hourglass-outline" size={14} color={palette.textMuted} />
                    <Text style={styles.locationText}>Aún sin resultado</Text>
                  </View>
                )
              }
            />
          ) : (
            <EmptyCard
              iconName="file-document-outline"
              eyebrow="Último Diagnóstico"
              message="Sin diagnósticos aún. Hacé tu primer análisis."
            />
          )}
        </Reveal>

        {/* Próxima Cita */}
        <Reveal index={5}>
          {appointmentsLoading ? (
            <LoadingCard heading="Próxima Cita" />
          ) : nextAppointment ? (
            <InfoCard
              iconName="calendar-clock"
              gradient={[palette.primary, palette.navy]}
              eyebrow="Próxima Cita"
              title={nextAppointment.type}
              subtitle={formatDateTime(nextAppointment.startsAt)}
              onPress={() => router.push('/schedule')}
              footer={
                <View style={styles.linkRow}>
                  <Ionicons name="time-outline" size={15} color={palette.textSecondary} />
                  <Text style={styles.locationText}>{nextAppointment.durationMin} min</Text>
                </View>
              }
            />
          ) : (
            <EmptyCard
              iconName="calendar-clock"
              eyebrow="Próxima Cita"
              message="No tenés turnos. Reservá cuando quieras."
            />
          )}
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
              <TextureGrid />
              <View style={styles.eduIcon}>
                <Ionicons name="school" size={24} color={palette.white} />
              </View>
              <View style={styles.eduTextCol}>
                <Text style={styles.eduTitle}>Videos Educativos</Text>
                <Text style={styles.eduSub}>Tratamientos y el Rincón de los Chicos 🧒</Text>
              </View>
              <View style={styles.eduArrow}>
                <Ionicons name="arrow-forward" size={18} color={palette.white} />
              </View>
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
              iconName="camera-outline"
              gradient={[palette.teal, palette.primary]}
              label="Iniciar análisis"
              onPress={() => router.push('/analysis/tutorial')}
            />
            <QuickAction
              iconName="robot-happy-outline"
              gradient={[palette.primary, palette.navy]}
              label="Hablar con DENTA"
              onPress={() => router.push('/denta')}
            />
            <QuickAction
              iconName="medical-bag"
              gradient={[palette.teal, palette.tealDark]}
              label="Ver tratamientos"
              onPress={() => router.push('/diagnosis')}
            />
            <QuickAction
              iconName="calendar-outline"
              gradient={[palette.primary, palette.primaryDark]}
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

/** Card de carga neutra, mientras se leen los datos del backend. */
function LoadingCard({ heading }: { heading: string }) {
  return (
    <View style={styles.emptyCard}>
      <View style={styles.emptyIcon}>
        <MaterialCommunityIcons name="progress-clock" size={22} color={palette.textMuted} />
      </View>
      <View style={styles.infoTextCol}>
        <Text style={styles.infoEyebrow}>{heading}</Text>
        <Text style={styles.emptyMessage}>Cargando…</Text>
      </View>
    </View>
  );
}

/** Estado vacío honesto para una tarjeta de información (sin datos reales). */
function EmptyCard({
  iconName,
  eyebrow,
  message,
}: {
  iconName: MciName;
  eyebrow: string;
  message: string;
}) {
  return (
    <View style={styles.emptyCard}>
      <View style={styles.emptyIcon}>
        <MaterialCommunityIcons name={iconName} size={22} color={palette.textMuted} />
      </View>
      <View style={styles.infoTextCol}>
        <Text style={styles.infoEyebrow}>{eyebrow}</Text>
        <Text style={styles.emptyMessage}>{message}</Text>
      </View>
    </View>
  );
}

function InfoCard({
  iconName,
  gradient,
  eyebrow,
  title,
  subtitle,
  footer,
  onPress,
}: {
  iconName: MciName;
  gradient: readonly [string, string];
  eyebrow: string;
  title: string;
  subtitle: string;
  footer: React.ReactNode;
  onPress: () => void;
}) {
  return (
    <PressableCard onPress={onPress} style={styles.infoCard}>
      <View style={styles.infoRow}>
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.infoIconGrad}>
          <MaterialCommunityIcons name={iconName} size={22} color={palette.white} />
        </LinearGradient>
        <View style={styles.infoTextCol}>
          <Text style={styles.infoEyebrow}>{eyebrow}</Text>
          <Text style={styles.infoTitle}>{title}</Text>
          <Text style={styles.infoSubtitle}>{subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={palette.textMuted} />
      </View>
      <View style={styles.divider} />
      <View style={styles.infoFooter}>{footer}</View>
    </PressableCard>
  );
}

function QuickAction({
  iconName,
  gradient,
  label,
  onPress,
}: {
  iconName: MciName;
  gradient: readonly [string, string];
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.quickTile, shadow.card, pressed && styles.pressed]}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.quickIcon}>
        <MaterialCommunityIcons name={iconName} size={24} color={palette.white} />
      </LinearGradient>
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
  divider: { height: 1, backgroundColor: palette.border, marginVertical: spacing.md },

  /* Salud Dental (cockpit) */
  healthCard: { marginTop: spacing.lg, paddingVertical: spacing.xl },
  healthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeading: { ...typography.subtitle, color: palette.textPrimary },
  healthReadyText: { ...typography.body, color: palette.textSecondary, marginTop: spacing.md },
  healthFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  healthUpdated: { ...typography.small, color: palette.textMuted },

  /* Salud Dental — estado vacío */
  healthEmptyBody: { alignItems: 'center', marginTop: spacing.lg, gap: spacing.sm },
  healthEmptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: palette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  healthEmptyTitle: { ...typography.subtitle, color: palette.textPrimary, textAlign: 'center' },
  healthEmptyText: {
    ...typography.caption,
    color: palette.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  emptyCtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    alignSelf: 'stretch',
    backgroundColor: palette.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    marginTop: spacing.lg,
  },
  emptyCtaText: { ...typography.bodyStrong, color: palette.white },

  /* Tarjetas de estado vacío / carga (info) */
  emptyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.lg,
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    borderStyle: 'dashed',
    padding: spacing.lg,
  },
  emptyIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: palette.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyMessage: { ...typography.caption, color: palette.textSecondary, marginTop: 2 },

  /* Info cards */
  infoCard: { marginTop: spacing.lg },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  infoIconGrad: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextCol: { flex: 1 },
  infoEyebrow: {
    ...typography.small,
    color: palette.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoTitle: { ...typography.subtitle, color: palette.textPrimary, marginTop: 2 },
  infoSubtitle: { ...typography.caption, color: palette.textSecondary, marginTop: 2 },
  infoFooter: {},
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

  /* Educación */
  eduCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginTop: spacing.lg,
    overflow: 'hidden',
  },
  eduIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eduTextCol: { flex: 1 },
  eduTitle: { ...typography.subtitle, color: palette.white },
  eduSub: { ...typography.caption, color: 'rgba(255,255,255,0.9)', marginTop: 2 },
  eduArrow: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Acceso rápido */
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
