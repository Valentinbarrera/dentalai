import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
import { ProgressRing } from '@/components/ui/progress-ring';
import { Reveal } from '@/components/ui/reveal';
import { CONTENT_BOTTOM_INSET } from '@/constants/layout';
import { getAnalysis, type Analysis } from '@/features/analyses';
import { AFFECTED_ZONES, AffectedZone, Severity } from '@/lib/diagnosis';
import { palette, radius, shadow, spacing, typography } from '@/theme/tokens';

const SEVERITY_COLOR: Record<Severity, string> = {
  high: palette.danger,
  medium: palette.warning,
  low: palette.success,
};

export default function ResultsScreen() {
  const router = useRouter();

  // El diagnóstico puede venir de un análisis real (guardado en Supabase) cuando
  // `processing.tsx` navega con `analysisId`. Sin ese id (demo, sin IA todavía),
  // la pantalla se comporta EXACTO que antes, con los mocks de `lib/diagnosis`.
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

  // Fuente de datos de las zonas: el resultado real si existe; si no, los mocks.
  // (En error o mientras no hay `result`, degradamos al mock para el demo.)
  const zones = analysis?.result?.affectedZones ?? AFFECTED_ZONES;
  const zonesLoading = Boolean(analysisId) && loading;
  const zonesError = Boolean(analysisId) && !loading && error !== null;

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <BrandBand title="Diagnóstico" subtitle="Resultados del escaneo IA" />

        <View style={styles.body}>
          {/* Encabezado */}
          <Reveal index={0}>
            <View style={styles.eyebrowRow}>
              <MaterialCommunityIcons name="tooth-outline" size={16} color={palette.primary} />
              <Text style={styles.eyebrow}>ANÁLISIS COMPLETADO</Text>
            </View>
            <Text style={styles.subtitle}>
              Basado en las imágenes radiográficas subidas el 24 de Octubre.
            </Text>
          </Reveal>

          {/* Diagnóstico principal */}
          <Reveal index={1}>
            <Card style={styles.diagCard}>
              <Badge label="⚠  Atención Requerida" tone="danger" />
              <Text style={styles.diagLabel}>Diagnóstico preliminar:</Text>
              <Text style={styles.diagName}>Ausencia de piezas posteriores</Text>
              <Text style={styles.diagDesc}>
                El análisis de IA detecta una pérdida significativa de piezas dentales en la zona
                posterior (molares y premolares), lo que puede comprometer la función masticatoria y
                la estructura ósea a largo plazo.
              </Text>
              <Button
                label="Ver opciones"
                left={<Ionicons name="arrow-forward" size={18} color={palette.white} />}
                onPress={() => router.push('/diagnosis/comparador')}
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

          {/* Nivel de confianza */}
          <Reveal index={2}>
            <LinearGradient
              colors={['#CFF3EC', '#DCEAFE']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.confCard, shadow.card]}>
              <Text style={styles.confLabel}>NIVEL DE CONFIANZA IA</Text>
              <ProgressRing value={87} size={140} strokeWidth={12} />
              <View style={styles.confFooter}>
                <MaterialCommunityIcons name="shield-check" size={16} color={palette.teal} />
                <Text style={styles.confFooterText}>Alta precisión estimada</Text>
              </View>
            </LinearGradient>
          </Reveal>

          {/* Aviso importante */}
          <Reveal index={3}>
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
          <Reveal index={4}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.accentBar} />
              <Text style={styles.sectionTitle}>Zonas Afectadas</Text>
            </View>
            {zonesLoading ? (
              <View style={styles.emptyZones}>
                <ActivityIndicator color={palette.primary} />
                <Text style={styles.emptyZonesText}>Cargando diagnóstico…</Text>
              </View>
            ) : zonesError ? (
              <View style={styles.emptyZones}>
                <MaterialCommunityIcons name="alert-circle-outline" size={28} color={palette.textMuted} />
                <Text style={styles.emptyZonesText}>No pudimos cargar el diagnóstico.</Text>
              </View>
            ) : zones.length > 0 ? (
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
      </ScrollView>
    </SafeAreaView>
  );
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

  confCard: {
    marginTop: spacing.lg,
    borderRadius: radius.xl,
    padding: spacing['2xl'],
    alignItems: 'center',
  },
  confLabel: { ...typography.label, color: palette.textSecondary, marginBottom: spacing.lg },
  confFooter: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.lg },
  confFooterText: { ...typography.caption, color: palette.textPrimary, fontWeight: '600' },

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
});
