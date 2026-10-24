/**
 * Điều hướng chính (unified 1-app-2-vai) - Giai đoạn 2.
 * Luồng: Splash -> Onboarding (chỉ lần đầu) -> Login / Đăng ký 3 bước OTP
 *   -> M-05 Chọn vai trò -> CallerTabs (bottom nav 4 tab) / DriverComingSoon.
 * currentRole = null (chưa chọn) -> RoleChoice (thay default 'caller' của GĐ1).
 * SOS / Tracking / Settings push ở mức ROOT để che bottom tab (C-04 là map full màn).
 * Lưu ý: KHÔNG bọc Stack.Screen trong Fragment - React.Children.forEach của
 * react-navigation không duyệt vào trong Fragment nên screen sẽ không đăng ký.
 */
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import { useAuthStore } from '../store/auth';
import { useEmergencyStore } from '../store/emergency';
import { colors, fontSize, fontWeight, radius, spacing } from '../theme';
import DotsLoader from '../components/DotsLoader';

import OnboardingScreen from '../screens/onboarding/Onboarding';
import LoginScreen from '../screens/auth/Login';
import RegisterPhoneScreen from '../screens/auth/RegisterPhone';
import RegisterOtpScreen from '../screens/auth/RegisterOtp';
import RegisterProfileScreen from '../screens/auth/RegisterProfile';
import RoleChoiceScreen from '../screens/auth/RoleChoice';
import CallerTabs from './CallerTabs';
import DriverComingSoonScreen from '../screens/driver/ComingSoon';
import SOSScreen from '../screens/caller/SOS';
import MatchingScreen from '../screens/caller/Matching';
import TrackingScreen from '../screens/caller/Tracking';
import CompletionScreen from '../screens/caller/Completion';
import SettingsScreen from '../screens/caller/Settings';

const Stack = createNativeStackNavigator();

const SCREEN_OPTIONS = {
  headerStyle: { backgroundColor: colors.primary },
  headerTintColor: colors.textOnPrimary,
  headerTitleStyle: { fontWeight: fontWeight.semibold },
  contentStyle: { backgroundColor: colors.background },
  animation: 'slide_from_right',
};

/** Splash tạm (M-01 sẽ hoàn thiện ở Giai đoạn 2): navy + logo đỏ + spinner. */
function Splash() {
  return (
    <View style={styles.splash}>
      <StatusBar style="light" />
      <View style={styles.logoBox}>
        <Text style={styles.logoPlus}>+</Text>
      </View>
      <View style={styles.wordRow}>
        <Text style={styles.wordSmart}>Smart</Text>
        <Text style={styles.wordEms}>EMS</Text>
      </View>
      <Text style={styles.slogan}>Điều phối cứu thương thời gian thực</Text>
      <Text style={styles.slogan2}>Phản hồi trong "giờ vàng"</Text>
      <DotsLoader style={styles.loader} />
      <Text style={styles.footer}>Nguồn mẫu học thuật · Không thay thế dịch vụ 115</Text>
    </View>
  );
}

/** Thời gian splash hiển thị tối thiểu (ms) - đảm bảo user thấy M-01 thay vì nháy mắt qua. */
const SPLASH_MIN_MS = 1600;

export default function AppNavigator() {
  const { token, ready, currentRole, onboarded, init } = useAuthStore();
  const connectRealtime = useEmergencyStore((s) => s.connectRealtime);
  const [splashMinDone, setSplashMinDone] = useState(false);

  useEffect(() => {
    init();
    const timer = setTimeout(() => setSplashMinDone(true), SPLASH_MIN_MS);
    return () => clearTimeout(timer);
  }, []);

  // Đăng nhập thành công -> mở kết nối realtime duy nhất cho cả phiên
  useEffect(() => {
    if (token) connectRealtime(token);
  }, [token]);

  // Splash hiện tối thiểu SPLASH_MIN_MS và cho tới khi khôi phục phiên xong
  if (!ready || !splashMinDone) return <Splash />;

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={SCREEN_OPTIONS}>
        {/* ===== Chưa đăng nhập: Onboarding (lần đầu) -> Login + Đăng ký 3 bước OTP ===== */}
        {!token && !onboarded ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
        ) : null}
        {!token ? (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        ) : null}
        {!token ? (
          <Stack.Screen name="RegisterPhone" component={RegisterPhoneScreen} options={{ headerShown: false }} />
        ) : null}
        {!token ? (
          <Stack.Screen name="RegisterOtp" component={RegisterOtpScreen} options={{ headerShown: false }} />
        ) : null}
        {!token ? (
          <Stack.Screen name="RegisterProfile" component={RegisterProfileScreen} options={{ headerShown: false }} />
        ) : null}

        {/* ===== Đã đăng nhập nhưng chưa chọn vai trò -> M-05 (thay default 'caller') ===== */}
        {token && !currentRole ? (
          <Stack.Screen name="RoleChoice" component={RoleChoiceScreen} options={{ headerShown: false }} />
        ) : null}
        {token && currentRole === 'driver' ? (
          <Stack.Screen
            name="DriverComingSoon"
            component={DriverComingSoonScreen}
            options={{ headerShown: false }}
          />
        ) : null}
        {token && currentRole === 'caller' ? (
          <Stack.Screen name="CallerTabs" component={CallerTabs} options={{ headerShown: false }} />
        ) : null}

        {/* Đăng ký ở root: navigate() từ trong tab tìm thấy, và che bottom tab khi push.
            Luồng GĐ3: C-01 giữ nút SOS -> SOS (C-02) -> replace Matching (C-03)
            -> tự replace Tracking (C-04) khi xe lên đường -> tự replace Completion (C-05)
            khi TRIP_COMPLETED -> "Về trang chủ" popToTop về tab. */}
        <Stack.Screen
          name="SOS"
          component={SOSScreen}
          options={{ title: 'Xác nhận vị trí của bạn', headerStyle: { backgroundColor: colors.primary } }}
        />
        <Stack.Screen
          name="Matching"
          component={MatchingScreen}
          options={{ headerShown: false, contentStyle: { backgroundColor: colors.surface } }}
        />
        <Stack.Screen name="Tracking" component={TrackingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Completion" component={CompletionScreen} options={{ headerShown: false }} />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: 'Cài đặt',
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.text,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  logoBox: {
    width: 76,
    height: 76,
    borderRadius: radius.xl,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.l,
  },
  logoPlus: { color: colors.textOnPrimary, fontSize: 52, fontWeight: fontWeight.bold, marginTop: -6 },
  wordRow: { flexDirection: 'row' },
  wordSmart: { color: colors.textOnPrimary, fontSize: fontSize.xxl, fontWeight: fontWeight.bold },
  wordEms: { color: colors.primary, fontSize: fontSize.xxl, fontWeight: fontWeight.bold },
  slogan: { color: 'rgba(255,255,255,0.7)', fontSize: fontSize.s, marginTop: spacing.s },
  slogan2: { color: 'rgba(255,255,255,0.7)', fontSize: fontSize.s, marginTop: 2 },
  loader: { marginTop: spacing.xxl },
  footer: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: fontSize.xs,
    position: 'absolute',
    bottom: spacing.xl,
  },
});
