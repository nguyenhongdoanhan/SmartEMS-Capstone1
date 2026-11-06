/**
 * D-08 Lịch sử ca trực (tab "Ca trực") - đúng mockup:
 * - Header của tab (DriverTabs): "Ca trực" + filter "Hôm nay ▾" (bấm đổi
 *   Hôm nay / Tất cả - icon chevron-down, không dùng ký tự ▾ để khỏi gặp
 *   lỗi render khác nhau giữa Android/iOS như bài học nút CTA D-04/D-06).
 * - Thống kê 3 ô: N ca · X km quãng đường · M tái điều động (theo filter).
 * - Danh sách chuyến HOÀN TẤT (ghi tại completeHandover -> store/driverHistory,
 *   AsyncStorage): badge HOÀN TẤT (xanh lá) / TÁI ĐỘNG (xanh dương - nhận trên
 *   tuyến về trạm) + giờ khép chuyến + "EMG-0031 · Ngã 6 Lê Duẩn" + dòng phụ
 *   "Phản hồi 8'24" · bàn giao BV Đa khoa ĐN" / "Nhận trên tuyến về trạm · X km".
 * - Backend thật: GET /trips/mine (gap D9) - hiện đọc snapshot trên máy.
 */
import React, { useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '../../../components';
import { DRIVER_CASE_STATUS } from '../../../constants/driverTrip';
import { useDriverHistoryStore } from '../../../store/driverHistory';
import { useDriverShiftStore } from '../../../store/driverShift';
import { colors, fontSize, fontWeight, radius, spacing } from '../../../theme';

/** "14:32" từ timestamp - giờ khép chuyến (bàn giao xong). */
function formatClock(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  const p = (n) => String(n).padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** "8'24"" từ số giây - thời gian CHẤP NHẬN -> TỚI HIỆN TRƯỜNG (mockup "Phản hồi 8'24"). */
function formatResponse(sec) {
  if (sec == null) return '—';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}'${String(s).padStart(2, '0')}"`;
}

export default function DriverShiftLogScreen() {
  const records = useDriverHistoryStore((s) => s.records);
  const { caseData, caseStatus, tripKm } = useDriverShiftStore();
  const [todayOnly, setTodayOnly] = useState(true);

  // Ca đang chạy (không tính DISPATCH_PENDING - chưa nhận) -> km sống cộng vào ô km.
  const activeCase = caseData && caseStatus !== DRIVER_CASE_STATUS.DISPATCH_PENDING ? caseData : null;

  const trips = useMemo(() => {
    if (!todayOnly) return records;
    const todayKey = new Date().toDateString();
    return records.filter((r) => new Date(r.completedAt).toDateString() === todayKey);
  }, [records, todayOnly]);

  const kmTotal =
    trips.reduce((sum, r) => sum + (r.km || 0), 0) +
    (activeCase && todayOnly ? tripKm : 0); // km chuyến sống chỉ hợp kể trong "Hôm nay"
  const reassignedCount = trips.filter((r) => r.reassigned).length;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* Filter khoảng thời gian (mockup: "Hôm nay ▾") */}
      <Pressable
        style={({ pressed }) => [styles.filterChip, pressed && { opacity: 0.75 }]}
        onPress={() => setTodayOnly((v) => !v)}
        accessibilityLabel="Đổi khoảng thời gian xem lịch sử"
      >
        <Text style={styles.filterText}>{todayOnly ? 'Hôm nay' : 'Tất cả'}</Text>
        <Ionicons name="chevron-down" size={14} color={colors.textSecondary} />
      </Pressable>

      {/* Thống kê 3 ô (mockup: 3 ca · 62 km · 1 tái điều động) */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{trips.length}</Text>
          <Text style={styles.statLabel}>ca</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{Math.round(kmTotal * 10) / 10}</Text>
          <Text style={styles.statLabel}>km quãng đường</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{reassignedCount}</Text>
          <Text style={styles.statLabel}>tái điều động</Text>
        </View>
      </View>

      {/* Danh sách chuyến hoàn tất - mới nhất trước */}
      {trips.length === 0 ? (
        <EmptyState
          icon="time-outline"
          title="Chưa có chuyến nào"
          message={
            todayOnly
              ? 'Chuyến hoàn tất bàn giao trong hôm nay sẽ hiện tại đây.'
              : 'Lịch sử các chuyến đã hoàn tất sẽ hiện tại đây.'
          }
        />
      ) : (
        trips.map((t) => (
          <View key={t.id} style={styles.tripCard}>
            <View style={styles.tripTop}>
              <View style={[styles.badge, t.reassigned ? styles.badgeRe : styles.badgeDone]}>
                <Text style={[styles.badgeText, t.reassigned ? styles.badgeTextRe : styles.badgeTextDone]}>
                  {t.reassigned ? 'TÁI ĐỘNG' : 'HOÀN TẤT'}
                </Text>
              </View>
              <Text style={styles.tripTime}>{formatClock(t.completedAt)}</Text>
            </View>
            <Text style={styles.tripTitle}>
              {t.code} · {t.shortAddress}
            </Text>
            <Text style={styles.tripSub} numberOfLines={1}>
              {t.reassigned
                ? `Nhận trên tuyến về trạm · ${t.km} km`
                : `Phản hồi ${formatResponse(t.responseSec)} · bàn giao ${t.hospitalName || 'bệnh viện'}`}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.l, paddingBottom: spacing.xxl },

  // Filter "Hôm nay ▾"
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: colors.bgSubtle,
    borderRadius: radius.full,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs + 2,
    marginBottom: spacing.m,
  },
  filterText: { fontSize: fontSize.s, fontWeight: fontWeight.medium, color: colors.text },

  // Thống kê 3 ô (pattern statBox D-01)
  statsRow: { flexDirection: 'row' },
  statBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.m,
    paddingVertical: spacing.l,
    alignItems: 'center',
    marginRight: spacing.m,
  },
  statValue: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text },
  statLabel: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2, textAlign: 'center' },

  // Card chuyến
  tripCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.l,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.l,
    marginTop: spacing.m,
  },
  tripTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: { borderRadius: radius.full, paddingHorizontal: spacing.m, paddingVertical: spacing.xs + 2 },
  badgeDone: { backgroundColor: colors.successBg },
  badgeRe: { backgroundColor: colors.blueBg },
  badgeText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, letterSpacing: 0.3 },
  badgeTextDone: { color: colors.successStrong },
  badgeTextRe: { color: colors.blue },
  tripTime: { fontSize: fontSize.s, color: colors.textMuted },
  tripTitle: { fontSize: fontSize.m, fontWeight: fontWeight.bold, color: colors.text, marginTop: spacing.s },
  tripSub: { fontSize: fontSize.s, color: colors.textSecondary, marginTop: 2 },
});
