import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { palette, radius, spacing, typography } from '@/theme/tokens';

import type { UserRole } from '../types';

type Option = { key: UserRole; label: string; icon: keyof typeof Ionicons.glyphMap };

const OPTIONS: readonly Option[] = [
  { key: 'paciente', label: 'Soy paciente', icon: 'happy-outline' },
  { key: 'odontologo', label: 'Soy odontólogo', icon: 'medkit-outline' },
];

type Props = {
  value: UserRole;
  onChange: (role: UserRole) => void;
};

/** Selector del tipo de cuenta durante el registro. */
export function RoleSelector({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      {OPTIONS.map((opt) => {
        const active = value === opt.key;
        return (
          <Pressable
            key={opt.key}
            onPress={() => onChange(opt.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={[styles.pill, active && styles.pillActive]}>
            <Ionicons name={opt.icon} size={18} color={active ? palette.primary : palette.textMuted} />
            <Text style={[styles.pillText, active && styles.pillTextActive]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: palette.border,
    backgroundColor: palette.surfaceAlt,
  },
  pillActive: {
    borderColor: palette.primary,
    backgroundColor: palette.primarySoft,
  },
  pillText: { ...typography.caption, color: palette.textMuted, fontWeight: '600' },
  pillTextActive: { color: palette.primary },
});
