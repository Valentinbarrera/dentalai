import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import type { ChatRole } from '@/lib/denta-responses';
import { palette, radius, shadow, spacing, typography } from '@/theme/tokens';

type ChatBubbleProps = {
  role: ChatRole;
  text: string;
  time: string;
};

export function ChatBubble({ role, text, time }: ChatBubbleProps) {
  const isDenta = role === 'denta';

  if (isDenta) {
    return (
      <View style={styles.rowDenta}>
        <LinearGradient
          colors={[palette.teal, palette.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.miniAvatar}>
          <MaterialCommunityIcons name="robot-happy" size={16} color={palette.white} />
        </LinearGradient>
        <View style={styles.dentaBubbleWrap}>
          <View style={[styles.bubble, styles.dentaBubble, shadow.card]}>
            <Text style={styles.dentaText}>{text}</Text>
          </View>
          <Text style={styles.time}>{time}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.rowUser}>
      <View style={styles.userBubbleWrap}>
        <View style={[styles.bubble, styles.userBubble]}>
          <Text style={styles.userText}>{text}</Text>
        </View>
        <Text style={[styles.time, styles.timeRight]}>{time}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rowDenta: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  rowUser: {
    alignItems: 'flex-end',
    marginTop: spacing.lg,
  },
  miniAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dentaBubbleWrap: { flexShrink: 1, maxWidth: '82%' },
  userBubbleWrap: { maxWidth: '82%' },
  bubble: {
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  dentaBubble: {
    backgroundColor: palette.surface,
    borderTopLeftRadius: 6,
    borderWidth: 1,
    borderColor: palette.border,
  },
  userBubble: {
    backgroundColor: palette.primary,
    borderTopRightRadius: 6,
  },
  dentaText: { ...typography.body, color: palette.textPrimary },
  userText: { ...typography.body, color: palette.white },
  time: { ...typography.small, color: palette.textMuted, marginTop: 4, marginLeft: spacing.xs },
  timeRight: { textAlign: 'right', marginRight: spacing.xs },
});
