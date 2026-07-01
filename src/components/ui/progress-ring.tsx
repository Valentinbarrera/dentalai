import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

import { palette, typography } from '@/theme/tokens';

type ProgressRingProps = {
  /** Valor 0–100 */
  value: number;
  size?: number;
  strokeWidth?: number;
  /** Texto grande al centro. Default: el valor. */
  centerLabel?: string;
  /** Texto chico debajo del valor */
  caption?: string;
};

/** Anillo de progreso con degradado teal→azul. Usado en "Salud Dental". */
export function ProgressRing({
  value,
  size = 120,
  strokeWidth = 10,
  centerLabel,
  caption,
}: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (clamped / 100) * circumference;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="ringGradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={palette.teal} />
            <Stop offset="1" stopColor={palette.primary} />
          </LinearGradient>
        </Defs>
        {/* Pista de fondo */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={palette.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progreso */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#ringGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${dash} ${circumference}`}
          // Arranca desde arriba (12 en punto)
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.center} pointerEvents="none">
        <Text style={styles.value}>{centerLabel ?? clamped}</Text>
        {caption ? <Text style={styles.caption}>{caption}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: { fontSize: 30, fontWeight: '700', color: palette.textPrimary },
  caption: { ...typography.small, color: palette.textSecondary },
});
