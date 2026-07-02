import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge } from '@/components/ui/badge';
import { BrandBand } from '@/components/ui/brand-band';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GradientIcon } from '@/components/ui/gradient-icon';
import { Reveal } from '@/components/ui/reveal';
import { palette, radius, spacing, typography } from '@/theme/tokens';

export default function CredentialsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [diploma, setDiploma] = useState<string | null>(null);
  const [matricula, setMatricula] = useState('');
  const [university, setUniversity] = useState('');
  const [saved, setSaved] = useState(false);

  const pickFromGallery = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    if (!res.canceled) setDiploma(res.assets[0].uri);
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!res.canceled) setDiploma(res.assets[0].uri);
  };

  const complete = !!diploma && !!matricula;

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <StatusBar style="light" />

      <BrandBand title="Credenciales Profesionales" onBack={() => router.back()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Profesional */}
        <Reveal index={0}>
          <Card style={styles.proCard}>
            <LinearGradient colors={[palette.primary, palette.teal]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.avatar}>
              <MaterialCommunityIcons name="stethoscope" size={26} color={palette.white} />
            </LinearGradient>
            <View style={styles.flex}>
              <Text style={styles.proName}>Dr. Smith</Text>
              <Text style={styles.proSpecialty}>Odontología General</Text>
            </View>
            <Badge label={saved && diploma ? '● En revisión' : '● Incompleto'} tone={saved && diploma ? 'warning' : 'neutral'} />
          </Card>
        </Reveal>

        {/* Progreso de carga */}
        <Reveal index={1}>
          <View style={styles.steps}>
            <StepChip label="Título" done={!!diploma} />
            <View style={styles.stepBar} />
            <StepChip label="Matrícula" done={!!matricula} />
            <View style={styles.stepBar} />
            <StepChip label="Universidad" done={!!university} />
          </View>
        </Reveal>

        {/* Título */}
        <Reveal index={2}>
          <SectionLabel>Título Universitario</SectionLabel>
          {diploma ? (
            <View>
              <Image source={{ uri: diploma }} style={styles.diplomaImg} resizeMode="cover" />
              <View style={styles.diplomaOverlay}>
                <Badge label="⏳ Pendiente de verificación" tone="warning" />
              </View>
              <Pressable
                onPress={pickFromGallery}
                accessibilityRole="button"
                accessibilityLabel="Cambiar la imagen del título"
                style={({ pressed }) => [styles.changeBtn, pressed && styles.pressedRow]}>
                <Ionicons name="refresh" size={16} color={palette.primary} />
                <Text style={styles.changeText}>Cambiar imagen</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.uploadBox}>
              <GradientIcon gradient={[palette.teal, palette.primary]} size={60} borderRadius={30}>
                <Ionicons name="cloud-upload-outline" size={32} color={palette.white} />
              </GradientIcon>
              <Text style={styles.uploadHint}>Subí una foto o escaneo de tu diploma</Text>
              <View style={styles.uploadBtns}>
                <Pressable
                  onPress={takePhoto}
                  accessibilityRole="button"
                  accessibilityLabel="Tomar foto del título con la cámara"
                  style={({ pressed }) => [styles.uploadBtn, pressed && styles.pressedRow]}>
                  <Ionicons name="camera-outline" size={18} color={palette.primary} />
                  <Text style={styles.uploadBtnText}>Tomar foto</Text>
                </Pressable>
                <Pressable
                  onPress={pickFromGallery}
                  accessibilityRole="button"
                  accessibilityLabel="Elegir imagen del título desde la galería"
                  style={({ pressed }) => [styles.uploadBtn, pressed && styles.pressedRow]}>
                  <Ionicons name="images-outline" size={18} color={palette.primary} />
                  <Text style={styles.uploadBtnText}>Galería</Text>
                </Pressable>
              </View>
            </View>
          )}
        </Reveal>

        {/* Datos */}
        <Reveal index={3}>
          <SectionLabel>Número de Matrícula</SectionLabel>
          <View style={styles.inputWrap}>
            <MaterialCommunityIcons name="card-account-details-outline" size={18} color={palette.textMuted} />
            <TextInput
              value={matricula}
              onChangeText={setMatricula}
              placeholder="Ej: MP 12345"
              placeholderTextColor={palette.textMuted}
              accessibilityLabel="Número de matrícula"
              style={styles.input}
            />
          </View>

          <SectionLabel>Universidad</SectionLabel>
          <View style={styles.inputWrap}>
            <Ionicons name="school-outline" size={18} color={palette.textMuted} />
            <TextInput
              value={university}
              onChangeText={setUniversity}
              placeholder="Ej: Universidad de Buenos Aires"
              placeholderTextColor={palette.textMuted}
              accessibilityLabel="Universidad"
              style={styles.input}
            />
          </View>
        </Reveal>

        {/* Nota de confianza */}
        <Reveal index={4}>
          <View style={styles.note}>
            <Ionicons name="shield-checkmark-outline" size={18} color={palette.teal} />
            <Text style={styles.noteText}>
              Verificamos tus credenciales en 24-48 hs. Una vez aprobadas, tu perfil mostrará la
              insignia de <Text style={styles.noteBold}>Profesional Verificado</Text>.
            </Text>
          </View>
        </Reveal>
      </ScrollView>

      <View style={[styles.ctaBar, { paddingBottom: insets.bottom + spacing.md }]}>
        {!complete && !saved && (
          <Text style={styles.ctaHint}>Cargá tu título y matrícula para continuar.</Text>
        )}
        <Button
          label={saved ? 'Credenciales enviadas ✓' : 'Guardar credenciales'}
          disabled={!complete}
          accessibilityLabel={saved ? 'Credenciales enviadas' : 'Guardar credenciales'}
          left={!saved ? <Ionicons name="save-outline" size={18} color={palette.white} /> : undefined}
          onPress={() => setSaved(true)}
        />
      </View>
    </SafeAreaView>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.sectionLabelRow}>
      <View style={styles.accentBar} />
      <Text style={styles.sectionLabel}>{children}</Text>
    </View>
  );
}

function StepChip({ label, done }: { label: string; done: boolean }) {
  return (
    <View style={styles.step}>
      <View style={[styles.stepDot, done && styles.stepDotDone]}>
        {done ? (
          <Ionicons name="checkmark" size={13} color={palette.white} />
        ) : (
          <View style={styles.stepDotInner} />
        )}
      </View>
      <Text style={[styles.stepLabel, done && styles.stepLabelDone]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  flex: { flex: 1 },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },

  proCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.lg },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  proName: { ...typography.subtitle, color: palette.textPrimary },
  proSpecialty: { ...typography.caption, color: palette.textSecondary, marginTop: 2 },

  steps: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.lg },
  step: { alignItems: 'center', gap: spacing.xs },
  stepDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: palette.surface,
    borderWidth: 1.5,
    borderColor: palette.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotDone: { backgroundColor: palette.teal, borderColor: palette.teal },
  stepDotInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: palette.textMuted },
  stepLabel: { ...typography.small, color: palette.textSecondary, fontWeight: '600' },
  stepLabelDone: { color: palette.tealDark },
  stepBar: { flex: 1, height: 2, backgroundColor: palette.border, marginHorizontal: spacing.sm, marginBottom: 18 },

  sectionLabelRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xl, marginBottom: spacing.md },
  accentBar: { width: 4, height: 18, borderRadius: radius.pill, backgroundColor: palette.teal },
  sectionLabel: { ...typography.bodyStrong, color: palette.textPrimary },

  uploadBox: {
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: palette.primaryLight,
    borderStyle: 'dashed',
    paddingVertical: spacing['2xl'],
    gap: spacing.md,
  },
  uploadHint: { ...typography.caption, color: palette.textSecondary },
  uploadBtns: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: palette.primarySoft, borderRadius: radius.pill, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  uploadBtnText: { ...typography.bodyStrong, color: palette.primary },
  pressedRow: { opacity: 0.7 },

  diplomaImg: { width: '100%', height: 200, borderRadius: radius.lg, backgroundColor: palette.surfaceAlt },
  diplomaOverlay: { position: 'absolute', top: spacing.md, left: spacing.md },
  changeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: spacing.md },
  changeText: { ...typography.bodyStrong, color: palette.primary },

  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: palette.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: spacing.md,
  },
  input: { flex: 1, ...typography.body, color: palette.textPrimary, paddingVertical: spacing.md },

  note: { flexDirection: 'row', gap: spacing.sm, backgroundColor: palette.tealSoft, borderRadius: radius.md, padding: spacing.lg, marginTop: spacing.xl },
  noteText: { ...typography.caption, color: palette.tealDark, flex: 1, lineHeight: 19 },
  noteBold: { fontWeight: '700' },

  ctaBar: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, backgroundColor: palette.background, borderTopWidth: 1, borderTopColor: palette.border },
  ctaHint: { ...typography.caption, color: palette.textMuted, textAlign: 'center', marginBottom: spacing.sm },
});
