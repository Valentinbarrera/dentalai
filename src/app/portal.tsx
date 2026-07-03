import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { BrandBand } from '@/components/ui/brand-band';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GradientIcon } from '@/components/ui/gradient-icon';
import { PressableCard } from '@/components/ui/pressable-card';
import { Reveal } from '@/components/ui/reveal';
import { ScreenContainer } from '@/components/ui/screen-container';
import {
  useDentistAppointments,
  useDentistPatients,
  type Appointment,
  type AppointmentStatus,
  type DentistPatient,
} from '@/features/appointments';
import { useAuth } from '@/features/auth';
import { palette, radius, shadow, spacing, typography } from '@/theme/tokens';

type Appt = {
  id: string;
  time: string;
  dur: string;
  name: string;
  tag: string;
  tagTone: 'teal' | 'red' | 'neutral';
  note?: string;
  primary?: boolean;
  scanReady?: boolean;
};

/** Adapta un turno real de Supabase a la fila que consume la agenda del portal. */
function toAppt(a: Appointment): Appt {
  const at = new Date(a.startsAt);
  const time = `${String(at.getHours()).padStart(2, '0')}:${String(at.getMinutes()).padStart(2, '0')}`;
  const tagTone: Appt['tagTone'] = /endodon/i.test(a.type)
    ? 'red'
    : /control|limpieza/i.test(a.type)
      ? 'teal'
      : 'neutral';
  return {
    id: a.id,
    time,
    dur: `${a.durationMin} min`,
    // Nombre real del paciente (join con `profiles` vía el feature); si el embed
    // no está disponible, caemos al tipo de turno como antes.
    name: a.patientName ?? a.type.charAt(0).toUpperCase() + a.type.slice(1),
    tag: a.type.toUpperCase(),
    tagTone,
    note: a.note,
  };
}

type Patient = {
  id: string;
  name: string;
  when: string;
  initials: string;
  color: string;
  statusLabel: string;
  statusTone: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
};

/** Colores de avatar, rotados de forma estable por posición en la lista. */
const AVATAR_COLORS = [palette.teal, palette.primary, palette.textSecondary, palette.warning];

/** Estado del turno más reciente → etiqueta y tono de la pastilla. */
const PATIENT_STATUS: Record<AppointmentStatus, { label: string; tone: Patient['statusTone'] }> = {
  confirmado: { label: 'Confirmado', tone: 'success' },
  completado: { label: 'Completado', tone: 'info' },
  pendiente: { label: 'Pendiente', tone: 'warning' },
  cancelado: { label: 'Cancelado', tone: 'danger' },
};

/** Iniciales (hasta 2) a partir del nombre del paciente. */
function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const letters = parts.slice(0, 2).map((p) => p.charAt(0).toUpperCase());
  return letters.join('');
}

/** Fecha del último turno → texto relativo ("Hoy, 08:00", "Ayer", "Lun 12"). */
function formatWhen(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const dayDiff = Math.round((startOf(now) - startOf(date)) / 86_400_000);

  if (dayDiff === 0) {
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `Hoy, ${hh}:${mm}`;
  }
  if (dayDiff === 1) return 'Ayer';

  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  return `${days[date.getDay()]} ${date.getDate()}`;
}

/** Adapta un paciente real (derivado de sus turnos) a la fila de la lista. */
function toPatientRow(p: DentistPatient, index: number): Patient {
  const status = PATIENT_STATUS[p.lastStatus];
  return {
    id: p.id,
    name: p.name,
    when: formatWhen(p.lastVisitAt),
    initials: initialsOf(p.name),
    color: AVATAR_COLORS[index % AVATAR_COLORS.length],
    statusLabel: status.label,
    statusTone: status.tone,
  };
}

const DAYS = [
  { id: 'd12', day: 'LUN', date: 12 },
  { id: 'd13', day: 'MAR', date: 13, active: true },
  { id: 'd14', day: 'MIÉ', date: 14, dot: true },
  { id: 'd15', day: 'JUE', date: 15 },
];

const TAG_TONE = {
  teal: { bg: palette.tealSoft, fg: palette.tealDark },
  red: { bg: palette.dangerSoft, fg: palette.danger },
  neutral: { bg: palette.surfaceAlt, fg: palette.textSecondary },
};

export default function PortalScreen() {
  const router = useRouter();
  const { user } = useAuth();

  // Turnos y pacientes reales del odontólogo desde Supabase (vía el feature, nunca directo).
  const { appointments } = useDentistAppointments(user?.id);
  const { patients } = useDentistPatients(user?.id);

  const schedule: Appt[] = appointments.map(toAppt);
  const patientRows: Patient[] = patients.map(toPatientRow);

  return (
    <ScreenContainer scroll padded={false} edges={[]} background={palette.background}>
      <StatusBar style="light" />

      <BrandBand
        title="DentalAI"
        subtitle="Portal del profesional"
        right={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Notificaciones"
            hitSlop={8}
            style={({ pressed }) => [styles.bellGlass, pressed && styles.bellPressed]}>
            <Ionicons name="notifications-outline" size={22} color={palette.white} />
            <View style={styles.bellDot} />
          </Pressable>
        }
      />

      <View style={styles.body}>
        {/* Saludo + CTA */}
        <Reveal index={0}>
          <Text style={styles.greeting}>Buen día, Dr. Smith</Text>
          <Text style={styles.subGreeting}>Este es el resumen de tu clínica para hoy.</Text>
          <Button
            label="Nuevo Turno"
            fullWidth={false}
            size="md"
            left={<Ionicons name="add" size={20} color={palette.white} />}
            onPress={() => {}}
            accessibilityLabel="Crear un nuevo turno"
            style={styles.newBtn}
          />
        </Reveal>

        {/* Credenciales */}
        <Reveal index={1}>
          <PressableCard
            onPress={() => router.push('/portal-credentials')}
            accessibilityLabel="Completá tus credenciales profesionales"
            style={styles.credCard}>
            <GradientIcon gradient={[palette.primary, palette.navy]} size={44}>
              <MaterialCommunityIcons name="certificate-outline" size={22} color={palette.white} />
            </GradientIcon>
            <View style={styles.credFlex}>
              <Text style={styles.credTitle}>Completá tus credenciales</Text>
              <Text style={styles.credSub}>Cargá tu título y matrícula para verificar tu perfil.</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={palette.textMuted} />
          </PressableCard>
        </Reveal>

        {/* Métricas */}
        <Reveal index={2}>
          <View style={styles.metricsRow}>
            <MetricCard icon="calendar-outline" label="Turnos hoy" value="14" delta="12%" progress={0.75} tone={palette.primary} gradient={[palette.teal, palette.primary]} />
            <MetricCard icon="clipboard-outline" label="Turnos semana" value="68" delta="5%" progress={0.6} tone={palette.teal} gradient={[palette.primary, palette.navy]} />
          </View>
        </Reveal>

        {/* Ingresos */}
        <Reveal index={3}>
          <LinearGradient colors={[palette.primary, palette.primaryDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.revenue, shadow.card]}>
            <View style={styles.revenueTop}>
              <View style={styles.revenueIcon}>
                <MaterialCommunityIcons name="wallet-outline" size={22} color={palette.white} />
              </View>
              <View style={styles.revenueBadge}>
                <Ionicons name="arrow-up" size={12} color={palette.white} />
                <Text style={styles.revenueBadgeText}>18% vs mes pasado</Text>
              </View>
            </View>
            <Text style={styles.revenueLabel}>Ingresos del mes</Text>
            <Text style={styles.revenueValue}>$42,500</Text>
          </LinearGradient>
        </Reveal>

        {/* Agenda de hoy */}
        <Reveal index={4}>
          <View style={styles.sectionHeader}>
            <View style={styles.headingRow}>
              <View style={styles.accentBar} />
              <Text style={styles.sectionTitle}>Agenda de Hoy</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ver calendario completo"
              hitSlop={8}
              style={({ pressed }) => pressed && styles.linkPressed}>
              <Text style={styles.link}>Ver calendario</Text>
            </Pressable>
          </View>

          <Card style={styles.scheduleCard}>
            <View style={styles.daysRow}>
              <Ionicons name="chevron-back" size={18} color={palette.textSecondary} />
              {DAYS.map((d) => (
                <View key={d.id} style={[styles.dayCard, d.active && styles.dayActive]}>
                  <Text style={[styles.dayLabel, d.active && styles.dayTextActive]}>{d.day}</Text>
                  <Text style={[styles.dayNum, d.active && styles.dayTextActive]}>{d.date}</Text>
                  {d.dot && <View style={styles.dayDot} />}
                </View>
              ))}
              <Ionicons name="chevron-forward" size={18} color={palette.textSecondary} />
            </View>

            <View style={styles.divider} />

            {schedule.length > 0 ? (
              schedule.map((a) => <ScheduleItem key={a.id} appt={a} />)
            ) : (
              <EmptyState
                icon="calendar-outline"
                title="No tenés turnos agendados"
                subtitle="Cuando agendes turnos, aparecerán acá."
              />
            )}
          </Card>
        </Reveal>

        {/* Pacientes recientes */}
        <Reveal index={5}>
          <View style={styles.sectionHeader}>
            <View style={styles.headingRow}>
              <View style={styles.accentBar} />
              <Text style={styles.sectionTitle}>Pacientes Recientes</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Buscar pacientes"
              style={({ pressed }) => [styles.searchBtn, pressed && styles.iconBtnPressed]}>
              <Ionicons name="search" size={18} color={palette.primary} />
            </Pressable>
          </View>

          <Card style={styles.patientsCard}>
            {patientRows.length > 0 ? (
              <>
                <View style={styles.patientsHead}>
                  <Text style={styles.patientsHeadText}>Paciente</Text>
                  <Text style={styles.patientsHeadText}>Estado</Text>
                </View>
                {patientRows.map((p) => (
                  <View key={p.id} style={styles.patientRow}>
                    <View style={styles.patientLeft}>
                      <View style={[styles.patientAvatar, { backgroundColor: p.color }]}>
                        <Text style={styles.patientInitials}>{p.initials}</Text>
                      </View>
                      <View>
                        <Text style={styles.patientName}>{p.name}</Text>
                        <Text style={styles.patientWhen}>{p.when}</Text>
                      </View>
                    </View>
                    <Badge label={`● ${p.statusLabel}`} tone={p.statusTone} />
                  </View>
                ))}
                <Button label="Ver todos los pacientes" variant="outline" onPress={() => {}} style={styles.allBtn} />
              </>
            ) : (
              <EmptyState
                icon="people-outline"
                title="Todavía no tenés pacientes"
                subtitle="Cuando agendes turnos, tus pacientes aparecerán acá."
              />
            )}
          </Card>
        </Reveal>
      </View>
    </ScreenContainer>
  );
}

function MetricCard({
  icon,
  label,
  value,
  delta,
  progress,
  tone,
  gradient,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
  delta: string;
  progress: number;
  tone: string;
  gradient: readonly [string, string];
}) {
  return (
    <Card style={styles.metric}>
      <View style={styles.metricTop}>
        <GradientIcon gradient={gradient} size={40}>
          <Ionicons name={icon} size={22} color={palette.white} />
        </GradientIcon>
        <View style={styles.deltaBadge}>
          <Ionicons name="trending-up" size={13} color={palette.success} />
          <Text style={styles.deltaText}>{delta}</Text>
        </View>
      </View>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <View style={styles.metricTrack}>
        <View style={[styles.metricFill, { width: `${progress * 100}%`, backgroundColor: tone }]} />
      </View>
    </Card>
  );
}

function EmptyState({
  icon,
  title,
  subtitle,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icon} size={26} color={palette.textMuted} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySub}>{subtitle}</Text>
    </View>
  );
}

function ScheduleItem({ appt }: { appt: Appt }) {
  const tone = TAG_TONE[appt.tagTone];
  return (
    <View style={styles.apptRow}>
      <View style={styles.apptTimeCol}>
        <Text style={[styles.apptTime, appt.primary && { color: palette.primary }]}>{appt.time}</Text>
        <Text style={styles.apptDur}>{appt.dur}</Text>
      </View>
      <View style={styles.apptTimeline}>
        <View style={[styles.apptNode, appt.primary && styles.apptNodeActive]} />
        <View style={styles.apptLine} />
      </View>
      <View style={[styles.apptCard, appt.primary && styles.apptCardPrimary]}>
        <View style={styles.apptCardTop}>
          <Text style={styles.apptName}>{appt.name}</Text>
          <View style={[styles.apptTag, { backgroundColor: tone.bg }]}>
            <Text style={[styles.apptTagText, { color: tone.fg }]}>{appt.tag}</Text>
          </View>
        </View>
        {appt.note && <Text style={styles.apptNote}>{appt.note}</Text>}
        {appt.scanReady && (
          <View style={styles.scanRow}>
            <MaterialCommunityIcons name="tooth-outline" size={15} color={palette.teal} />
            <Text style={styles.scanText}>AI Scan listo</Text>
          </View>
        )}
        {appt.primary && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Iniciar sesión con ${appt.name}`}
            style={({ pressed }) => [styles.startBtn, pressed && styles.startBtnPressed]}>
            <Ionicons name="play" size={14} color={palette.white} />
            <Text style={styles.startBtnText}>Iniciar sesión</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: spacing.xl },

  bellGlass: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellPressed: { opacity: 0.6, backgroundColor: 'rgba(255,255,255,0.32)' },
  bellDot: {
    position: 'absolute',
    top: 11,
    right: 12,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#F87171',
    borderWidth: 1.5,
    borderColor: palette.primary,
  },

  headingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  accentBar: { width: 4, height: 18, borderRadius: radius.pill, backgroundColor: palette.teal },

  greeting: { ...typography.h1, color: palette.textPrimary, marginTop: spacing.xl },
  subGreeting: { ...typography.body, color: palette.textSecondary, marginTop: spacing.xs },
  newBtn: { marginTop: spacing.lg, alignSelf: 'flex-start' },

  credCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.lg },
  credFlex: { flex: 1 },
  credTitle: { ...typography.bodyStrong, color: palette.textPrimary },
  credSub: { ...typography.caption, color: palette.textSecondary, marginTop: 2 },

  metricsRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  metric: { flex: 1 },
  metricTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  deltaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: palette.successSoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  deltaText: { ...typography.caption, color: palette.success, fontWeight: '700' },
  metricLabel: { ...typography.caption, color: palette.textSecondary, marginTop: spacing.md },
  metricValue: { ...typography.h1, fontSize: 30, color: palette.textPrimary, marginTop: 2 },
  metricTrack: { height: 6, borderRadius: radius.pill, backgroundColor: palette.surfaceAlt, marginTop: spacing.md, overflow: 'hidden' },
  metricFill: { height: '100%', borderRadius: radius.pill },

  revenue: { borderRadius: radius.xl, padding: spacing['2xl'], marginTop: spacing.lg },
  revenueTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  revenueIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  revenueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  revenueBadgeText: { ...typography.small, color: palette.white, fontWeight: '700' },
  revenueLabel: { ...typography.body, color: 'rgba(255,255,255,0.85)', marginTop: spacing.lg },
  revenueValue: { fontSize: 34, fontWeight: '800', color: palette.white, marginTop: 2 },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing['2xl'],
    marginBottom: spacing.md,
  },
  sectionTitle: { ...typography.h2, fontSize: 20, color: palette.textPrimary },
  link: { ...typography.bodyStrong, color: palette.primary },
  linkPressed: { opacity: 0.6 },
  iconBtnPressed: { opacity: 0.7, transform: [{ scale: 0.96 }] },
  searchBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: palette.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  scheduleCard: {},
  daysRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dayCard: { alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.md, gap: 2 },
  dayActive: { backgroundColor: palette.primary },
  dayLabel: { ...typography.small, color: palette.textSecondary, fontWeight: '700' },
  dayNum: { ...typography.subtitle, color: palette.textPrimary },
  dayTextActive: { color: palette.white },
  dayDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: palette.danger, position: 'absolute', top: 4, right: 8 },
  divider: { height: 1, backgroundColor: palette.border, marginVertical: spacing.lg },

  apptRow: { flexDirection: 'row', gap: spacing.sm },
  apptTimeCol: { width: 52, alignItems: 'flex-start' },
  apptTime: { ...typography.bodyStrong, color: palette.textPrimary },
  apptDur: { ...typography.small, color: palette.textMuted },
  apptTimeline: { alignItems: 'center', width: 16 },
  apptNode: { width: 10, height: 10, borderRadius: 5, backgroundColor: palette.border, marginTop: 4 },
  apptNodeActive: { backgroundColor: palette.primary },
  apptLine: { flex: 1, width: 2, backgroundColor: palette.border, marginTop: 2 },
  apptCard: { flex: 1, borderRadius: radius.md, paddingBottom: spacing.lg },
  apptCardPrimary: {
    backgroundColor: palette.primarySoft,
    borderWidth: 1,
    borderColor: palette.primaryLight,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  apptCardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  apptName: { ...typography.subtitle, color: palette.textPrimary, flexShrink: 1 },
  apptTag: { borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  apptTagText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
  apptNote: { ...typography.caption, color: palette.textSecondary, marginTop: 4 },
  scanRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  scanText: { ...typography.caption, color: palette.teal, fontWeight: '600' },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: palette.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    marginTop: spacing.md,
  },
  startBtnPressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  startBtnText: { ...typography.bodyStrong, color: palette.white },

  patientsCard: {},
  patientsHead: { flexDirection: 'row', justifyContent: 'space-between', paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: palette.border },
  patientsHeadText: { ...typography.caption, color: palette.textMuted, fontWeight: '600' },
  patientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  patientLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  patientAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  patientInitials: { ...typography.caption, color: palette.white, fontWeight: '700' },
  patientName: { ...typography.bodyStrong, color: palette.textPrimary },
  patientWhen: { ...typography.small, color: palette.textMuted },
  allBtn: { marginTop: spacing.lg },

  empty: { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.xs },
  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: palette.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  emptyTitle: { ...typography.bodyStrong, color: palette.textPrimary },
  emptySub: { ...typography.caption, color: palette.textSecondary, textAlign: 'center' },
});
