import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge } from '@/components/ui/badge';
import { BrandBand } from '@/components/ui/brand-band';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GradientIcon } from '@/components/ui/gradient-icon';
import { Reveal } from '@/components/ui/reveal';
import { CONTENT_BOTTOM_INSET } from '@/constants/layout';
import { useMyAnalyses } from '@/features/analyses';
import type { Analysis, AnalysisStatus, DiagnosisResult } from '@/features/analyses';
import { palette, radius, spacing, typography } from '@/theme/tokens';

/** Metadatos visuales por estado del análisis (etiqueta, tono del badge e ícono). */
const STATUS_META: Record<
  AnalysisStatus,
  { label: string; tone: 'success' | 'warning' | 'danger' | 'info'; icon: React.ComponentProps<typeof Ionicons>['name'] }
> = {
  subiendo: { label: 'Subiendo', tone: 'info', icon: 'cloud-upload-outline' },
  procesando: { label: 'Procesando', tone: 'warning', icon: 'sync-outline' },
  listo: { label: 'Listo', tone: 'success', icon: 'checkmark-done-outline' },
  error: { label: 'Error', tone: 'danger', icon: 'alert-circle-outline' },
};

/** Formatea la fecha de creación a algo legible en es-AR. */
function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });
}

/** Arma un resumen corto del diagnóstico: zonas a tratar + tratamiento recomendado. */
function summarize(result: DiagnosisResult): string {
  const zones = result.affectedZones.length;
  const zonesLabel = `${zones} ${zones === 1 ? 'zona' : 'zonas'} a tratar`;
  const recommended = result.treatmentOptions.find((t) => t.recommended);
  return recommended ? `${zonesLabel} · ${recommended.name}` : zonesLabel;
}

export default function HistoryScreen() {
  const router = useRouter();
  const { analyses, loading, error } = useMyAnalyses();

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <StatusBar style="light" />
      <BrandBand
        title="Historial clínico"
        subtitle="Tus análisis y diagnósticos"
        onBack={() => router.back()}
      />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={palette.primary} />
          <Text style={styles.centeredHint}>Cargando tus análisis…</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <View style={[styles.stateIcon, { backgroundColor: palette.dangerSoft }]}>
            <Ionicons name="cloud-offline-outline" size={38} color={palette.danger} />
          </View>
          <Text style={styles.stateTitle}>No pudimos cargar tu historial</Text>
          <Text style={styles.stateDesc}>{error}</Text>
        </View>
      ) : analyses.length === 0 ? (
        <View style={styles.centered}>
          <Reveal index={0} style={styles.emptyBlock}>
            <View style={[styles.stateIcon, { backgroundColor: palette.primarySoft }]}>
              <Ionicons name="document-text-outline" size={38} color={palette.primary} />
            </View>
            <Text style={styles.stateTitle}>Todavía no tenés análisis</Text>
            <Text style={styles.stateDesc}>
              Hacé tu primer escaneo y acá vas a ver tus diagnósticos guardados.
            </Text>
          </Reveal>
          <Reveal index={1} style={styles.emptyCta}>
            <Button
              label="Hacer mi primer escaneo"
              left={<Ionicons name="scan-outline" size={20} color={palette.white} />}
              onPress={() => router.push('/analysis/tutorial')}
            />
          </Reveal>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {analyses.map((analysis, i) => (
            <Reveal key={analysis.id} index={i}>
              <AnalysisRow analysis={analysis} />
            </Reveal>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function AnalysisRow({ analysis }: { analysis: Analysis }) {
  const meta = STATUS_META[analysis.status];
  return (
    <Card style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <GradientIcon gradient={[palette.primary, palette.navy]} size={44} borderRadius={radius.md}>
          <Ionicons name={meta.icon} size={20} color={palette.white} />
        </GradientIcon>
        <View style={styles.itemHeaderText}>
          <Text style={styles.itemDate}>{formatDate(analysis.createdAt)}</Text>
          <Text style={styles.itemId}>Análisis #{analysis.id.slice(0, 8)}</Text>
        </View>
        <Badge label={meta.label} tone={meta.tone} />
      </View>

      {analysis.result ? (
        <View style={styles.itemSummary}>
          <Ionicons name="pulse-outline" size={16} color={palette.teal} />
          <Text style={styles.itemSummaryText}>{summarize(analysis.result)}</Text>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },

  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: CONTENT_BOTTOM_INSET,
    gap: spacing.md,
  },

  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  centeredHint: { ...typography.body, color: palette.textSecondary },

  stateIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  stateTitle: { ...typography.h2, color: palette.textPrimary, textAlign: 'center' },
  stateDesc: {
    ...typography.body,
    color: palette.textSecondary,
    textAlign: 'center',
    maxWidth: 300,
  },
  emptyBlock: { alignItems: 'center', gap: spacing.md },
  emptyCta: { alignSelf: 'stretch', marginTop: spacing.lg },

  itemCard: { gap: spacing.md },
  itemHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  itemHeaderText: { flex: 1 },
  itemDate: { ...typography.bodyStrong, color: palette.textPrimary, textTransform: 'capitalize' },
  itemId: { ...typography.caption, color: palette.textMuted, marginTop: 2 },

  itemSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: palette.tealSoft,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  itemSummaryText: { ...typography.caption, color: palette.tealDark, fontWeight: '600', flex: 1 },
});
