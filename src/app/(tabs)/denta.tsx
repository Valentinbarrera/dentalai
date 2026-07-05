import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
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

import { ChatBubble } from '@/components/denta/chat-bubble';
import { Chip } from '@/components/denta/chip';
import { ConfidenceMeter } from '@/components/denta/confidence-meter';
import { DentaAvatar } from '@/components/denta/denta-avatar';
import { BrandBand } from '@/components/ui/brand-band';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/ui/reveal';
import { CONTENT_BOTTOM_INSET } from '@/constants/layout';
import { sendDentaMessage } from '@/features/denta';
import {
  ChatMessage,
  DENTA_WELCOME,
  INITIAL_SUGGESTIONS,
  Suggestion,
  formatNow,
  nextMessageId,
} from '@/lib/denta-responses';
import { palette, radius, shadow, spacing, typography } from '@/theme/tokens';

const INITIAL_CONFIDENCE = 75;
const ERROR_REPLY =
  'Uy, no pude responder en este momento. Probá de nuevo en un ratito. 🦷';

export default function DentaScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome', role: 'denta', text: DENTA_WELCOME, time: formatNow() },
  ]);
  const [confidence, setConfidence] = useState(INITIAL_CONFIDENCE);
  const [used, setUsed] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  const remaining = INITIAL_SUGGESTIONS.filter((s) => !used.includes(s.id));

  const scrollToEnd = () =>
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));

  /** Envía un mensaje del usuario a Denta (IA real) y agrega la respuesta. */
  const send = async (text: string) => {
    const clean = text.trim();
    if (!clean || sending) return;

    const userMsg: ChatMessage = {
      id: nextMessageId(),
      role: 'user',
      text: clean,
      time: formatNow(),
    };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput('');
    setSending(true);
    scrollToEnd();

    try {
      // Mandamos el historial (rol + texto) para que la IA tenga contexto.
      const reply = await sendDentaMessage(history.map((m) => ({ role: m.role, text: m.text })));
      setMessages((prev) => [
        ...prev,
        { id: nextMessageId(), role: 'denta', text: reply, time: formatNow() },
      ]);
      setConfidence((c) => Math.min(100, c + 5));
    } catch {
      // Error honesto: no inventamos una respuesta clínica.
      setMessages((prev) => [
        ...prev,
        { id: nextMessageId(), role: 'denta', text: ERROR_REPLY, time: formatNow() },
      ]);
    } finally {
      setSending(false);
      scrollToEnd();
    }
  };

  const handleChip = (s: Suggestion) => {
    setUsed((prev) => [...prev, s.id]);
    void send(s.message);
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

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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
            {sending && <TypingBubble />}
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

        {/* Barra inferior: CTA de análisis + input de chat */}
        <View style={styles.bottomBar}>
          <Button
            label="INICIAR ANÁLISIS VISUAL"
            left={<Ionicons name="scan-outline" size={20} color={palette.white} />}
            onPress={() => router.push('/analysis/tutorial')}
          />
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Escribile a Denta…"
              placeholderTextColor={palette.textMuted}
              multiline
              editable={!sending}
              returnKeyType="send"
              blurOnSubmit={false}
              onSubmitEditing={() => send(input)}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Enviar"
              disabled={sending || !input.trim()}
              onPress={() => send(input)}
              style={({ pressed }) => [
                styles.sendBtn,
                (sending || !input.trim()) && styles.sendBtnDisabled,
                pressed && styles.sendBtnPressed,
              ]}>
              <Ionicons name="send" size={18} color={palette.white} />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/** Burbuja "Denti está escribiendo…" mientras esperamos a la IA. */
function TypingBubble() {
  return (
    <View style={styles.typingRow}>
      <LinearGradient
        colors={[palette.teal, palette.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.typingAvatar}>
        <MaterialCommunityIcons name="robot-happy" size={16} color={palette.white} />
      </LinearGradient>
      <View style={[styles.typingBubble, shadow.card]}>
        <Text style={styles.typingText}>Denti está escribiendo…</Text>
      </View>
    </View>
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

  // Indicador de "escribiendo…"
  typingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  typingAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typingBubble: {
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    borderTopLeftRadius: 6,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  typingText: { ...typography.body, color: palette.textMuted, fontStyle: 'italic' },

  // Barra inferior
  bottomBar: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: CONTENT_BOTTOM_INSET,
    backgroundColor: palette.background,
    gap: spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    minHeight: 44,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    ...typography.body,
    color: palette.textPrimary,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: palette.textMuted },
  sendBtnPressed: { opacity: 0.7 },
});
