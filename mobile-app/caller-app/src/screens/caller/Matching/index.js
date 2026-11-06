/**
 * C-03 Đang ghép xe - đúng mockup tài liệu thiết kế:
 * - Header đỏ: "Đang tìm xe phù hợp..." + "EMG-0031 · đã gửi 00:38 giây trước" (đồng hồ đếm)
 * - Timeline dọc 4 bước, suy ra HOÀN TOÀN từ event backend (không tự chế trạng thái):
 *     1. "Đã gửi SOS kèm GPS"      - xong ngay khi vào màn (emergency.created_at)
 *     2. "Điều phối viên đã nhận"  - khi nhận echo SOS_CREATED từ dispatch center
 *     3. "Matching engine đang ghép xe..." - cam nhấp nháy; xong khi AMBULANCE_ASSIGNED
 *     4. "Xe được điều động · nhận ETA"  - khi DRIVER_EN_ROUTE kèm ETA -> TỰ CHUYỂN sang C-04
 * - Card vàng "Trong lúc chờ — làm ngay" + nút xám "Hủy yêu cầu (chỉ khi an toàn)"
 */
import React, { useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Animated, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useEmergencyStore } from '../../../store/emergency';
import { emergencyCode, isFinalStatus, isMatchingStatus } from '../../../constants/trip';
import { colors, fontSize, fontWeight, radius, spacing } from '../../../theme';

function formatTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch (err) {
    return '';
  }
}

function formatElapsed(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** Chấm cam nhấp nháy - trạng thái "đang xử lý" của timeline (mockup C-03: 🟠). */
function PulsingDot() {
  const opacity = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 550, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 550, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);
  return <Animated.View style={[styles.pendingDot, { opacity }]} />;
}

export default function MatchingScreen({ navigation }) {
  const { emergency, timeline, cancelSOS } = useEmergencyStore();
  const [elapsed, setElapsed] = useState(0);

  const status = emergency?.status;
  const code = emergency ? emergencyCode(emergency.id) : '';
  const createdAt = emergency?.created_at;

  // Đồng hồ "đã gửi 00:38 giây trước"
  useEffect(() => {
    if (!createdAt) return undefined;
    const tick = () => setElapsed(Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000)));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [createdAt]);

  // Khi xe được điều động + lên đường (hết giai đoạn matching) -> tự chuyển C-04
  useEffect(() => {
    if (status && !isMatchingStatus(status) && !isFinalStatus(status)) {
      navigation.replace('Tracking');
    }
  }, [status, navigation]);

  const findEvent = (s) => timeline.find((t) => t.status === s);
  const sosEcho = findEvent('SOS_CREATED'); // echo từ dispatch center (bước 2)
  const assigned = findEvent('AMBULANCE_ASSIGNED'); // matching xong (bước 3)
  const enRoute = findEvent('DRIVER_EN_ROUTE'); // xe điều động + ETA (bước 4)

  const onCancel = () => {
    Alert.alert(
      'Hủy yêu cầu cấp cứu?',
      'Chỉ hủy khi bạn an toàn và không còn cần xe cấp cứu. Hành động này không thể hoàn tác.',
      [
        { text: 'Giữ yêu cầu', style: 'cancel' },
        {
          text: 'Hủy yêu cầu',
          style: 'destructive',
          onPress: async () => {
            await cancelSOS();
            navigation.popToTop();
          },
        },
      ],
    );
  };

  if (!emergency) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.center}>
          <Text style={styles.emptyText}>Không có yêu cầu nào đang được ghép xe</Text>
        </View>
      </SafeAreaView>
    );
  }

  const steps = [
    {
      title: 'Đã gửi SOS kèm GPS',
      done: true,
      time: formatTime(createdAt),
      meta: emergency.address || undefined,
    },
    {
      title: 'Điều phối viên đã nhận',
      done: !!sosEcho,
      active: !sosEcho,
      time: sosEcho ? formatTime(sosEcho.at) : undefined,
      meta: undefined,
    },
    {
      title: 'Matching engine đang ghép xe...',
      done: !!assigned,
      active: !assigned,
      time: assigned ? formatTime(assigned.at) : undefined,
      meta: assigned ? `Xe ${assigned.plate} · score ${assigned.score ?? '—'}` : undefined,
    },
    {
      title: 'Xe được điều động · nhận ETA',
      done: !!enRoute,
      active: !!assigned && !enRoute,
      time: enRoute ? formatTime(enRoute.at) : undefined,
      meta: enRoute ? `Dự kiến ~${Math.ceil(enRoute.eta ?? 0)} phút` : undefined,
    },
  ];

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
      <StatusBar style="light" />
      {/* Header đỏ như mockup C-03 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Đang tìm xe phù hợp...</Text>
        <Text style={styles.headerSub}>
          {code} · đã gửi {formatElapsed(elapsed)} giây trước
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Timeline dọc 4 bước */}
        <View style={styles.timelineCard}>
          {steps.map((step, i) => {
            const isLast = i === steps.length - 1;
            const nextDone = !isLast && steps[i + 1].done;
            return (
              <View key={step.title} style={styles.stepRow}>
                <View style={styles.stepLeft}>
                  {step.done ? (
                    <View style={styles.doneDot}>
                      <Ionicons name="checkmark" size={14} color={colors.textOnPrimary} />
                    </View>
                  ) : step.active ? (
                    <PulsingDot />
                  ) : (
                    <View style={styles.upcomingDot} />
                  )}
                  {!isLast && <View style={[styles.stepLine, nextDone && styles.stepLineDone]} />}
                </View>
                <View style={styles.stepBody}>
                  <Text style={[styles.stepTitle, step.done && styles.stepTitleDone]}>{step.title}</Text>
                  {step.time && <Text style={styles.stepTime}>{step.time}</Text>}
                  {step.meta && <Text style={styles.stepMeta}>{step.meta}</Text>}
                  {step.active && !step.done && <Text style={styles.stepPending}>Đang xử lý...</Text>}
                </View>
              </View>
            );
          })}
        </View>

        {/* Card vàng "Trong lúc chờ" (mockup C-03) */}
        <View style={styles.waitCard}>
          <Text style={styles.waitTitle}>Trong lúc chờ — làm ngay</Text>
          <Text style={styles.waitLine}>• Cầm máu trực tiếp bằng vải sạch</Text>
          <Text style={styles.waitLine}>• Không di chuyển nạn nhân nếu gãy xương sống</Text>
        </View>

        <Pressable style={({ pressed }) => [styles.cancelBtn, pressed && { opacity: 0.8 }]} onPress={onCancel}>
          <Text style={styles.cancelText}>Hủy yêu cầu (chỉ khi an toàn)</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyText: { color: colors.textSecondary, fontSize: fontSize.s, textAlign: 'center' },

  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.l + 4,
  },
  headerTitle: { color: colors.textOnPrimary, fontSize: fontSize.xl, fontWeight: fontWeight.bold },
  headerSub: { color: 'rgba(255, 255, 255, 0.85)', fontSize: fontSize.s, marginTop: spacing.xs },

  container: { padding: spacing.xl, paddingBottom: spacing.xxl },

  timelineCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.l,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.l,
  },
  stepRow: { flexDirection: 'row' },
  stepLeft: { alignItems: 'center', marginRight: spacing.m, width: 22 },
  doneDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingDot: { width: 18, height: 18, borderRadius: 9, backgroundColor: colors.warning, marginTop: 2 },
  upcomingDot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: colors.border, marginTop: 2 },
  stepLine: { flex: 1, width: 2, backgroundColor: colors.border, marginTop: 4 },
  stepLineDone: { backgroundColor: colors.success },
  stepBody: { flex: 1, paddingBottom: spacing.l },
  stepTitle: { fontSize: fontSize.m, color: colors.textSecondary, fontWeight: fontWeight.medium },
  stepTitleDone: { color: colors.text, fontWeight: fontWeight.semibold },
  stepTime: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  stepMeta: { fontSize: fontSize.xs, color: colors.info, marginTop: spacing.xs, fontWeight: fontWeight.medium },
  stepPending: { fontSize: fontSize.xs, color: colors.warning, marginTop: spacing.xs, fontWeight: fontWeight.medium },

  waitCard: {
    backgroundColor: colors.warningBg,
    borderRadius: radius.l,
    borderWidth: 1,
    borderColor: '#FDE4C7',
    padding: spacing.l,
    marginTop: spacing.l,
  },
  waitTitle: { color: '#B45309', fontSize: fontSize.m, fontWeight: fontWeight.bold, marginBottom: spacing.s },
  waitLine: { color: '#92400E', fontSize: fontSize.s, lineHeight: 22 },

  cancelBtn: {
    marginTop: spacing.xl,
    backgroundColor: colors.bgSubtle,
    borderRadius: radius.m,
    paddingVertical: spacing.m + 2,
    alignItems: 'center',
  },
  cancelText: { color: colors.textSecondary, fontSize: fontSize.s, fontWeight: fontWeight.medium },
});
