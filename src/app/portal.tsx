import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PressableCard } from '@/components/ui/pressable-card';
import { Reveal } from '@/components/ui/reveal';
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

const APPTS: Appt[] = [
  { id: 'a1', time: '09:00', dur: '45 min', name: 'Elena Rodríguez', tag: 'CONTROL', tagTone: 'teal', note: 'Control de rutina y limpieza.', primary: true },
  { id: 'a2', time: '10:00', dur: '60 min', name: 'Martín Silva', tag: 'ENDODONCIA', tagTone: 'red', scanReady: true },
  { id: 'a3', time: '11:30', dur: '30 min', name: 'Sofía Rossi', tag: 'CONSULTA', tagTone: 'neutral' },
];

type Patient = { id: string; name: string; when: string; initials: string; color: string; paid: boolean };

const PATIENTS: Patient[] = [
  { id: 'p1', name: 'Laura G.', when: 'Hoy, 08:00', initials: 'LG', color: palette.teal, paid: true },
  { id: 'p2', name: 'Carlos M.', when: 'Ayer', initials: 'CM', color: palette.primary, paid: false },
  { id: 'p3', name: 'Ana P.', when: 'Ayer', initials: 'AP', color: palette.textSecondary, paid: true },
  { id: 'p4', name: 'Jorge L.', when: 'Lun 12', initials: 'JL', color: palette.warning, paid: false },
];

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

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Volver"
          style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}>
          <Ionicons name="arrow-back" size={22} color={palette.primary} />
        </Pressable>
        <Text style={styles.logo}>DentalAI</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Notificaciones"
          style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}>
          <Ionicons name="notifications-outline" size={20} color={palette.primary} />
          <View style={styles.notifDot} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
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
            <View style={styles.credIcon}>
              <MaterialCommunityIcons name="certificate-outline" size={22} color={palette.primary} />
            </View>
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
            <MetricCard icon="calendar-outline" label="Turnos hoy" value="14" delta="12%" progress={0.75} tone={palette.primary} />
            <MetricCard icon="clipboard-outline" label="Turnos semana" value="68" delta="5%" progress={0.6} tone={palette.teal} />
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
            <Text style={styles.sectionTitle}>Agenda de Hoy</Text>
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

            {APPTS.length > 0 ? (
              APPTS.map((a) => <ScheduleItem key={a.id} appt={a} />)
            ) : (
              <EmptyState
                icon="calendar-outline"
                title="Sin turnos para hoy"
                subtitle="Cuando agendes turnos, aparecerán acá."
              />
            )}
          </Card>
        </Reveal>

        {/* Pacientes recientes */}
        <Reveal index={5}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pacientes Recientes</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Buscar pacientes"
              style={({ pressed }) => [styles.searchBtn, pressed && styles.iconBtnPressed]}>
              <Ionicons name="search" size={18} color={palette.primary} />
            </Pressable>
          </View>

          <Card style={styles.patientsCard}>
            {PATIENTS.length > 0 ? (
              <>
                <View style={styles.patientsHead}>
                  <Text style={styles.patientsHeadText}>Paciente</Text>
                  <Text style={styles.patientsHeadText}>Estado</Text>
                </View>
                {PATIENTS.map((p) => (
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
                    <Badge label={p.paid ? '● Pagado' : '● Pendiente'} tone={p.paid ? 'success' : 'danger'} />
                  </View>
                ))}
                <Button label="Ver todos los pacientes" variant="outline" onPress={() => {}} style={styles.allBtn} />
              </>
            ) : (
              <EmptyState
                icon="people-outline"
                title="Todavía no hay pacientes"
                subtitle="Los pacientes recientes se mostrarán en esta lista."
              />
            )}
          </Card>
        </Reveal>
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricCard({
  icon,
  label,
  value,
  delta,
  progress,
  tone,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
  delta: string;
  progress: number;
  tone: string;
}) {
  return (
    <Card style={styles.metric}>
      <View style={styles.metricTop}>
        <View style={styles.metricIcon}>
          <Ionicons name={icon} size={22} color={palette.primary} />
        </View>
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
  safe: { flex: 1, backgroundColor: palette.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnPressed: { opacity: 0.7, transform: [{ scale: 0.96 }] },
  notifDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.danger,
    borderWidth: 1.5,
    borderColor: palette.primaryLight,
  },
  logo: { ...typography.h2, fontSize: 20, color: palette.primary, fontWeight: '800' },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing['3xl'] },

  greeting: { ...typography.h1, color: palette.textPrimary, marginTop: spacing.sm },
  subGreeting: { ...typography.body, color: palette.textSecondary, marginTop: spacing.xs },
  newBtn: { marginTop: spacing.lg, alignSelf: 'flex-start' },

  credCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.lg },
  credFlex: { flex: 1 },
  credIcon: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: palette.primarySoft, alignItems: 'center', justifyContent: 'center' },
  credTitle: { ...typography.bodyStrong, color: palette.textPrimary },
  credSub: { ...typography.caption, color: palette.textSecondary, marginTop: 2 },

  metricsRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  metric: { flex: 1 },
  metricTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: palette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
