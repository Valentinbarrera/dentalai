import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { ScreenContainer } from '@/components/ui/screen-container';
import { palette, radius, spacing, typography } from '@/theme/tokens';

type ComingSoonProps = {
  title: string;
  description: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
};

/** Estado provisional prolijo para pantallas aún no construidas. */
export function ComingSoon({ title, description, icon = 'construct-outline' }: ComingSoonProps) {
  return (
    <ScreenContainer scroll={false} contentStyle={styles.center}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={40} color={palette.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <View style={styles.pill}>
        <Text style={styles.pillText}>En construcción</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: palette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: { ...typography.h2, color: palette.textPrimary, textAlign: 'center' },
  description: {
    ...typography.body,
    color: palette.textSecondary,
    textAlign: 'center',
    maxWidth: 300,
  },
  pill: {
    marginTop: spacing.md,
    backgroundColor: palette.warningSoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  pillText: { ...typography.caption, color: palette.warning, fontWeight: '700' },
});
