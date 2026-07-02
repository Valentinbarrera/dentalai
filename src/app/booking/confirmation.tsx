import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandBand } from '@/components/ui/brand-band';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GradientIcon } from '@/components/ui/gradient-icon';
import { Reveal } from '@/components/ui/reveal';
import { palette, radius, spacing, typography } from '@/theme/tokens';

export default function ConfirmationScreen() {
  const router = useRouter();

  const goHome = () => {
    if (router.canDismiss()) router.dismissAll();
    router.navigate('/');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <StatusBar style="light" />
      {/* Header celebratorio de marca */}
      <BrandBand title="¡Turno confirmado!" subtitle="Tu cita fue agendada con éxito.">
        <View style={styles.successWrap}>
          <View style={styles.glow} pointerEvents="none" />
          <View style={styles.ring} pointerEvents="none" />
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={40} color={palette.tealDark} />
          </View>
        </View>
        <Text style={styles.heroCaption}>Te esperamos para cuidar tu sonrisa.</Text>
      </BrandBand>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Detalles */}
        <Reveal index={0}>
        <Card style={styles.card}>
          <View style={styles.headingRow}>
            <View style={styles.accentBar} />
            <Text style={styles.cardTitle}>Detalles del Turno</Text>
          </View>
          <View style={styles.divider} />

          <DetailRow
            icon={<MaterialCommunityIcons name="tooth-outline" size={20} color={palette.white} />}
            gradient={[palette.teal, palette.primary]}
            label="PROFESIONAL"
            value="Dra. Elena Santos"
            sub="Especialista en Ortodoncia"
            subColor={palette.primary}
          />
          <DetailRow
            icon={<Ionicons name="calendar-outline" size={20} color={palette.white} />}
            gradient={[palette.primary, palette.navy]}
            label="FECHA Y HORA"
            value="Jueves, 24 de Octubre"
            sub="14:30 hs"
          />
          <DetailRow
            icon={<Ionicons name="location-outline" size={20} color={palette.white} />}
            gradient={[palette.teal, palette.tealDark]}
            label="UBICACIÓN"
            value="Clínica DentalAI Central"
            sub="Av. Libertador 1234, Piso 5"
            last
          />
        </Card>
        </Reveal>
      </ScrollView>

      {/* Acciones */}
      <Reveal index={1} style={styles.actions}>
        <Button
          label="Agregar al calendario"
          accessibilityLabel="Agregar el turno al calendario"
          left={<Ionicons name="calendar" size={18} color={palette.white} />}
          onPress={() => {}}
        />
        <Button
          label="Abrir WhatsApp"
          variant="outline"
          accessibilityLabel="Abrir WhatsApp de la clínica"
          left={<Ionicons name="logo-whatsapp" size={18} color={palette.primary} />}
          onPress={() => {}}
          style={styles.waBtn}
        />
        <Pressable
          onPress={goHome}
          accessibilityRole="button"
          accessibilityLabel="Volver al inicio"
          style={({ pressed }) => [styles.homeLink, pressed && styles.homeLinkPressed]}>
          <Text style={styles.homeLinkText}>Volver al inicio</Text>
        </Pressable>
      </Reveal>
    </SafeAreaView>
  );
}

function DetailRow({
  icon,
  gradient,
  label,
  value,
  sub,
  subColor,
  last,
}: {
  icon: React.ReactNode;
  gradient: readonly [string, string];
  label: string;
  value: string;
  sub: string;
  subColor?: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.detailRow, !last && styles.detailRowBorder]}>
      <GradientIcon gradient={gradient} size={40} borderRadius={20}>
        {icon}
      </GradientIcon>
      <View style={styles.flex}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
        <Text style={[styles.detailSub, subColor ? { color: subColor } : null]}>{sub}</Text>
      </View>
    </View>
  );
}

const RING = 108;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  flex: { flex: 1 },
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing['2xl'] },

  successWrap: { width: RING, height: RING, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginTop: spacing.xl },
  glow: {
    position: 'absolute',
    width: RING,
    height: RING,
    borderRadius: RING / 2,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  ring: {
    position: 'absolute',
    width: RING - 16,
    height: RING - 16,
    borderRadius: (RING - 16) / 2,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCaption: { ...typography.caption, color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginTop: spacing.lg },

  headingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  accentBar: { width: 4, height: 18, borderRadius: radius.pill, backgroundColor: palette.teal },

  card: { marginTop: spacing.sm },
  cardTitle: { ...typography.h2, fontSize: 20, color: palette.textPrimary },
  divider: { height: 1, backgroundColor: palette.border, marginTop: spacing.md },

  detailRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start', paddingVertical: spacing.lg },
  detailRowBorder: { borderBottomWidth: 1, borderBottomColor: palette.border },
  detailLabel: { fontSize: 10, color: palette.textMuted, fontWeight: '700', letterSpacing: 0.5 },
  detailValue: { ...typography.subtitle, color: palette.textPrimary, marginTop: 2 },
  detailSub: { ...typography.caption, color: palette.textSecondary, marginTop: 2 },

  actions: { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, gap: spacing.md },
  waBtn: {},
  homeLink: { alignItems: 'center', paddingVertical: spacing.sm },
  homeLinkPressed: { opacity: 0.6 },
  homeLinkText: { ...typography.bodyStrong, color: palette.primary },
});
