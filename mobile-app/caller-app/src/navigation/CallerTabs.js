/**
 * Bottom navigation 4 tab của vai trò Caller (C-01):
 * Trang chủ / Sơ cứu / Lịch sử / Cá nhân - tab active màu đỏ.
 * Các màn push full màn (SOS, Tracking, Settings, FirstAidDetail...) nằm ở root stack.
 */
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { colors, fontSize, fontWeight } from '../theme';

import HomeScreen from '../screens/caller/Home';
import FirstAidScreen from '../screens/caller/FirstAid';
import HistoryScreen from '../screens/caller/History';
import ProfileScreen from '../screens/caller/Profile';

const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Home', label: 'Trang chủ', icon: 'home', component: HomeScreen, headerShown: false },
  { name: 'FirstAid', label: 'Sơ cứu', icon: 'medical', component: FirstAidScreen, title: 'Sơ cứu khẩn cấp' },
  { name: 'History', label: 'Lịch sử', icon: 'time', component: HistoryScreen, title: 'Lịch sử' },
  { name: 'Profile', label: 'Cá nhân', icon: 'person', component: ProfileScreen, title: 'Hồ sơ' },
];

export default function CallerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const tab = TABS.find((t) => t.name === route.name);
        return {
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: { fontSize: fontSize.xs, fontWeight: fontWeight.medium },
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
          },
          headerShown: tab?.headerShown !== false,
          headerStyle: { backgroundColor: colors.surface },
          headerTitleStyle: { color: colors.text, fontWeight: fontWeight.semibold },
          headerTitle: tab?.title ?? tab?.label,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? tab?.icon : `${tab?.icon}-outline`} size={22} color={color} />
          ),
        };
      }}
    >
      {TABS.map((tab) => (
        <Tab.Screen key={tab.name} name={tab.name} component={tab.component} options={{ title: tab.label }} />
      ))}
    </Tab.Navigator>
  );
}
