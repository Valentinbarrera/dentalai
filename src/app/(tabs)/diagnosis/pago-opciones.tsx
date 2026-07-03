import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandBand } from '@/components/ui/brand-band';
import { Button } from '@/components/ui/button';
import { GradientIcon } from '@/components/ui/gradient-icon';
import { CONTENT_BOTTOM_INSET } from '@/constants/layout';
import { getAnalysis, type Analysis } from '@/features/analyses';
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

  // TODO(Fase 3): `DiagnosisResult` todavía NO trae planes de pago. La IA /
  // presupuestador debe devolver un campo `paymentPlans` (derivado del `budget`
  // del tratamiento elegido) para renderizar los planes reales acá. Hasta
  // entonces no hay dato honesto que mostrar, así que siempre va el estado vacío.
  const hasPlans = false;

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
        ) : hasPlans ? null : (
          <PagoEmpty hasAnalysis={Boolean(analysis)} />
        )}
      </ScrollView>
    </SafeAreaView>
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
