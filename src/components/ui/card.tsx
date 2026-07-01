import { View, ViewProps, StyleSheet } from 'react-native';

import { palette, radius, shadow, spacing } from '@/theme/tokens';

type CardProps = ViewProps & {
  /** Padding interno del card. Default: 'lg' */
  padded?: keyof typeof spacing | false;
  /** Quita la sombra (para cards anidados o sobre fondos claros) */
  flat?: boolean;
};

/** Contenedor blanco con esquinas redondeadas y sombra suave. Base de casi todas las pantallas. */
export function Card({ style, padded = 'lg', flat = false, ...rest }: CardProps) {
  return (
    <View
      style={[
        styles.card,
        !flat && shadow.card,
        padded !== false && { padding: spacing[padded] },
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
  },
});
