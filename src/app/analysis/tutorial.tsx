import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { CameraGuide } from '@/components/analysis/camera-guide';
import { BrandBand } from '@/components/ui/brand-band';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GradientIcon } from '@/components/ui/gradient-icon';
import { Reveal } from '@/components/ui/reveal';
import { palette, radius, shadow, spacing, typography } from '@/theme/tokens';

type Rule = {
  icon: React.ReactNode;
  title: string;
  desc: string;
  negative?: boolean;
};

const RULES: Rule[] = [
  {
    icon: <Ionicons name="sunny" size={22} color={palette.teal} />,
    title: 'Buena Iluminación',
    desc: 'Usá luz natural o un ambiente bien iluminado.',
  },
  {
    icon: <MaterialCommunityIcons name="emoticon-happy-outline" size={22} color={palette.teal} />,
    title: 'Boca Abierta',
    desc: 'Mostrá todos los dientes posibles en la toma.',
  },
  {
    icon: <MaterialCommunityIcons name="hand-back-right-off-outline" size={22} color={palette.danger} />,
    title: 'Sin Obstáculos',
    desc: 'Evitá cubrir los dientes con la lengua o labios.',
    negative: true,
  },
  {
    icon: <MaterialCommunityIcons name="motion-outline" size={22} color={palette.danger} />,
    title: 'Sin Movimiento',
    desc: 'Mantené la cámara estable para evitar fotos borrosas.',
    negative: true,
  },
];

const STEPS = [
  { title: 'Buscá luz clara', desc: 'Acercate a una ventana o encendé una luz frontal brillante.' },
  { title: 'Sacá 3 fotos guiadas', desc: 'Frente y ambos perfiles: alineá tu sonrisa dentro del óvalo.' },
  { title: 'Grabá un video 360°', desc: 'Frente al espejo, movés el celular lento de lado a lado.' },
  { title: 'DENTA arma tu modelo 3D', desc: 'Fusiona todo para diagnosticar con más precisión.' },
];

export default function TutorialScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <StatusBar style="light" />

      <BrandBand
        title="Instrucciones de Análisis"
        subtitle="3 fotos + un video corto para tu modelo 3D"
        onBack={() => router.back()}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Reveal index={0}>
          <Text style={styles.intro}>
            Vas a sacar 3 fotos y grabar un video corto para que DENTA IA reconstruya un modelo 3D de
            tu sonrisa. Seguí estas reglas básicas para un mejor resultado.
          </Text>
        </Reveal>

        {/* Reglas 2x2 */}
        <Reveal index={1}>
          <View style={styles.rulesGrid}>
            {RULES.map((r) => (
              <RuleCard key={r.title} {...r} />
            ))}
          </View>
        </Reveal>

        {/* Guía paso a paso */}
        <Reveal index={2}>
          <Card style={styles.guideCard}>
            <View style={styles.guideHeadingRow}>
              <View style={styles.accentBar} />
              <Text style={styles.guideTitle}>Guía paso a paso</Text>
            </View>
            {STEPS.map((s, i) => (
              <View key={s.title} style={styles.stepRow}>
                <View style={styles.stepNumberCol}>
                  <GradientIcon gradient={[palette.primary, palette.navy]} size={28} borderRadius={14}>
                    <Text style={styles.stepNumberText}>{i + 1}</Text>
                  </GradientIcon>
                  {i < STEPS.length - 1 && <View style={styles.stepLine} />}
                </View>
                <View style={styles.stepTextCol}>
                  <Text style={styles.stepTitle}>{s.title}</Text>
                  <Text style={styles.stepDesc}>{s.desc}</Text>
                </View>
              </View>
            ))}
          </Card>
        </Reveal>

        {/* Mockup ilustrativo de la cámara */}
        <Reveal index={3}>
          <View style={[styles.mockup, shadow.card]}>
            <CameraGuide width={320} height={180} color={palette.teal} />
            <View style={styles.mockupBadge}>
              <Ionicons name="scan-outline" size={16} color={palette.white} />
              <Text style={styles.mockupBadgeText}>Alineá tus dientes aquí</Text>
            </View>
          </View>
        </Reveal>
      </ScrollView>

      {/* CTA fijo */}
      <View style={[styles.ctaBar, { paddingBottom: insets.bottom + spacing.md }]}>
        <Button
          label="Entendido, Abrir Cámara"
          left={<Ionicons name="camera" size={20} color={palette.white} />}
          onPress={() => router.push('/analysis/camera')}
        />
      </View>
    </SafeAreaView>
  );
}

function RuleCard({ icon, title, desc, negative }: Rule) {
  return (
    <Card
      flat
      style={[styles.ruleCard, shadow.card, negative && styles.ruleCardNegative]}
      padded="lg">
      <View style={[styles.ruleIcon, { backgroundColor: negative ? palette.dangerSoft : palette.tealSoft }]}>
        {icon}
      </View>
      <Text style={styles.ruleTitle}>{title}</Text>
      <Text style={styles.ruleDesc}>{desc}</Text>
      <Ionicons
        name={negative ? 'close-circle' : 'checkmark-circle'}
        size={22}
        color={negative ? palette.danger : palette.success}
        style={styles.ruleStatus}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
  intro: {
    ...typography.body,
    color: palette.textSecondary,
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },

  accentBar: { width: 4, height: 18, borderRadius: radius.pill, backgroundColor: palette.teal },

  rulesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  ruleCard: {
    flexBasis: '47.5%',
    flexGrow: 1,
    alignItems: 'center',
  },
  ruleCardNegative: { borderColor: palette.dangerSoft, backgroundColor: '#FFF8F8' },
  ruleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  ruleTitle: { ...typography.bodyStrong, color: palette.textPrimary, textAlign: 'center' },
  ruleDesc: {
    ...typography.small,
    color: palette.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: spacing.md,
  },
  ruleStatus: { marginTop: 'auto' },

  guideCard: { marginTop: spacing.xl },
  guideHeadingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  guideTitle: { ...typography.h2, fontSize: 20, color: palette.textPrimary },
  stepRow: { flexDirection: 'row', gap: spacing.md },
  stepNumberCol: { alignItems: 'center', width: 28 },
  stepNumberText: { ...typography.caption, color: palette.white, fontWeight: '700' },
  stepLine: { flex: 1, width: 2, backgroundColor: palette.primaryLight, marginVertical: 4 },
  stepTextCol: { flex: 1, paddingBottom: spacing.lg },
  stepTitle: { ...typography.bodyStrong, color: palette.textPrimary },
  stepDesc: { ...typography.caption, color: palette.textSecondary, marginTop: 2 },

  mockup: {
    marginTop: spacing.xl,
    height: 180,
    borderRadius: radius.lg,
    backgroundColor: '#1E293B',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mockupBadge: {
    position: 'absolute',
    bottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  mockupBadgeText: { ...typography.caption, color: palette.white, fontWeight: '600' },

  ctaBar: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    backgroundColor: palette.background,
    borderTopWidth: 1,
    borderTopColor: palette.border,
  },
});
