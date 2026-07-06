import type { BottomTabBarProps } from 'expo-router/build/react-navigation/bottom-tabs/types';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FLOATING_TAB_BAR } from '@/constants/layout';
import { palette, radius, shadow, spacing, typography } from '@/theme/tokens';

type IconLib = 'ion' | 'mci';
type TabConfig = {
  label: string;
  lib: IconLib;
  icon: string;
  iconActive?: string;
  center?: boolean;
};

// Mapa por nombre de ruta. Cubre el grupo del paciente (tabs) y el del
// odontólogo (dentist); cada layout solo renderiza las rutas que le pasa el navegador.
const TABS: Record<string, TabConfig> = {
  // Paciente
  home: { label: 'Home', lib: 'ion', icon: 'home-outline', iconActive: 'home' },
  diagnosis: { label: 'Diagnóstico', lib: 'mci', icon: 'tooth-outline', iconActive: 'tooth' },
  denta: { label: 'DENTA', lib: 'mci', icon: 'robot-happy', center: true },
  schedule: { label: 'Turnos', lib: 'ion', icon: 'calendar-outline', iconActive: 'calendar' },
  profile: { label: 'Perfil', lib: 'ion', icon: 'person-outline', iconActive: 'person' },
  // Odontólogo
  panel: { label: 'Panel', lib: 'mci', icon: 'view-dashboard-outline', iconActive: 'view-dashboard' },
  patients: { label: 'Pacientes', lib: 'ion', icon: 'people-outline', iconActive: 'people' },
  videos: { label: 'Videos', lib: 'ion', icon: 'videocam-outline', iconActive: 'videocam' },
};

function TabIcon({ lib, name, color, size }: { lib: IconLib; name: string; color: string; size: number }) {
  const Comp = lib === 'ion' ? Ionicons : MaterialCommunityIcons;
  return <Comp name={name as any} size={size} color={color} />;
}

/** Nav bar flotante con FAB central elevado para DENTA. */
export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrapper,
        { bottom: Math.max(insets.bottom, spacing.sm) + FLOATING_TAB_BAR.marginBottom },
      ]}>
      <View style={[styles.bar, shadow.floating]}>
        {state.routes.map((route, index) => {
          const cfg = TABS[route.name];
          if (!cfg) return null;
          const focused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          // Botón central elevado (DENTA)
          if (cfg.center) {
            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                accessibilityRole="button"
                accessibilityState={{ selected: focused }}
                accessibilityLabel={cfg.label}
                style={styles.tab}>
                <View style={[styles.fab, shadow.floating, focused && styles.fabActive]}>
                  <TabIcon lib={cfg.lib} name={cfg.icon} color={palette.white} size={26} />
                </View>
              </Pressable>
            );
          }

          const color = focused ? palette.primary : palette.textMuted;
          const iconName = focused ? cfg.iconActive ?? cfg.icon : cfg.icon;

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="button"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={cfg.label}
              style={styles.tab}>
              <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
                <TabIcon lib={cfg.lib} name={iconName} color={color} size={22} />
              </View>
              <Text style={[styles.label, focused && styles.labelActive]} numberOfLines={1}>
                {cfg.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: FLOATING_TAB_BAR.marginHorizontal,
    right: FLOATING_TAB_BAR.marginHorizontal,
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    height: FLOATING_TAB_BAR.height,
    backgroundColor: palette.surface,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  iconWrap: {
    width: 40,
    height: 30,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: palette.primarySoft,
  },
  label: {
    ...typography.small,
    fontSize: 10,
    color: palette.textMuted,
  },
  labelActive: {
    color: palette.primary,
    fontWeight: '700',
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -36,
    borderWidth: 4,
    borderColor: palette.surface,
  },
  fabActive: {
    backgroundColor: palette.primaryDark,
  },
});
