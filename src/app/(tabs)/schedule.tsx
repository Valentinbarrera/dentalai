import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandBand } from '@/components/ui/brand-band';
import { PressableCard } from '@/components/ui/pressable-card';
import { Reveal } from '@/components/ui/reveal';
import { CONTENT_BOTTOM_INSET } from '@/constants/layout';
import { useDentists, type Dentist } from '@/features/dentists';
import { palette, radius, spacing, typography } from '@/theme/tokens';

/**
 * Tab de especialistas. Lista odontólogos REALES (usuarios con rol
 * `odontologo` en `profiles`, vía `useDentists`). Cero datos ficticios:
 * si no hay profesionales registrados se muestra un estado vacío honesto.
 * Al elegir uno se navega a la agenda propagando su `id` real como
 * `dentistId`/`specialistId` para que el turno tenga una FK válida.
 */
export default function SpecialistsScreen() {
  const router = useRouter();
  const { dentists, loading, error } = useDentists();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return dentists;
    return dentists.filter((d) => {
      const name = (d.fullName ?? '').toLowerCase();
      const specialty = (d.specialty ?? '').toLowerCase();
      return name.includes(q) || specialty.includes(q);
    });
  }, [dentists, query]);

  const selectDentist = (d: Dentist) => {
    router.push({
      pathname: '/booking/agenda',
      params: {
        // `dentistId` real: es el usuario odontólogo de auth.users, sirve como FK del turno.
        dentistId: d.id,
        // Se mantiene también como `specialistId` por compatibilidad del flujo existente.
        specialistId: d.id,
        // Datos para el DISPLAY del turno a lo largo del booking.
        specialistName: d.fullName ?? 'Profesional',
        specialistSubtitle: d.specialty ?? 'Odontología general',
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <BrandBand title="Especialistas" subtitle="Encontrá tu profesional ideal" />

        <View style={styles.inner}>
          {/* Búsqueda sobre profesionales reales */}
          <Reveal index={0} style={styles.searchRow}>
            <View style={styles.searchInput}>
              <Ionicons name="search" size={18} color={palette.textMuted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Buscar por nombre o especialidad..."
                placeholderTextColor={palette.textMuted}
                style={styles.input}
              />
            </View>
          </Reveal>

          {/* Estados: cargando / error / vacío honesto / lista */}
          {loading ? (
            <View style={styles.stateBox}>
              <ActivityIndicator color={palette.primary} />
              <Text style={styles.stateText}>Cargando profesionales…</Text>
            </View>
          ) : error ? (
            <View style={styles.stateBox}>
              <Ionicons name="cloud-offline-outline" size={40} color={palette.textMuted} />
              <Text style={styles.stateTitle}>No pudimos cargar los profesionales</Text>
              <Text style={styles.stateText}>{error}</Text>
            </View>
          ) : dentists.length === 0 ? (
            <View style={styles.stateBox}>
              <Ionicons name="people-outline" size={40} color={palette.textMuted} />
              <Text style={styles.stateTitle}>Todavía no hay profesionales disponibles</Text>
              <Text style={styles.stateText}>
                Cuando un odontólogo se registre vas a poder reservar tu turno.
              </Text>
            </View>
          ) : filtered.length === 0 ? (
            <View style={styles.stateBox}>
              <Ionicons name="search-outline" size={40} color={palette.textMuted} />
              <Text style={styles.stateTitle}>Sin resultados</Text>
              <Text style={styles.stateText}>No encontramos profesionales para “{query.trim()}”.</Text>
            </View>
          ) : (
            <View style={styles.list}>
              {filtered.map((d, i) => (
                <Reveal key={d.id} index={i}>
                  <DentistCard d={d} onSelect={() => selectDentist(d)} />
                </Reveal>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function DentistCard({ d, onSelect }: { d: Dentist; onSelect: () => void }) {
  const name = d.fullName ?? 'Profesional';
  const specialty = d.specialty ?? 'Odontología general';
  return (
    <PressableCard onPress={onSelect} accessibilityLabel={`Seleccionar ${name}, ${specialty}`}>
      <View style={styles.cardTop}>
        <LinearGradient colors={[palette.primaryLight, palette.tealLight]} style={styles.avatar}>
          <Ionicons name="person" size={32} color={palette.primary} />
        </LinearGradient>
        <View style={styles.cardInfo}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.specialty}>{specialty}</Text>
          {d.verified ? (
            <View style={styles.verifiedRow}>
              <Ionicons name="checkmark-circle" size={14} color={palette.teal} />
              <Text style={styles.verifiedText}>Matrícula verificada</Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardBottom}>
        <View style={styles.meta}>
          <Ionicons name="calendar-outline" size={14} color={palette.textSecondary} />
          <Text style={styles.metaText}>Ver horarios disponibles</Text>
        </View>
        <Pressable
          onPress={onSelect}
          accessibilityRole="button"
          accessibilityLabel={`Seleccionar ${name}`}
          style={({ pressed }) => [styles.selectBtn, pressed && styles.pressed]}>
          <Text style={styles.selectBtnText}>Seleccionar</Text>
        </Pressable>
      </View>
    </PressableCard>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  content: { paddingBottom: CONTENT_BOTTOM_INSET },
  inner: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm },

  searchRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm, marginBottom: spacing.lg },
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

  stateBox: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing['3xl'],
  },
  stateTitle: { ...typography.subtitle, color: palette.textPrimary, marginTop: spacing.sm, textAlign: 'center' },
  stateText: { ...typography.caption, color: palette.textSecondary, textAlign: 'center' },

  list: { gap: spacing.lg },

  cardTop: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  avatar: { width: 64, height: 64, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  cardInfo: { flex: 1 },
  name: { ...typography.subtitle, color: palette.textPrimary },
  specialty: { ...typography.caption, color: palette.primary, fontWeight: '600', marginTop: 2 },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.sm },
  verifiedText: { ...typography.caption, color: palette.teal, fontWeight: '600' },

  divider: { height: 1, backgroundColor: palette.border, marginVertical: spacing.md },

  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
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
