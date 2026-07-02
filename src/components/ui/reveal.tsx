import { ReactNode } from 'react';
import { ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

type RevealProps = {
  children: ReactNode;
  /** Índice de orden en la pantalla; controla el delay escalonado. Default: 0 */
  index?: number;
  /** Milisegundos por paso de escalonado. Default: 60 */
  step?: number;
  /** Delay base extra en ms. Default: 0 */
  delay?: number;
  style?: ViewStyle | ViewStyle[];
};

/**
 * Envuelve una sección para darle una entrada suave (fade + slide up) escalonada.
 * Uso: <Reveal index={0}>…</Reveal>, <Reveal index={1}>…</Reveal> …
 * Unifica la animación de aparición en todas las pantallas.
 */
export function Reveal({ children, index = 0, step = 60, delay = 0, style }: RevealProps) {
  return (
    <Animated.View
      entering={FadeInDown.duration(400).delay(delay + index * step)}
      style={style}>
      {children}
    </Animated.View>
  );
}
