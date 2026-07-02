import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChatBubble } from '@/components/denta/chat-bubble';
import { Chip } from '@/components/denta/chip';
import { ConfidenceMeter } from '@/components/denta/confidence-meter';
import { DentaAvatar } from '@/components/denta/denta-avatar';
import { BrandBand } from '@/components/ui/brand-band';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/ui/reveal';
import { CONTENT_BOTTOM_INSET } from '@/constants/layout';
import {
  ChatMessage,
  DENTA_WELCOME,
  INITIAL_SUGGESTIONS,
  Suggestion,
  formatNow,
  getDentaReply,
  nextMessageId,
} from '@/lib/denta-responses';
import { palette, spacing, typography } from '@/theme/tokens';

const INITIAL_CONFIDENCE = 75;

export default function DentaScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome', role: 'denta', text: DENTA_WELCOME, time: '10:42 AM' },
  ]);
  const [confidence, setConfidence] = useState(INITIAL_CONFIDENCE);
  const [used, setUsed] = useState<string[]>([]);

  const remaining = INITIAL_SUGGESTIONS.filter((s) => !used.includes(s.id));

  const handleChip = (s: Suggestion) => {
    const reply = getDentaReply(s.id);
    setMessages((prev) => [
      ...prev,
      { id: nextMessageId(), role: 'user', text: s.message, time: formatNow() },
      { id: nextMessageId(), role: 'denta', text: reply.text, time: formatNow() },
    ]);
    setConfidence((c) => Math.min(100, c + reply.confidenceDelta));
    setUsed((prev) => [...prev, s.id]);
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  };

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <StatusBar style="light" />
      <BrandBand
        title="DentalAI"
        subtitle="Tu asistente dental virtual"
        right={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Notificaciones"
            hitSlop={8}
            style={({ pressed }) => [styles.bell, pressed && styles.bellPressed]}>
            <Ionicons name="notifications-outline" size={22} color={palette.white} />
            <View style={styles.bellDot} />
          </Pressable>
        }
      />

      <ScrollView
        ref={scrollRef}
        style={styles.flex}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <Reveal index={0}>
          <ConfidenceMeter value={confidence} />
        </Reveal>

        {/* Hero */}
        <Reveal index={1} style={styles.hero}>
          <DentaAvatar />
          <Text style={styles.heroTitle}>¡Hola! Soy DENTA IA</Text>
          <Text style={styles.heroSubtitle}>
            Tu asistente dental virtual. Estoy aquí para escucharte y guiarte hacia tu mejor
            sonrisa.
          </Text>
        </Reveal>

        {/* Conversación */}
        <Reveal index={2}>
          {messages.map((m) => (
            <ChatBubble key={m.id} role={m.role} text={m.text} time={m.time} />
          ))}
        </Reveal>

        {/* Chips de sugerencias */}
        {remaining.length > 0 && (
          <Reveal index={3} style={styles.chips}>
            {remaining.map((s) => (
              <Chip key={s.id} label={s.label} onPress={() => handleChip(s)} />
            ))}
          </Reveal>
        )}
      </ScrollView>

      {/* CTA fijo */}
      <View style={styles.ctaBar}>
        <Button
          label="INICIAR ANÁLISIS VISUAL"
          left={<Ionicons name="scan-outline" size={20} color={palette.white} />}
          onPress={() => router.push('/analysis/tutorial')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  flex: { flex: 1 },
  bell: {
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
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  hero: { alignItems: 'center', marginTop: spacing['2xl'] },
  heroTitle: {
    ...typography.h2,
    color: palette.textPrimary,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  heroSubtitle: {
    ...typography.body,
    color: palette.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    maxWidth: 320,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  ctaBar: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: CONTENT_BOTTOM_INSET,
    backgroundColor: palette.background,
  },
});
