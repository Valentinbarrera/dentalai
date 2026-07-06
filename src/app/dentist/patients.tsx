import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge } from '@/components/ui/badge';
import { BrandBand } from '@/components/ui/brand-band';
import { PressableCard } from '@/components/ui/pressable-card';
import { Reveal } from '@/components/ui/reveal';
import { CONTENT_BOTTOM_INSET } from '@/constants/layout';
import { useDentistPatients, type AppointmentStatus, type DentistPatient } from '@/features/appointments';
import { useAuth } from '@/features/auth';
import { palette, radius, spacing, typography } from '@/theme/tokens';

const AVATAR_COLORS = [palette.teal, palette.primary, palette.textSecondary, palette.warning];

const STATUS: Record<AppointmentStatus, { label: string; tone: 'success' | 'info' | 'warning' | 'danger' }> = {
  confirmado: { label: 'Confirmado', tone: 'success' },
  completado: { label: 'Completado', tone: 'info' },
  pendiente: { label: 'Pendiente', tone: 'warning' },
  cancelado: { label: 'Cancelado', tone: 'danger' },
};

/** Iniciales (hasta 2) a partir del nombre. */
function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return parts.slice(0, 2).map((p) => p.charAt(0).toUpperCase()).join('');
}

/** Fecha del último turno → texto relativo simple. */
function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diff = Math.round((startOf(new Date()) - startOf(date)) / 86_400_000);
  if (diff === 0) return `Hoy, ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  if (diff === 1) return 'Ayer';
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  return `${days[date.getDay()]} ${date.getDate()}`;
}

/** Tab "Pacientes" del odontólogo: lista sus pacientes (derivados de sus turnos). */
export default function DentistPatientsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { patients, loading, error } = useDentistPatients(user?.id);

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <StatusBar style="light" />
      <BrandBand title="Pacientes" subtitle="Las personas que atendés en DentalAI" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {loading ? (
          <View style={styles.stateBox}>
            <ActivityIndicator color={palette.primary} />
            <Text style={styles.stateText}>Cargando pacientes…</Text>
          </View>
        ) : error ? (
          <View style={styles.stateBox}>
            <MaterialCommunityIcons name="alert-circle-outline" size={32} color={palette.textMuted} />
            <Text style={styles.stateText}>No pudimos cargar tus pacientes.</Text>
          </View>
        ) : patients.length === 0 ? (
          <View style={styles.stateBox}>
            <Ionicons name="people-outline" size={40} color={palette.textMuted} />
            <Text style={styles.stateTitle}>Todavía no tenés pacientes</Text>
            <Text style={styles.stateText}>
              Cuando alguien reserve un turno con vos, va a aparecer acá.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {patients.map((p, i) => (
              <Reveal key={p.id} index={i}>
                <PatientRow patient={p} color={AVATAR_COLORS[i % AVATAR_COLORS.length]} onPress={() =>
                  router.push({ pathname: '/patient/[id]', params: { id: p.id, name: p.name } })
                } />
              </Reveal>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function PatientRow({ patient, color, onPress }: { patient: DentistPatient; color: string; onPress: () => void }) {
  const status = STATUS[patient.lastStatus];
  return (
    <PressableCard onPress={onPress} accessibilityLabel={`Ver ficha de ${patient.name}`} style={styles.row}>
      <View style={[styles.avatar, { backgroundColor: color }]}>
        <Text style={styles.initials}>{initialsOf(patient.name)}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{patient.name}</Text>
        <Text style={styles.when}>Último turno: {formatWhen(patient.lastVisitAt)}</Text>
      </View>
      <Badge label={status.label} tone={status.tone} />
    </PressableCard>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: CONTENT_BOTTOM_INSET },
  list: { gap: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  initials: { ...typography.caption, color: palette.white, fontWeight: '700' },
  info: { flex: 1 },
  name: { ...typography.bodyStrong, color: palette.textPrimary },
  when: { ...typography.small, color: palette.textMuted, marginTop: 2 },

  stateBox: { alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing['3xl'] },
  stateTitle: { ...typography.subtitle, color: palette.textPrimary, marginTop: spacing.sm, textAlign: 'center' },
  stateText: { ...typography.caption, color: palette.textSecondary, textAlign: 'center' },
});
