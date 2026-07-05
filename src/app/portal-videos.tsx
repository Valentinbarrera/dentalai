import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge } from '@/components/ui/badge';
import { BrandBand } from '@/components/ui/brand-band';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Reveal } from '@/components/ui/reveal';
import { useAuth } from '@/features/auth';
import { createVideo, deleteVideo, useMyVideos, type Video } from '@/features/videos';
import { palette, radius, spacing, typography } from '@/theme/tokens';

/** Pantalla del odontólogo: publica videos educativos (por URL) y gestiona los propios. */
export default function PortalVideosScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const { videos, loading, error, reload } = useMyVideos(user?.id);

  // Campos del form de carga por URL.
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [duration, setDuration] = useState('');

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const canPublish = title.trim().length > 0 && !saving;

  const resetForm = () => {
    setTitle('');
    setCategory('');
    setDescription('');
    setVideoUrl('');
    setThumbnailUrl('');
    setDuration('');
  };

  const handlePublish = async () => {
    if (!canPublish) return;
    setSaving(true);
    setFormError(null);
    setSuccess(false);
    try {
      await createVideo({
        title,
        category,
        description,
        videoUrl,
        thumbnailUrl,
        duration,
      });
      resetForm();
      setSuccess(true);
      reload();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : 'No pudimos publicar el video.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setFormError(null);
    try {
      await deleteVideo(id);
      reload();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : 'No pudimos borrar el video.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <StatusBar style="light" />

      <BrandBand
        title="Videos educativos"
        subtitle="Cargá contenido para tus pacientes"
        onBack={() => router.back()}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <ScrollView
          style={styles.flex}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}>
          {/* Form de carga por URL */}
          <Reveal index={0}>
            <SectionLabel>Publicar un video</SectionLabel>
            <Card style={styles.formCard}>
              <Field label="Título" required>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Ej: Cómo cepillarte correctamente"
                  placeholderTextColor={palette.textMuted}
                  accessibilityLabel="Título del video"
                  style={styles.input}
                  editable={!saving}
                />
              </Field>

              <Field label="Categoría">
                <TextInput
                  value={category}
                  onChangeText={setCategory}
                  placeholder="Ej: Higiene, Ortodoncia…"
                  placeholderTextColor={palette.textMuted}
                  accessibilityLabel="Categoría del video"
                  style={styles.input}
                  editable={!saving}
                />
              </Field>

              <Field label="Descripción">
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Un resumen corto del contenido…"
                  placeholderTextColor={palette.textMuted}
                  accessibilityLabel="Descripción del video"
                  style={[styles.input, styles.inputMultiline]}
                  multiline
                  editable={!saving}
                />
              </Field>

              <Field label="URL del video">
                <TextInput
                  value={videoUrl}
                  onChangeText={setVideoUrl}
                  placeholder="https://…"
                  placeholderTextColor={palette.textMuted}
                  accessibilityLabel="URL del video"
                  style={styles.input}
                  autoCapitalize="none"
                  keyboardType="url"
                  editable={!saving}
                />
              </Field>

              <Field label="URL de la miniatura">
                <TextInput
                  value={thumbnailUrl}
                  onChangeText={setThumbnailUrl}
                  placeholder="https://…"
                  placeholderTextColor={palette.textMuted}
                  accessibilityLabel="URL de la miniatura"
                  style={styles.input}
                  autoCapitalize="none"
                  keyboardType="url"
                  editable={!saving}
                />
              </Field>

              <Field label="Duración">
                <TextInput
                  value={duration}
                  onChangeText={setDuration}
                  placeholder='Ej: "8:30"'
                  placeholderTextColor={palette.textMuted}
                  accessibilityLabel="Duración del video"
                  style={styles.input}
                  editable={!saving}
                />
              </Field>

              {!!formError && <Text style={styles.errorText}>{formError}</Text>}
              {success && (
                <View style={styles.successRow}>
                  <Ionicons name="checkmark-circle" size={18} color={palette.success} />
                  <Text style={styles.successText}>Video publicado.</Text>
                </View>
              )}

              <Button
                label={saving ? 'Publicando…' : 'Publicar video'}
                loading={saving}
                disabled={!canPublish}
                left={
                  !saving ? (
                    <Ionicons name="cloud-upload-outline" size={18} color={palette.white} />
                  ) : undefined
                }
                onPress={handlePublish}
                accessibilityLabel="Publicar video"
                style={styles.publishBtn}
              />
            </Card>
          </Reveal>

          {/* Lista de mis videos */}
          <Reveal index={1}>
            <SectionLabel>Mis videos</SectionLabel>

            {loading ? (
              <Card style={styles.stateCard}>
                <Text style={styles.stateText}>Cargando tus videos…</Text>
              </Card>
            ) : error ? (
              <Card style={styles.stateCard}>
                <Ionicons name="alert-circle-outline" size={22} color={palette.danger} />
                <Text style={[styles.stateText, { color: palette.danger }]}>{error}</Text>
              </Card>
            ) : videos.length === 0 ? (
              <Card style={styles.stateCard}>
                <View style={styles.emptyIcon}>
                  <Ionicons name="videocam-outline" size={26} color={palette.textMuted} />
                </View>
                <Text style={styles.emptyTitle}>Todavía no publicaste videos</Text>
                <Text style={styles.emptySub}>
                  Cargá tu primer video con el formulario de arriba.
                </Text>
              </Card>
            ) : (
              videos.map((v) => (
                <VideoRow
                  key={v.id}
                  video={v}
                  deleting={deletingId === v.id}
                  onDelete={() => handleDelete(v.id)}
                />
              ))
            )}
          </Reveal>
        </ScrollView>
      </KeyboardAvoidingView>
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

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>
        {label}
        {required ? <Text style={styles.requiredMark}> *</Text> : null}
      </Text>
      {children}
    </View>
  );
}

function VideoRow({
  video,
  deleting,
  onDelete,
}: {
  video: Video;
  deleting: boolean;
  onDelete: () => void;
}) {
  return (
    <Card style={styles.videoCard}>
      <View style={styles.videoThumb}>
        <MaterialCommunityIcons name="play-circle-outline" size={26} color={palette.primary} />
      </View>
      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle} numberOfLines={2}>
          {video.title}
        </Text>
        <View style={styles.videoMeta}>
          {video.category ? <Badge label={video.category} tone="info" /> : null}
          {video.duration ? (
            <View style={styles.durationRow}>
              <Ionicons name="time-outline" size={13} color={palette.textMuted} />
              <Text style={styles.durationText}>{video.duration}</Text>
            </View>
          ) : null}
        </View>
      </View>
      <Pressable
        onPress={onDelete}
        disabled={deleting}
        accessibilityRole="button"
        accessibilityLabel={`Borrar ${video.title}`}
        hitSlop={8}
        style={({ pressed }) => [
          styles.deleteBtn,
          pressed && styles.deletePressed,
          deleting && styles.deleteDisabled,
        ]}>
        <Ionicons name="trash-outline" size={18} color={palette.danger} />
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  flex: { flex: 1 },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing['2xl'] },

  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  accentBar: { width: 4, height: 18, borderRadius: radius.pill, backgroundColor: palette.teal },
  sectionLabel: { ...typography.bodyStrong, color: palette.textPrimary },

  formCard: { gap: spacing.md },
  field: { gap: spacing.xs },
  fieldLabel: { ...typography.caption, color: palette.textSecondary, fontWeight: '600' },
  requiredMark: { color: palette.danger },
  input: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...typography.body,
    color: palette.textPrimary,
  },
  inputMultiline: { minHeight: 80, textAlignVertical: 'top' },

  errorText: { ...typography.caption, color: palette.danger },
  successRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  successText: { ...typography.caption, color: palette.success, fontWeight: '600' },
  publishBtn: { marginTop: spacing.sm },

  stateCard: { alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.xl },
  stateText: { ...typography.body, color: palette.textSecondary, textAlign: 'center' },
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

  videoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  videoThumb: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: palette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoInfo: { flex: 1, gap: spacing.xs },
  videoTitle: { ...typography.bodyStrong, color: palette.textPrimary },
  videoMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  durationRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  durationText: { ...typography.small, color: palette.textMuted },
  deleteBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.dangerSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deletePressed: { opacity: 0.7 },
  deleteDisabled: { opacity: 0.4 },
});
