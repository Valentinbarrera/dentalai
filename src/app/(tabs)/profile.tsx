import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandBand } from '@/components/ui/brand-band';
import { Card } from '@/components/ui/card';
import { GradientIcon } from '@/components/ui/gradient-icon';
import { Reveal } from '@/components/ui/reveal';
import { CONTENT_BOTTOM_INSET } from '@/constants/layout';
import { ROUTES } from '@/lib/routes';
import { session } from '@/lib/session';
import { palette, radius, spacing, typography } from '@/theme/tokens';

type Row = {
  id: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress?: () => void;
  danger?: boolean;
  gradient?: readonly [string, string];
};

export default function ProfileScreen() {
  const router = useRouter();

  const account: Row[] = [
    { id: 'edit', icon: 'person-outline', label: 'Editar perfil', gradient: [palette.teal, palette.primary] },
    { id: 'history', icon: 'document-text-outline', label: 'Historial clínico', gradient: [palette.primary, palette.navy] },
    { id: 'payments', icon: 'card-outline', label: 'Métodos de pago', gradient: [palette.teal, palette.tealDark] },
    { id: 'notifications', icon: 'notifications-outline', label: 'Notificaciones', gradient: [palette.primary, palette.primaryDark] },
  ];

  const app: Row[] = [
    { id: 'help', icon: 'help-circle-outline', label: 'Ayuda y soporte', gradient: [palette.teal, palette.primary] },
    { id: 'privacy', icon: 'lock-closed-outline', label: 'Privacidad y seguridad', gradient: [palette.primary, palette.navy] },
    {
      id: 'logout',
      icon: 'log-out-outline',
      label: 'Cerrar sesión',
      danger: true,
      onPress: () => {
        session.authed = false;
        router.replace(ROUTES.login);
      },
    },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <BrandBand title="Perfil" subtitle="Tu cuenta y preferencias" />

        <View style={styles.inner}>
        {/* Tarjeta de usuario */}
        <Reveal index={0}>
          <Card style={styles.userCard}>
            <LinearGradient colors={[palette.primary, palette.teal]} style={styles.avatar}>
              <Text style={styles.avatarText}>JG</Text>
            </LinearGradient>
            <View style={styles.flex}>
              <Text style={styles.userName}>Juan González</Text>
              <Text style={styles.userMail}>juan.gonzalez@email.com</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={palette.textMuted} />
          </Card>
        </Reveal>

        {/* Acceso al portal profesional */}
        <Reveal index={1}>
          <Pressable
            onPress={() => router.push('/portal')}
            accessibilityRole="button"
            accessibilityLabel="Portal del profesional"
            style={({ pressed }) => pressed && styles.pressed}>
            <LinearGradient colors={[palette.primary, palette.primaryDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.portalCard}>
              <View style={styles.portalIcon}>
                <MaterialCommunityIcons name="stethoscope" size={24} color={palette.white} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.portalTitle}>Portal del profesional</Text>
                <Text style={styles.portalSub}>¿Sos odontólogo? Gestioná tu agenda y pacientes.</Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color={palette.white} />
            </LinearGradient>
          </Pressable>
        </Reveal>

        <Reveal index={2}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.accentBar} />
            <Text style={styles.groupLabel}>Cuenta</Text>
          </View>
          <Card style={styles.group} padded={false}>
            {account.map((r, i) => (
              <RowItem key={r.id} row={r} last={i === account.length - 1} />
            ))}
          </Card>
        </Reveal>

        <Reveal index={3}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.accentBar} />
            <Text style={styles.groupLabel}>Aplicación</Text>
          </View>
          <Card style={styles.group} padded={false}>
            {app.map((r, i) => (
              <RowItem key={r.id} row={r} last={i === app.length - 1} />
            ))}
          </Card>
        </Reveal>

        <Reveal index={4}>
          <Text style={styles.version}>DentalAI v3.0.0</Text>
        </Reveal>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function RowItem({ row, last }: { row: Row; last: boolean }) {
  const color = row.danger ? palette.danger : palette.textPrimary;
  return (
    <Pressable
      onPress={row.onPress}
      accessibilityRole="button"
      accessibilityLabel={row.label}
      style={({ pressed }) => [
        styles.row,
        !last && styles.rowBorder,
        pressed && styles.rowPressed,
      ]}>
      {row.danger ? (
        <View style={[styles.rowIcon, { backgroundColor: palette.dangerSoft }]}>
          <Ionicons name={row.icon} size={20} color={palette.danger} />
        </View>
      ) : (
        <GradientIcon
          gradient={row.gradient ?? [palette.teal, palette.primary]}
          size={36}
          borderRadius={radius.sm}>
          <Ionicons name={row.icon} size={18} color={palette.white} />
        </GradientIcon>
      )}
      <Text style={[styles.rowLabel, { color }]}>{row.label}</Text>
      {!row.danger && <Ionicons name="chevron-forward" size={18} color={palette.textMuted} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  flex: { flex: 1 },
  content: { paddingBottom: CONTENT_BOTTOM_INSET },
  inner: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl },

  userCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  avatarText: { ...typography.h2, color: palette.white, fontWeight: '700' },
  userName: { ...typography.subtitle, color: palette.textPrimary },
  userMail: { ...typography.caption, color: palette.textSecondary, marginTop: 2 },

  portalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  portalIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  portalTitle: { ...typography.subtitle, color: palette.white },
  portalSub: { ...typography.caption, color: 'rgba(255,255,255,0.85)', marginTop: 2 },

  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing['2xl'],
    marginBottom: spacing.md,
  },
  accentBar: { width: 4, height: 18, borderRadius: radius.pill, backgroundColor: palette.teal },
  groupLabel: { ...typography.label, color: palette.textSecondary },
  group: { overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: palette.border },
  rowPressed: { backgroundColor: palette.surfaceAlt },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: palette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: { ...typography.body, fontWeight: '600', flex: 1 },

  version: { ...typography.caption, color: palette.textMuted, textAlign: 'center', marginTop: spacing['2xl'] },

  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
});
