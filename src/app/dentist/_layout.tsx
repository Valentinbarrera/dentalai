import { Tabs } from 'expo-router';

import { TabBar } from '@/components/tab-bar';

/** Navegación propia del ODONTÓLOGO (separada de las tabs del paciente). */
export const unstable_settings = { initialRouteName: 'panel' };

export default function DentistLayout() {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="panel" />
      <Tabs.Screen name="patients" />
      <Tabs.Screen name="videos" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
