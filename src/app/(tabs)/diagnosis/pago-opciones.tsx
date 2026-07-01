import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CONTENT_BOTTOM_INSET } from '@/constants/layout';
import { PAYMENT_PLANS, PaymentPlan } from '@/lib/diagnosis';
import { palette, radius, spacing, typography } from '@/theme/tokens';

export default function PagoOpcionesScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.eyebrowRow}>
          <MaterialCommunityIcons name="cash-multiple" size={16} color={palette.primary} />
          <Text style={styles.eyebrow}>TREATMENT OPTIONS</Text>
        </View>
        <Text style={styles.title}>Opciones de Pago</Text>
        <Text style={styles.subtitle}>Elegí cómo querés pagar tu tratamiento dental seleccionado.</Text>

        {PAYMENT_PLANS.map((p) => (
          <PlanCard key={p.id} plan={p} onPress={() => router.push('/booking/agenda')} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function PlanCard({ plan, onPress }: { plan: PaymentPlan; onPress: () => void }) {
  return (
    <Card style={styles.card}>
      <View style={styles.cardHead}>
        <Text style={styles.cardTitle}>{plan.title}</Text>
        {plan.highlight && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{plan.highlight}</Text>
          </View>
        )}
      </View>

      {plan.total ? (
        <>
          <Text style={styles.investLabel}>Inversión Total:</Text>
          <View style={styles.investRow}>
            <Text style={styles.investValue}>{plan.total}</Text>
            {plan.totalOld && <Text style={styles.investOld}>{plan.totalOld}</Text>}
          </View>
        </>
      ) : (
        <>
          <Text style={styles.initialText}>
            Pago Inicial: <Text style={styles.initialStrong}>{plan.initial}</Text>
          </Text>
          <SliderVisual />
          <Text style={styles.monthlyText}>
            Cuota Mensual: <Text style={styles.monthlyStrong}>{plan.monthly}</Text> ({plan.monthlyNote})
          </Text>
        </>
      )}

      <Button
        label={plan.cta}
        variant={plan.primary ? 'outline' : 'primary'}
        left={
          plan.primary ? (
            <Ionicons name="card-outline" size={18} color={palette.primary} />
          ) : (
            <Ionicons name="calculator-outline" size={18} color={palette.white} />
          )
        }
        onPress={onPress}
        style={styles.cardBtn}
      />
    </Card>
  );
}

/** Slider decorativo (posición fija) para ilustrar el pago inicial. */
function SliderVisual({ progress = 0.4 }: { progress?: number }) {
  return (
    <View style={styles.sliderTrack}>
      <View style={[styles.sliderFill, { width: `${progress * 100}%` }]} />
      <View style={[styles.sliderThumb, { left: `${progress * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  content: { paddingHorizontal: spacing.xl, paddingBottom: CONTENT_BOTTOM_INSET },

  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.sm },
  eyebrow: { ...typography.label, color: palette.primary },
  title: { ...typography.h1, color: palette.textPrimary, marginTop: spacing.sm },
  subtitle: { ...typography.body, color: palette.textSecondary, marginTop: spacing.xs },

  card: { marginTop: spacing.lg },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cardTitle: { ...typography.h2, fontSize: 18, color: palette.textPrimary },
  discountBadge: { backgroundColor: palette.successSoft, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: 3 },
  discountText: { ...typography.caption, color: palette.success, fontWeight: '700' },

  investLabel: { ...typography.caption, color: palette.textSecondary, marginTop: spacing.md },
  investRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm, marginTop: 2 },
  investValue: { ...typography.h1, color: palette.textPrimary },
  investOld: { ...typography.body, color: palette.textMuted, textDecorationLine: 'line-through', marginBottom: 4 },

  initialText: { ...typography.body, color: palette.textSecondary, marginTop: spacing.md },
  initialStrong: { color: palette.textPrimary, fontWeight: '700' },
  monthlyText: { ...typography.body, color: palette.textSecondary, marginTop: spacing.md },
  monthlyStrong: { color: palette.primary, fontWeight: '700' },

  sliderTrack: { height: 6, borderRadius: radius.pill, backgroundColor: palette.surfaceAlt, marginTop: spacing.md, justifyContent: 'center' },
  sliderFill: { position: 'absolute', left: 0, height: 6, borderRadius: radius.pill, backgroundColor: palette.primary },
  sliderThumb: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: palette.white,
    borderWidth: 3,
    borderColor: palette.primary,
    marginLeft: -9,
  },

  cardBtn: { marginTop: spacing.lg },
});
