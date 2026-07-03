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

export default function PresupuestoScreen() {
  const router = useRouter();

  // El presupuesto real (desglose, resumen, financiación) debe salir del análisis
  // guardado en Supabase. Cargamos el análisis vía `analysisId`; sin datos reales
  // NO mostramos números inventados: caemos en un estado vacío honesto.
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
        if (!cancelled) setError(e instanceof Error ? e.message : 'No pudimos leer el presupuesto.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [analysisId]);

  // TODO(Fase 3): el tipo `DiagnosisResult` todavía NO trae presupuesto. La IA
  // (Edge Function) debe devolver un campo `budget` con { items, summary,
  // financingOptions } para poder renderizar el desglose real acá. Hasta entonces
  // no hay dato honesto que mostrar, así que siempre va el estado vacío.
  const hasBudget = false;

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
        ) : hasBudget ? null : (
          <PresupuestoEmpty hasAnalysis={Boolean(analysis)} />
        )}
      </ScrollView>
    </SafeAreaView>
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
          ? 'Cuando la IA calcule tu plan de tratamiento vas a ver acá el desglose, el total y las opciones de financiación.'
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
