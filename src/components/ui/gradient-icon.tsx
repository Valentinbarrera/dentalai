import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

import { radius } from '@/theme/tokens';

type GradientIconProps = {
  /** Ícono (blanco) a mostrar dentro del tile. */
  children: ReactNode;
  /** Par de colores del degradado (usar tokens de marca). */
  gradient: readonly [string, string];
  /** Lado del tile. Default: 46 */
  size?: number;
  /** Radio de las esquinas. Default: radius.md */
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
};

/** Tile con degradado de marca para contener un ícono. Unifica la iconografía. */
export function GradientIcon({
  children,
  gradient,
  size = 46,
  borderRadius = radius.md,
  style,
}: GradientIconProps) {
  return (
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[{ width: size, height: size, borderRadius, alignItems: 'center', justifyContent: 'center' }, style]}>
      {children}
    </LinearGradient>
  );
}
