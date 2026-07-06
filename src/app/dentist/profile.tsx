import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandBand } from '@/components/ui/brand-band';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Reveal } from '@/components/ui/reveal';
import { FLOATING_TAB_BAR } from '@/constants/layout';
import { updateMyProfile, useMyProfile, type Profile } from '@/features/profile';
import { palette, radius, spacing, typography } from '@/theme/tokens';

/** Normaliza un campo de texto: vacío → null (para no guardar strings vacíos). */
function toNullable(value: string): string | null {
  const clean = value.trim();
  return clean.length > 0 ? clean : null;
}

export default function PortalProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { profile, loading, error, reload } = useMyProfile();

  // Estado del formulario, hidratado cuando llega el perfil.
  const [fullName, setFullName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [matricula, setMatricula] = useState('');
  const [university, setUniversity] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Cuando el perfil carga (o se recarga), volcamos sus valores al form.
  useEffect(() => {
    if (!profile) return;
    setFullName(profile.fullName ?? '');
    setSpecialty(profile.specialty ?? '');
    setMatricula(profile.matricula ?? '');
    setUniversity(profile.university ?? '');
    setBio(profile.bio ?? '');
    setAvatarUrl(profile.avatarUrl ?? '');
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      await updateMyProfile({
        fullName: toNullable(fullName),
        specialty: toNullable(specialty),
        matricula: toNullable(matricula),
        university: toNullable(university),
        bio: toNullable(bio),
        avatarUrl: toNullable(avatarUrl),
      });
      setSaved(true);
      reload();
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : 'No pudimos guardar tu perfil.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <StatusBar style="light" />

      <BrandBand title="Mi perfil profesional" subtitle="Editá tus datos públicos" />

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.content}>
            {/* Avatar / foto */}
            <Reveal index={0}>
              <Card style={styles.avatarCard}>
                <AvatarPreview uri={avatarUrl} profile={profile} />
                <View style={styles.flex}>
                  <Text style={styles.avatarTitle}>Foto de perfil</Text>
                  <Text style={styles.avatarHint}>Pegá la URL de tu foto por ahora.</Text>
                </View>
              </Card>

              <FieldLabel>URL de la foto</FieldLabel>
              <View style={styles.inputWrap}>
                <Ionicons name="image-outline" size={18} color={palette.textMuted} />
                <TextInput
                  value={avatarUrl}
                  onChangeText={setAvatarUrl}
                  placeholder="https://…"
                  placeholderTextColor={palette.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                  accessibilityLabel="URL de la foto de perfil"
                  style={styles.input}
                />
              </View>
              {/* TODO: subida de foto con expo-image-picker + bucket (fase futura) */}
            </Reveal>

            {/* Datos de texto */}
            <Reveal index={1}>
              <FieldLabel>Nombre completo</FieldLabel>
              <View style={styles.inputWrap}>
                <Ionicons name="person-outline" size={18} color={palette.textMuted} />
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Ej: Dra. Ana Pérez"
                  placeholderTextColor={palette.textMuted}
                  accessibilityLabel="Nombre completo"
                  style={styles.input}
                />
              </View>

              <FieldLabel>Especialidad</FieldLabel>
              <View style={styles.inputWrap}>
                <MaterialCommunityIcons name="tooth-outline" size={18} color={palette.textMuted} />
                <TextInput
                  value={specialty}
                  onChangeText={setSpecialty}
                  placeholder="Ej: Ortodoncia"
                  placeholderTextColor={palette.textMuted}
                  accessibilityLabel="Especialidad"
                  style={styles.input}
                />
              </View>

              <FieldLabel>Matrícula</FieldLabel>
              <View style={styles.inputWrap}>
                <MaterialCommunityIcons
                  name="card-account-details-outline"
                  size={18}
                  color={palette.textMuted}
                />
                <TextInput
                  value={matricula}
                  onChangeText={setMatricula}
                  placeholder="Ej: MP 12345"
                  placeholderTextColor={palette.textMuted}
                  accessibilityLabel="Matrícula"
                  style={styles.input}
                />
              </View>

              <FieldLabel>Universidad</FieldLabel>
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

              <FieldLabel>Biografía</FieldLabel>
              <View style={[styles.inputWrap, styles.inputWrapMultiline]}>
                <TextInput
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Contá tu experiencia, enfoque y trayectoria…"
                  placeholderTextColor={palette.textMuted}
                  accessibilityLabel="Biografía"
                  multiline
                  textAlignVertical="top"
                  style={[styles.input, styles.inputMultiline]}
                />
              </View>
            </Reveal>

            {/* Feedback */}
            {!!saveError && (
              <Text style={styles.errorMsg}>{saveError}</Text>
            )}
            {saved && !saveError && (
              <View style={styles.successRow}>
                <Ionicons name="checkmark-circle" size={18} color={palette.success} />
                <Text style={styles.successMsg}>Perfil guardado correctamente.</Text>
              </View>
            )}
          </ScrollView>

          <View
            style={[
              styles.ctaBar,
              {
                paddingBottom:
                  insets.bottom + FLOATING_TAB_BAR.height + FLOATING_TAB_BAR.marginBottom + spacing.md,
              },
            ]}>
            <Button
              label="Guardar cambios"
              loading={saving}
              onPress={handleSave}
              accessibilityLabel="Guardar cambios del perfil"
              left={
                !saving ? (
                  <Ionicons name="save-outline" size={18} color={palette.white} />
                ) : undefined
              }
            />
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

/** Preview del avatar: imagen si hay URL, si no un placeholder con inicial. */
function AvatarPreview({ uri, profile }: { uri: string; profile: Profile | null }) {
  const clean = uri.trim();
  if (clean.length > 0) {
    return <Image source={{ uri: clean }} style={styles.avatarImg} resizeMode="cover" />;
  }
  const initial = (profile?.fullName ?? '?').trim().charAt(0).toUpperCase() || '?';
  return (
    <LinearGradient
      colors={[palette.primary, palette.teal]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.avatarImg}>
      <Text style={styles.avatarInitial}>{initial}</Text>
    </LinearGradient>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.fieldLabelRow}>
      <View style={styles.accentBar} />
      <Text style={styles.fieldLabel}>{children}</Text>
    </View>
  );
}

function LoadingState() {
  return (
    <View style={styles.centered}>
      <ActivityIndicator color={palette.primary} />
      <Text style={styles.centeredText}>Cargando tu perfil…</Text>
    </View>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={styles.centered}>
      <Ionicons name="alert-circle-outline" size={40} color={palette.danger} />
      <Text style={styles.centeredText}>{message}</Text>
      <Button label="Reintentar" variant="outline" fullWidth={false} onPress={onRetry} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  flex: { flex: 1 },
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xl },

  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
  centeredText: { ...typography.body, color: palette.textSecondary, textAlign: 'center' },

  avatarCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatarImg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: palette.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarInitial: { ...typography.h2, color: palette.white, fontWeight: '800' },
  avatarTitle: { ...typography.subtitle, color: palette.textPrimary },
  avatarHint: { ...typography.caption, color: palette.textSecondary, marginTop: 2 },

  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  accentBar: { width: 4, height: 18, borderRadius: radius.pill, backgroundColor: palette.teal },
  fieldLabel: { ...typography.bodyStrong, color: palette.textPrimary },

  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: spacing.md,
  },
  inputWrapMultiline: { alignItems: 'flex-start', paddingTop: spacing.sm },
  input: { flex: 1, ...typography.body, color: palette.textPrimary, paddingVertical: spacing.md },
  inputMultiline: { minHeight: 110, paddingTop: spacing.sm },

  errorMsg: { ...typography.caption, color: palette.danger, marginTop: spacing.lg, textAlign: 'center' },
  successRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
  successMsg: { ...typography.caption, color: palette.success, fontWeight: '600' },

  ctaBar: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    backgroundColor: palette.background,
    borderTopWidth: 1,
    borderTopColor: palette.border,
  },
});
