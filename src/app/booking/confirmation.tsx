import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Reveal } from '@/components/ui/reveal';
import { palette, radius, spacing, typography } from '@/theme/tokens';

export default function ConfirmationScreen() {
  const router = useRouter();

  const goHome = () => {
    if (router.canDismiss()) router.dismissAll();
    router.navigate('/');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Éxito */}
        <Reveal index={0}>
          <View style={styles.successWrap}>
            <View style={styles.glow} />
            <View style={styles.ring} />
            <View style={styles.checkCircle}>
              <Ionicons name="checkmark" size={40} color={palette.white} />
            </View>
          </View>

          <Text style={styles.title}>¡Turno confirmado!</Text>
          <Text style={styles.subtitle}>
            Tu cita fue agendada con éxito. Te esperamos para cuidar tu sonrisa.
          </Text>
        </Reveal>

        {/* Detalles */}
        <Reveal index={1}>
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Detalles del Turno</Text>
          <View style={styles.divider} />

          <DetailRow
            icon={<MaterialCommunityIcons name="tooth-outline" size={20} color={palette.primary} />}
            label="PROFESIONAL"
            value="Dra. Elena Santos"
            sub="Especialista en Ortodoncia"
            subColor={palette.primary}
          />
          <DetailRow
            icon={<Ionicons name="calendar-outline" size={20} color={palette.primary} />}
            label="FECHA Y HORA"
            value="Jueves, 24 de Octubre"
            sub="14:30 hs"
          />
          <DetailRow
            icon={<Ionicons name="location-outline" size={20} color={palette.primary} />}
            label="UBICACIÓN"
            value="Clínica DentalAI Central"
            sub="Av. Libertador 1234, Piso 5"
            last
          />
        </Card>
        </Reveal>
      </ScrollView>

      {/* Acciones */}
      <Reveal index={2} style={styles.actions}>
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
  label,
  value,
  sub,
  subColor,
  last,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  subColor?: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.detailRow, !last && styles.detailRowBorder]}>
      <View style={styles.detailIcon}>{icon}</View>
      <View style={styles.flex}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
        <Text style={[styles.detailSub, subColor ? { color: subColor } : null]}>{sub}</Text>
      </View>
    </View>
  );
}

const RING = 120;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  flex: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing['2xl'] },

  successWrap: { width: RING, height: RING, alignSelf: 'center', alignItems: 'center', justifyContent: 'center' },
  glow: {
    position: 'absolute',
    width: RING,
    height: RING,
    borderRadius: RING / 2,
    backgroundColor: palette.tealSoft,
  },
  ring: {
    position: 'absolute',
    width: RING - 16,
    height: RING - 16,
    borderRadius: (RING - 16) / 2,
    borderWidth: 2,
    borderColor: palette.tealLight,
  },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: palette.tealDark,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: { ...typography.h1, color: palette.primary, textAlign: 'center', marginTop: spacing['2xl'] },
  subtitle: {
    ...typography.body,
    color: palette.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    maxWidth: 320,
    alignSelf: 'center',
  },

  card: { marginTop: spacing['2xl'] },
  cardTitle: { ...typography.h2, fontSize: 20, color: palette.textPrimary },
  divider: { height: 1, backgroundColor: palette.border, marginTop: spacing.md },

  detailRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start', paddingVertical: spacing.lg },
  detailRowBorder: { borderBottomWidth: 1, borderBottomColor: palette.border },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailLabel: { fontSize: 10, color: palette.textMuted, fontWeight: '700', letterSpacing: 0.5 },
  detailValue: { ...typography.subtitle, color: palette.textPrimary, marginTop: 2 },
  detailSub: { ...typography.caption, color: palette.textSecondary, marginTop: 2 },

  actions: { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, gap: spacing.md },
  waBtn: {},
  homeLink: { alignItems: 'center', paddingVertical: spacing.sm },
  homeLinkPressed: { opacity: 0.6 },
  homeLinkText: { ...typography.bodyStrong, color: palette.primary },
});
