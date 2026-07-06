import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandBand } from '@/components/ui/brand-band';
import { Button } from '@/components/ui/button';
import { GradientIcon } from '@/components/ui/gradient-icon';
import { Reveal } from '@/components/ui/reveal';
import { palette, radius, spacing, typography } from '@/theme/tokens';

const ASPECTS = ['Puntualidad', 'Profesionalismo', 'Instalaciones', 'Trato cálido', 'Explicación clara'];
const LABELS = ['', 'Muy malo', 'Malo', 'Bueno', 'Muy bueno', '¡Excelente!'];

export default function RateScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  // Profesional real elegido en el flujo de reserva (propagado por params).
  const { specialistName, specialistSubtitle } = useLocalSearchParams<{
    specialistName?: string;
    specialistSubtitle?: string;
  }>();
  const nombre = specialistName ?? 'Profesional';
  const especialidad = specialistSubtitle ?? 'Odontología general';

  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const toggleTag = (t: string) =>
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  if (submitted) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar style="dark" />
        <Reveal index={0} style={styles.thanks}>
          <GradientIcon gradient={[palette.teal, palette.primary]} size={80} borderRadius={40}>
            <Ionicons name="checkmark" size={40} color={palette.white} />
          </GradientIcon>
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
    <SafeAreaView style={styles.safe} edges={[]}>
      <StatusBar style="light" />
      <BrandBand onBack={() => router.back()} title="Calificar profesional" subtitle={nombre} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Profesional */}
        <Reveal index={0}>
          <View style={styles.specialist}>
            <GradientIcon gradient={[palette.primary, palette.teal]} size={72} borderRadius={36}>
              <Ionicons name="person" size={28} color={palette.white} />
            </GradientIcon>
            <Text style={styles.name}>{nombre}</Text>
            <Text style={styles.specialty}>{especialidad}</Text>
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
          <View style={styles.headingRow}>
            <View style={styles.accentBar} />
            <Text style={styles.sectionLabel}>¿Qué destacarías?</Text>
          </View>
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
          <View style={styles.headingRow}>
            <View style={styles.accentBar} />
            <Text style={styles.sectionLabel}>Tu comentario (opcional)</Text>
          </View>
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
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl, paddingTop: spacing.xl },

  headingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing['2xl'], marginBottom: spacing.md },
  accentBar: { width: 4, height: 18, borderRadius: radius.pill, backgroundColor: palette.teal },

  specialist: { alignItems: 'center', marginTop: spacing.sm },
  name: { ...typography.h2, fontSize: 20, color: palette.textPrimary, marginTop: spacing.md },
  specialty: { ...typography.caption, color: palette.primary, fontWeight: '600', marginTop: 2 },

  question: { ...typography.subtitle, color: palette.textPrimary, textAlign: 'center', marginTop: spacing['2xl'] },
  stars: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.lg },
  starPressed: { transform: [{ scale: 1.15 }] },
  ratingLabel: { ...typography.bodyStrong, color: palette.warning, textAlign: 'center', marginTop: spacing.md, minHeight: 22 },

  sectionLabel: { ...typography.bodyStrong, color: palette.textPrimary },
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
  thanksTitle: { ...typography.h1, fontSize: 24, color: palette.textPrimary, textAlign: 'center', marginTop: spacing.xl },
  thanksText: { ...typography.body, color: palette.textSecondary, textAlign: 'center', marginTop: spacing.sm },
});
