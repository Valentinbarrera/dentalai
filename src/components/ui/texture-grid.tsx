import { StyleSheet } from 'react-native';
import Svg, { Circle, Defs, Pattern, Rect } from 'react-native-svg';

type TextureGridProps = {
  /** Opacidad general del patrón. Default: 0.1 */
  opacity?: number;
  /** Color de los puntos. Default: blanco translúcido */
  dotColor?: string;
};

/** Textura de puntos sutil para superficies con gradiente de marca. */
export function TextureGrid({ opacity = 0.1, dotColor = 'rgba(255,255,255,0.55)' }: TextureGridProps) {
  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <Pattern id="dots" width={22} height={22} patternUnits="userSpaceOnUse">
          <Circle cx={2} cy={2} r={1.4} fill={dotColor} />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#dots)" opacity={opacity} />
    </Svg>
  );
}
