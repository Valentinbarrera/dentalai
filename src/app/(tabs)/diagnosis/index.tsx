import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge } from '@/components/ui/badge';
import { BrandBand } from '@/components/ui/brand-band';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GradientIcon } from '@/components/ui/gradient-icon';
import { Reveal } from '@/components/ui/reveal';
import { CONTENT_BOTTOM_INSET } from '@/constants/layout';
import { getAnalysis, type Analysis, type DiagnosisResult } from '@/features/analyses';
import type { AffectedZone, Severity } from '@/lib/diagnosis';
import { palette, radius, shadow, spacing, typography } from '@/theme/tokens';

const SEVERITY_COLOR: Record<Severity, string> = {
  high: palette.danger,
  medium: palette.warning,
  low: palette.success,
};

export default function ResultsScreen() {
  // El diagnóstico real llega desde un análisis guardado en Supabase: `processing.tsx`
  // navega con `analysisId` cuando la IA (Fase 3) terminó de procesarlo. Sin ese id
  // —o si el análisis todavía no tiene `result`— NO mostramos datos ficticios: la
  // pantalla cae en un estado vacío honesto que invita a hacer el análisis.
  const { analysisId } = useLocalSearchParams<{ analysisId?: string }>();

  // Lectura siempre vía `@/features/analyses`; la UI nunca toca Supabase directo.
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(analysisId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!analysisId) return;
    let cancelled = false;

    setLoading(true);
    setError(null);
    getAnalysis(analysisId)
      .then((a) => {
        if (!cancelled) setAnalysis(a);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'No pudimos leer el diagnóstico.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [analysisId]);

  // El diagnóstico real (o `null` si aún no está listo / no hay análisis).
  const result: DiagnosisResult | null = analysis?.result ?? null;

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <BrandBand title="Diagnóstico" subtitle="Resultados del escaneo IA" />

        {loading ? (
          <View style={styles.stateWrap}>
            <ActivityIndicator color={palette.primary} />
            <Text style={styles.stateText}>Cargando diagnóstico…</Text>
          </View>
        ) : error ? (
          <View style={styles.stateWrap}>
            <MaterialCommunityIcons name="alert-circle-outline" size={28} color={palette.textMuted} />
            <Text style={styles.stateText}>No pudimos cargar el diagnóstico.</Text>
          </View>
        ) : result ? (
          <DiagnosisContent result={result} createdAt={analysis?.createdAt} analysisId={analysisId} />
        ) : (
          <DiagnosisEmpty />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/** Render del diagnóstico real. Solo usa campos que trae `DiagnosisResult`. */
function DiagnosisContent({
  result,
  createdAt,
  analysisId,
}: {
  result: DiagnosisResult;
  createdAt?: string;
  analysisId?: string;
}) {
  const router = useRouter();
  const zones = result.affectedZones ?? [];
  const affected = zones.filter((z) => z.severity !== 'low');

  const worst: Severity = zones.some((z) => z.severity === 'high')
    ? 'high'
    : zones.some((z) => z.severity === 'medium')
      ? 'medium'
      : 'low';
  const badge =
    worst === 'high'
      ? { tone: 'danger' as const, label: '⚠  Atención Requerida' }
      : worst === 'medium'
        ? { tone: 'warning' as const, label: 'Revisión sugerida' }
        : { tone: 'success' as const, label: 'Sin hallazgos relevantes' };

  const headline =
    affected.length > 0
      ? `${affected.length} ${affected.length === 1 ? 'zona requiere' : 'zonas requieren'} atención`
      : 'Sin hallazgos relevantes';

  const dateLabel = formatDate(createdAt);

  return (
    <View style={styles.body}>
      {/* Encabezado */}
      <Reveal index={0}>
        <View style={styles.eyebrowRow}>
          <MaterialCommunityIcons name="tooth-outline" size={16} color={palette.primary} />
          <Text style={styles.eyebrow}>ANÁLISIS COMPLETADO</Text>
        </View>
        <Text style={styles.subtitle}>
          {dateLabel
            ? `Basado en las imágenes radiográficas subidas el ${dateLabel}.`
            : 'Basado en las imágenes radiográficas de tu análisis.'}
        </Text>
      </Reveal>

      {/* Diagnóstico principal */}
      {/* TODO(Fase 3): la IA debería devolver en `result` un resumen clínico
          (nombre + descripción del hallazgo) y un `confidence`. Hasta entonces,
          el titular se deriva de las zonas reales; NO inventamos texto clínico. */}
      <Reveal index={1}>
        <Card style={styles.diagCard}>
          <Badge label={badge.label} tone={badge.tone} />
          <Text style={styles.diagLabel}>Diagnóstico preliminar:</Text>
          <Text style={[styles.diagName, { color: SEVERITY_COLOR[worst] }]}>{headline}</Text>
          <Text style={styles.diagDesc}>
            Revisá abajo las zonas detectadas por el análisis y compará las opciones de tratamiento
            disponibles para tu caso.
          </Text>
          <Button
            label="Ver opciones"
            left={<Ionicons name="arrow-forward" size={18} color={palette.white} />}
            onPress={() =>
              router.push({ pathname: '/diagnosis/comparador', params: analysisId ? { analysisId } : {} })
            }
            style={styles.diagBtn}
          />
          <Button
            label="Ver imagen original"
            variant="outline"
            left={<Ionicons name="image-outline" size={18} color={palette.primary} />}
            onPress={() => {}}
          />
        </Card>
      </Reveal>

      {/* TODO(Fase 3): "Nivel de confianza IA" se removió a propósito. Volverá
          cuando la IA devuelva `result.confidence`; no mostramos un % inventado. */}

      {/* Aviso importante */}
      <Reveal index={2}>
        <View style={styles.notice}>
          <GradientIcon gradient={[palette.primary, palette.navy]} size={28} borderRadius={14}>
            <Ionicons name="information" size={16} color={palette.white} />
          </GradientIcon>
          <View style={styles.flex}>
            <Text style={styles.noticeTitle}>Aviso Importante</Text>
            <Text style={styles.noticeText}>
              Este resultado es un análisis preliminar generado por inteligencia artificial y{' '}
              <Text style={styles.noticeBold}>
                debe ser confirmado por un profesional odontológico cualificado
              </Text>{' '}
              antes de iniciar cualquier tratamiento.
            </Text>
          </View>
        </View>
      </Reveal>

      {/* Zonas afectadas */}
      <Reveal index={3}>
        <View style={styles.sectionHeaderRow}>
          <View style={styles.accentBar} />
          <Text style={styles.sectionTitle}>Zonas Afectadas</Text>
        </View>
        {zones.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.zonesRow}>
            {zones.map((z) => (
              <ZoneCard key={z.id} zone={z} />
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyZones}>
            <MaterialCommunityIcons name="tooth-outline" size={28} color={palette.textMuted} />
            <Text style={styles.emptyZonesText}>No se detectaron zonas afectadas.</Text>
          </View>
        )}
      </Reveal>
    </View>
  );
}

/** Estado vacío honesto: todavía no hay un diagnóstico real que mostrar. */
function DiagnosisEmpty() {
  const router = useRouter();
  return (
    <View style={styles.emptyState}>
      <GradientIcon gradient={[palette.primary, palette.navy]} size={96} borderRadius={radius.xl}>
        <MaterialCommunityIcons name="tooth-outline" size={44} color={palette.white} />
      </GradientIcon>
      <Text style={styles.emptyTitle}>Todavía no tenés un diagnóstico</Text>
      <Text style={styles.emptyDesc}>
        Hacé tu análisis con IA para ver acá tus zonas afectadas, opciones de tratamiento y
        presupuesto personalizados.
      </Text>
      <Button
        label="Hacer mi análisis"
        left={<Ionicons name="scan-outline" size={18} color={palette.white} />}
        onPress={() => router.push('/analysis/tutorial')}
        fullWidth={false}
        style={styles.emptyCta}
      />
    </View>
  );
}

/** Formatea un ISO a "24 de octubre" (es-AR); devuelve '' si no es válido. */
function formatDate(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' });
}

function ZoneCard({ zone }: { zone: AffectedZone }) {
  const color = SEVERITY_COLOR[zone.severity];
  return (
    <Card style={styles.zoneCard}>
      <View style={styles.zoneTop}>
        <MaterialCommunityIcons name="tooth" size={30} color={palette.textSecondary} />
        <View style={[styles.zoneDot, { backgroundColor: color }]} />
      </View>
      <Text style={styles.zoneName}>{zone.zone}</Text>
      <Text style={[styles.zoneStatus, { color }]}>{zone.status}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  flex: { flex: 1 },
  content: { paddingBottom: CONTENT_BOTTOM_INSET },
  body: { paddingHorizontal: spacing.xl },

  accentBar: { width: 4, height: 18, borderRadius: radius.pill, backgroundColor: palette.teal },

  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.lg },
  eyebrow: { ...typography.label, color: palette.primary },
  subtitle: { ...typography.body, color: palette.textSecondary, marginTop: spacing.xs },

  diagCard: { marginTop: spacing.xl },
  diagLabel: { ...typography.h2, fontSize: 22, color: palette.textPrimary, marginTop: spacing.lg },
  diagName: { ...typography.h2, fontSize: 22, color: palette.danger, marginTop: 2 },
  diagDesc: { ...typography.body, color: palette.textSecondary, marginTop: spacing.md },
  diagBtn: { marginTop: spacing.xl, marginBottom: spacing.md },

  notice: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: palette.primarySoft,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  noticeTitle: { ...typography.bodyStrong, color: palette.textPrimary, marginBottom: 2 },
  noticeText: { ...typography.caption, color: palette.textSecondary, lineHeight: 19 },
  noticeBold: { fontWeight: '700', color: palette.textPrimary },

  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing['2xl'],
    marginBottom: spacing.md,
  },
  sectionTitle: { ...typography.h2, fontSize: 20, color: palette.textPrimary },
  zonesRow: { gap: spacing.md, paddingRight: spacing.xl },
  zoneCard: { width: 200 },
  zoneTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  zoneDot: { width: 10, height: 10, borderRadius: 5 },
  zoneName: { ...typography.bodyStrong, color: palette.textPrimary, marginTop: spacing.md },
  zoneStatus: { ...typography.caption, fontWeight: '700', marginTop: 2 },

  emptyZones: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing['2xl'],
  },
  emptyZonesText: { ...typography.caption, color: palette.textSecondary },

  // Estados de carga / error (debajo de la banda de marca).
  stateWrap: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing['3xl'] },
  stateText: { ...typography.body, color: palette.textSecondary },

  // Estado vacío honesto.
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['3xl'],
    gap: spacing.md,
  },
  emptyTitle: {
    ...typography.h2,
    fontSize: 20,
    color: palette.textPrimary,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  emptyDesc: { ...typography.body, color: palette.textSecondary, textAlign: 'center', maxWidth: 320 },
  emptyCta: { marginTop: spacing.lg },
});
