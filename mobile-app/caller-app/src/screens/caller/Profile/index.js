/**
 * C-10 · Hồ sơ (khung Giai đoạn 1 - đã nối chức năng: đổi vai trò, cài đặt, đăng xuất).
 * Giai đoạn 4: hồ sơ y tế khẩn cấp (AsyncStorage, gửi kèm SOS), sửa thông tin, skin đầy đủ.
 */
import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAuthStore } from '../../../store/auth';
import { useEmergencyStore } from '../../../store/emergency';
import { Card } from '../../../components';
import { colors, fontSize, fontWeight, radius, spacing } from '../../../theme';

const COMING_SOON = () =>
  Alert.alert('Thông báo', 'Tính năng sẽ hoàn thiện ở giai đoạn tiếp theo.');

function MenuRow({ icon, label, onPress, danger = false }) {
  return (
    <Pressable style={({ pressed }) => [styles.menuRow, pressed && styles.pressed]} onPress={onPress}>
      <Ionicons name={icon} size={20} color={danger ? colors.primary : colors.textSecondary} />
      <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
      {!danger && <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />}
    </Pressable>
  );
}

export default function ProfileScreen({ navigation }) {
  const { user, setRole, logout } = useAuthStore();
  const { disconnectRealtime, clear } = useEmergencyStore();

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn chắc chắn muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          disconnectRealtime();
          clear();
          await logout();
        },
      },
    ]);
  };

  const initial = (user?.full_name || user?.email || 'U').trim().charAt(0).toUpperCase();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      {/* Thông tin người dùng */}
      <View style={styles.userRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.full_name || 'Người dùng SmartEMS'}</Text>
          <Text style={styles.userSub}>
            {user?.phone || user?.email || ''} · Caller
          </Text>
        </View>
      </View>

      {/* Card hồ sơ y tế khẩn cấp - Giai đoạn 4 bổ sung nội dung thật */}
      <Card style={styles.medicalCard}>
        <View style={styles.medicalHeader}>
          <Ionicons name="medkit-outline" size={18} color={colors.primary} />
          <Text style={styles.medicalTitle}>Hồ sơ y tế khẩn cấp</Text>
          <View style={styles.medicalDot} />
          <Text style={styles.medicalSend}>Gửi kèm SOS</Text>
        </View>
        <Text style={styles.medicalNote}>
          Nhóm máu, dị ứng, bệnh nền và liên hệ người thân sẽ được hoàn thiện ở giai đoạn tiếp
          theo và tự động gửi kèm mỗi yêu cầu SOS.
        </Text>
      </Card>

      {/* Menu */}
      <Card padded={false} style={styles.menuCard}>
        <MenuRow icon="location-outline" label="Địa chỉ thường trú" onPress={COMING_SOON} />
        <View style={styles.menuDivider} />
        <MenuRow icon="car-outline" label="Chuyển vai trò tài xế" onPress={() => setRole('driver')} />
        <View style={styles.menuDivider} />
        <MenuRow icon="settings-outline" label="Cài đặt" onPress={() => navigation.navigate('Settings')} />
      </Card>

      <Pressable style={({ pressed }) => [styles.logoutBtn, pressed && styles.pressed]} onPress={handleLogout}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.l, paddingBottom: spacing.xxl },
  pressed: { opacity: 0.7 },

  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.m,
    padding: spacing.l,
    marginBottom: spacing.m,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    backgroundColor: '#FDE7EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
  },
  avatarText: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.primary },
  userInfo: { flex: 1 },
  userName: { fontSize: fontSize.l, fontWeight: fontWeight.semibold, color: colors.text },
  userSub: { fontSize: fontSize.s, color: colors.textSecondary, marginTop: 2 },

  medicalCard: { backgroundColor: colors.primaryLight, borderColor: '#FECACA', marginBottom: spacing.m },
  medicalHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.s },
  medicalTitle: { fontSize: fontSize.m, fontWeight: fontWeight.semibold, color: colors.text },
  medicalDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },
  medicalSend: { fontSize: fontSize.xs, color: colors.successStrong },
  medicalNote: { fontSize: fontSize.s, color: colors.textSecondary, marginTop: spacing.s, lineHeight: 20 },

  menuCard: { marginBottom: spacing.l },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    paddingVertical: spacing.l,
    paddingHorizontal: spacing.l,
    minHeight: 52,
  },
  menuLabel: { flex: 1, fontSize: fontSize.m, color: colors.text },
  menuLabelDanger: { color: colors.primary },
  menuDivider: { height: 1, backgroundColor: colors.border, marginLeft: spacing.l + 20 + spacing.m },

  logoutBtn: {
    backgroundColor: colors.bgSubtle,
    borderRadius: radius.m,
    paddingVertical: spacing.m + 2,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  logoutText: { color: colors.primary, fontSize: fontSize.m, fontWeight: fontWeight.semibold },
});
