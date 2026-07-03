import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandBand } from '@/components/ui/brand-band';
import { PressableCard } from '@/components/ui/pressable-card';
import { Reveal } from '@/components/ui/reveal';
import { useDentists, type Dentist } from '@/features/dentists';
import { palette, radius, spacing, typography } from '@/theme/tokens';

/**
 * Elección del profesional para reservar. Muestra odontólogos REALES
 * (usuarios con rol `odontologo` en `profiles`, vía `useDentists`).
 * Al elegir uno se propaga su `id` real como `dentistId` para que el turno
 * se pueda guardar con una FK válida a `auth.users`.
 */
export default function SpecialistPickerScreen() {
  const router = useRouter();
  const { dentists, loading, error } = useDentists();

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
      <BrandBand
        onBack={() => router.back()}
        title="Elegí un profesional"
        subtitle="Seleccioná el odontólogo con el que querés reservar tu turno."
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
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
              Cuando un odontólogo se registre en DentalAI vas a poder reservar tu turno con él.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {dentists.map((d, i) => (
              <Reveal key={d.id} index={i}>
                <DentistCard d={d} onSelect={() => selectDentist(d)} />
              </Reveal>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function DentistCard({ d, onSelect }: { d: Dentist; onSelect: () => void }) {
  const name = d.fullName ?? 'Profesional';
  return (
    <PressableCard onPress={onSelect} accessibilityLabel={`Seleccionar ${name}`}>
      <View style={styles.cardTop}>
        <LinearGradient
          colors={[palette.primaryLight, palette.tealLight]}
          style={styles.avatar}>
          <Ionicons name="person" size={32} color={palette.primary} />
        </LinearGradient>
        <View style={styles.cardInfo}>
          <Text style={styles.name}>{name}</Text>
          {d.specialty ? <Text style={styles.specialty}>{d.specialty}</Text> : null}
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
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing['3xl'] },

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
