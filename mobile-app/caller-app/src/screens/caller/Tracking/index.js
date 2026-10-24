/**
 * Màn Theo dõi: hiển thị tình trạng chuyến cấp cứu realtime qua WebSocket (hoặc mock).
 */
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useEmergencyStore } from '../../../store/emergency';
import { isFinalStatus, statusLabel } from '../../../constants/trip';
import { colors, fontSize, fontWeight, radius, spacing } from '../../../theme';

const WS_BADGE = {
  connected: { text: 'Realtime: đã kết nối', color: colors.success, bg: colors.successBg },
  idle: { text: 'Realtime: chờ kết nối', color: colors.textSecondary, bg: colors.surface },
  closed: { text: 'Realtime: ngắt kết nối', color: colors.warning, bg: colors.warningBg },
  error: { text: 'Realtime: lỗi kết nối', color: colors.error, bg: colors.errorBg },
  unauthorized: { text: 'Realtime: phiên hết hạn', color: colors.error, bg: colors.errorBg },
};

function formatTime(isoString) {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  } catch (err) {
    return '';
  }
}

export default function TrackingScreen({ navigation }) {
  const { emergency, timeline, wsStatus, clear } = useEmergencyStore();

  if (!emergency) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>Chưa có yêu cầu cấp cứu nào</Text>
        <Text style={styles.emptySub}>
          Khi bạn gửi SOS, mọi bước di chuyển của xe sẽ hiện realtime tại đây.
        </Text>
        <Pressable style={styles.homeBtn} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.homeBtnText}>Về màn hình chính</Text>
        </Pressable>
      </View>
    );
  }

  const done = isFinalStatus(emergency.status);
  const badge = WS_BADGE[wsStatus] || WS_BADGE.idle;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <View style={styles.statusCard}>
        <Text style={done ? styles.statusDone : styles.statusActive}>
          {statusLabel(emergency.status)}
        </Text>
        <View style={[styles.wsBadge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.wsText, { color: badge.color }]}>{badge.text}</Text>
        </View>
      </View>

      <View style={styles.timeline}>
        {timeline.map((item, index) => {
          const isLast = index === timeline.length - 1;
          const current = isLast && !done;
          return (
            <View key={`${item.status}-${item.at}`} style={styles.timelineRow}>
              <View style={styles.timelineLeft}>
                <View style={[styles.timelineDot, current && styles.timelineDotActive]} />
                {!isLast && <View style={styles.timelineLine} />}
              </View>
              <View style={styles.timelineBody}>
                <Text style={current ? styles.timelineStatusCurrent : styles.timelineStatus}>
                  {statusLabel(item.status)}
                </Text>
                <Text style={styles.timelineTime}>{formatTime(item.at)}</Text>
                {!!item.plate && <Text style={styles.timelineMeta}>Xe {item.plate}</Text>}
                {item.eta != null && <Text style={styles.timelineMeta}>Dự kiến ~{item.eta} phút nữa</Text>}
                {!!item.hospital && <Text style={styles.timelineMeta}>Đưa tới: {item.hospital}</Text>}
              </View>
            </View>
          );
        })}
      </View>

      {done && (
        <Pressable style={styles.clearBtn} onPress={clear}>
          <Text style={styles.clearBtnText}>Xóa tình huống đã hoàn tất</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.xl, paddingBottom: spacing.xxl },
  center: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyTitle: { fontSize: fontSize.l, fontWeight: fontWeight.semibold, color: colors.text, textAlign: 'center' },
  emptySub: { fontSize: fontSize.s, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.s, marginBottom: spacing.xl, lineHeight: 20 },
  homeBtn: { backgroundColor: colors.primary, borderRadius: radius.m, paddingVertical: spacing.m, paddingHorizontal: spacing.xl },
  homeBtnText: { color: colors.textOnPrimary, fontWeight: fontWeight.semibold },
  statusCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.l,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  statusActive: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.primary },
  statusDone: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.success },
  wsBadge: { alignSelf: 'flex-start', borderRadius: radius.full, paddingHorizontal: spacing.m, paddingVertical: spacing.xs, marginTop: spacing.m },
  wsText: { fontSize: fontSize.xs, fontWeight: fontWeight.medium },
  timeline: { backgroundColor: colors.surface, borderRadius: radius.l, borderWidth: 1, borderColor: colors.border, padding: spacing.l },
  timelineRow: { flexDirection: 'row', minHeight: 56 },
  timelineLeft: { alignItems: 'center', marginRight: spacing.m, width: 16 },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.textDisabled,
    marginTop: 4,
  },
  timelineDotActive: { backgroundColor: colors.primary, elevation: 3 },
  timelineLine: { flex: 1, width: 2, backgroundColor: colors.border, marginTop: 4 },
  timelineBody: { flex: 1, paddingBottom: spacing.m },
  timelineStatus: { fontSize: fontSize.m, fontWeight: fontWeight.medium, color: colors.text },
  timelineStatusCurrent: { fontSize: fontSize.m, fontWeight: fontWeight.semibold, color: colors.primary },
  timelineTime: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  timelineMeta: { fontSize: fontSize.xs, color: colors.info, marginTop: spacing.xs },
  clearBtn: {
    marginTop: spacing.l,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.m,
    paddingVertical: spacing.m,
    alignItems: 'center',
  },
  clearBtnText: { color: colors.textSecondary, fontSize: fontSize.s, fontWeight: fontWeight.medium },
});
