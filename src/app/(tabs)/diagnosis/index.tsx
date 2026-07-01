import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge } from '@/components/ui/badge';
import { BrandHeader } from '@/components/ui/brand-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProgressRing } from '@/components/ui/progress-ring';
import { CONTENT_BOTTOM_INSET } from '@/constants/layout';
import { AFFECTED_ZONES, AffectedZone, Severity } from '@/lib/diagnosis';
import { palette, radius, shadow, spacing, typography } from '@/theme/tokens';

const SEVERITY_COLOR: Record<Severity, string> = {
  high: palette.danger,
  medium: palette.warning,
  low: palette.success,
};

export default function ResultsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <BrandHeader />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Encabezado */}
        <View style={styles.eyebrowRow}>
          <MaterialCommunityIcons name="tooth-outline" size={16} color={palette.primary} />
          <Text style={styles.eyebrow}>ANÁLISIS COMPLETADO</Text>
        </View>
        <Text style={styles.title}>Resultados del Escaneo</Text>
        <Text style={styles.subtitle}>
          Basado en las imágenes radiográficas subidas el 24 de Octubre.
        </Text>

        {/* Diagnóstico principal */}
        <Card style={styles.diagCard}>
          <Badge label="⚠  Atención Requerida" tone="danger" />
          <Text style={styles.diagLabel}>Diagnóstico preliminar:</Text>
          <Text style={styles.diagName}>Ausencia de piezas posteriores</Text>
          <Text style={styles.diagDesc}>
            El análisis de IA detecta una pérdida significativa de piezas dentales en la zona
            posterior (molares y premolares), lo que puede comprometer la función masticatoria y la
            estructura ósea a largo plazo.
          </Text>
          <Button
            label="Ver opciones"
            left={<Ionicons name="arrow-forward" size={18} color={palette.white} />}
            onPress={() => router.push('/diagnosis/comparador')}
            style={styles.diagBtn}
          />
          <Button
            label="Ver imagen original"
            variant="outline"
            left={<Ionicons name="image-outline" size={18} color={palette.primary} />}
            onPress={() => {}}
          />
        </Card>

        {/* Nivel de confianza */}
        <LinearGradient
          colors={['#CFF3EC', '#DCEAFE']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.confCard, shadow.card]}>
          <Text style={styles.confLabel}>NIVEL DE CONFIANZA IA</Text>
          <ProgressRing value={87} size={140} strokeWidth={12} />
          <View style={styles.confFooter}>
            <MaterialCommunityIcons name="shield-check" size={16} color={palette.teal} />
            <Text style={styles.confFooterText}>Alta precisión estimada</Text>
          </View>
        </LinearGradient>

        {/* Aviso importante */}
        <View style={styles.notice}>
          <View style={styles.noticeIcon}>
            <Ionicons name="information" size={16} color={palette.white} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.noticeTitle}>Aviso Importante</Text>
            <Text style={styles.noticeText}>
              Este resultado es un análisis preliminar generado por inteligencia artificial y{' '}
              <Text style={styles.noticeBold}>
                debe ser confirmado por un profesional odontológico cualificado
              </Text>{' '}
              antes de iniciar cualquier tratamiento.
            </Text>
          </View>
        </View>

        {/* Zonas afectadas */}
        <Text style={styles.sectionTitle}>Zonas Afectadas</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.zonesRow}>
          {AFFECTED_ZONES.map((z) => (
            <ZoneCard key={z.id} zone={z} />
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

function ZoneCard({ zone }: { zone: AffectedZone }) {
  const color = SEVERITY_COLOR[zone.severity];
  return (
    <Card style={styles.zoneCard}>
      <View style={styles.zoneTop}>
        <MaterialCommunityIcons name="tooth" size={30} color={palette.textSecondary} />
        <View style={[styles.zoneDot, { backgroundColor: color }]} />
      </View>
      <Text style={styles.zoneName}>{zone.zone}</Text>
      <Text style={[styles.zoneStatus, { color }]}>{zone.status}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  flex: { flex: 1 },
  content: { paddingHorizontal: spacing.xl, paddingBottom: CONTENT_BOTTOM_INSET },

  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.sm },
  eyebrow: { ...typography.label, color: palette.primary },
  title: { ...typography.h1, color: palette.textPrimary, marginTop: spacing.sm },
  subtitle: { ...typography.body, color: palette.textSecondary, marginTop: spacing.xs },

  diagCard: { marginTop: spacing.xl },
  diagLabel: { ...typography.h2, fontSize: 22, color: palette.textPrimary, marginTop: spacing.lg },
  diagName: { ...typography.h2, fontSize: 22, color: palette.danger, marginTop: 2 },
  diagDesc: { ...typography.body, color: palette.textSecondary, marginTop: spacing.md },
  diagBtn: { marginTop: spacing.xl, marginBottom: spacing.md },

  confCard: {
    marginTop: spacing.lg,
    borderRadius: radius.xl,
    padding: spacing['2xl'],
    alignItems: 'center',
  },
  confLabel: { ...typography.label, color: palette.textSecondary, marginBottom: spacing.lg },
  confFooter: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.lg },
  confFooterText: { ...typography.caption, color: palette.textPrimary, fontWeight: '600' },

  notice: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: palette.primarySoft,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  noticeIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: palette.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noticeTitle: { ...typography.bodyStrong, color: palette.textPrimary, marginBottom: 2 },
  noticeText: { ...typography.caption, color: palette.textSecondary, lineHeight: 19 },
  noticeBold: { fontWeight: '700', color: palette.textPrimary },

  sectionTitle: { ...typography.h2, fontSize: 20, color: palette.textPrimary, marginTop: spacing['2xl'], marginBottom: spacing.md },
  zonesRow: { gap: spacing.md, paddingRight: spacing.xl },
  zoneCard: { width: 200 },
  zoneTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  zoneDot: { width: 10, height: 10, borderRadius: 5 },
  zoneName: { ...typography.bodyStrong, color: palette.textPrimary, marginTop: spacing.md },
  zoneStatus: { ...typography.caption, fontWeight: '700', marginTop: 2 },
});
