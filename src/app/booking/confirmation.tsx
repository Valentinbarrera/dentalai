import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandBand } from '@/components/ui/brand-band';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GradientIcon } from '@/components/ui/gradient-icon';
import { Reveal } from '@/components/ui/reveal';
import { createAppointment } from '@/features/appointments';
import { useAuth } from '@/features/auth';
import { ROUTES } from '@/lib/routes';
import { palette, radius, spacing, typography } from '@/theme/tokens';

const DIAS_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MESES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

/** Formatea el ISO string del turno a un texto legible en español.
 *  Se hace a mano (sin Intl) para no depender del soporte de ICU en el runtime. */
function formatFechaHora(iso?: string): { fecha: string; hora: string } | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const fecha = `${DIAS_ES[d.getDay()]}, ${d.getDate()} de ${MESES_ES[d.getMonth()]}`;
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return { fecha, hora: `${hh}:${mm} hs` };
}

export default function ConfirmationScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const savedRef = useRef(false);
  // dentistId del profesional elegido. Llega por route params una vez que el flujo
  // de booking trabaje con odontólogos reales (Fase 4).
  //
  // specialistId/Name/Subtitle son datos del especialista MOCK y se usan SOLO para el
  // DISPLAY de esta pantalla. OJO: specialistId NO es un usuario real de Supabase, así
  // que nunca se usa como `dentistId` en el guardado.
  // TODO(Fase 4): mapear specialistId (mock) → dentistId real (auth.users) para poder
  // persistir el turno con el odontólogo elegido.
  const { dentistId, startsAt, specialistName, specialistSubtitle } = useLocalSearchParams<{
    dentistId?: string;
    startsAt?: string;
    specialistId?: string;
    specialistName?: string;
    specialistSubtitle?: string;
  }>();

  // Fecha/hora reales elegidas, formateadas en español legible (o el fallback del mock).
  const fecha = formatFechaHora(startsAt);

  // Al llegar a esta pantalla la reserva ya quedó confirmada: persistimos el turno
  // en Supabase (una sola vez) para que aparezca en la agenda del odontólogo.
  //
  // Requisito real: `appointments.dentist_id` es FK a `auth.users`, así que el turno
  // NO se puede guardar hasta que exista el odontólogo elegido (Fase 4: cuentas de
  // odontólogo + mapeo de especialistas a usuarios reales). Hasta entonces guardamos
  // solo si nos llega un `dentistId` real por params; nunca inventamos un id (evita un
  // INSERT que falla la FK y se traga en silencio).
  useEffect(() => {
    if (savedRef.current || !user?.id || !dentistId) return;
    savedRef.current = true;

    createAppointment({
      patientId: user.id,
      dentistId,
      startsAt: startsAt ?? new Date().toISOString(),
      durationMin: 45,
      type: 'consulta',
    }).catch(() => {
      // No rompemos la pantalla de éxito si el guardado falla (p. ej. sin conexión).
    });
  }, [user?.id, dentistId, startsAt]);

  const goHome = () => {
    if (router.canDismiss()) router.dismissAll();
    router.navigate(ROUTES.home);
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
            value={specialistName ?? 'Dra. Elena Santos'}
            sub={specialistSubtitle ?? 'Especialista en Ortodoncia'}
            subColor={palette.primary}
          />
          <DetailRow
            icon={<Ionicons name="calendar-outline" size={20} color={palette.white} />}
            gradient={[palette.primary, palette.navy]}
            label="FECHA Y HORA"
            value={fecha?.fecha ?? 'Jueves, 24 de Octubre'}
            sub={fecha?.hora ?? '14:30 hs'}
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
