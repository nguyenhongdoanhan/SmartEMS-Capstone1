/**
 * Điều hướng chính của app (native-stack).
 * Luồng: Splash -> (chưa đăng nhập) Login -> (đã đăng nhập) Home/SOS/Tracking/FirstAid.
 */
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAuthStore } from '../store/auth';
import { useEmergencyStore } from '../store/emergency';
import { colors } from '../theme';

import LoginScreen from '../screens/Login';
import HomeScreen from '../screens/Home';
import SOSScreen from '../screens/SOS';
import TrackingScreen from '../screens/Tracking';
import FirstAidScreen from '../screens/FirstAid';

const Stack = createNativeStackNavigator();

const SCREEN_OPTIONS = {
  headerStyle: { backgroundColor: colors.primary },
  headerTintColor: colors.textOnPrimary,
  headerTitleStyle: { fontWeight: '600' },
  contentStyle: { backgroundColor: colors.background },
  animation: 'slide_from_right',
};

function Splash() {
  return (
    <View style={styles.splash}>
      <StatusBar style="light" />
      <ActivityIndicator size="large" color={colors.textOnPrimary} />
    </View>
  );
}

export default function AppNavigator() {
  const { token, ready, init } = useAuthStore();
  const connectRealtime = useEmergencyStore((s) => s.connectRealtime);

  useEffect(() => {
    init();
  }, []);

  // Đăng nhập thành công -> mở kết nối realtime duy nhất cho cả phiên
  useEffect(() => {
    if (token) connectRealtime(token);
  }, [token]);

  if (!ready) return <Splash />;

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={SCREEN_OPTIONS}>
        {!token ? (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'SmartEMS', headerBackVisible: false }} />
            <Stack.Screen name="SOS" component={SOSScreen} options={{ title: 'Gửi cứu thương' }} />
            <Stack.Screen name="Tracking" component={TrackingScreen} options={{ title: 'Theo dõi tình trạng' }} />
            <Stack.Screen name="FirstAid" component={FirstAidScreen} options={{ title: 'Sơ cấp cứu' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
