import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

  return (
    <ScreenContainer>
      {/* ---------- Header ---------- */}
      <Reveal index={0} style={styles.header}>
        <View style={styles.headerLeft}>
          <LinearGradient
            colors={[palette.teal, palette.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatar}>
            <Text style={styles.avatarText}>{USER.initials}</Text>
          </LinearGradient>
          <View>
            <Text style={styles.greetingSmall}>{getGreeting()},</Text>
            <Text style={styles.greetingName}>Hola {USER.name}</Text>
          </View>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Notificaciones" style={styles.bell}>
          <Ionicons name="notifications-outline" size={22} color={palette.textPrimary} />
          <View style={styles.bellDot} />
        </Pressable>
      </Reveal>

      {/* ---------- Hero DENTA ---------- */}
      <Reveal index={1}>
        <LinearGradient
          colors={['#E6FBF6', '#EFF4FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, shadow.card]}>
          <View style={styles.heroLabelRow}>
            <MaterialCommunityIcons name="robot-happy" size={18} color={palette.teal} />
            <Text style={styles.heroLabel}>ASISTENTE IA</Text>
          </View>
          <Text style={styles.heroTitle}>DENTA está listo{'\n'}para ayudarte</Text>
          <Text style={styles.heroBody}>
            Tu salud dental está en estado óptimo. Tenés 1 recomendación preventiva pendiente.
          </Text>
          <Button
            label="Ver recomendaciones"
            size="md"
            fullWidth={false}
            onPress={() => router.push('/denta')}
            style={styles.heroBtn}
          />
          <View style={styles.heroGlow} pointerEvents="none" />
        </LinearGradient>
      </Reveal>

      {/* ---------- Salud Dental (cockpit) ---------- */}
      <Reveal index={2}>
        <PressableCard onPress={() => router.push('/diagnosis')} style={styles.healthCard}>
          <View style={styles.healthHeader}>
            <Text style={styles.cardHeading}>Salud Dental</Text>
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

      {/* ---------- Último Diagnóstico ---------- */}
      <Reveal index={3}>
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

      {/* ---------- Próxima Cita ---------- */}
      <Reveal index={4}>
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

      {/* ---------- Educación ---------- */}
      <Reveal index={5}>
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

      {/* ---------- Acceso Rápido ---------- */}
      <Reveal index={6}>
        <Text style={styles.sectionTitle}>Acceso Rápido</Text>
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
    </ScreenContainer>
  );
}

/* ---------------- Sub-componentes locales ---------------- */

/** Mini barra de sub-métrica para la tarjeta de salud. */
function MetricBar({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.metricRow}>
      <Text style={styles.metricLabel}>{label}</Text>
      <View style={styles.metricTrack}>
        <View style={[styles.metricFill, { width: `${Math.max(0, Math.min(100, value))}%` }]} />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...typography.subtitle, color: palette.white, fontWeight: '700' },
  greetingSmall: { ...typography.caption, color: palette.textSecondary },
  greetingName: { ...typography.title, color: palette.navy, fontWeight: '700' },
  bell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.border,
  },
  bellDot: {
    position: 'absolute',
    top: 11,
    right: 12,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: palette.danger,
    borderWidth: 1.5,
    borderColor: palette.surface,
  },

  hero: {
    borderRadius: radius.xl,
    padding: spacing['2xl'],
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  heroLabelRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  heroLabel: { ...typography.label, color: palette.teal },
  heroTitle: {
    ...typography.h1,
    color: palette.textPrimary,
    marginTop: spacing.md,
  },
  heroBody: {
    ...typography.body,
    color: palette.textSecondary,
    marginTop: spacing.sm,
    maxWidth: '90%',
  },
  heroBtn: { marginTop: spacing.xl },
  heroGlow: {
    position: 'absolute',
    right: -40,
    bottom: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: palette.white,
    opacity: 0.35,
  },

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

  sectionTitle: {
    ...typography.h2,
    fontSize: 20,
    color: palette.textPrimary,
    marginTop: spacing['2xl'],
    marginBottom: spacing.md,
  },

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
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
});
