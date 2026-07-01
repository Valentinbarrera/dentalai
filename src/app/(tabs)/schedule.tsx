import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/card';
import { CONTENT_BOTTOM_INSET } from '@/constants/layout';
import { Specialist, SPECIALISTS, SPECIALTY_FILTERS } from '@/lib/specialists';
import { palette, radius, spacing, typography } from '@/theme/tokens';

export default function SpecialistsScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('Todos');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Especialistas</Text>
        <Pressable accessibilityLabel="Filtros" style={styles.iconBtn}>
          <Ionicons name="options-outline" size={20} color={palette.primary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Búsqueda */}
        <View style={styles.searchRow}>
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
          <Pressable style={styles.searchBtn}>
            <Text style={styles.searchBtnText}>Buscar</Text>
          </Pressable>
        </View>

        {/* Filtros */}
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
                style={[styles.filterChip, active && styles.filterChipActive]}>
                <Text style={[styles.filterText, active && styles.filterTextActive]}>{f}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Lista */}
        <View style={styles.list}>
          {SPECIALISTS.map((s) => (
            <SpecialistCard key={s.id} s={s} onSelect={() => router.push(`/booking/specialist?id=${s.id}`)} />
          ))}
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
    <Card style={styles.card}>
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
        <Pressable onPress={onSelect} style={styles.selectBtn}>
          <Text style={styles.selectBtnText}>Seleccionar</Text>
        </Pressable>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  headerTitle: { ...typography.h2, color: palette.textPrimary },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { paddingHorizontal: spacing.xl, paddingBottom: CONTENT_BOTTOM_INSET },

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
  card: {},
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
});
