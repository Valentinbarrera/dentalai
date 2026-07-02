import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { palette, typography } from '@/theme/tokens';

/** Header de marca reutilizable: avatar + "DentalAI" + campana. */
export function BrandHeader() {
  return (
    <View style={styles.header}>
      <View style={styles.left}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={18} color={palette.primary} />
        </View>
        <Text style={styles.logo}>DentalAI</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Notificaciones"
        style={({ pressed }) => [styles.bell, pressed && styles.bellPressed]}>
        <Ionicons name="notifications-outline" size={20} color={palette.primary} />
        <View style={styles.bellDot} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { ...typography.h2, fontSize: 20, color: palette.primary, fontWeight: '800' },
  bell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellPressed: { opacity: 0.6 },
  bellDot: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.danger,
    borderWidth: 1.5,
    borderColor: palette.primaryLight,
  },
});
