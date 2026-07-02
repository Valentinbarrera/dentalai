import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandBand } from '@/components/ui/brand-band';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GradientIcon } from '@/components/ui/gradient-icon';
import { PressableCard } from '@/components/ui/pressable-card';
import { Reveal } from '@/components/ui/reveal';
import { palette, radius, spacing, typography } from '@/theme/tokens';

type Method = { id: string; label: string; icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'] };

const METHODS: Method[] = [
  { id: 'card', label: 'Tarjeta', icon: 'credit-card-outline' },
  { id: 'transfer', label: 'Transferencia', icon: 'bank-outline' },
  { id: 'financing', label: 'Financiación', icon: 'hand-coin-outline' },
  { id: 'bitcoin', label: 'Bitcoin', icon: 'bitcoin' },
  { id: 'ethereum', label: 'Ethereum', icon: 'ethereum' },
  { id: 'usdt', label: 'USDT', icon: 'currency-usd' },
];

const ORDER = [
  { label: 'Consulta', value: '$150.00' },
  { label: 'Escaneo Diagnóstico IA', value: '$80.00' },
  { label: 'Impuestos y cargos', value: '$20.00' },
];

export default function PaymentScreen() {
  const router = useRouter();
  const [method, setMethod] = useState('card');

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <StatusBar style="light" />
      <BrandBand
        onBack={() => router.back()}
        title="Resumen de Pago"
        subtitle="Revisá los detalles de tu turno y elegí cómo pagar."
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Detalles del turno */}
        <Reveal index={0}>
        <Card style={styles.card}>
          <View style={styles.headingRow}>
            <View style={styles.accentBar} />
            <Text style={styles.cardTitle}>Detalles del Turno</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.apptRow}>
            <GradientIcon gradient={[palette.teal, palette.primary]} size={44} borderRadius={radius.md}>
              <MaterialCommunityIcons name="tooth" size={22} color={palette.white} />
            </GradientIcon>
            <View style={styles.flex}>
              <Text style={styles.apptName}>Examen y Limpieza IA Completo</Text>
              <Text style={styles.apptSub}>Dra. Elena Santos • DentalAI Clínica Central</Text>
            </View>
          </View>
          <View style={styles.apptMetaBox}>
            <View style={styles.flex}>
              <Text style={styles.metaLabel}>FECHA Y HORA</Text>
              <Text style={styles.metaValue}>24 Oct, 2023 • 10:00 AM</Text>
            </View>
            <View style={styles.flex}>
              <Text style={styles.metaLabel}>DURACIÓN</Text>
              <Text style={styles.metaValue}>45 Minutos</Text>
            </View>
          </View>
        </Card>
        </Reveal>

        {/* Método de pago */}
        <Reveal index={1}>
        <Card style={styles.card}>
          <View style={styles.headingRow}>
            <View style={styles.accentBar} />
            <Text style={styles.cardTitle}>Método de Pago</Text>
          </View>
          <View style={styles.methodsGrid}>
            {METHODS.map((m) => {
              const active = m.id === method;
              return (
                <PressableCard
                  key={m.id}
                  flat
                  padded={false}
                  onPress={() => setMethod(m.id)}
                  accessibilityLabel={`Pagar con ${m.label}`}
                  accessibilityState={{ selected: active }}
                  style={[styles.method, active && styles.methodActive] as ViewStyle[]}>
                  <MaterialCommunityIcons
                    name={m.icon}
                    size={22}
                    color={active ? palette.primary : palette.textSecondary}
                  />
                  <Text style={[styles.methodLabel, active && styles.methodLabelActive]}>{m.label}</Text>
                </PressableCard>
              );
            })}
          </View>

          {method === 'card' ? (
            <View style={styles.form}>
              <Field label="Número de tarjeta" placeholder="0000 0000 0000 0000" icon="card-outline" keyboardType="number-pad" />
              <View style={styles.formRow}>
                <View style={styles.flex}>
                  <Field label="Vencimiento" placeholder="MM/YY" />
                </View>
                <View style={styles.flex}>
                  <Field label="CVC" placeholder="123" keyboardType="number-pad" />
                </View>
              </View>
              <Field label="Nombre del titular" placeholder="Juan Pérez" />
              <Text style={styles.formLabel}>Cuotas</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Seleccionar cuotas: Pago único"
                style={({ pressed }) => [styles.select, pressed && styles.selectPressed]}>
                <Text style={styles.selectText}>Pago único ($250.00)</Text>
                <Ionicons name="chevron-down" size={18} color={palette.textSecondary} />
              </Pressable>
            </View>
          ) : (
            <View style={styles.altNote}>
              <Ionicons name="information-circle-outline" size={18} color={palette.primary} />
              <Text style={styles.altNoteText}>
                Al confirmar se generarán los datos {method === 'transfer' ? 'de la transferencia' : 'del pago'} y un
                código para completar la operación.
              </Text>
            </View>
          )}
        </Card>
        </Reveal>

        {/* Resumen de orden */}
        <Reveal index={2}>
        <Card style={styles.card}>
          <View style={styles.headingRow}>
            <View style={styles.accentBar} />
            <Text style={styles.cardTitle}>Resumen de Orden</Text>
          </View>
          {ORDER.map((o) => (
            <View key={o.label} style={styles.orderRow}>
              <Text style={styles.orderLabel}>{o.label}</Text>
              <Text style={styles.orderValue}>{o.value}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <View style={styles.totalRight}>
              <Text style={styles.totalValue}>$250.00</Text>
              <Text style={styles.totalNote}>Incluye impuestos aplicables</Text>
            </View>
          </View>
          <View style={styles.secureRow}>
            <Ionicons name="lock-closed" size={14} color={palette.teal} />
            <Text style={styles.secureText}>Pagos seguros y encriptados.</Text>
          </View>
          <Button
            label="Pagar $250.00"
            left={<Ionicons name="lock-closed" size={16} color={palette.white} />}
            onPress={() => router.push('/booking/confirmation')}
            style={styles.payBtn}
          />
        </Card>
        </Reveal>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({
  label,
  placeholder,
  icon,
  keyboardType,
}: {
  label: string;
  placeholder: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  keyboardType?: 'number-pad';
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.formLabel}>{label}</Text>
      <View style={styles.inputWrap}>
        {icon && <Ionicons name={icon} size={18} color={palette.textMuted} />}
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={palette.textMuted}
          keyboardType={keyboardType}
          style={styles.input}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  flex: { flex: 1 },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing['3xl'], paddingTop: spacing.xl },

  headingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  accentBar: { width: 4, height: 18, borderRadius: radius.pill, backgroundColor: palette.teal },

  card: { marginTop: spacing.lg },
  cardTitle: { ...typography.h2, fontSize: 20, color: palette.textPrimary },
  divider: { height: 1, backgroundColor: palette.border, marginVertical: spacing.md },

  apptRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  apptName: { ...typography.subtitle, color: palette.textPrimary },
  apptSub: { ...typography.caption, color: palette.textSecondary, marginTop: 2 },
  apptMetaBox: {
    flexDirection: 'row',
    gap: spacing.lg,
    backgroundColor: palette.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  metaLabel: { fontSize: 10, color: palette.textMuted, fontWeight: '700', letterSpacing: 0.5 },
  metaValue: { ...typography.bodyStrong, color: palette.textPrimary, marginTop: 4 },

  methodsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.lg },
  method: {
    flexBasis: '47%',
    flexGrow: 1,
    alignItems: 'center',
    gap: 6,
    backgroundColor: palette.surfaceAlt,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
    paddingVertical: spacing.lg,
  },
  methodActive: { borderColor: palette.primary, backgroundColor: palette.primarySoft },
  methodLabel: { ...typography.caption, color: palette.textSecondary, fontWeight: '600' },
  methodLabelActive: { color: palette.primary },

  form: { marginTop: spacing.lg, gap: spacing.md },
  formRow: { flexDirection: 'row', gap: spacing.md },
  field: { gap: 6 },
  formLabel: { ...typography.caption, color: palette.textPrimary, fontWeight: '600' },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: palette.surfaceAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: spacing.md,
  },
  input: { flex: 1, ...typography.body, color: palette.textPrimary, paddingVertical: spacing.md },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: palette.surfaceAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  selectPressed: { opacity: 0.85, borderColor: palette.primaryLight },
  selectText: { ...typography.body, color: palette.textPrimary },
  altNote: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: palette.primarySoft,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  altNoteText: { ...typography.caption, color: palette.textSecondary, flex: 1, lineHeight: 19 },

  orderRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md },
  orderLabel: { ...typography.body, color: palette.textSecondary },
  orderValue: { ...typography.bodyStrong, color: palette.textPrimary },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  totalLabel: { ...typography.h2, fontSize: 20, color: palette.textPrimary },
  totalRight: { alignItems: 'flex-end' },
  totalValue: { ...typography.h1, color: palette.primary },
  totalNote: { ...typography.small, color: palette.textMuted, fontWeight: '600' },
  secureRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.lg },
  secureText: { ...typography.caption, color: palette.teal, fontWeight: '600' },
  payBtn: { marginTop: spacing.lg },
});
