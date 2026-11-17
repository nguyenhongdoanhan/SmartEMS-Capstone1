/**
 * D-09 Hồ sơ tài xế (tab "Hồ sơ") - đúng mockup:
 * - Card: avatar chữ cái + tên tài xế (từ auth - fallback "Nguyễn Văn B") +
 *   "Tài xế · AMB-07 · Trạm S1" + badge "● Đang trực" (xanh) / "● Không trực"
 *   (xám) theo store driverShift.
 * - CHUYÊN MÔN (mock - gap D8: backend chưa có profile driver): Hạng bằng
 *   "B2 · cấp cứu A" · Chứng chỉ "Sơ cấp cứu CPR · 2025" · Kinh nghiệm
 *   "3 năm · ★ 4.9" (sao dùng icon Ionicons - không dùng ký tự ★).
 * - Menu: "Đăng ký ca trực tuần sau" (gap D7 - backend chưa có shift endpoints)
 *   / "Liên hệ khẩn cấp" (gọi tổng đài 115).
 * - Nút "Kết thúc ca trực" (chữ đỏ, nền xám - đúng mockup) -> Alert xác nhận
 *   -> stopDuty: hủy ca đang chạy + đóng GPS stream ngay.
 */
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../../../components';
import { useAuthStore } from '../../../store/auth';
import { DRIVER_STATION, DRIVER_VEHICLE, useDriverShiftStore } from '../../../store/driverShift';
import { colors, fontSize, fontWeight, radius, spacing } from '../../../theme';

/** CHUYÊN MÔN (mockup D-09) - mock tĩnh chờ backend mở rộng profile (gap D8). */
const EXPERTISE = [
  { icon: 'id-card-outline', label: 'Hạng bằng', value: 'B2 · cấp cứu A' },
  { icon: 'ribbon-outline', label: 'Chứng chỉ', value: 'Sơ cấp cứu CPR · 2025' },
  { icon: 'time-outline', label: 'Kinh nghiệm', value: '3 năm', rating: '4.9' },
];

export default function DriverProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const { onDuty, stopDuty } = useDriverShiftStore();

  const name = user?.full_name || 'Nguyễn Văn B';
  const initials = name.trim().charAt(0).toUpperCase();

  const registerShift = () =>
    Alert.alert(
      'Đăng ký ca trực tuần sau',
      'Lịch đăng ký ca sẽ mở khi backend có shift endpoints (hiện ca trực đang chạy mô phỏng - gap D7).',
      [{ text: 'Đã hiểu' }],
    );

  const contactEmergency = () =>
    Alert.alert('Liên hệ khẩn cấp', 'Tổng đài cấp cứu 115\nTrung tâm điều hành SmartEMS', [
      { text: 'Gọi 115', onPress: () => Linking.openURL('tel:115') },
      { text: 'Đóng', style: 'cancel' },
    ]);

  const confirmStop = () =>
    Alert.alert('Kết thúc ca trực?', 'Ca đang chạy (nếu có) sẽ bị hủy và GPS stream sẽ đóng.', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Kết thúc', style: 'destructive', onPress: stopDuty },
    ]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* ===== Card tài xế ===== */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.role}>
            Tài xế · {DRIVER_VEHICLE.code} · {DRIVER_STATION.name}
          </Text>
          <View style={[styles.dutyBadge, onDuty ? styles.dutyBadgeOn : styles.dutyBadgeOff]}>
            <Text style={[styles.dutyBadgeText, onDuty ? styles.dutyBadgeTextOn : styles.dutyBadgeTextOff]}>
              {onDuty ? '● Đang trực' : '● Không trực'}
            </Text>
          </View>
        </View>
      </View>

      {/* ===== CHUYÊN MÔN ===== */}
      <Text style={styles.sectionLabel}>CHUYÊN MÔN</Text>
      <View style={styles.expertiseCard}>
        {EXPERTISE.map((row, i) => (
          <View
            key={row.label}
            style={[styles.expertRow, i > 0 && styles.expertRowDivider]}
            accessibilityLabel={`${row.label}: ${row.value}`}
          >
            <View style={styles.expertIcon}>
              <Ionicons name={row.icon} size={20} color={colors.blue} />
            </View>
            <Text style={styles.expertLabel}>{row.label}</Text>
            <View style={styles.expertValueWrap}>
              <Text style={styles.expertValue}>{row.value}</Text>
              {row.rating && (
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={13} color={colors.warning} />
                  <Text style={styles.ratingText}>{row.rating}</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* ===== Menu ===== */}
      <Pressable
        style={({ pressed }) => [styles.menuRow, pressed && { opacity: 0.75 }]}
        onPress={registerShift}
        accessibilityLabel="Đăng ký ca trực tuần sau"
      >
        <Ionicons name="calendar-number-outline" size={22} color={colors.text} />
        <Text style={styles.menuText}>Đăng ký ca trực tuần sau</Text>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </Pressable>
      <Pressable
        style={({ pressed }) => [styles.menuRow, pressed && { opacity: 0.75 }]}
        onPress={contactEmergency}
        accessibilityLabel="Liên hệ khẩn cấp"
      >
        <Ionicons name="warning-outline" size={22} color={colors.text} />
        <Text style={styles.menuText}>Liên hệ khẩn cấp</Text>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </Pressable>

      {/* ===== Kết thúc ca trực (chữ đỏ, nền xám - đúng mockup) ===== */}
      <AppButton
        variant="secondary"
        size="lg"
        title="Kết thúc ca trực"
        onPress={confirmStop}
        disabled={!onDuty}
        style={styles.endDutyButton}
        textStyle={{ color: colors.primary, fontWeight: fontWeight.bold }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.l, paddingBottom: spacing.xxl },

  // Card tài xế
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.l,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.l,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.blueBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
  },
  avatarText: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.blue },
  profileInfo: { flex: 1 },
  name: { fontSize: fontSize.l, fontWeight: fontWeight.bold, color: colors.text },
  role: { fontSize: fontSize.s, color: colors.textSecondary, marginTop: 2 },
  dutyBadge: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs + 1,
    marginTop: spacing.s,
  },
  dutyBadgeOn: { backgroundColor: colors.successBg },
  dutyBadgeOff: { backgroundColor: colors.bgSubtle },
  dutyBadgeText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, letterSpacing: 0.3 },
  dutyBadgeTextOn: { color: colors.successStrong },
  dutyBadgeTextOff: { color: colors.textMuted },

  // Chuyên môn
  sectionLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginTop: spacing.l,
    marginBottom: spacing.s,
  },
  expertiseCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.l,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  expertRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.l, minHeight: 56 },
  expertRowDivider: { borderTopWidth: 1, borderTopColor: colors.border },
  expertIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.m,
    backgroundColor: colors.blueBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
  },
  expertLabel: { fontSize: fontSize.m, color: colors.textSecondary, flex: 1 },
  expertValueWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.s },
  expertValue: { fontSize: fontSize.m, fontWeight: fontWeight.semibold, color: colors.text },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingText: { fontSize: fontSize.s, fontWeight: fontWeight.semibold, color: colors.warning },

  // Menu
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    backgroundColor: colors.surface,
    borderRadius: radius.l,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.l,
    minHeight: 56,
    marginTop: spacing.s,
  },
  menuText: { flex: 1, fontSize: fontSize.m, color: colors.text, fontWeight: fontWeight.medium },

  // CTA cuối - tách khỏi nhóm menu phía trên (nhịp spacing.l như các màn D-04..D-07)
  endDutyButton: { marginTop: spacing.l },
});
