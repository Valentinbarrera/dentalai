import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { palette } from '@/theme/tokens';

/** Avatar de DENTA con anillos de glow teal. */
export function DentaAvatar({ size = 132 }: { size?: number }) {
  const glow = size * 1.34;
  const ring = size * 1.12;

  return (
    <View style={[styles.container, { width: glow, height: glow }]}>
      <View style={[styles.circle, { width: glow, height: glow, borderRadius: glow / 2, backgroundColor: palette.tealSoft, opacity: 0.7 }]} />
      <View style={[styles.circle, { width: ring, height: ring, borderRadius: ring / 2, backgroundColor: palette.tealLight }]} />
      <LinearGradient
        colors={[palette.teal, palette.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.circle, styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
        <MaterialCommunityIcons name="robot-happy" size={size * 0.5} color={palette.white} />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  circle: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  avatar: {
    borderWidth: 4,
    borderColor: palette.white,
  },
});
