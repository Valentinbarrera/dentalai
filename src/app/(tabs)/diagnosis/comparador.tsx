import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandHeader } from '@/components/ui/brand-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CONTENT_BOTTOM_INSET } from '@/constants/layout';
import { TREATMENT_OPTIONS, TreatmentOption } from '@/lib/diagnosis';
import { palette, radius, shadow, spacing, typography } from '@/theme/tokens';

const CARD_W = Math.min(Dimensions.get('window').width * 0.82, 340);
const GAP = 16;

export default function ComparadorScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <BrandHeader />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Pressable style={styles.eyebrowRow} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={16} color={palette.primary} />
          <Text style={styles.eyebrow}>TREATMENT OPTIONS</Text>
        </Pressable>
        <Text style={styles.title}>Comparador de{'\n'}Tratamientos</Text>
        <Text style={styles.subtitle}>
          Análisis comparativo de opciones reconstructivas basado en tu diagnóstico IA. Evaluá
          alternativas para tomar la mejor decisión clínica.
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_W + GAP}
          decelerationRate="fast"
          contentContainerStyle={styles.carousel}>
          {TREATMENT_OPTIONS.map((opt) => (
            <TreatmentCard key={opt.id} opt={opt} />
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

function TreatmentCard({ opt }: { opt: TreatmentOption }) {
  const router = useRouter();
  return (
    <Card style={styles.card} padded={false}>
      {/* Imagen */}
      <LinearGradient colors={opt.accent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.image}>
        <MaterialCommunityIcons name="tooth" size={64} color="rgba(255,255,255,0.85)" />
        {opt.recommended && (
          <View style={styles.recBadge}>
            <MaterialCommunityIcons name="star-four-points" size={13} color={palette.white} />
            <Text style={styles.recText}>RECOMENDADO</Text>
          </View>
        )}
      </LinearGradient>

      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{opt.name}</Text>
        <Text style={styles.cardDesc}>{opt.description}</Text>

        <View style={styles.statsGrid}>
          <Stat icon="cash-multiple" label="INVERSIÓN EST." value={opt.inversion} />
          <Stat icon="calendar-month" label="CUOTA MENSUAL" value={opt.cuota} highlight />
          <Stat icon="clock-outline" label="TIEMPO TRATAM." value={opt.tiempo} />
          <Stat icon="medical-bag" label="CIRUGÍA" value={opt.cirugia} />
        </View>

        <View style={styles.durability}>
          <MaterialCommunityIcons name="shield-check" size={16} color={palette.teal} />
          <View>
            <Text style={styles.durLabel}>DURABILIDAD</Text>
            <Text style={styles.durValue}>{opt.durabilidad}</Text>
          </View>
        </View>

        <Button
          label="VER DETALLES"
          left={<Ionicons name="arrow-forward" size={18} color={palette.white} />}
          onPress={() => router.push('/diagnosis/presupuesto')}
          style={styles.detailBtn}
        />
      </View>
    </Card>
  );
}

function Stat({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.stat}>
      <View style={styles.statLabelRow}>
        <MaterialCommunityIcons name={icon} size={13} color={palette.textMuted} />
        <Text style={styles.statLabel}>{label}</Text>
      </View>
      <Text style={[styles.statValue, highlight && { color: palette.primary }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  content: { paddingBottom: CONTENT_BOTTOM_INSET },

  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.sm, paddingHorizontal: spacing.xl },
  eyebrow: { ...typography.label, color: palette.primary },
  title: { ...typography.h1, color: palette.textPrimary, marginTop: spacing.sm, paddingHorizontal: spacing.xl },
  subtitle: { ...typography.body, color: palette.textSecondary, marginTop: spacing.sm, paddingHorizontal: spacing.xl },

  carousel: { gap: GAP, paddingHorizontal: spacing.xl, paddingTop: spacing.xl },
  card: { width: CARD_W, overflow: 'hidden' },
  image: {
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: palette.teal,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  recText: { ...typography.small, fontSize: 10, color: palette.white, fontWeight: '800', letterSpacing: 0.5 },

  cardBody: { padding: spacing.lg },
  cardTitle: { ...typography.h2, fontSize: 22, color: palette.textPrimary },
  cardDesc: { ...typography.caption, color: palette.textSecondary, marginTop: spacing.xs },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.lg },
  stat: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: palette.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  statLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statLabel: { fontSize: 9, color: palette.textMuted, fontWeight: '700', letterSpacing: 0.3 },
  statValue: { ...typography.bodyStrong, color: palette.textPrimary, marginTop: 4 },

  durability: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: palette.tealSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  durLabel: { fontSize: 9, color: palette.tealDark, fontWeight: '700', letterSpacing: 0.3 },
  durValue: { ...typography.bodyStrong, color: palette.tealDark },

  detailBtn: { marginTop: spacing.lg },
});
