import { Tabs } from 'expo-router';
import React from 'react';

import ModernTabBar from '@/components/ModernTabBar';
import { useLanguage } from '@/context/LanguageContext';

export default function TabLayout() {
  const { t } = useLanguage();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <ModernTabBar {...props} />}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('tab_alarms'),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: t('tab_stats'),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tab_profile'),
        }}
      />
    </Tabs>
  );
}
