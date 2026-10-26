/**
 * D-01 Trang chủ ca trực (tab "Tổng quan") - đúng mockup UI_design_Driver_SmartEMS:
 * - Header: "Ca trực hôm nay" + ngày thực + tên trạm + avatar tài xế.
 * - Card "TRẠNG THÁI TRỰC" (nền xanh nhạt khi trực): công tắc = GATE GPS stream
 *   thật 3s/lần (watchPositionAsync trong store driverShift) - tắt trực là đóng GPS.
 * - Card xe: AMB-07 + dòng GPS live (tọa độ bản tin cuối, số bản tin đã gửi)
 *   để nghiệm thu GPS thật ngay ở GĐ1.
 * - Thống kê 3 ô: ca đã chạy / km hôm nay / giờ trực (mock - GĐ4 nối shift thật).
 * - Alert xanh nhạt: chính sách tái điều động khi RETURNING (D-07).
 * - Tab bar 4 mục nằm ở DriverTabs (tab này headerShown:false -> tự safe-area).
 */
import React, { useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuthStore } from '../../../store/auth';
import {
  DRIVER_STATION,
  DRIVER_VEHICLE,
  SHIFT_STATS_MOCK,
  useDriverShiftStore,
} from '../../../store/driverShift';
import { colors, fontSize, fontWeight, radius, spacing } from '../../../theme';

const WEEKDAYS = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

/** "12:34:56" từ timestamp - giờ cập nhật GPS bản tin cuối. */
function formatClock(ts) {
  const d = new Date(ts);
  const p = (n) => String(n).padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

export default function DriverHomeScreen() {
  const user = useAuthStore((s) => s.user);
  const { onDuty, lastPosition, packets, gpsError, startDuty, stopDuty } = useDriverShiftStore();
  const insets = useSafeAreaInsets(); // tab Tổng quan không có header -> tự safe-area

  // "Thứ 4 · 26/09 · Trạm S1 Sơn Trà" - ngày theo thiết bị, trạm theo mock.
  const dateLabel = useMemo(() => {
    const now = new Date();
    const p = (n) => String(n).padStart(2, '0');
    return `${WEEKDAYS[now.getDay()]} · ${p(now.getDate())}/${p(now.getMonth() + 1)} · ${DRIVER_STATION.name}`;
  }, []);

  const initials = (user?.full_name || 'T').trim().charAt(0).toUpperCase();

  // Bật/tắt ca trực = bật/tắt GPS stream (store lo phần xin quyền + watch).
  const toggleDuty = (value) => {
    if (value) startDuty();
    else stopDuty();
  };

  // Dòng GPS sống ở card xe - bằng chứng GPS thật cho lúc nghiệm thu.
  let gpsLine = null;
  if (gpsError === 'permission') {
    gpsLine = 'Chưa cấp quyền vị trí — bật trong Cài đặt điện thoại';
  } else if (onDuty && lastPosition) {
    gpsLine = `${lastPosition.latitude.toFixed(5)}, ${lastPosition.longitude.toFixed(5)} · ${formatClock(
      lastPosition.at,
    )} · đã gửi ${packets} bản tin`;
  } else if (onDuty) {
    gpsLine = 'Đang chờ bản tin GPS đầu tiên...';
  } else if (lastPosition) {
    gpsLine = `GPS đã ngừng · bản tin cuối ${formatClock(lastPosition.at)}`;
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.l }]}
    >
      {/* Header: tiêu đề ca trực + avatar tài xế */}
      <View style={styles.headerRow}>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Ca trực hôm nay</Text>
          <Text style={styles.headerSub}>{dateLabel}</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
      </View>

      {/* Card 1: TRẠNG THÁI TRỰC - công tắc là gate GPS stream */}
      <View style={[styles.dutyCard, onDuty ? styles.dutyCardOn : styles.dutyCardOff]}>
        <View style={styles.dutyRow}>
          <View style={styles.dutyLabelWrap}>
            <View style={[styles.dutyDot, onDuty ? styles.dutyDotOn : styles.dutyDotOff]} />
            <Text style={styles.dutyLabel}>TRẠNG THÁI TRỰC</Text>
          </View>
          <Switch
            value={onDuty}
            onValueChange={toggleDuty}
            trackColor={{ true: colors.success, false: colors.border }}
            thumbColor={colors.surface}
            accessibilityLabel="Bật tắt ca trực"
          />
        </View>
        <Text style={styles.dutySub}>{onDuty ? 'Sẵn sàng nhận ca' : 'Đang tắt trực — bật để nhận ca mới'}</Text>
      </View>

      {/* Card 2: xe được gán (mock AMB-07) + trạng thái GPS stream */}
      <View style={styles.card}>
        <View style={styles.vehicleRow}>
          <View style={styles.vehicleIcon}>
            <Ionicons name="medkit" size={22} color={colors.warning} />
          </View>
          <View style={styles.vehicleInfo}>
            <Text style={styles.vehicleTitle}>
              {DRIVER_VEHICLE.code} · {DRIVER_VEHICLE.plate}
            </Text>
            <Text style={styles.vehicleSub}>
              {DRIVER_VEHICLE.type} · GPS cập nhật 3 giây/lần
            </Text>
          </View>
        </View>
        {gpsLine ? (
          <Text style={[styles.gpsLine, gpsError === 'permission' && styles.gpsLineError]} numberOfLines={1}>
            {gpsLine}
          </Text>
        ) : null}
      </View>

      {/* Thống kê 3 ô: ca đã chạy / km hôm nay / giờ trực (mock GĐ1) */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{SHIFT_STATS_MOCK.tripsToday}</Text>
          <Text style={styles.statLabel}>ca đã chạy</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{SHIFT_STATS_MOCK.kmToday}</Text>
          <Text style={styles.statLabel}>km hôm nay</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{SHIFT_STATS_MOCK.dutyHoursLabel}</Text>
          <Text style={styles.statLabel}>giờ trực</Text>
        </View>
      </View>

      {/* Alert chính sách tái điều động trên tuyến RETURNING (D-07) */}
      <View style={styles.policyBox}>
        <Ionicons name="information-circle" size={20} color={colors.info} />
        <Text style={styles.policyText}>
          Khi đang về trạm (RETURNING), hệ thống có thể điều động bạn tới ca gần tuyến đường —
          nhận thông báo như ca mới.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.l, paddingBottom: spacing.xxl },

  // Header
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.l },
  headerTextWrap: { flex: 1 },
  headerTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text },
  headerSub: { fontSize: fontSize.s, color: colors.textSecondary, marginTop: 2 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.blueBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: fontSize.l, fontWeight: fontWeight.bold, color: colors.blue },

  // Card trạng thái trực
  dutyCard: { borderRadius: radius.l, padding: spacing.l },
  dutyCardOn: { backgroundColor: colors.successBg },
  dutyCardOff: { backgroundColor: colors.bgSubtle },
  dutyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dutyLabelWrap: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  dutyDot: { width: 10, height: 10, borderRadius: radius.full, marginRight: spacing.s },
  dutyDotOn: { backgroundColor: colors.success },
  dutyDotOff: { backgroundColor: colors.textMuted },
  dutyLabel: { fontSize: fontSize.s, fontWeight: fontWeight.bold, color: colors.text },
  dutySub: { fontSize: fontSize.s, color: colors.textSecondary, marginTop: spacing.s },

  // Card xe
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.l,
    padding: spacing.l,
    marginTop: spacing.m,
  },
  vehicleRow: { flexDirection: 'row', alignItems: 'center' },
  vehicleIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.m,
    backgroundColor: colors.warningBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
  },
  vehicleInfo: { flex: 1 },
  vehicleTitle: { fontSize: fontSize.m, fontWeight: fontWeight.bold, color: colors.text },
  vehicleSub: { fontSize: fontSize.s, color: colors.textSecondary, marginTop: 2 },
  gpsLine: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: spacing.s },
  gpsLineError: { color: colors.error },

  // Thống kê 3 ô
  statsRow: { flexDirection: 'row', marginTop: spacing.m },
  statBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.m,
    paddingVertical: spacing.l,
    alignItems: 'center',
    marginRight: spacing.m,
  },
  statValue: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text },
  statLabel: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },

  // Alert tái điều động
  policyBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.infoBg,
    borderRadius: radius.m,
    padding: spacing.l,
    marginTop: spacing.m,
  },
  policyText: { flex: 1, fontSize: fontSize.s, color: colors.textSecondary, marginLeft: spacing.s, lineHeight: 19 },
});
