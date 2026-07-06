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
import { getAnalysis, type Analysis, type BudgetPlan } from '@/features/analyses';
import { palette, radius, spacing, typography } from '@/theme/tokens';

/** Formatea un número como "$8.000" (sin decimales, estilo es-AR). */
function money(n: number): string {
  return `$${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(n)}`;
}

export default function PresupuestoScreen() {
  const router = useRouter();

  // El presupuesto real (los 3 planes calculados con precios reales) sale del
  // análisis guardado en Supabase. Cargamos el análisis vía `analysisId`; sin
  // datos reales NO mostramos números inventados: caemos en un estado vacío honesto.
  // `planId` (opcional) viene del comparador e indica qué plan mostrar.
  const { analysisId, planId } = useLocalSearchParams<{ analysisId?: string; planId?: string }>();

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
        if (!cancelled) setError(e instanceof Error ? e.message : 'No pudimos leer el presupuesto.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [analysisId]);

  // Los 3 presupuestos reales devueltos por la IA (calculados con el catálogo).
  // Elegimos el que pidió el comparador (`planId`), o el recomendado, o el primero.
  const plans = analysis?.result?.plans ?? [];
  const plan =
    plans.find((p) => p.id === planId) ?? plans.find((p) => p.recommended) ?? plans[0] ?? null;

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <BrandBand
          title="Presupuesto"
          subtitle="Detalle de tu tratamiento"
          onBack={() => router.back()}
        />

        {loading ? (
          <View style={styles.stateWrap}>
            <ActivityIndicator color={palette.primary} />
            <Text style={styles.stateText}>Cargando presupuesto…</Text>
          </View>
        ) : error ? (
          <View style={styles.stateWrap}>
            <MaterialCommunityIcons name="alert-circle-outline" size={28} color={palette.textMuted} />
            <Text style={styles.stateText}>No pudimos cargar el presupuesto.</Text>
          </View>
        ) : plan ? (
          <PresupuestoContent plan={plan} analysisId={analysisId} />
        ) : (
          <PresupuestoEmpty hasAnalysis={Boolean(analysis)} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/** Presupuesto real: desglose por ítem del plan elegido y total destacado. */
function PresupuestoContent({ plan, analysisId }: { plan: BudgetPlan; analysisId?: string }) {
  const router = useRouter();
  // Blindamos por si el plan viniera sin ítems: estado honesto, sin inventar.
  const items = plan.items ?? [];

  return (
    <View style={styles.contentWrap}>
      {/* Encabezado del plan elegido */}
      <Reveal index={0}>
        <View style={styles.planHeader}>
          {plan.recommended ? <Badge label="Recomendado" tone="success" /> : null}
          <Text style={styles.planTitle}>{plan.title}</Text>
          {plan.description ? <Text style={styles.planDesc}>{plan.description}</Text> : null}
        </View>
      </Reveal>

      {/* Desglose de ítems */}
      <Reveal index={1}>
        <View style={styles.headingRow}>
          <View style={styles.accentBar} />
          <Text style={styles.sectionTitle}>Desglose del tratamiento</Text>
        </View>

        <Card style={styles.card}>
          {items.length > 0 ? (
            items.map((item, i) => (
              <View
                key={`${item.procedureId}-${i}`}
                style={[styles.itemRow, i > 0 && styles.itemRowBordered]}>
                <View style={styles.qtyChip}>
                  <Text style={styles.qtyChipText}>{item.qty}×</Text>
                </View>
                <View style={styles.itemMain}>
                  <Text style={styles.itemLabel}>{item.name}</Text>
                  <Text style={styles.itemNote}>{money(item.unitPrice)} c/u</Text>
                </View>
                <Text style={styles.itemPrice}>{money(item.lineTotal)}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.itemNote}>
              Este plan todavía no tiene ítems detallados.
            </Text>
          )}
        </Card>
      </Reveal>

      {/* Total destacado */}
      <Reveal index={2}>
        <Card style={styles.summaryCard} flat>
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total estimado</Text>
            <Text style={styles.totalValue}>{money(plan.total)}</Text>
          </View>
        </Card>
      </Reveal>

      {/* Ver opciones de pago */}
      <Reveal index={3}>
        <Button
          label="Ver opciones de pago"
          left={<Ionicons name="card-outline" size={18} color={palette.white} />}
          onPress={() =>
            router.push({
              pathname: '/diagnosis/pago-opciones',
              params: analysisId ? { analysisId } : {},
            })
          }
        />
      </Reveal>

      {/* Aviso: estimación orientativa, no cotización final */}
      <Reveal index={4}>
        <View style={styles.disclaimer}>
          <MaterialCommunityIcons name="information-outline" size={16} color={palette.textMuted} />
          <Text style={styles.disclaimerText}>
            Estos valores son estimaciones orientativas generadas por IA como orientación
            preliminar, no una cotización final ni un diagnóstico clínico. El presupuesto
            definitivo lo confirma tu odontólogo tras una consulta profesional.
          </Text>
        </View>
      </Reveal>
    </View>
  );
}

/** Estado vacío honesto: todavía no hay un presupuesto real que mostrar. */
function PresupuestoEmpty({ hasAnalysis }: { hasAnalysis: boolean }) {
  const router = useRouter();
  return (
    <View style={styles.emptyState}>
      <GradientIcon gradient={[palette.primary, palette.navy]} size={96} borderRadius={radius.xl}>
        <MaterialCommunityIcons name="cash-multiple" size={44} color={palette.white} />
      </GradientIcon>
      <Text style={styles.emptyTitle}>Todavía no hay un presupuesto</Text>
      <Text style={styles.emptyDesc}>
        {hasAnalysis
          ? 'Cuando la IA calcule tu plan de tratamiento vas a ver acá el desglose y el total.'
          : 'Hacé tu análisis con IA para recibir un presupuesto detallado y personalizado para tu caso.'}
      </Text>
      <Button
        label={hasAnalysis ? 'Ver mi diagnóstico' : 'Hacer mi análisis'}
        left={<Ionicons name="scan-outline" size={18} color={palette.white} />}
        onPress={() => router.push(hasAnalysis ? '/diagnosis' : '/analysis/tutorial')}
        fullWidth={false}
        style={styles.emptyCta}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  content: { paddingBottom: CONTENT_BOTTOM_INSET },

  // Presupuesto real.
  contentWrap: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, gap: spacing.lg },

  // Encabezado del plan elegido.
  planHeader: { gap: spacing.sm },
  planTitle: { ...typography.h2, fontSize: 22, color: palette.textPrimary },
  planDesc: { ...typography.body, color: palette.textSecondary },

  headingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  accentBar: { width: 4, height: 18, borderRadius: radius.pill, backgroundColor: palette.teal },
  sectionTitle: { ...typography.h2, fontSize: 20, color: palette.textPrimary },

  card: { padding: spacing.lg },

  // Filas del desglose.
  itemRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, paddingVertical: spacing.md },
  itemRowBordered: { borderTopWidth: 1, borderTopColor: palette.border },
  itemMain: { flex: 1 },
  qtyChip: {
    backgroundColor: palette.primarySoft,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  qtyChipText: { ...typography.small, fontSize: 11, fontWeight: '700', color: palette.primary },
  itemLabel: { ...typography.bodyStrong, color: palette.textPrimary, flexShrink: 1 },
  itemNote: { ...typography.caption, color: palette.textSecondary, marginTop: 2 },
  itemPrice: { ...typography.bodyStrong, color: palette.textPrimary },

  // Resumen.
  summaryCard: { padding: spacing.lg, backgroundColor: palette.primarySoft, borderColor: palette.primaryLight },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  totalLabel: { ...typography.subtitle, color: palette.textPrimary },
  totalValue: { ...typography.h2, fontSize: 24, color: palette.primary },

  // Aviso legal / orientativo.
  disclaimer: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: palette.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  disclaimerText: { ...typography.caption, color: palette.textSecondary, flex: 1 },

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
