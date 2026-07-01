import { Pressable, StyleSheet, Text } from 'react-native';

import { palette, radius, spacing, typography } from '@/theme/tokens';

type ChipProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

/** Chip de pregunta frecuente (FAQ) para arrancar la conversación con DENTA. */
export function Chip({ label, onPress, disabled }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.chip,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}>
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: palette.primaryLight,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.4 },
  text: { ...typography.bodyStrong, color: palette.primary, fontWeight: '600' },
});
