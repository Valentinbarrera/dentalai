import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandBand } from '@/components/ui/brand-band';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GradientIcon } from '@/components/ui/gradient-icon';
import { Reveal } from '@/components/ui/reveal';
import { CONTENT_BOTTOM_INSET } from '@/constants/layout';
import { getAnalysis, type Analysis, type DiagnosisResult } from '@/features/analyses';
import type { TreatmentOption } from '@/lib/diagnosis';
import { palette, radius, spacing, typography } from '@/theme/tokens';

const CARD_W = Math.min(Dimensions.get('window').width * 0.82, 340);
const GAP = 16;

// Paleta de degradados por defecto. La IA ya no elige colores, así que si una
// opción no trae `accent` usamos uno de estos según su índice.
const DEFAULT_ACCENTS: [string, string][] = [
  ['#0D9488', '#2563EB'],
  ['#6366F1', '#8B5CF6'],
  ['#0EA5E9', '#22D3EE'],
];

export default function ComparadorScreen() {
  const router = useRouter();

  // Las opciones de tratamiento provienen del diagnóstico real (Supabase) vía
  // `analysisId`. Sin análisis real —o si aún no tiene `result`— mostramos un
  // estado vacío honesto en vez de opciones ficticias.
  const { analysisId } = useLocalSearchParams<{ analysisId?: string }>();

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

  const result: DiagnosisResult | null = analysis?.result ?? null;
  const options = result?.treatmentOptions ?? [];

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <BrandBand
          title="Comparador"
          subtitle="Tratamientos según tu diagnóstico IA"
          onBack={() => router.back()}
        />

        {loading ? (
          <View style={styles.stateWrap}>
            <ActivityIndicator color={palette.primary} />
            <Text style={styles.stateText}>Cargando opciones…</Text>
          </View>
        ) : error ? (
          <View style={styles.stateWrap}>
            <MaterialCommunityIcons name="alert-circle-outline" size={28} color={palette.textMuted} />
            <Text style={styles.stateText}>No pudimos cargar las opciones.</Text>
          </View>
        ) : options.length > 0 ? (
          <>
            <Reveal index={0}>
              <View style={styles.intro}>
                <View style={styles.headingRow}>
                  <View style={styles.accentBar} />
                  <Text style={styles.sectionTitle}>Elegí una alternativa</Text>
                </View>
                <Text style={styles.subtitle}>
                  Análisis comparativo de opciones reconstructivas basado en tu diagnóstico IA.
                  Evaluá alternativas para tomar la mejor decisión clínica.
                </Text>
              </View>
            </Reveal>

            <Reveal index={1}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={CARD_W + GAP}
                decelerationRate="fast"
                contentContainerStyle={styles.carousel}>
                {options.map((opt, index) => (
                  <TreatmentCard key={opt.id} opt={opt} index={index} analysisId={analysisId} />
                ))}
              </ScrollView>
            </Reveal>
          </>
        ) : (
          <ComparadorEmpty />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/** Estado vacío honesto: no hay opciones de tratamiento reales que comparar. */
function ComparadorEmpty() {
  const router = useRouter();
  return (
    <View style={styles.emptyState}>
      <GradientIcon gradient={[palette.primary, palette.navy]} size={96} borderRadius={radius.xl}>
        <MaterialCommunityIcons name="tooth-outline" size={44} color={palette.white} />
      </GradientIcon>
      <Text style={styles.emptyTitle}>Todavía no hay opciones para comparar</Text>
      <Text style={styles.emptyDesc}>
        Hacé tu análisis con IA para ver las alternativas de tratamiento recomendadas para tu caso.
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

function TreatmentCard({
  opt,
  index,
  analysisId,
}: {
  opt: TreatmentOption;
  index: number;
  analysisId?: string;
}) {
  const router = useRouter();
  const accent = opt.accent ?? DEFAULT_ACCENTS[index % DEFAULT_ACCENTS.length];
  return (
    <Card style={styles.card} padded={false}>
      {/* Imagen */}
      <LinearGradient colors={accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.image}>
        <MaterialCommunityIcons name="tooth" size={64} color="rgba(255,255,255,0.85)" />
        {opt.recommended && (
          <View style={styles.recBadge}>
            <MaterialCommunityIcons name="star-four-points" size={13} color={palette.white} />
            <Text style={styles.recText}>RECOMENDADO</Text>
          </View>
        )}
      </LinearGradient>

      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{opt.name}</Text>
        <Text style={styles.cardDesc}>{opt.description}</Text>

        <View style={styles.statsGrid}>
          <Stat icon="cash-multiple" label="INVERSIÓN EST." value={opt.inversion} />
          <Stat icon="calendar-month" label="CUOTA MENSUAL" value={opt.cuota} highlight />
          <Stat icon="clock-outline" label="TIEMPO TRATAM." value={opt.tiempo} />
          <Stat icon="medical-bag" label="CIRUGÍA" value={opt.cirugia} />
        </View>

        <View style={styles.durability}>
          <MaterialCommunityIcons name="shield-check" size={16} color={palette.teal} />
          <View>
            <Text style={styles.durLabel}>DURABILIDAD</Text>
            <Text style={styles.durValue}>{opt.durabilidad}</Text>
          </View>
        </View>

        <Button
          label="VER DETALLES"
          left={<Ionicons name="arrow-forward" size={18} color={palette.white} />}
          onPress={() =>
            router.push({ pathname: '/diagnosis/presupuesto', params: analysisId ? { analysisId } : {} })
          }
          style={styles.detailBtn}
        />
      </View>
    </Card>
  );
}

function Stat({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.stat}>
      <View style={styles.statLabelRow}>
        <MaterialCommunityIcons name={icon} size={13} color={palette.textMuted} />
        <Text style={styles.statLabel}>{label}</Text>
      </View>
      <Text style={[styles.statValue, highlight && { color: palette.primary }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  content: { paddingBottom: CONTENT_BOTTOM_INSET },

  intro: { paddingHorizontal: spacing.xl, marginTop: spacing.xl },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  accentBar: { width: 4, height: 18, borderRadius: radius.pill, backgroundColor: palette.teal },
  sectionTitle: { ...typography.h2, fontSize: 20, color: palette.textPrimary },
  subtitle: { ...typography.body, color: palette.textSecondary, marginTop: spacing.sm },

  carousel: { gap: GAP, paddingHorizontal: spacing.xl, paddingTop: spacing.xl },
  card: { width: CARD_W, overflow: 'hidden' },
  image: {
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: palette.teal,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  recText: { ...typography.small, fontSize: 10, color: palette.white, fontWeight: '800', letterSpacing: 0.5 },

  cardBody: { padding: spacing.lg },
  cardTitle: { ...typography.h2, fontSize: 22, color: palette.textPrimary },
  cardDesc: { ...typography.caption, color: palette.textSecondary, marginTop: spacing.xs },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.lg },
  stat: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: palette.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  statLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statLabel: { fontSize: 9, color: palette.textMuted, fontWeight: '700', letterSpacing: 0.3 },
  statValue: { ...typography.bodyStrong, color: palette.textPrimary, marginTop: 4 },

  durability: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: palette.tealSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  durLabel: { fontSize: 9, color: palette.tealDark, fontWeight: '700', letterSpacing: 0.3 },
  durValue: { ...typography.bodyStrong, color: palette.tealDark },

  detailBtn: { marginTop: spacing.lg },

  // Estados de carga / error.
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
