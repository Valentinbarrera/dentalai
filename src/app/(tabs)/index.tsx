import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProgressRing } from '@/components/ui/progress-ring';
import { ScreenContainer } from '@/components/ui/screen-container';
import { palette, radius, shadow, spacing, typography } from '@/theme/tokens';

const USER = { name: 'Juan', initials: 'JG', healthScore: 85 };

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScreenContainer>
      {/* ---------- Header ---------- */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <LinearGradient
            colors={[palette.teal, palette.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatar}>
            <Text style={styles.avatarText}>{USER.initials}</Text>
          </LinearGradient>
          <View>
            <Text style={styles.greetingSmall}>Bienvenido de vuelta,</Text>
            <Text style={styles.greetingName}>Hola {USER.name}</Text>
          </View>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Notificaciones" style={styles.bell}>
          <Ionicons name="notifications-outline" size={22} color={palette.textPrimary} />
          <View style={styles.bellDot} />
        </Pressable>
      </View>

      {/* ---------- Hero DENTA ---------- */}
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

      {/* ---------- Salud Dental ---------- */}
      <Card style={styles.healthCard}>
        <Text style={styles.cardHeading}>Salud Dental</Text>
        <ProgressRing value={USER.healthScore} size={128} strokeWidth={11} />
        <Badge label="Óptimo" tone="success" style={{ marginTop: spacing.md }} />
      </Card>

      {/* ---------- Último Diagnóstico ---------- */}
      <InfoCard
        icon={<MaterialCommunityIcons name="file-document-outline" size={20} color={palette.primary} />}
        eyebrow="Último Diagnóstico"
        title="Revisión General"
        subtitle="Hace 2 semanas"
        footer={
          <Pressable style={styles.linkRow} onPress={() => router.push('/diagnosis')}>
            <Text style={styles.link}>Ver reporte</Text>
            <Ionicons name="arrow-forward" size={15} color={palette.primary} />
          </Pressable>
        }
      />

      {/* ---------- Próxima Cita ---------- */}
      <InfoCard
        icon={<MaterialCommunityIcons name="calendar-clock" size={20} color={palette.primary} />}
        eyebrow="Próxima Cita"
        title="Limpieza Ultrasónica"
        subtitle="15 Nov, 10:30 AM"
        footer={
          <View style={styles.linkRow}>
            <Ionicons name="location-outline" size={15} color={palette.textSecondary} />
            <Text style={styles.locationText}>Clínica Centro</Text>
          </View>
        }
      />

      {/* ---------- Acceso Rápido ---------- */}
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
    </ScreenContainer>
  );
}

/* ---------------- Sub-componentes locales ---------------- */

function InfoCard({
  icon,
  eyebrow,
  title,
  subtitle,
  footer,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  subtitle: string;
  footer: React.ReactNode;
}) {
  return (
    <Card style={styles.infoCard}>
      <View style={styles.infoHeader}>
        <View style={styles.infoIcon}>{icon}</View>
        <Text style={styles.infoEyebrow}>{eyebrow}</Text>
      </View>
      <Text style={styles.infoTitle}>{title}</Text>
      <Text style={styles.infoSubtitle}>{subtitle}</Text>
      <View style={styles.infoFooter}>{footer}</View>
    </Card>
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

  healthCard: { alignItems: 'center', marginTop: spacing.lg, paddingVertical: spacing['2xl'] },
  cardHeading: { ...typography.subtitle, color: palette.textPrimary, marginBottom: spacing.lg },

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
