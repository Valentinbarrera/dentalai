import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/ui/reveal';
import { getSpecialist } from '@/lib/specialists';
import { palette, radius, spacing, typography } from '@/theme/tokens';

const ASPECTS = ['Puntualidad', 'Profesionalismo', 'Instalaciones', 'Trato cálido', 'Explicación clara'];
const LABELS = ['', 'Muy malo', 'Malo', 'Bueno', 'Muy bueno', '¡Excelente!'];

export default function RateScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const s = getSpecialist(id);

  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const toggleTag = (t: string) =>
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  if (submitted) {
    return (
      <SafeAreaView style={styles.safe}>
        <Reveal index={0} style={styles.thanks}>
          <View style={styles.thanksIcon}>
            <Ionicons name="checkmark" size={40} color={palette.white} />
          </View>
          <Text style={styles.thanksTitle}>¡Gracias por tu reseña!</Text>
          <Text style={styles.thanksText}>
            Tu opinión ayuda a otros pacientes a elegir con confianza.
          </Text>
          <Button label="Listo" onPress={() => router.back()} style={{ marginTop: spacing.xl }} fullWidth={false} />
        </Reveal>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Volver"
          style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}>
          <Ionicons name="arrow-back" size={22} color={palette.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Calificar profesional</Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Profesional */}
        <Reveal index={0}>
          <View style={styles.specialist}>
            <LinearGradient colors={[palette.primary, palette.teal]} style={styles.avatar}>
              <Ionicons name="person" size={28} color={palette.white} />
            </LinearGradient>
            <Text style={styles.name}>{s.name}</Text>
            <Text style={styles.specialty}>{s.specialty}</Text>
          </View>
        </Reveal>

        {/* Estrellas */}
        <Reveal index={1}>
          <Text style={styles.question}>¿Cómo fue tu experiencia?</Text>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((i) => {
              const on = i <= rating;
              return (
                <Pressable
                  key={i}
                  onPress={() => setRating(i)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={`Calificar con ${i} ${i === 1 ? 'estrella' : 'estrellas'}`}
                  accessibilityState={{ selected: on }}
                  style={({ pressed }) => (pressed ? styles.starPressed : undefined)}>
                  <Ionicons
                    name={on ? 'star' : 'star-outline'}
                    size={40}
                    color={on ? palette.warning : palette.border}
                  />
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.ratingLabel}>{LABELS[rating]}</Text>
        </Reveal>

        {/* Aspectos */}
        <Reveal index={2}>
          <Text style={styles.sectionLabel}>¿Qué destacarías?</Text>
          <View style={styles.tags}>
            {ASPECTS.map((t) => {
              const active = tags.includes(t);
              return (
                <Pressable
                  key={t}
                  onPress={() => toggleTag(t)}
                  accessibilityRole="button"
                  accessibilityLabel={t}
                  accessibilityState={{ selected: active }}
                  style={({ pressed }) => [styles.tag, active && styles.tagActive, pressed && styles.tagPressed]}>
                  <Text style={[styles.tagText, active && styles.tagTextActive]}>{t}</Text>
                </Pressable>
              );
            })}
          </View>
        </Reveal>

        {/* Comentario */}
        <Reveal index={3}>
          <Text style={styles.sectionLabel}>Tu comentario (opcional)</Text>
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Contá tu experiencia para ayudar a otros pacientes..."
            placeholderTextColor={palette.textMuted}
            multiline
            style={styles.input}
          />
        </Reveal>
      </ScrollView>

      <View style={[styles.ctaBar, { paddingBottom: insets.bottom + spacing.md }]}>
        <Button
          label="Enviar reseña"
          disabled={rating === 0}
          left={<Ionicons name="send" size={16} color={palette.white} />}
          onPress={() => setSubmitted(true)}
        />
      </View>
    </SafeAreaView>
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
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: palette.primaryLight, alignItems: 'center', justifyContent: 'center' },
  iconBtnPressed: { opacity: 0.7, transform: [{ scale: 0.94 }] },
  headerTitle: { ...typography.subtitle, color: palette.textPrimary },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },

  specialist: { alignItems: 'center', marginTop: spacing.lg },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  name: { ...typography.h2, fontSize: 20, color: palette.textPrimary, marginTop: spacing.md },
  specialty: { ...typography.caption, color: palette.primary, fontWeight: '600', marginTop: 2 },

  question: { ...typography.subtitle, color: palette.textPrimary, textAlign: 'center', marginTop: spacing['2xl'] },
  stars: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.lg },
  starPressed: { transform: [{ scale: 1.15 }] },
  ratingLabel: { ...typography.bodyStrong, color: palette.warning, textAlign: 'center', marginTop: spacing.md, minHeight: 22 },

  sectionLabel: { ...typography.bodyStrong, color: palette.textPrimary, marginTop: spacing['2xl'], marginBottom: spacing.md },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tag: { borderRadius: radius.pill, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surface, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  tagActive: { backgroundColor: palette.primarySoft, borderColor: palette.primary },
  tagPressed: { opacity: 0.7 },
  tagText: { ...typography.caption, color: palette.textSecondary, fontWeight: '600' },
  tagTextActive: { color: palette.primary },

  input: {
    ...typography.body,
    color: palette.textPrimary,
    backgroundColor: palette.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.lg,
    minHeight: 100,
    textAlignVertical: 'top',
  },

  ctaBar: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, backgroundColor: palette.background, borderTopWidth: 1, borderTopColor: palette.border },

  thanks: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing['3xl'] },
  thanksIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: palette.success, alignItems: 'center', justifyContent: 'center' },
  thanksTitle: { ...typography.h1, fontSize: 24, color: palette.textPrimary, textAlign: 'center', marginTop: spacing.xl },
  thanksText: { ...typography.body, color: palette.textSecondary, textAlign: 'center', marginTop: spacing.sm },
});
