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
import { getAnalysis, type Analysis, type PaymentPlan } from '@/features/analyses';
import { palette, radius, spacing, typography } from '@/theme/tokens';

export default function PagoOpcionesScreen() {
  const router = useRouter();

  // Los planes de pago dependen del presupuesto real del tratamiento elegido.
  // Cargamos el análisis vía `analysisId`; sin datos reales NO mostramos planes
  // ni montos inventados: caemos en un estado vacío honesto.
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
        if (!cancelled) setError(e instanceof Error ? e.message : 'No pudimos leer las opciones de pago.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [analysisId]);

  // Los planes de pago los deriva la IA a partir del `budget` del tratamiento
  // elegido. Si `paymentPlans` viene con datos reales los mostramos; si no,
  // cae en el estado vacío honesto (sin montos inventados).
  const plans = analysis?.result?.paymentPlans ?? null;

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <BrandBand
          title="Opciones de Pago"
          subtitle="Métodos de pago"
          onBack={() => router.back()}
        />

        {loading ? (
          <View style={styles.stateWrap}>
            <ActivityIndicator color={palette.primary} />
            <Text style={styles.stateText}>Cargando opciones de pago…</Text>
          </View>
        ) : error ? (
          <View style={styles.stateWrap}>
            <MaterialCommunityIcons name="alert-circle-outline" size={28} color={palette.textMuted} />
            <Text style={styles.stateText}>No pudimos cargar las opciones de pago.</Text>
          </View>
        ) : plans && plans.length > 0 ? (
          <PagoContent plans={plans} />
        ) : (
          <PagoEmpty hasAnalysis={Boolean(analysis)} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/** Lista de planes de pago reales devueltos por la IA. */
function PagoContent({ plans }: { plans: PaymentPlan[] }) {
  return (
    <>
      <Reveal index={0}>
        <View style={styles.intro}>
          <View style={styles.headingRow}>
            <View style={styles.accentBar} />
            <Text style={styles.sectionTitle}>Elegí cómo pagar</Text>
          </View>
          <Text style={styles.subtitle}>
            Planes de pago para tu tratamiento, calculados a partir de tu presupuesto.
          </Text>
        </View>
      </Reveal>

      <View style={styles.plansWrap}>
        {plans.map((plan, i) => (
          <Reveal key={plan.id} index={i + 1}>
            <PlanCard plan={plan} />
          </Reveal>
        ))}
      </View>
    </>
  );
}

/** Una tarjeta por plan de pago. El plan `primary` va destacado. */
function PlanCard({ plan }: { plan: PaymentPlan }) {
  const isPrimary = Boolean(plan.primary);
  return (
    <Card style={[styles.planCard, isPrimary && styles.planCardPrimary]}>
      <View style={styles.planHeader}>
        <Text style={styles.planTitle}>{plan.title}</Text>
        {plan.highlight ? (
          <Badge label={plan.highlight} tone={isPrimary ? 'info' : 'neutral'} />
        ) : null}
      </View>

      {plan.total ? (
        <View style={styles.totalRow}>
          <Text style={styles.totalValue}>{plan.total}</Text>
          <Text style={styles.totalLabel}>Total</Text>
        </View>
      ) : null}

      {plan.initial || plan.monthly ? (
        <View style={styles.installments}>
          {plan.initial ? (
            <View style={styles.installLine}>
              <MaterialCommunityIcons name="cash" size={16} color={palette.textMuted} />
              <Text style={styles.installText}>
                Anticipo <Text style={styles.installStrong}>{plan.initial}</Text>
              </Text>
            </View>
          ) : null}
          {plan.monthly ? (
            <View style={styles.installLine}>
              <MaterialCommunityIcons name="calendar-month" size={16} color={palette.primary} />
              <Text style={[styles.installText, styles.installStrong, { color: palette.primary }]}>
                {plan.monthly}
              </Text>
            </View>
          ) : null}
          {plan.monthlyNote ? <Text style={styles.installNote}>{plan.monthlyNote}</Text> : null}
        </View>
      ) : null}

      <Button
        label="Elegir plan"
        variant={isPrimary ? 'primary' : 'secondary'}
        left={
          <Ionicons
            name="checkmark-circle-outline"
            size={18}
            color={isPrimary ? palette.white : palette.primary}
          />
        }
        onPress={() => {
          // El cobro real se implementa en otra fase; por ahora sin acción.
        }}
        style={styles.planBtn}
      />
    </Card>
  );
}

/** Estado vacío honesto: todavía no hay planes de pago reales que mostrar. */
function PagoEmpty({ hasAnalysis }: { hasAnalysis: boolean }) {
  const router = useRouter();
  return (
    <View style={styles.emptyState}>
      <GradientIcon gradient={[palette.primary, palette.navy]} size={96} borderRadius={radius.xl}>
        <MaterialCommunityIcons name="credit-card-outline" size={44} color={palette.white} />
      </GradientIcon>
      <Text style={styles.emptyTitle}>Todavía no hay opciones de pago</Text>
      <Text style={styles.emptyDesc}>
        {hasAnalysis
          ? 'Cuando tengas un presupuesto calculado vas a ver acá los planes y las formas de pago disponibles.'
          : 'Hacé tu análisis con IA para recibir un presupuesto y sus opciones de pago.'}
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

  // Encabezado de la lista de planes.
  intro: { paddingHorizontal: spacing.xl, marginTop: spacing.xl },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  accentBar: { width: 4, height: 18, borderRadius: radius.pill, backgroundColor: palette.primary },
  sectionTitle: { ...typography.h2, fontSize: 20, color: palette.textPrimary },
  subtitle: { ...typography.body, color: palette.textSecondary, marginTop: spacing.sm },

  // Tarjetas de planes.
  plansWrap: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, gap: spacing.lg },
  planCard: { gap: spacing.md },
  planCardPrimary: { borderColor: palette.primary, borderWidth: 1.5 },
  planHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  planTitle: { ...typography.h2, fontSize: 18, color: palette.textPrimary, flexShrink: 1 },

  totalRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  totalValue: { ...typography.h2, fontSize: 28, color: palette.primary },
  totalLabel: { ...typography.caption, color: palette.textMuted },

  installments: {
    backgroundColor: palette.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  installLine: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  installText: { ...typography.body, color: palette.textSecondary },
  installStrong: { ...typography.bodyStrong, color: palette.textPrimary },
  installNote: { ...typography.caption, color: palette.textMuted, marginTop: spacing.xs },

  planBtn: { marginTop: spacing.xs },

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
