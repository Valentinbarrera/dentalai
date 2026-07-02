import { Pressable, PressableProps, StyleProp, StyleSheet, ViewStyle } from 'react-native';

import { palette, radius, shadow, spacing } from '@/theme/tokens';

type PressableCardProps = Omit<PressableProps, 'style'> & {
  /** Padding interno. Default: 'lg' */
  padded?: keyof typeof spacing | false;
  /** Quita la sombra (para cards sobre fondos claros o anidados). */
  flat?: boolean;
  /** Acepta estilos condicionales (`cond && style`) y arreglos. */
  style?: StyleProp<ViewStyle>;
};

/**
 * Card blanco tocable con feedback al presionar (scale + opacity).
 * Misma apariencia que <Card> pero interactivo. Base de las tarjetas navegables.
 */
export function PressableCard({
  children,
  padded = 'lg',
  flat = false,
  style,
  accessibilityRole = 'button',
  ...rest
}: PressableCardProps) {
  return (
    <Pressable
      accessibilityRole={accessibilityRole}
      style={({ pressed }) => [
        styles.card,
        !flat && shadow.card,
        padded !== false && { padding: spacing[padded] },
        style,
        pressed && styles.pressed,
      ]}
      {...rest}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
  },
  pressed: { opacity: 0.9, transform: [{ scale: 0.985 }] },
});
