import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandBand } from '@/components/ui/brand-band';
import { PressableCard } from '@/components/ui/pressable-card';
import { Reveal } from '@/components/ui/reveal';
import { CONTENT_BOTTOM_INSET } from '@/constants/layout';
import { Specialist, SPECIALISTS, SPECIALTY_FILTERS } from '@/lib/specialists';
import { palette, radius, spacing, typography } from '@/theme/tokens';

export default function SpecialistsScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('Todos');

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <BrandBand
          title="Especialistas"
          subtitle="Encontrá tu profesional ideal"
          right={
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Filtros"
              hitSlop={8}
              style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}>
              <Ionicons name="options-outline" size={20} color={palette.white} />
            </Pressable>
          }
        />

        <View style={styles.inner}>
        {/* Búsqueda */}
        <Reveal index={0} style={styles.searchRow}>
          <View style={styles.searchInput}>
            <Ionicons name="search" size={18} color={palette.textMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Buscar especialista o clínica..."
              placeholderTextColor={palette.textMuted}
              style={styles.input}
            />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Buscar"
            style={({ pressed }) => [styles.searchBtn, pressed && styles.pressed]}>
            <Text style={styles.searchBtnText}>Buscar</Text>
          </Pressable>
        </Reveal>

        {/* Filtros */}
        <Reveal index={1}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filters}>
            {SPECIALTY_FILTERS.map((f) => {
              const active = f === filter;
              return (
                <Pressable
                  key={f}
                  onPress={() => setFilter(f)}
                  accessibilityRole="button"
                  accessibilityLabel={`Filtrar por ${f}`}
                  accessibilityState={{ selected: active }}
                  style={({ pressed }) => [
                    styles.filterChip,
                    active && styles.filterChipActive,
                    pressed && styles.pressed,
                  ]}>
                  <Text style={[styles.filterText, active && styles.filterTextActive]}>{f}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Reveal>

        {/* Lista */}
        <Reveal index={2} style={styles.list}>
          {SPECIALISTS.map((s) => (
            <SpecialistCard key={s.id} s={s} onSelect={() => router.push(`/booking/specialist?id=${s.id}`)} />
          ))}
        </Reveal>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SpecialistAvatar({ online, size = 64 }: { online?: boolean; size?: number }) {
  return (
    <View>
      <LinearGradient
        colors={[palette.primaryLight, palette.tealLight]}
        style={{ width: size, height: size, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="person" size={size * 0.5} color={palette.primary} />
      </LinearGradient>
      {online && <View style={styles.onlineDot} />}
    </View>
  );
}

function SpecialistCard({ s, onSelect }: { s: Specialist; onSelect: () => void }) {
  return (
    <PressableCard
      onPress={onSelect}
      accessibilityLabel={`Ver ${s.name}, ${s.specialty}`}>
      <View style={styles.cardTop}>
        <SpecialistAvatar online={s.online} />
        <View style={styles.cardInfo}>
          <Text style={styles.name}>{s.name}</Text>
          <Text style={styles.specialty}>{s.specialty}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color={palette.warning} />
            <Text style={styles.ratingText}>{s.rating.toFixed(1)}</Text>
            <Text style={styles.reviewsText}>({s.reviews} reviews)</Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardBottom}>
        <View style={styles.meta}>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={14} color={palette.textSecondary} />
            <Text style={styles.metaText}>
              {s.distanceKm} km • {s.clinic}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <MaterialCommunityIcons name="briefcase-outline" size={14} color={palette.textSecondary} />
            <Text style={styles.metaText}>Consulta: ${s.consulta}</Text>
          </View>
        </View>
        <Pressable
          onPress={onSelect}
          accessibilityRole="button"
          accessibilityLabel={`Seleccionar ${s.name}`}
          style={({ pressed }) => [styles.selectBtn, pressed && styles.pressed]}>
          <Text style={styles.selectBtnText}>Seleccionar</Text>
        </Pressable>
      </View>
    </PressableCard>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnPressed: { opacity: 0.6, backgroundColor: 'rgba(255,255,255,0.32)' },
  content: { paddingBottom: CONTENT_BOTTOM_INSET },
  inner: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm },

  searchRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  searchInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: palette.surface,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: spacing.lg,
  },
  input: { flex: 1, ...typography.body, color: palette.textPrimary, paddingVertical: spacing.md },
  searchBtn: {
    backgroundColor: palette.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  searchBtnText: { ...typography.bodyStrong, color: palette.white },

  filters: { gap: spacing.sm, paddingVertical: spacing.lg, paddingRight: spacing.xl },
  filterChip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  filterChipActive: { backgroundColor: palette.primary, borderColor: palette.primary },
  filterText: { ...typography.caption, color: palette.textSecondary, fontWeight: '600' },
  filterTextActive: { color: palette.white },

  list: { gap: spacing.lg },
  cardTop: { flexDirection: 'row', gap: spacing.md },
  cardInfo: { flex: 1 },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: palette.success,
    borderWidth: 2,
    borderColor: palette.surface,
  },
  name: { ...typography.subtitle, color: palette.textPrimary },
  specialty: { ...typography.caption, color: palette.primary, fontWeight: '600', marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.sm },
  ratingText: { ...typography.caption, color: palette.textPrimary, fontWeight: '700' },
  reviewsText: { ...typography.caption, color: palette.textMuted },

  divider: { height: 1, backgroundColor: palette.border, marginVertical: spacing.md },

  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  meta: { gap: 4, flex: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { ...typography.caption, color: palette.textSecondary },
  selectBtn: {
    backgroundColor: palette.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  selectBtnText: { ...typography.bodyStrong, color: palette.white },

  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
});
