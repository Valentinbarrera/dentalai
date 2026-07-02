import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

import { palette, typography } from '@/theme/tokens';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type ProgressRingProps = {
  /** Valor 0–100 */
  value: number;
  size?: number;
  strokeWidth?: number;
  /** Texto grande al centro. Default: el valor (con conteo animado). */
  centerLabel?: string;
  /** Texto chico debajo del valor */
  caption?: string;
  /** Anima el trazo y el número al montar. Default: true */
  animated?: boolean;
  /** Duración de la animación en ms. Default: 1000 */
  duration?: number;
};

/** Anillo de progreso con degradado teal→azul. El trazo se dibuja y el número cuenta. */
export function ProgressRing({
  value,
  size = 120,
  strokeWidth = 10,
  centerLabel,
  caption,
  animated = true,
  duration = 1000,
}: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const anim = useRef(new Animated.Value(animated ? 0 : clamped)).current;
  const [display, setDisplay] = useState(animated ? 0 : clamped);

  useEffect(() => {
    if (!animated) {
      setDisplay(clamped);
      anim.setValue(clamped);
      return;
    }
    const id = anim.addListener(({ value: v }) => setDisplay(Math.round(v)));
    const a = Animated.timing(anim, {
      toValue: clamped,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });
    a.start();
    return () => {
      a.stop();
      anim.removeListener(id);
    };
  }, [clamped, animated, duration, anim]);

  // offset: circunferencia (vacío) → 0 (lleno) según el valor
  const strokeDashoffset = anim.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

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
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#ringGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          // Arranca desde arriba (12 en punto)
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.center} pointerEvents="none">
        <Text style={styles.value}>{centerLabel ?? display}</Text>
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
