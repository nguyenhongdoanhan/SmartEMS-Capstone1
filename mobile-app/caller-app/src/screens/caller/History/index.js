/**
 * C-08 · Lịch sử yêu cầu cấp cứu:
 * - Filter chips: Tất cả (đen active) / Đang xử lý / Hoàn tất
 * - Chuyến đang chạy (emergency store) hiện đầu danh sách, badge theo trạng thái
 * - Chuyến đã kết thúc đọc từ history store (AsyncStorage - TODO #5 backend /mine)
 * - Card: badge + ngày · địa điểm đậm · "AMB-07 · phản hồi 8'24" · BV...
 * Bấm card -> C-09 chi tiết sự cố.
 */
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge, EmptyState } from '../../../components';
import { useEmergencyStore } from '../../../store/emergency';
import { useHistoryStore } from '../../../store/history';
import {
  emergencyCode,
  formatDayMonth,
  formatMinutesSeconds,
  isFinalStatus,
  isMatchingStatus,
  secondsBetween,
  statusLabel,
} from '../../../constants/trip';
import { colors, fontSize, fontWeight, radius, spacing } from '../../../theme';

const FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'processing', label: 'Đang xử lý' },
  { key: 'done', label: 'Hoàn tất' },
];

/** Badge hiển thị cho từng trạng thái (mockup C-08: HOÀN TẤT xanh / ĐANG VẬN CHUYỂN xanh dương). */
function badgeFor(status) {
  if (status === 'TRIP_COMPLETED') return { label: 'HOÀN TẤT', variant: 'success' };
  if (status === 'CANCELED') return { label: 'ĐÃ HỦY', variant: 'neutral' };
  if (status === 'TRANSPORTING') return { label: 'ĐANG VẬN CHUYỂN', variant: 'transport' };
  return { label: 'ĐANG XỬ LÝ', variant: 'warning' };
}

/** Dòng phụ "AMB-07 · phản hồi 8'24" · BV Đa khoa ĐN" tính từ snapshot record. */
function buildSubLine(record) {
  const parts = [];
  if (record.ambulance?.id) parts.push(`AMB-${String(record.ambulance.id).padStart(2, '0')}`);
  const arrived = record.timeline.find((t) => t.status === 'ARRIVED_ON_SCENE');
  const response = arrived ? formatMinutesSeconds(secondsBetween(record.createdAt, arrived.at)) : null;
  if (response) parts.push(`phản hồi ${response}`);
  const hospital = record.hospital?.name || record.timeline.find((t) => t.status === 'AT_HOSPITAL')?.hospital;
  if (hospital) parts.push(hospital);
  return parts.join(' · ');
}

export default function HistoryScreen({ navigation }) {
  const [filter, setFilter] = useState('all');
  const { emergency, timeline, ambulance, hospital, tripDistanceKm } = useEmergencyStore();
  const records = useHistoryStore((s) => s.records);

  // Chuyến đang chạy hiển thị như 1 "record sống" (chưa vào archive)
  const active = emergency && !isFinalStatus(emergency.status);
  const activeEntry = useMemo(
    () =>
      active
        ? {
            kind: 'active',
            id: emergency.id,
            status: emergency.status,
            createdAt: emergency.created_at,
            address: emergency.address,
            timeline,
            ambulance,
            hospital,
            tripDistanceKm,
            rating: null,
          }
        : null,
    [active, emergency, timeline, ambulance, hospital, tripDistanceKm],
  );

  const items = useMemo(() => {
    const archived = records.map((r) => ({ kind: 'record', ...r }));
    if (filter === 'processing') return activeEntry ? [activeEntry] : [];
    if (filter === 'done') return archived.filter((r) => r.status === 'TRIP_COMPLETED');
    return activeEntry ? [activeEntry, ...archived] : archived;
  }, [filter, records, activeEntry]);

  const openItem = (item) => {
    if (item.kind === 'active') {
      navigation.navigate(isMatchingStatus(item.status) ? 'Matching' : 'Tracking');
      return;
    }
    navigation.navigate('HistoryDetail', { emergencyId: item.id });
  };

  const renderItem = ({ item }) => {
    const badge = badgeFor(item.status);
    const sub = item.kind === 'active' ? statusLabel(item.status) : buildSubLine(item);
    return (
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={() => openItem(item)}
      >
        <View style={styles.cardTop}>
          <Badge label={badge.label} variant={badge.variant} />
          <Text style={styles.cardDate}>{formatDayMonth(item.createdAt)}</Text>
        </View>
        <Text style={styles.cardAddress} numberOfLines={2}>
          {item.address || `Vị trí SOS ${emergencyCode(item.id)}`}
        </Text>
        {sub ? <Text style={styles.cardSub} numberOfLines={1}>{sub}</Text> : null}
        {item.kind === 'active' ? (
          <View style={styles.liveRow}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Chạm để theo dõi chuyến đang chạy</Text>
          </View>
        ) : (
          <Text style={styles.cardOpen}>Xem chi tiết sự cố</Text>
        )}
      </Pressable>
    );
  };

  return (
    <View style={styles.screen}>
      {/* Filter chips - mockup: chip active nền đen */}
      <View style={styles.chipRow}>
        {FILTERS.map((f) => {
          const selected = filter === f.key;
          return (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={[styles.chip, selected && styles.chipActive]}
              accessibilityLabel={`Lọc ${f.label}`}
            >
              <Text style={[styles.chipText, selected && styles.chipTextActive]}>{f.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={items}
        keyExtractor={(item, i) => `${item.kind}-${item.id}-${i}`}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            icon={filter === 'processing' ? 'navigate-outline' : 'time-outline'}
            title={filter === 'processing' ? 'Không có yêu cầu đang xử lý' : 'Chưa có yêu cầu nào'}
            message={
              filter === 'done'
                ? 'Các ca cấp cứu hoàn tất sẽ được lưu lại ở đây.'
                : 'Lịch sử các yêu cầu cấp cứu của bạn sẽ hiển thị ở đây sau khi bạn gửi SOS.'
            }
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },

  chipRow: {
    flexDirection: 'row',
    gap: spacing.s,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  chip: {
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s,
    borderRadius: radius.full,
    backgroundColor: colors.bgSubtle,
  },
  chipActive: { backgroundColor: colors.chipActiveBg },
  chipText: { color: colors.textSecondary, fontSize: fontSize.s, fontWeight: fontWeight.medium },
  chipTextActive: { color: colors.chipActiveText, fontWeight: fontWeight.semibold },

  listContent: { padding: spacing.l, paddingBottom: spacing.xxl },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.l,
    padding: spacing.l,
    marginBottom: spacing.m,
  },
  cardPressed: { opacity: 0.85 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.s },
  cardDate: { color: colors.textSecondary, fontSize: fontSize.xs },
  cardAddress: { fontSize: fontSize.m, fontWeight: fontWeight.semibold, color: colors.text },
  cardSub: { color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 4 },
  cardOpen: { color: colors.blue, fontSize: fontSize.xs, fontWeight: fontWeight.medium, marginTop: spacing.s },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.s },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.warning },
  liveText: { color: colors.warning, fontSize: fontSize.xs, fontWeight: fontWeight.medium },
});
