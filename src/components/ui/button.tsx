import { ActivityIndicator, Pressable, PressableProps, StyleSheet, Text, View } from 'react-native';

import { palette, radius, spacing, typography } from '@/theme/tokens';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost';
type Size = 'md' | 'lg';

type ButtonProps = Omit<PressableProps, 'children'> & {
  label: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  /** Elemento a la izquierda del label (ej: ícono) */
  left?: React.ReactNode;
  fullWidth?: boolean;
};

export function Button({
  label,
  variant = 'primary',
  size = 'lg',
  loading = false,
  left,
  fullWidth = true,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: loading }}
      disabled={isDisabled}
      style={(state) => [
        styles.base,
        size === 'lg' ? styles.lg : styles.md,
        variantStyles[variant].container,
        fullWidth && styles.fullWidth,
        state.pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}>
      {loading ? (
        <ActivityIndicator color={variantStyles[variant].text.color} />
      ) : (
        <View style={styles.content}>
          {left}
          <Text style={[styles.label, variantStyles[variant].text]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  md: { paddingVertical: spacing.md, paddingHorizontal: spacing.xl },
  lg: { paddingVertical: spacing.lg, paddingHorizontal: spacing['2xl'] },
  fullWidth: { alignSelf: 'stretch' },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  label: { ...typography.subtitle },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.5 },
});

const variantStyles: Record<Variant, { container: object; text: { color: string } }> = {
  primary: {
    container: { backgroundColor: palette.primary },
    text: { color: palette.white },
  },
  secondary: {
    container: { backgroundColor: palette.primarySoft },
    text: { color: palette.primary },
  },
  outline: {
    container: { backgroundColor: palette.surface, borderWidth: 1.5, borderColor: palette.primaryLight },
    text: { color: palette.primary },
  },
  ghost: {
    container: { backgroundColor: 'transparent' },
    text: { color: palette.primary },
  },
};
