import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import { palette, radius, spacing, typography } from '@/theme/tokens';

type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const tones: Record<Tone, { bg: string; fg: string }> = {
  success: { bg: palette.successSoft, fg: palette.success },
  warning: { bg: palette.warningSoft, fg: palette.warning },
  danger: { bg: palette.dangerSoft, fg: palette.danger },
  info: { bg: palette.primarySoft, fg: palette.primary },
  neutral: { bg: palette.surfaceAlt, fg: palette.textSecondary },
};

type BadgeProps = {
  label: string;
  tone?: Tone;
  style?: ViewStyle;
};

/** Pastilla de estado, ej: "Óptimo", "Pagado", "Pendiente". */
export function Badge({ label, tone = 'neutral', style }: BadgeProps) {
  const c = tones[tone];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }, style]}>
      <Text style={[styles.text, { color: c.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  text: { ...typography.caption, fontWeight: '600' },
});
