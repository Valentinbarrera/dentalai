import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandHeader } from '@/components/ui/brand-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Reveal } from '@/components/ui/reveal';
import { CONTENT_BOTTOM_INSET } from '@/constants/layout';
import { BUDGET_ITEMS, BUDGET_SUMMARY, FINANCING_OPTIONS } from '@/lib/diagnosis';
import { palette, radius, spacing, typography } from '@/theme/tokens';

export default function PresupuestoScreen() {
  const router = useRouter();
  const [financing, setFinancing] = useState('f24');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <BrandHeader />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Reveal index={0}>
          <Text style={styles.title}>Detalle del Presupuesto</Text>
        </Reveal>

        {/* Plan seleccionado */}
        <Reveal index={1}>
        <Card style={styles.planCard}>
          <LinearGradient colors={['#0D9488', '#2563EB']} style={styles.planImg}>
            <MaterialCommunityIcons name="tooth" size={40} color="rgba(255,255,255,0.9)" />
          </LinearGradient>
          <View style={styles.flex}>
            <View style={styles.recBadge}>
              <MaterialCommunityIcons name="star-four-points" size={11} color={palette.white} />
              <Text style={styles.recText}>RECOMENDADO</Text>
            </View>
            <Text style={styles.planName}>Implantes + Coronas</Text>
            <Text style={styles.planDesc}>Solución permanente de alta estética y funcionalidad máxima.</Text>
            <Text style={styles.planTotal}>
              Total <Text style={styles.planTotalValue}>{BUDGET_SUMMARY.total}</Text>
            </Text>
          </View>
        </Card>
        </Reveal>

        {/* Desglose */}
        <Reveal index={2}>
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Desglose del Presupuesto</Text>
          <View style={styles.divider} />
          {BUDGET_ITEMS.map((it) => (
            <View key={it.id} style={styles.itemRow}>
              <View style={styles.flex}>
                <Text style={styles.itemLabel}>
                  {it.qty ? `${it.qty} ` : ''}
                  {it.label}
                </Text>
                <View style={styles.noteRow}>
                  <Ionicons name="document-text-outline" size={12} color={palette.textMuted} />
                  <Text style={styles.itemNote}>Nota Clínica: {it.note}</Text>
                </View>
              </View>
              <Text style={styles.itemPrice}>{it.price}</Text>
            </View>
          ))}
        </Card>
        </Reveal>

        {/* Resumen */}
        <Reveal index={3}>
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Resumen</Text>
          <View style={styles.sumRow}>
            <Text style={styles.sumLabel}>Subtotal</Text>
            <Text style={styles.sumValue}>{BUDGET_SUMMARY.subtotal}</Text>
          </View>
          <View style={styles.sumRow}>
            <Text style={styles.sumLabel}>Impuestos (IVA)</Text>
            <Text style={styles.sumValue}>{BUDGET_SUMMARY.tax}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.sumRow}>
            <Text style={styles.totalLabel}>PRECIO TOTAL FINAL:</Text>
            <Text style={styles.totalValue}>{BUDGET_SUMMARY.total}</Text>
          </View>
        </Card>
        </Reveal>

        {/* Financiamiento */}
        <Reveal index={4}>
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Opciones de Financiamiento</Text>
          <View style={styles.financeList}>
            {FINANCING_OPTIONS.map((f) => {
              const active = f.id === financing;
              return (
                <Pressable
                  key={f.id}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={`${f.months}, ${f.monthly}, ${f.note}`}
                  onPress={() => setFinancing(f.id)}
                  style={({ pressed }) => [
                    styles.finance,
                    active && styles.financeActive,
                    pressed && styles.pressed,
                  ]}>
                  <Ionicons
                    name={active ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color={active ? palette.primary : palette.textMuted}
                  />
                  <Text style={styles.financeText}>
                    {f.months}: <Text style={styles.financeStrong}>{f.monthly}</Text> ({f.note})
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>
        </Reveal>

        <Reveal index={5}>
          <Button
            label="Confirmar y Agendar"
            left={<Ionicons name="checkmark-circle" size={18} color={palette.white} />}
            onPress={() => router.push('/diagnosis/pago-opciones')}
            style={styles.confirmBtn}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ver videos educativos del tratamiento"
            onPress={() => router.push('/videos')}
            style={({ pressed }) => [styles.videosLink, pressed && styles.pressed]}>
            <Ionicons name="play-circle-outline" size={16} color={palette.primary} />
            <Text style={styles.videosLinkText}>Ver videos educativos del tratamiento</Text>
          </Pressable>
        </Reveal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  flex: { flex: 1 },
  content: { paddingHorizontal: spacing.xl, paddingBottom: CONTENT_BOTTOM_INSET },
  title: { ...typography.h1, color: palette.textPrimary, marginTop: spacing.sm },

  planCard: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  planImg: { width: 72, height: 72, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  recBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    alignSelf: 'flex-start',
    backgroundColor: palette.teal,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  recText: { fontSize: 9, color: palette.white, fontWeight: '800', letterSpacing: 0.3 },
  planName: { ...typography.subtitle, color: palette.textPrimary, marginTop: 4 },
  planDesc: { ...typography.caption, color: palette.textSecondary, marginTop: 2 },
  planTotal: { ...typography.caption, color: palette.textSecondary, marginTop: spacing.sm },
  planTotalValue: { ...typography.subtitle, color: palette.textPrimary, fontWeight: '800' },

  card: { marginTop: spacing.lg },
  cardTitle: { ...typography.h2, fontSize: 18, color: palette.textPrimary },
  divider: { height: 1, backgroundColor: palette.border, marginVertical: spacing.md },

  itemRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingVertical: spacing.sm, gap: spacing.md },
  itemLabel: { ...typography.bodyStrong, color: palette.textPrimary },
  noteRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  itemNote: { ...typography.small, color: palette.textMuted },
  itemPrice: { ...typography.bodyStrong, color: palette.textPrimary },

  sumRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  sumLabel: { ...typography.body, color: palette.textSecondary },
  sumValue: { ...typography.bodyStrong, color: palette.textPrimary },
  totalLabel: { ...typography.subtitle, color: palette.textPrimary, fontWeight: '800' },
  totalValue: { ...typography.h2, fontSize: 20, color: palette.primary },

  financeList: { gap: spacing.md, marginTop: spacing.sm },
  finance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: palette.border,
    padding: spacing.md,
  },
  financeActive: { borderColor: palette.primary, backgroundColor: palette.primarySoft },
  pressed: { opacity: 0.7 },
  financeText: { ...typography.body, color: palette.textSecondary, flex: 1 },
  financeStrong: { color: palette.textPrimary, fontWeight: '700' },

  confirmBtn: { marginTop: spacing.xl },
  videosLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: spacing.lg },
  videosLinkText: { ...typography.bodyStrong, color: palette.primary },
});
