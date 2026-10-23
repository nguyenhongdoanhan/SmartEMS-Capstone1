/**
 * Màn chính: trạng thái chuyến cấp cứu đang hoạt động + lối vào SOS / Sơ cấp cứu.
 */
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAuthStore } from '../../store/auth';
import { useEmergencyStore } from '../../store/emergency';
import { isFinalStatus, statusLabel } from '../../constants/trip';
import { ENV } from '../../config/env';
import { colors, fontSize, fontWeight, radius, spacing } from '../../theme';

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuthStore();
  const { emergency, disconnectRealtime, clear } = useEmergencyStore();
  const active = emergency && !isFinalStatus(emergency.status);

  const handleLogout = async () => {
    disconnectRealtime();
    clear();
    await logout();
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.greeting}>Xin chào, {user?.full_name || 'bạn'}</Text>
      <Text style={styles.greetingSub}>Bạn cần hỗ trợ y tế khẩn cấp?</Text>

      {active ? (
        <View style={styles.activeCard}>
          <View style={styles.activeDot} />
          <View style={styles.activeInfo}>
            <Text style={styles.activeTitle}>Đang có yêu cầu cấp cứu</Text>
            <Text style={styles.activeStatus}>{statusLabel(emergency.status)}</Text>
          </View>
          <Pressable style={styles.trackBtn} onPress={() => navigation.navigate('Tracking')}>
            <Text style={styles.trackBtnText}>Theo dõi</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.idleCard}>
          <Text style={styles.idleText}>Không có yêu cầu nào đang hoạt động</Text>
        </View>
      )}

      <Pressable
        style={({ pressed }) => [styles.sosBtn, pressed && styles.sosBtnPressed]}
        onPress={() => navigation.navigate('SOS')}
      >
        <Text style={styles.sosText}>GỬI CỨU THƯƠNG</Text>
        <Text style={styles.sosSub}>Cấp cứu ngay tại vị trí của bạn</Text>
      </Pressable>

      <View style={styles.rowBtns}>
        <Pressable style={styles.subBtn} onPress={() => navigation.navigate('FirstAid')}>
          <Text style={styles.subBtnText}>Hướng dẫn sơ cứu</Text>
        </Pressable>
        {!active && emergency && (
          <Pressable style={styles.subBtn} onPress={() => navigation.navigate('Tracking')}>
            <Text style={styles.subBtnText}>Xem chuyến cũ</Text>
          </Pressable>
        )}
      </View>

      <Pressable onPress={handleLogout} hitSlop={8}>
        <Text style={styles.logout}>Đăng xuất</Text>
      </Pressable>

      {ENV.MOCK_MODE && <Text style={styles.mockBadge}>Chế độ demo (mock data)</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.xl, paddingBottom: spacing.xxl },
  greeting: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text },
  greetingSub: { fontSize: fontSize.s, color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.xl },
  activeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningBg,
    borderWidth: 1,
    borderColor: '#FDE4C7',
    borderRadius: radius.m,
    padding: spacing.l,
    marginBottom: spacing.l,
  },
  activeDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.warning, marginRight: spacing.m },
  activeInfo: { flex: 1 },
  activeTitle: { fontSize: fontSize.m, fontWeight: fontWeight.semibold, color: colors.text },
  activeStatus: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: spacing.xs },
  trackBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.s,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s + 2,
  },
  trackBtnText: { color: colors.textOnPrimary, fontSize: fontSize.s, fontWeight: fontWeight.semibold },
  idleCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.l,
    marginBottom: spacing.l,
  },
  idleText: { fontSize: fontSize.s, color: colors.textSecondary, textAlign: 'center' },
  sosBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    elevation: 6,
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  sosBtnPressed: { backgroundColor: colors.primaryDark },
  sosText: { color: colors.textOnPrimary, fontSize: fontSize.xxl, fontWeight: fontWeight.bold, letterSpacing: 1 },
  sosSub: { color: 'rgba(255,255,255,0.85)', fontSize: fontSize.xs, marginTop: spacing.xs },
  rowBtns: { flexDirection: 'row', gap: spacing.m, marginTop: spacing.l },
  subBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.m,
    alignItems: 'center',
  },
  subBtnText: { color: colors.text, fontSize: fontSize.s, fontWeight: fontWeight.medium },
  logout: { color: colors.textSecondary, fontSize: fontSize.s, textAlign: 'center', marginTop: spacing.xl },
  mockBadge: {
    color: colors.textDisabled,
    fontSize: fontSize.xs,
    textAlign: 'center',
    marginTop: spacing.m,
  },
});
