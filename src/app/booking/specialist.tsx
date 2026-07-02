import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Foto header */}
        <LinearGradient colors={[palette.primary, palette.teal]} style={styles.photo}>
          <Ionicons name="person" size={96} color="rgba(255,255,255,0.85)" />
        </LinearGradient>

        {/* Botones overlay */}
        <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Volver"
            style={({ pressed }) => [styles.roundBtn, pressed && styles.roundBtnPressed]}>
            <Ionicons name="arrow-back" size={22} color={palette.primary} />
          </Pressable>
          <View style={styles.topRight}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Agregar a favoritos"
              style={({ pressed }) => [styles.roundBtn, pressed && styles.roundBtnPressed]}>
              <Ionicons name="heart-outline" size={20} color={palette.danger} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Compartir perfil"
              style={({ pressed }) => [styles.roundBtn, pressed && styles.roundBtnPressed]}>
              <Ionicons name="share-social-outline" size={20} color={palette.primary} />
            </Pressable>
          </View>
        </View>

        <View style={styles.body}>
          {/* Nombre + rating */}
          <Reveal index={0}>
            <View style={styles.nameRow}>
              <View style={styles.flex}>
                <Text style={styles.name}>{s.name}</Text>
                <Text style={styles.specialty}>Especialista en {s.specialty.split(' ')[0]}</Text>
              </View>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={14} color={palette.warning} />
                <Text style={styles.ratingText}>
                  {s.rating.toFixed(1)} ({s.reviews})
                </Text>
              </View>
            </View>

            {/* Tags */}
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
              <Stat icon="briefcase-outline" value={`${s.experienceYears} Años`} label="Experiencia" />
              <View style={styles.statDivider} />
              <Stat icon="school-outline" value={s.university} label="Egresada" />
              <View style={styles.statDivider} />
              <Stat icon="people-outline" value={s.patients} label="Pacientes" />
            </Card>
          </Reveal>

          {/* Sobre mí */}
          <Reveal index={2}>
            <Text style={styles.sectionTitle}>Sobre mí</Text>
            <Text style={styles.about}>{s.about}</Text>
          </Reveal>

          {/* Reseñas */}
          <Reveal index={3}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.sectionTitle}>Reseñas</Text>
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
            <Text style={styles.sectionTitle}>Horarios Disponibles</Text>
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
              onPress={() => router.push('/booking/agenda')}
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
          onPress={() => router.push('/booking/agenda')}
        />
      </View>
    </View>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  value: string;
  label: string;
}) {
  return (
    <View style={styles.stat}>
      <View style={styles.statIcon}>
        <Ionicons name={icon} size={20} color={palette.teal} />
      </View>
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
  flex: { flex: 1 },
  photo: { height: 240, alignItems: 'center', justifyContent: 'center' },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  topRight: { flexDirection: 'row', gap: spacing.sm },
  roundBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundBtnPressed: { opacity: 0.7, transform: [{ scale: 0.94 }] },

  body: {
    backgroundColor: palette.background,
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    marginTop: -24,
    paddingTop: spacing['2xl'],
    paddingHorizontal: spacing.xl,
  },
  nameRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  name: { ...typography.h1, fontSize: 26, color: palette.textPrimary },
  specialty: { ...typography.body, color: palette.textSecondary, marginTop: 2 },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: palette.surface,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    marginTop: 4,
  },
  ratingText: { ...typography.caption, color: palette.textPrimary, fontWeight: '700' },

  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.lg },
  tag: { backgroundColor: palette.primarySoft, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: 6 },
  tagText: { ...typography.caption, color: palette.primary, fontWeight: '600' },

  statsCard: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xl },
  stat: { flex: 1, alignItems: 'center', gap: 4 },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.tealSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statValue: { ...typography.subtitle, color: palette.textPrimary },
  statLabel: { ...typography.caption, color: palette.textSecondary },
  statDivider: { width: 1, height: 48, backgroundColor: palette.border },

  sectionTitle: { ...typography.h2, fontSize: 20, color: palette.textPrimary, marginTop: spacing['2xl'] },
  about: { ...typography.body, color: palette.textSecondary, marginTop: spacing.md },

  reviewsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  link: { ...typography.bodyStrong, color: palette.primary, marginTop: spacing['2xl'] },
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
