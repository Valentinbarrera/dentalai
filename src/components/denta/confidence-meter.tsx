import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { palette, radius, spacing, typography } from '@/theme/tokens';

/** Pastilla "NIVEL DE CONFIANZA" con barra animada. Crece al evacuar dudas. */
export function ConfidenceMeter({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  const anim = useRef(new Animated.Value(clamped)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: clamped,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [clamped, anim]);

  const width = anim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.pill}>
      <MaterialCommunityIcons name="shield-check" size={16} color={palette.teal} />
      <Text style={styles.label}>NIVEL DE CONFIANZA</Text>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width }]} />
      </View>
      <Text style={styles.value}>{Math.round(clamped)}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: palette.surface,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  label: { ...typography.label, color: palette.textSecondary, fontSize: 11 },
  track: {
    flex: 1,
    height: 7,
    borderRadius: radius.pill,
    backgroundColor: palette.tealLight,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: palette.teal,
  },
  value: { ...typography.caption, color: palette.teal, fontWeight: '700' },
});
