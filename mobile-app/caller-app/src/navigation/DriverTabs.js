/**
 * Bottom navigation 4 tab của vai trò Driver (D-01):
 * Tổng quan / Ca trực / Bản đồ / Hồ sơ - tab active màu đỏ (đồng bộ brand caller).
 * - Tab Tổng quan = D-01 (tự vẽ header + safe-area, headerShown:false).
 * - 3 tab còn lại hiện placeholder - nội dung thật ở GĐ4 (D-08, map, D-09).
 * - Các màn giữa chuyến (D-02 điều động, D-03 dẫn đường...) là full-screen
 *   KHÔNG có tab bar - sẽ push ở mức root stack (DriverStack) từ GĐ2.
 */
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { colors, fontSize, fontWeight } from '../theme';

import DriverHomeScreen from '../screens/driver/Home';
import DriverShiftLogScreen from '../screens/driver/ShiftLog';
import DriverMapOverviewScreen from '../screens/driver/MapOverview';
import DriverProfileScreen from '../screens/driver/Profile';

const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Overview', label: 'Tổng quan', icon: 'home', component: DriverHomeScreen, headerShown: false },
  { name: 'ShiftLog', label: 'Ca trực', icon: 'time', component: DriverShiftLogScreen, title: 'Ca trực' },
  { name: 'MapOverview', label: 'Bản đồ', icon: 'map', component: DriverMapOverviewScreen, title: 'Bản đồ' },
  { name: 'DriverProfile', label: 'Hồ sơ', icon: 'person', component: DriverProfileScreen, title: 'Hồ sơ' },
];

export default function DriverTabs() {
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
