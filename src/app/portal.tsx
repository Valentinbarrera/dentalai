import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

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
  useUpdateAppointmentStatus,
  type Appointment,
  type AppointmentStatus,
  type DentistPatient,
} from '@/features/appointments';
import { useAuth } from '@/features/auth';
import { palette, radius, spacing, typography } from '@/theme/tokens';

type Appt = {
  id: string;
  /** Usuario paciente dueño del turno, para navegar a su ficha. */
  patientId: string;
  time: string;
  dur: string;
  name: string;
  tag: string;
  tagTone: 'teal' | 'red' | 'neutral';
  note?: string;
  status: AppointmentStatus;
  /** Momento de inicio (ISO), para filtrar por día. */
  startsAt: string;
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
    patientId: a.patientId,
    time,
    dur: `${a.durationMin} min`,
    // Nombre real del paciente (join con `profiles` vía el feature); si el embed
    // no está disponible, caemos al tipo de turno como antes.
    name: a.patientName ?? a.type.charAt(0).toUpperCase() + a.type.slice(1),
    tag: a.type.toUpperCase(),
    tagTone,
    note: a.note,
    status: a.status,
    startsAt: a.startsAt,
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

/** Medianoche local de una fecha (base para comparar y filtrar por día). */
function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

const DAY_LABELS = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'] as const;

type DayCell = { key: number; label: string; date: number };

/** Los próximos `n` días reales a partir de hoy, para el selector de la agenda. */
function buildDays(n: number): DayCell[] {
  const today = startOfDay(new Date());
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return { key: d.getTime(), label: DAY_LABELS[d.getDay()], date: d.getDate() };
  });
}

const TAG_TONE = {
  teal: { bg: palette.tealSoft, fg: palette.tealDark },
  red: { bg: palette.dangerSoft, fg: palette.danger },
  neutral: { bg: palette.surfaceAlt, fg: palette.textSecondary },
};

/** Estado del turno → badge, para turnos ya cerrados (sin acciones). */
const APPT_STATUS_BADGE: Record<AppointmentStatus, { label: string; tone: Patient['statusTone'] }> =
  PATIENT_STATUS;

export default function PortalScreen() {
  const router = useRouter();
  const { user } = useAuth();

  // Nombre real del odontólogo (metadata de auth); si no está, saludo genérico.
  const dentistName: string = user?.user_metadata?.full_name ?? 'profesional';

  // Turnos y pacientes reales del odontólogo desde Supabase (vía el feature, nunca directo).
  const { appointments } = useDentistAppointments(user?.id);
  const { patients } = useDentistPatients(user?.id);

  // Copia local editable de los turnos: permite actualización optimista al
  // confirmar/completar/cancelar sin re-fetchear toda la agenda.
  const [items, setItems] = useState<Appointment[]>([]);
  useEffect(() => {
    setItems(appointments);
  }, [appointments]);

  const { run: runStatus, pending } = useUpdateAppointmentStatus();

  const days = useMemo(() => buildDays(5), []);
  const [selectedDay, setSelectedDay] = useState<number>(() => startOfDay(new Date()).getTime());

  const schedule: Appt[] = items.map(toAppt);
  const patientRows: Patient[] = patients.map(toPatientRow);

  // Métricas reales derivadas de los turnos (sin deltas inventados).
  const { todayCount, weekCount } = useMemo(() => {
    const todayStart = startOfDay(new Date()).getTime();
    const weekEnd = todayStart + 7 * 86_400_000;
    let today = 0;
    let week = 0;
    for (const a of items) {
      const day = startOfDay(new Date(a.startsAt)).getTime();
      if (day === todayStart) today += 1;
      if (day >= todayStart && day < weekEnd) week += 1;
    }
    return { todayCount: today, weekCount: week };
  }, [items]);

  // Turnos del día seleccionado, ordenados por hora.
  const daySchedule = schedule.filter(
    (a) => startOfDay(new Date(a.startsAt)).getTime() === selectedDay,
  );

  /** Cambia el estado de un turno con UI optimista + reversión suave ante error. */
  async function handleStatus(id: string, status: AppointmentStatus) {
    const snapshot = items;
    setItems((cur) => cur.map((a) => (a.id === id ? { ...a, status } : a)));
    try {
      const updated = await runStatus(id, status);
      // Reconciliamos con lo que devuelve el servidor (fuente de verdad).
      setItems((cur) => cur.map((a) => (a.id === id ? updated : a)));
    } catch {
      setItems(snapshot); // revertir
      Alert.alert('No se pudo actualizar el turno', 'Revisá tu conexión e intentá de nuevo.');
    }
  }

  const goToPatient = (id: string, name: string) =>
    router.push({ pathname: '/patient/[id]', params: { id, name } });

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
          <Text style={styles.greeting}>Buen día, {dentistName}</Text>
          <Text style={styles.subGreeting}>Este es el resumen de tu clínica para hoy.</Text>
          <Button
            label="Nuevo Turno"
            fullWidth={false}
            size="md"
            left={<Ionicons name="add" size={20} color={palette.white} />}
            // TODO(fuera de scope): pantalla de creación de turno del portal.
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

        {/* Accesos rápidos del portal */}
        <Reveal index={2}>
          <View style={styles.quickRow}>
            <PressableCard
              onPress={() => router.push('/portal-profile')}
              accessibilityLabel="Mi perfil profesional"
              style={styles.quickCard}>
              <GradientIcon gradient={[palette.teal, palette.primary]} size={40}>
                <Ionicons name="person-outline" size={20} color={palette.white} />
              </GradientIcon>
              <Text style={styles.quickTitle}>Mi perfil</Text>
              <Text style={styles.quickSub}>Tu perfil profesional</Text>
            </PressableCard>
            <PressableCard
              onPress={() => router.push('/portal-videos')}
              accessibilityLabel="Cargar videos educativos"
              style={styles.quickCard}>
              <GradientIcon gradient={[palette.primary, palette.navy]} size={40}>
                <Ionicons name="videocam-outline" size={20} color={palette.white} />
              </GradientIcon>
              <Text style={styles.quickTitle}>Videos</Text>
              <Text style={styles.quickSub}>Contenido educativo</Text>
            </PressableCard>
          </View>
        </Reveal>

        {/* Métricas reales */}
        <Reveal index={3}>
          <View style={styles.metricsRow}>
            <MetricCard
              icon="calendar-outline"
              label="Turnos hoy"
              value={String(todayCount)}
              gradient={[palette.teal, palette.primary]}
            />
            <MetricCard
              icon="clipboard-outline"
              label="Próximos 7 días"
              value={String(weekCount)}
              gradient={[palette.primary, palette.navy]}
            />
          </View>
        </Reveal>

        {/* Agenda */}
        <Reveal index={4}>
          <View style={styles.sectionHeader}>
            <View style={styles.headingRow}>
              <View style={styles.accentBar} />
              <Text style={styles.sectionTitle}>Agenda</Text>
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
              {days.map((d) => {
                const active = d.key === selectedDay;
                return (
                  <Pressable
                    key={d.key}
                    accessibilityRole="button"
                    accessibilityLabel={`Ver turnos del ${d.label} ${d.date}`}
                    accessibilityState={{ selected: active }}
                    onPress={() => setSelectedDay(d.key)}
                    style={[styles.dayCard, active && styles.dayActive]}>
                    <Text style={[styles.dayLabel, active && styles.dayTextActive]}>{d.label}</Text>
                    <Text style={[styles.dayNum, active && styles.dayTextActive]}>{d.date}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.divider} />

            {daySchedule.length > 0 ? (
              daySchedule.map((a) => (
                <ScheduleItem
                  key={a.id}
                  appt={a}
                  busyStatus={pending?.id === a.id ? pending.status : null}
                  onPressPatient={() => goToPatient(a.patientId, a.name)}
                  onAction={(status) => handleStatus(a.id, status)}
                />
              ))
            ) : (
              <EmptyState
                icon="calendar-outline"
                title="No hay turnos este día"
                subtitle="Elegí otro día o esperá a que se agenden nuevos turnos."
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
                  <Pressable
                    key={p.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Ver ficha de ${p.name}`}
                    onPress={() => goToPatient(p.id, p.name)}
                    style={({ pressed }) => [styles.patientRow, pressed && styles.rowPressed]}>
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
                  </Pressable>
                ))}
                {/* TODO(fuera de scope): pantalla de listado completo de pacientes. */}
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
  gradient,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
  gradient: readonly [string, string];
}) {
  return (
    <Card style={styles.metric}>
      <GradientIcon gradient={gradient} size={40}>
        <Ionicons name={icon} size={22} color={palette.white} />
      </GradientIcon>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
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

function ScheduleItem({
  appt,
  busyStatus,
  onPressPatient,
  onAction,
}: {
  appt: Appt;
  /** Estado que se está aplicando ahora sobre este turno, o null si no hay nada en curso. */
  busyStatus: AppointmentStatus | null;
  onPressPatient: () => void;
  onAction: (status: AppointmentStatus) => void;
}) {
  const tone = TAG_TONE[appt.tagTone];
  const busy = busyStatus !== null;
  const closed = appt.status === 'completado' || appt.status === 'cancelado';
  const badge = APPT_STATUS_BADGE[appt.status];

  return (
    <View style={styles.apptRow}>
      <View style={styles.apptTimeCol}>
        <Text style={styles.apptTime}>{appt.time}</Text>
        <Text style={styles.apptDur}>{appt.dur}</Text>
      </View>
      <View style={styles.apptTimeline}>
        <View style={[styles.apptNode, appt.status === 'confirmado' && styles.apptNodeActive]} />
        <View style={styles.apptLine} />
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ver ficha de ${appt.name}`}
        onPress={onPressPatient}
        style={({ pressed }) => [styles.apptCard, pressed && styles.rowPressed]}>
        <View style={styles.apptCardTop}>
          <Text style={styles.apptName}>{appt.name}</Text>
          <View style={[styles.apptTag, { backgroundColor: tone.bg }]}>
            <Text style={[styles.apptTagText, { color: tone.fg }]}>{appt.tag}</Text>
          </View>
        </View>
        {appt.note && <Text style={styles.apptNote}>{appt.note}</Text>}

        {closed ? (
          <View style={styles.apptStatusRow}>
            <Badge label={badge.label} tone={badge.tone} />
          </View>
        ) : (
          <View style={styles.apptActions}>
            {appt.status === 'pendiente' && (
              <Button
                label="Confirmar"
                size="md"
                fullWidth={false}
                loading={busyStatus === 'confirmado'}
                disabled={busy}
                onPress={() => onAction('confirmado')}
                style={styles.apptActionBtn}
              />
            )}
            {appt.status === 'confirmado' && (
              <Button
                label="Completar"
                size="md"
                fullWidth={false}
                loading={busyStatus === 'completado'}
                disabled={busy}
                onPress={() => onAction('completado')}
                style={styles.apptActionBtn}
              />
            )}
            <Button
              label="Cancelar"
              variant="outline"
              size="md"
              fullWidth={false}
              loading={busyStatus === 'cancelado'}
              disabled={busy}
              onPress={() => onAction('cancelado')}
              style={styles.apptActionBtn}
            />
          </View>
        )}
      </Pressable>
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

  quickRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  quickCard: { flex: 1, gap: spacing.sm },
  quickTitle: { ...typography.bodyStrong, color: palette.textPrimary, marginTop: spacing.xs },
  quickSub: { ...typography.caption, color: palette.textSecondary },

  metricsRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  metric: { flex: 1, gap: spacing.xs },
  metricLabel: { ...typography.caption, color: palette.textSecondary, marginTop: spacing.md },
  metricValue: { ...typography.h1, fontSize: 30, color: palette.textPrimary, marginTop: 2 },

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
  dayCard: { flex: 1, alignItems: 'center', paddingVertical: spacing.sm, borderRadius: radius.md, gap: 2 },
  dayActive: { backgroundColor: palette.primary },
  dayLabel: { ...typography.small, color: palette.textSecondary, fontWeight: '700' },
  dayNum: { ...typography.subtitle, color: palette.textPrimary },
  dayTextActive: { color: palette.white },
  divider: { height: 1, backgroundColor: palette.border, marginVertical: spacing.lg },

  rowPressed: { opacity: 0.7 },

  apptRow: { flexDirection: 'row', gap: spacing.sm },
  apptTimeCol: { width: 52, alignItems: 'flex-start' },
  apptTime: { ...typography.bodyStrong, color: palette.textPrimary },
  apptDur: { ...typography.small, color: palette.textMuted },
  apptTimeline: { alignItems: 'center', width: 16 },
  apptNode: { width: 10, height: 10, borderRadius: 5, backgroundColor: palette.border, marginTop: 4 },
  apptNodeActive: { backgroundColor: palette.primary },
  apptLine: { flex: 1, width: 2, backgroundColor: palette.border, marginTop: 2 },
  apptCard: {
    flex: 1,
    borderRadius: radius.md,
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
  apptStatusRow: { flexDirection: 'row', marginTop: spacing.md },
  apptActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  apptActionBtn: { flex: 1 },

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
