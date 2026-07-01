import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChatBubble } from '@/components/denta/chat-bubble';
import { Chip } from '@/components/denta/chip';
import { ConfidenceMeter } from '@/components/denta/confidence-meter';
import { DentaAvatar } from '@/components/denta/denta-avatar';
import { Button } from '@/components/ui/button';
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
import { palette, radius, spacing, typography } from '@/theme/tokens';

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
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.userAvatar}>
            <Ionicons name="person" size={18} color={palette.primary} />
          </View>
          <Text style={styles.logo}>DentalAI</Text>
        </View>
        <Pressable accessibilityLabel="Notificaciones" style={styles.bell}>
          <Ionicons name="notifications-outline" size={20} color={palette.primary} />
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.flex}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <ConfidenceMeter value={confidence} />

        {/* Hero */}
        <View style={styles.hero}>
          <DentaAvatar />
          <Text style={styles.heroTitle}>¡Hola! Soy DENTA IA</Text>
          <Text style={styles.heroSubtitle}>
            Tu asistente dental virtual. Estoy aquí para escucharte y guiarte hacia tu mejor
            sonrisa.
          </Text>
        </View>

        {/* Conversación */}
        {messages.map((m) => (
          <ChatBubble key={m.id} role={m.role} text={m.text} time={m.time} />
        ))}

        {/* Chips de sugerencias */}
        {remaining.length > 0 && (
          <View style={styles.chips}>
            {remaining.map((s) => (
              <Chip key={s.id} label={s.label} onPress={() => handleChip(s)} />
            ))}
          </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { ...typography.h2, fontSize: 20, color: palette.primary, fontWeight: '800' },
  bell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
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
