import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge } from '@/components/ui/badge';
import { BrandBand } from '@/components/ui/brand-band';
import { Card } from '@/components/ui/card';
import { GradientIcon } from '@/components/ui/gradient-icon';
import { PressableCard } from '@/components/ui/pressable-card';
import { Reveal } from '@/components/ui/reveal';
import { CONTENT_BOTTOM_INSET } from '@/constants/layout';
import { useUserAnalyses } from '@/features/analyses';
import type { Analysis, AnalysisStatus, DiagnosisResult } from '@/features/analyses';
import { usePatientAppointments } from '@/features/appointments';
import type { Appointment, AppointmentStatus } from '@/features/appointments';
import { palette, radius, spacing, typography } from '@/theme/tokens';

type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

/** Estado del turno → etiqueta legible y tono de la pastilla. */
const APPOINTMENT_STATUS_META: Record<AppointmentStatus, { label: string; tone: BadgeTone }> = {
  pendiente: { label: 'Pendiente', tone: 'warning' },
  confirmado: { label: 'Confirmado', tone: 'success' },
  completado: { label: 'Completado', tone: 'info' },
  cancelado: { label: 'Cancelado', tone: 'danger' },
};

/** Estado del análisis → etiqueta, tono e ícono (mismo lenguaje que el historial). */
const ANALYSIS_STATUS_META: Record<
  AnalysisStatus,
  { label: string; tone: BadgeTone; icon: React.ComponentProps<typeof Ionicons>['name'] }
> = {
  subiendo: { label: 'Subiendo', tone: 'info', icon: 'cloud-upload-outline' },
  procesando: { label: 'Procesando', tone: 'warning', icon: 'sync-outline' },
  listo: { label: 'Listo', tone: 'success', icon: 'checkmark-done-outline' },
  error: { label: 'Error', tone: 'danger', icon: 'alert-circle-outline' },
};

/** Fecha larga legible en es-AR (ej. "24 de octubre de 2026"). */
function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });
}

/** Fecha + hora legible para un turno (ej. "24 de octubre · 09:30"). */
function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const date = d.toLocaleDateString('es-AR', { day: '2-digit', month: 'long' });
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${date} · ${hh}:${mm}`;
}

/** Resumen corto de un diagnóstico: el `summary` de la IA o el conteo de zonas. */
function summarize(result: DiagnosisResult): string {
  const summary = result.summary?.trim();
  if (summary) return summary;
  const zones = result.affectedZones?.length ?? 0;
  return `${zones} ${zones === 1 ? 'zona detectada' : 'zonas detectadas'}`;
}

export default function PatientScreen() {
  const router = useRouter();
  const { id, name } = useLocalSearchParams<{ id?: string; name?: string }>();
  const patientId = typeof id === 'string' ? id : undefined;
  const patientName = typeof name === 'string' && name.trim() ? name : 'Paciente';

  const {
    appointments,
    loading: apptLoading,
    error: apptError,
  } = usePatientAppointments(patientId);
  const {
    analyses,
    loading: scanLoading,
    error: scanError,
  } = useUserAnalyses(patientId);

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <StatusBar style="light" />
      <BrandBand
        title={patientName}
        subtitle="Ficha del paciente"
        onBack={() => router.back()}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Historial de turnos */}
        <Reveal index={0}>
          <SectionHeader title="Historial de turnos" />
        </Reveal>
        <Reveal index={1}>
          <SectionState
            loading={apptLoading}
            error={apptError}
            empty={appointments.length === 0}
            loadingLabel="Cargando turnos…"
            errorLabel="No pudimos cargar los turnos del paciente."
            emptyIcon="calendar-outline"
            emptyTitle="Sin turnos"
            emptyDesc="Cuando compartas un turno con este paciente, va a aparecer acá.">
            <View style={styles.list}>
              {appointments.map((a) => (
                <AppointmentRow key={a.id} appointment={a} />
              ))}
            </View>
          </SectionState>
        </Reveal>

        {/* Scans y diagnósticos */}
        <Reveal index={2}>
          <SectionHeader title="Scans y diagnósticos" />
        </Reveal>
        <Reveal index={3}>
          <SectionState
            loading={scanLoading}
            error={scanError}
            empty={analyses.length === 0}
            loadingLabel="Cargando scans…"
            errorLabel="No pudimos cargar los scans del paciente."
            emptyIcon="scan-outline"
            emptyTitle="Sin scans"
            emptyDesc="Todavía no hay análisis con IA para este paciente.">
            <View style={styles.list}>
              {analyses.map((a) => (
                <AnalysisRow
                  key={a.id}
                  analysis={a}
                  onPress={
                    a.status === 'listo'
                      ? () =>
                          router.push({ pathname: '/diagnosis', params: { analysisId: a.id } })
                      : undefined
                  }
                />
              ))}
            </View>
          </SectionState>
        </Reveal>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeaderRow}>
      <View style={styles.accentBar} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

/** Envuelve el contenido de una sección resolviendo loading / error / vacío. */
function SectionState({
  loading,
  error,
  empty,
  loadingLabel,
  errorLabel,
  emptyIcon,
  emptyTitle,
  emptyDesc,
  children,
}: {
  loading: boolean;
  error: string | null;
  empty: boolean;
  loadingLabel: string;
  errorLabel: string;
  emptyIcon: React.ComponentProps<typeof Ionicons>['name'];
  emptyTitle: string;
  emptyDesc: string;
  children: React.ReactNode;
}) {
  if (loading) {
    return (
      <View style={styles.stateWrap}>
        <ActivityIndicator color={palette.primary} />
        <Text style={styles.stateText}>{loadingLabel}</Text>
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.stateWrap}>
        <View style={[styles.stateIcon, { backgroundColor: palette.dangerSoft }]}>
          <Ionicons name="cloud-offline-outline" size={26} color={palette.danger} />
        </View>
        <Text style={styles.stateText}>{errorLabel}</Text>
      </View>
    );
  }
  if (empty) {
    return (
      <View style={styles.stateWrap}>
        <View style={[styles.stateIcon, { backgroundColor: palette.surfaceAlt }]}>
          <Ionicons name={emptyIcon} size={26} color={palette.textMuted} />
        </View>
        <Text style={styles.emptyTitle}>{emptyTitle}</Text>
        <Text style={styles.emptyDesc}>{emptyDesc}</Text>
      </View>
    );
  }
  return <>{children}</>;
}

function AppointmentRow({ appointment }: { appointment: Appointment }) {
  const meta = APPOINTMENT_STATUS_META[appointment.status];
  return (
    <Card style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <GradientIcon gradient={[palette.teal, palette.primary]} size={44} borderRadius={radius.md}>
          <Ionicons name="calendar-outline" size={20} color={palette.white} />
        </GradientIcon>
        <View style={styles.itemHeaderText}>
          <Text style={styles.itemTitle} numberOfLines={1}>
            {formatDateTime(appointment.startsAt)}
          </Text>
          <Text style={styles.itemSub} numberOfLines={1}>
            {appointment.type} · {appointment.durationMin} min
          </Text>
        </View>
        <Badge label={meta.label} tone={meta.tone} />
      </View>
      {appointment.note ? <Text style={styles.itemNote}>{appointment.note}</Text> : null}
    </Card>
  );
}

function AnalysisRow({ analysis, onPress }: { analysis: Analysis; onPress?: () => void }) {
  const meta = ANALYSIS_STATUS_META[analysis.status];

  const inner = (
    <>
      <View style={styles.itemHeader}>
        <GradientIcon gradient={[palette.primary, palette.navy]} size={44} borderRadius={radius.md}>
          <Ionicons name={meta.icon} size={20} color={palette.white} />
        </GradientIcon>
        <View style={styles.itemHeaderText}>
          <Text style={styles.itemTitle}>{formatDate(analysis.createdAt)}</Text>
          <Text style={styles.itemSub}>Scan #{analysis.id.slice(0, 8)}</Text>
        </View>
        <Badge label={meta.label} tone={meta.tone} />
      </View>

      {analysis.result ? (
        <View style={styles.summaryRow}>
          <Ionicons name="pulse-outline" size={16} color={palette.teal} />
          <Text style={styles.summaryText} numberOfLines={2}>
            {summarize(analysis.result)}
          </Text>
        </View>
      ) : null}

      {onPress ? (
        <View style={styles.viewRow}>
          <Text style={styles.viewText}>Ver diagnóstico</Text>
          <Ionicons name="chevron-forward" size={16} color={palette.primary} />
        </View>
      ) : null}
    </>
  );

  if (onPress) {
    return (
      <PressableCard
        onPress={onPress}
        accessibilityLabel={`Ver diagnóstico del scan del ${formatDate(analysis.createdAt)}`}
        style={styles.itemCard}>
        {inner}
      </PressableCard>
    );
  }

  return <Card style={styles.itemCard}>{inner}</Card>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },

  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: CONTENT_BOTTOM_INSET,
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  accentBar: { width: 4, height: 18, borderRadius: radius.pill, backgroundColor: palette.teal },
  sectionTitle: { ...typography.h2, fontSize: 20, color: palette.textPrimary },

  list: { gap: spacing.md },

  itemCard: { gap: spacing.md },
  itemHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  itemHeaderText: { flex: 1 },
  itemTitle: { ...typography.bodyStrong, color: palette.textPrimary, textTransform: 'capitalize' },
  itemSub: { ...typography.caption, color: palette.textMuted, marginTop: 2, textTransform: 'capitalize' },
  itemNote: { ...typography.caption, color: palette.textSecondary },

  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: palette.tealSoft,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  summaryText: { ...typography.caption, color: palette.tealDark, fontWeight: '600', flex: 1 },

  viewRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 2 },
  viewText: { ...typography.caption, color: palette.primary, fontWeight: '700' },

  stateWrap: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing['2xl'],
  },
  stateText: { ...typography.body, color: palette.textSecondary, textAlign: 'center' },
  stateIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  emptyTitle: { ...typography.bodyStrong, color: palette.textPrimary },
  emptyDesc: {
    ...typography.caption,
    color: palette.textSecondary,
    textAlign: 'center',
    maxWidth: 300,
  },
});
