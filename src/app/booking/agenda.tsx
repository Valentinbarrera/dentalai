import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandBand } from '@/components/ui/brand-band';
import { Button } from '@/components/ui/button';
import { GradientIcon } from '@/components/ui/gradient-icon';
import { PressableCard } from '@/components/ui/pressable-card';
import { Reveal } from '@/components/ui/reveal';
import { CALENDAR_DAYS, TIME_SLOTS, TimeSlot } from '@/lib/specialists';
import { palette, radius, spacing, typography } from '@/theme/tokens';

/** Construye un ISO string real a partir del día y horario elegidos en el mock.
 *  El calendario del mock corresponde a Octubre 2023 (ver el selector de mes). */
function buildStartsAtISO(dayId: string, slotId: string): string {
  const d = CALENDAR_DAYS.find((c) => c.id === dayId) ?? CALENDAR_DAYS[0];
  const t = TIME_SLOTS.find((s) => s.id === slotId) ?? TIME_SLOTS[0];
  const match = t.label.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  let hours = 9;
  let minutes = 0;
  if (match) {
    hours = Number(match[1]);
    minutes = Number(match[2]);
    const meridiem = match[3].toUpperCase();
    if (meridiem === 'PM' && hours !== 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;
  }
  return new Date(2023, 9, d.date, hours, minutes).toISOString();
}

export default function AgendaScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Odontólogo elegido en la pantalla anterior. `dentistId` es el usuario real
  // (auth.users) y se propaga para poder guardar el turno con una FK válida;
  // specialistId/Name/Subtitle se propagan para el DISPLAY del turno.
  const { dentistId, specialistId, specialistName, specialistSubtitle } = useLocalSearchParams<{
    dentistId?: string;
    specialistId?: string;
    specialistName?: string;
    specialistSubtitle?: string;
  }>();

  const [day, setDay] = useState('d17');
  const [slot, setSlot] = useState('t3');

  const morning = TIME_SLOTS.filter((s) => s.period === 'morning');
  const afternoon = TIME_SLOTS.filter((s) => s.period === 'afternoon');

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <StatusBar style="light" />
      {/* Header de marca */}
      <BrandBand
        onBack={() => router.back()}
        title="Reservar Turno"
        subtitle="Elegí la fecha y el horario para tu consulta del análisis IA."
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Selector de mes */}
        <Reveal index={0}>
          <View style={styles.monthBar}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Mes anterior"
              style={({ pressed }) => [styles.monthArrow, pressed && styles.monthArrowPressed]}>
              <Ionicons name="chevron-back" size={20} color={palette.textPrimary} />
            </Pressable>
            <Text style={styles.monthText}>Octubre 2023</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Mes siguiente"
              style={({ pressed }) => [styles.monthArrow, pressed && styles.monthArrowPressed]}>
              <Ionicons name="chevron-forward" size={20} color={palette.textPrimary} />
            </Pressable>
          </View>

          {/* Días */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysRow}>
            {CALENDAR_DAYS.map((d) => {
              const active = d.id === day;
              return (
                <PressableCard
                  key={d.id}
                  flat
                  padded={false}
                  disabled={!d.available}
                  onPress={() => setDay(d.id)}
                  accessibilityLabel={`${d.day} ${d.date}${d.available ? '' : ', no disponible'}`}
                  accessibilityState={{ selected: active, disabled: !d.available }}
                  style={[styles.dayCard, active && styles.dayCardActive, !d.available && styles.dayDisabled] as ViewStyle[]}>
                  <Text style={[styles.dayLabel, active && styles.dayTextActive]}>{d.day}</Text>
                  <Text style={[styles.dayNum, active && styles.dayTextActive]}>{d.date}</Text>
                  {d.available && <View style={[styles.dayDot, active && styles.dayDotActive]} />}
                </PressableCard>
              );
            })}
          </ScrollView>
        </Reveal>

        {/* Horarios */}
        <Reveal index={1}>
          <View style={styles.slotsHeader}>
            <View style={styles.accentBar} />
            <GradientIcon gradient={[palette.teal, palette.primary]} size={32} borderRadius={radius.sm}>
              <Ionicons name="time-outline" size={18} color={palette.white} />
            </GradientIcon>
            <Text style={styles.slotsHeaderText}>Horarios Disponibles</Text>
          </View>

          {morning.length + afternoon.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="calendar-clear-outline" size={40} color={palette.textMuted} />
              <Text style={styles.emptyTitle}>Sin horarios disponibles</Text>
              <Text style={styles.emptyText}>Probá con otra fecha para ver turnos libres.</Text>
            </View>
          ) : (
            <>
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
            </>
          )}
        </Reveal>
      </ScrollView>

      {/* CTA fijo */}
      <View style={[styles.ctaBar, { paddingBottom: insets.bottom + spacing.md }]}>
        <Button
          label="Continuar"
          left={<Ionicons name="arrow-forward" size={18} color={palette.white} />}
          onPress={() =>
            router.push({
              pathname: '/booking/payment',
              params: {
                dentistId,
                specialistId,
                specialistName,
                specialistSubtitle,
                startsAt: buildStartsAtISO(day, slot),
              },
            })
          }
        />
      </View>
    </SafeAreaView>
  );
}

function SlotButton({ slot, selected, onPress }: { slot: TimeSlot; selected: boolean; onPress: () => void }) {
  const full = slot.status === 'full';
  return (
    <PressableCard
      flat
      padded={false}
      disabled={full}
      onPress={onPress}
      accessibilityLabel={`Horario ${slot.label}${full ? ', lleno' : ''}`}
      accessibilityState={{ selected, disabled: full }}
      style={[styles.slot, selected && styles.slotSelected, full && styles.slotFull] as ViewStyle[]}>
      {selected && <Ionicons name="checkmark-circle" size={16} color={palette.white} />}
      <Text style={[styles.slotText, selected && styles.slotTextSelected, full && styles.slotTextFull]}>
        {slot.label}
      </Text>
      {full && <Text style={styles.fullTag}>Lleno</Text>}
    </PressableCard>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl, paddingTop: spacing.xl },

  accentBar: { width: 4, height: 18, borderRadius: radius.pill, backgroundColor: palette.teal },

  monthBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.md,
  },
  monthArrow: { padding: spacing.sm, borderRadius: radius.sm },
  monthArrowPressed: { opacity: 0.6, backgroundColor: palette.surfaceAlt },
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

  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing['3xl'],
    marginTop: spacing.lg,
  },
  emptyTitle: { ...typography.subtitle, color: palette.textPrimary, marginTop: spacing.sm },
  emptyText: { ...typography.caption, color: palette.textSecondary, textAlign: 'center' },

  ctaBar: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    backgroundColor: palette.background,
    borderTopWidth: 1,
    borderTopColor: palette.border,
  },
});
