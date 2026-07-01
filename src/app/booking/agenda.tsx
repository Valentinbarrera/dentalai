import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { CALENDAR_DAYS, TIME_SLOTS, TimeSlot } from '@/lib/specialists';
import { palette, radius, spacing, typography } from '@/theme/tokens';

export default function AgendaScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [day, setDay] = useState('d17');
  const [slot, setSlot] = useState('t3');

  const morning = TIME_SLOTS.filter((s) => s.period === 'morning');
  const afternoon = TIME_SLOTS.filter((s) => s.period === 'afternoon');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={palette.primary} />
        </Pressable>
        <Text style={styles.logo}>DentalAI</Text>
        <Pressable style={styles.iconBtn}>
          <Ionicons name="notifications-outline" size={20} color={palette.primary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Reservar Turno</Text>
        <Text style={styles.subtitle}>
          Seleccioná la fecha y el horario para tu consulta del análisis IA.
        </Text>

        {/* Selector de mes */}
        <View style={styles.monthBar}>
          <Pressable style={styles.monthArrow}>
            <Ionicons name="chevron-back" size={20} color={palette.textPrimary} />
          </Pressable>
          <Text style={styles.monthText}>Octubre 2023</Text>
          <Pressable style={styles.monthArrow}>
            <Ionicons name="chevron-forward" size={20} color={palette.textPrimary} />
          </Pressable>
        </View>

        {/* Días */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysRow}>
          {CALENDAR_DAYS.map((d) => {
            const active = d.id === day;
            return (
              <Pressable
                key={d.id}
                disabled={!d.available}
                onPress={() => setDay(d.id)}
                style={[styles.dayCard, active && styles.dayCardActive, !d.available && styles.dayDisabled]}>
                <Text style={[styles.dayLabel, active && styles.dayTextActive]}>{d.day}</Text>
                <Text style={[styles.dayNum, active && styles.dayTextActive]}>{d.date}</Text>
                {d.available && <View style={[styles.dayDot, active && styles.dayDotActive]} />}
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Horarios */}
        <View style={styles.slotsHeader}>
          <Ionicons name="time-outline" size={18} color={palette.primary} />
          <Text style={styles.slotsHeaderText}>Horarios Disponibles</Text>
        </View>

        <View style={styles.slotsGrid}>
          {morning.map((t) => (
            <SlotButton key={t.id} slot={t} selected={t.id === slot} onPress={() => setSlot(t.id)} />
          ))}
        </View>

        <View style={styles.periodDivider}>
          <View style={styles.periodLine} />
          <Text style={styles.periodText}>TARDE</Text>
          <View style={styles.periodLine} />
        </View>

        <View style={styles.slotsGrid}>
          {afternoon.map((t) => (
            <SlotButton key={t.id} slot={t} selected={t.id === slot} onPress={() => setSlot(t.id)} />
          ))}
        </View>
      </ScrollView>

      {/* CTA fijo */}
      <View style={[styles.ctaBar, { paddingBottom: insets.bottom + spacing.md }]}>
        <Button
          label="Continuar"
          left={<Ionicons name="arrow-forward" size={18} color={palette.white} />}
          onPress={() => router.push('/booking/payment')}
        />
      </View>
    </SafeAreaView>
  );
}

function SlotButton({ slot, selected, onPress }: { slot: TimeSlot; selected: boolean; onPress: () => void }) {
  const full = slot.status === 'full';
  return (
    <Pressable
      disabled={full}
      onPress={onPress}
      style={[styles.slot, selected && styles.slotSelected, full && styles.slotFull]}>
      {selected && <Ionicons name="checkmark-circle" size={16} color={palette.white} />}
      <Text style={[styles.slotText, selected && styles.slotTextSelected, full && styles.slotTextFull]}>
        {slot.label}
      </Text>
      {full && <Text style={styles.fullTag}>Lleno</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { ...typography.h2, fontSize: 20, color: palette.primary, fontWeight: '800' },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },

  title: { ...typography.h1, fontSize: 26, color: palette.textPrimary, marginTop: spacing.sm },
  subtitle: { ...typography.body, color: palette.textSecondary, marginTop: spacing.xs },

  monthBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.md,
    marginTop: spacing.xl,
  },
  monthArrow: { padding: spacing.sm },
  monthText: { ...typography.subtitle, color: palette.textPrimary },

  daysRow: { gap: spacing.md, marginTop: spacing.lg, paddingRight: spacing.xl },
  dayCard: {
    width: 66,
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    paddingVertical: spacing.lg,
    gap: 6,
  },
  dayCardActive: { backgroundColor: palette.primary, borderColor: palette.primary },
  dayDisabled: { opacity: 0.4 },
  dayLabel: { ...typography.caption, color: palette.textSecondary, fontWeight: '700' },
  dayNum: { ...typography.h2, fontSize: 20, color: palette.textPrimary },
  dayTextActive: { color: palette.white },
  dayDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: palette.primary },
  dayDotActive: { backgroundColor: palette.white },

  slotsHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing['2xl'] },
  slotsHeaderText: { ...typography.subtitle, color: palette.textPrimary },

  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.lg },
  slot: {
    flexBasis: '47%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: palette.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border,
    paddingVertical: spacing.lg,
  },
  slotSelected: { backgroundColor: palette.primary, borderColor: palette.primary },
  slotFull: { backgroundColor: palette.surfaceAlt, borderColor: palette.border },
  slotText: { ...typography.bodyStrong, color: palette.textPrimary },
  slotTextSelected: { color: palette.white },
  slotTextFull: { color: palette.textMuted, textDecorationLine: 'line-through' },
  fullTag: { ...typography.small, color: palette.danger, fontWeight: '700' },

  periodDivider: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing['2xl'] },
  periodLine: { flex: 1, height: 1, backgroundColor: palette.border },
  periodText: { ...typography.caption, color: palette.textSecondary, fontWeight: '700', letterSpacing: 1 },

  ctaBar: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    backgroundColor: palette.background,
    borderTopWidth: 1,
    borderTopColor: palette.border,
  },
});
