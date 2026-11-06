/**
 * C-09 · Chi tiết sự cố (event log):
 * - Header "< EMG-0031" + "26/08 · hoàn tất 12:12" + badge HOÀN TẤT / ĐÃ HỦY
 * - Timeline dọc dùng ĐÚNG tên event backend (SOS_CREATED, AMBULANCE_ASSIGNED...)
 *   + nhãn tiếng Việt + chi tiết (plate/score/eta/BV/phản hồi) - không tự chế event
 * - Card cuối: xe AMB-07 · 51K-234.56 / tài xế Nguyễn Văn B · ⭐ 5/5 đánh giá của bạn
 * Snapshot đọc từ history store (AsyncStorage) - backend TODO #5/#6.
 */
import React, { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Badge } from '../../../components';
import { useHistoryStore } from '../../../store/history';
import {
  STATUS_LABELS,
  emergencyCode,
  formatDayMonth,
  formatHm,
  formatMinutesSeconds,
  secondsBetween,
} from '../../../constants/trip';
import { colors, fontSize, fontWeight, radius, spacing } from '../../../theme';

/** Chi tiết thêm cho từng dòng event - tính từ entry + snapshot chuyến. */
function eventMeta(entry, record) {
  switch (entry.status) {
    case 'SOS_CREATED':
      return 'GPS tự động · yêu cầu đã tới điều phối';
    case 'AMBULANCE_ASSIGNED': {
      const score = record.ambulance?.score;
      return score ? `Ambulance matching score ${score}` : 'Điều phối đã chọn xe phù hợp';
    }
    case 'DRIVER_EN_ROUTE':
      return entry.plate ? `${entry.plate} lên đường` : 'Xe lên đường';
    case 'ARRIVED_ON_SCENE': {
      const resp = formatMinutesSeconds(secondsBetween(record.createdAt, entry.at));
      return resp ? `Phản hồi ${resp}` : 'Xe tới nơi';
    }
    case 'TRANSPORTING':
      return entry.hospital ? `Đưa bệnh nhân tới ${entry.hospital}` : 'Vận chuyển bệnh nhân';
    case 'AT_HOSPITAL':
      return entry.hospital || 'Bàn giao bệnh nhân';
    case 'TRIP_COMPLETED':
      return record.tripDistanceKm != null ? `Hoàn tất · tuyến ${record.tripDistanceKm}km` : 'Hoàn tất ca';
    default:
      return null;
  }
}

function formatHms(iso) {
  try {
    return new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch (err) {
    return '';
  }
}

export default function HistoryDetailScreen({ route, navigation }) {
  const records = useHistoryStore((s) => s.records);
  const record = records.find((r) => r.id === route.params?.emergencyId) || null;

  // Tiêu đề header = mã sự cố "EMG-0031" (trước early return - Rules of Hooks)
  useEffect(() => {
    if (record) navigation.setOptions({ title: emergencyCode(record.id) });
  }, [navigation, record]);

  if (!record) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Không tìm thấy sự cố này (có thể đã bị xóa khỏi lịch sử).</Text>
      </View>
    );
  }

  // Bỏ dòng CREATED (seed local) - event log bắt đầu từ SOS_CREATED như mockup C-09
  const events = record.timeline.filter((t) => t.status !== 'CREATED');
  const canceled = record.status === 'CANCELED';
  const badge = canceled ? { label: 'ĐÃ HỦY', variant: 'neutral' } : { label: 'HOÀN TẤT', variant: 'success' };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      {/* Header info - mockup: "26/08 · hoàn tất 12:12" + badge */}
      <View style={styles.headerRow}>
        <Text style={styles.headerDate}>
          {formatDayMonth(record.createdAt)} · {canceled ? 'đã hủy' : `hoàn tất ${formatHm(record.endedAt)}`}
        </Text>
        <Badge label={badge.label} variant={badge.variant} />
      </View>
      <Text style={styles.address}>{record.address || 'Vị trí gửi SOS'}</Text>

      {/* Event log timeline - tên event đúng backend event_types */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Nhật ký sự cố</Text>
        {events.length === 0 && (
          <Text style={styles.noEvents}>Yêu cầu bị hủy trước khi điều phối xử lý.</Text>
        )}
        {events.map((entry, i) => {
          const isLast = i === events.length - 1;
          const meta = eventMeta(entry, record);
          return (
            <View key={`${entry.status}-${i}`} style={styles.tlRow}>
              <View style={styles.tlRail}>
                <View style={[styles.tlDot, isLast && styles.tlDotDone]} />
                {!isLast ? <View style={styles.tlLine} /> : null}
              </View>
              <View style={styles.tlContent}>
                <View style={styles.tlTop}>
                  <Text style={styles.tlName}>{entry.status}</Text>
                  <Text style={styles.tlTime}>{formatHms(entry.at)}</Text>
                </View>
                <Text style={styles.tlLabel}>{STATUS_LABELS[entry.status] || ''}</Text>
                {meta ? <Text style={styles.tlMeta}>{meta}</Text> : null}
              </View>
            </View>
          );
        })}
      </View>

      {/* Card cuối: xe + tài xế + đánh giá (mockup C-09) */}
      {record.ambulance ? (
        <View style={styles.card}>
          <View style={styles.ambRow}>
            <View style={styles.ambIcon}>
              <Ionicons name="medical" size={22} color={colors.primary} />
            </View>
            <View style={styles.ambInfo}>
              <Text style={styles.ambPlate}>
                AMB-{String(record.ambulance.id).padStart(2, '0')} · {record.ambulance.plate || '—'}
              </Text>
              <Text style={styles.ambDriver}>Tài xế {record.ambulance.driver || '—'}</Text>
            </View>
          </View>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingStar}>⭐</Text>
            <Text style={styles.ratingText}>
              {record.rating != null
                ? `${record.rating}/5 · đánh giá của bạn`
                : 'Chưa đánh giá chuyến này'}
            </Text>
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background, padding: spacing.xl },
  emptyText: { color: colors.textSecondary, fontSize: fontSize.s, textAlign: 'center' },

  container: { padding: spacing.l, paddingBottom: spacing.xxl },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerDate: { color: colors.textSecondary, fontSize: fontSize.s },
  address: { color: colors.text, fontSize: fontSize.l, fontWeight: fontWeight.semibold, marginTop: spacing.s },

  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.l,
    padding: spacing.l,
    marginTop: spacing.l,
  },
  cardTitle: { color: colors.text, fontSize: fontSize.m, fontWeight: fontWeight.semibold, marginBottom: spacing.l },
  noEvents: { color: colors.textSecondary, fontSize: fontSize.s },

  tlRow: { flexDirection: 'row' },
  tlRail: { width: 22, alignItems: 'center' },
  tlDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    marginTop: 3,
  },
  tlDotDone: { backgroundColor: colors.success },
  tlLine: { width: 2, flex: 1, backgroundColor: colors.border, marginTop: 2 },
  tlContent: { flex: 1, paddingBottom: spacing.l, marginLeft: spacing.s },
  tlTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tlName: { color: colors.text, fontSize: fontSize.s + 1, fontWeight: fontWeight.bold, letterSpacing: 0.3 },
  tlTime: { color: colors.textMuted, fontSize: fontSize.xs },
  tlLabel: { color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 2 },
  tlMeta: { color: colors.text, fontSize: fontSize.xs, marginTop: 4 },

  ambRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.m },
  ambIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.m,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ambInfo: { flex: 1 },
  ambPlate: { color: colors.text, fontSize: fontSize.m, fontWeight: fontWeight.semibold },
  ambDriver: { color: colors.textSecondary, fontSize: fontSize.s, marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.s, marginTop: spacing.l },
  ratingStar: { fontSize: 16 },
  ratingText: { color: colors.text, fontSize: fontSize.s, fontWeight: fontWeight.medium },
});
