import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandBand } from '@/components/ui/brand-band';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GradientIcon } from '@/components/ui/gradient-icon';
import { PressableCard } from '@/components/ui/pressable-card';
import { Reveal } from '@/components/ui/reveal';
import { getSpecialist, QUICK_SLOTS, REVIEWS, Review } from '@/lib/specialists';
import { palette, radius, shadow, spacing, typography } from '@/theme/tokens';

export default function SpecialistProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const s = getSpecialist(id);

  const [slot, setSlot] = useState(QUICK_SLOTS[1].id);

  // Datos del especialista mock que se propagan por el flujo de booking para el DISPLAY.
  // TODO(Fase 4): mapear este especialista mock a un odontólogo real (auth.users) para
  // poder mandar un `dentistId` real al guardado del turno.
  const specialistParams = {
    specialistId: s.id,
    specialistName: s.name,
    specialistSubtitle: `Especialista en ${s.specialty.split(' ')[0]}`,
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header de marca */}
        <BrandBand
          onBack={() => router.back()}
          title={s.name}
          subtitle={`Especialista en ${s.specialty.split(' ')[0]}`}
          right={
            <View style={styles.headerActions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Agregar a favoritos"
                hitSlop={8}
                style={({ pressed }) => [styles.glassBtn, pressed && styles.glassBtnPressed]}>
                <Ionicons name="heart-outline" size={20} color={palette.white} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Compartir perfil"
                hitSlop={8}
                style={({ pressed }) => [styles.glassBtn, pressed && styles.glassBtnPressed]}>
                <Ionicons name="share-social-outline" size={20} color={palette.white} />
              </Pressable>
            </View>
          }>
          <View style={styles.heroChips}>
            <View style={styles.heroChip}>
              <Ionicons name="star" size={13} color={palette.warning} />
              <Text style={styles.heroChipText}>
                {s.rating.toFixed(1)} ({s.reviews})
              </Text>
            </View>
            <View style={styles.heroChip}>
              <Ionicons name="location-outline" size={13} color={palette.white} />
              <Text style={styles.heroChipText}>{s.distanceKm} km · {s.clinic}</Text>
            </View>
            {s.online ? (
              <View style={styles.heroChip}>
                <View style={styles.onlineDot} />
                <Text style={styles.heroChipText}>En línea</Text>
              </View>
            ) : null}
          </View>
        </BrandBand>

        <View style={styles.body}>
          {/* Tags */}
          <Reveal index={0}>
            <View style={styles.tags}>
              {s.tags.map((t) => (
                <View key={t} style={styles.tag}>
                  <Text style={styles.tagText}>{t}</Text>
                </View>
              ))}
            </View>
          </Reveal>

          {/* Stats */}
          <Reveal index={1}>
            <Card style={styles.statsCard} flat>
              <Stat icon="briefcase-outline" value={`${s.experienceYears} Años`} label="Experiencia" gradient={[palette.teal, palette.primary]} />
              <View style={styles.statDivider} />
              <Stat icon="school-outline" value={s.university} label="Egresada" gradient={[palette.primary, palette.navy]} />
              <View style={styles.statDivider} />
              <Stat icon="people-outline" value={s.patients} label="Pacientes" gradient={[palette.teal, palette.tealDark]} />
            </Card>
          </Reveal>

          {/* Sobre mí */}
          <Reveal index={2}>
            <View style={styles.headingRow}>
              <View style={styles.accentBar} />
              <Text style={styles.sectionTitle}>Sobre mí</Text>
            </View>
            <Text style={styles.about}>{s.about}</Text>
          </Reveal>

          {/* Reseñas */}
          <Reveal index={3}>
            <View style={styles.reviewsHeader}>
              <View style={styles.headingRow}>
                <View style={styles.accentBar} />
                <Text style={styles.sectionTitle}>Reseñas</Text>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel="Ver todas las reseñas">
                <Text style={styles.link}>Ver todas</Text>
              </Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.reviewsRow}>
              {REVIEWS.map((r) => (
                <ReviewCard key={r.id} r={r} />
              ))}
            </ScrollView>
            <Button
              label="Escribir una reseña"
              variant="outline"
              left={<Ionicons name="star-outline" size={18} color={palette.primary} />}
              onPress={() => router.push(`/booking/rate?id=${s.id}`)}
              style={styles.reviewBtn}
            />
          </Reveal>

          {/* Horarios */}
          <Reveal index={4}>
            <View style={styles.headingRow}>
              <View style={styles.accentBar} />
              <Text style={styles.sectionTitle}>Horarios Disponibles</Text>
            </View>
            <Text style={styles.weekLabel}>Próxima semana</Text>
            <View style={styles.slotsRow}>
              {QUICK_SLOTS.map((q) => {
                const active = q.id === slot;
                return (
                  <PressableCard
                    key={q.id}
                    onPress={() => setSlot(q.id)}
                    flat
                    padded={false}
                    accessibilityLabel={`Horario ${q.day} ${q.time}`}
                    accessibilityState={{ selected: active }}
                    style={[styles.slot, active && styles.slotActive] as ViewStyle[]}>
                    <Text style={[styles.slotDay, active && styles.slotTextActive]}>{q.day}</Text>
                    <Text style={[styles.slotTime, active && styles.slotTextActive]}>{q.time}</Text>
                  </PressableCard>
                );
              })}
            </View>
            <Pressable
              onPress={() => router.push({ pathname: '/booking/agenda', params: specialistParams })}
              accessibilityRole="button"
              accessibilityLabel="Ver calendario completo"
              style={({ pressed }) => [styles.calendarBtn, pressed && styles.calendarBtnPressed]}>
              <Ionicons name="calendar-outline" size={16} color={palette.primary} />
              <Text style={styles.calendarBtnText}>Ver calendario completo</Text>
            </Pressable>
          </Reveal>
        </View>
      </ScrollView>

      {/* CTA fijo */}
      <View style={[styles.ctaBar, { paddingBottom: insets.bottom + spacing.md }]}>
        <Button
          label="Reservar turno"
          left={<Ionicons name="arrow-forward" size={18} color={palette.white} />}
          onPress={() => router.push({ pathname: '/booking/agenda', params: specialistParams })}
        />
      </View>
    </View>
  );
}

function Stat({
  icon,
  value,
  label,
  gradient,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  value: string;
  label: string;
  gradient: readonly [string, string];
}) {
  return (
    <View style={styles.stat}>
      <GradientIcon gradient={gradient} size={44} borderRadius={22} style={styles.statIcon}>
        <Ionicons name={icon} size={20} color={palette.white} />
      </GradientIcon>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ReviewCard({ r }: { r: Review }) {
  return (
    <Card style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewAvatar}>
          <Text style={styles.reviewInitial}>{r.initial}</Text>
        </View>
        <Text style={styles.reviewName}>{r.name}</Text>
      </View>
      <View style={styles.stars}>
        {Array.from({ length: r.rating }).map((_, i) => (
          <Ionicons key={i} name="star" size={13} color={palette.success} />
        ))}
      </View>
      <Text style={styles.reviewText}>“{r.text}”</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.background },

  headerActions: { flexDirection: 'row', gap: spacing.sm },
  glassBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassBtnPressed: { opacity: 0.6, backgroundColor: 'rgba(255,255,255,0.32)' },

  heroChips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.lg },
  heroChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  heroChipText: { ...typography.caption, color: palette.white, fontWeight: '700' },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: palette.tealLight },

  body: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl },

  headingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing['2xl'] },
  accentBar: { width: 4, height: 18, borderRadius: radius.pill, backgroundColor: palette.teal },

  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tag: { backgroundColor: palette.primarySoft, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: 6 },
  tagText: { ...typography.caption, color: palette.primary, fontWeight: '600' },

  statsCard: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xl },
  stat: { flex: 1, alignItems: 'center', gap: 4 },
  statIcon: { marginBottom: 4 },
  statValue: { ...typography.subtitle, color: palette.textPrimary },
  statLabel: { ...typography.caption, color: palette.textSecondary },
  statDivider: { width: 1, height: 48, backgroundColor: palette.border },

  sectionTitle: { ...typography.h2, fontSize: 20, color: palette.textPrimary },
  about: { ...typography.body, color: palette.textSecondary, marginTop: spacing.md },

  reviewsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing['2xl'] },
  link: { ...typography.bodyStrong, color: palette.primary },
  reviewsRow: { gap: spacing.md, marginTop: spacing.md, paddingRight: spacing.xl },
  reviewCard: { width: 260 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  reviewAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: palette.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewInitial: { ...typography.bodyStrong, color: palette.primary },
  reviewName: { ...typography.bodyStrong, color: palette.textPrimary },
  stars: { flexDirection: 'row', gap: 2, marginTop: spacing.sm },
  reviewText: { ...typography.caption, color: palette.textSecondary, marginTop: spacing.sm, lineHeight: 19 },
  reviewBtn: { marginTop: spacing.lg },

  weekLabel: { ...typography.caption, color: palette.textSecondary, marginTop: spacing.sm },
  slotsRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  slot: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border,
    paddingVertical: spacing.md,
    gap: 4,
  },
  slotActive: { backgroundColor: palette.primary, borderColor: palette.primary },
  slotDay: { ...typography.caption, color: palette.textSecondary, fontWeight: '600' },
  slotTime: { ...typography.subtitle, color: palette.textPrimary },
  slotTextActive: { color: palette.white },
  calendarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: palette.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border,
    paddingVertical: spacing.md,
    marginTop: spacing.md,
  },
  calendarBtnPressed: { opacity: 0.85, backgroundColor: palette.primarySoft },
  calendarBtnText: { ...typography.bodyStrong, color: palette.primary },

  ctaBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    backgroundColor: palette.background,
    borderTopWidth: 1,
    borderTopColor: palette.border,
    ...shadow.card,
  },
});
