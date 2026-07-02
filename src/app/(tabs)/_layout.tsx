import { Tabs } from 'expo-router';

import { TabBar } from '@/components/tab-bar';

export const unstable_settings = { initialRouteName: 'home' };

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="diagnosis" />
      <Tabs.Screen name="denta" />
      <Tabs.Screen name="schedule" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
