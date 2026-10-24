/**
 * C-05 Hoàn tất & đánh giá - đúng mockup tài liệu thiết kế:
 * - Banner xanh: "Bệnh nhân đã được bàn giao an toàn" + "EMG-0031 · BV Đa khoa Đà Nẵng · 12:12"
 * - 3 metric (mục tiêu golden hour): thời gian phản hồi / thời gian điều phối / quãng đường
 *   - tính THẬT từ timestamp các event trong timeline (không hard-code số liệu)
 * - "Đánh giá trải nghiệm cứu hộ" - 5 sao vàng (mặc định 4 sao như mockup)
 * - Nút đỏ "Về trang chủ": gửi đánh giá (mock) + dọn state + popToTop về tab
 */
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton, StarRating } from '../../../components';
import { useEmergencyStore } from '../../../store/emergency';
import { emergencyCode } from '../../../constants/trip';
import { colors, fontSize, fontWeight, radius, spacing } from '../../../theme';

function secondsBetween(aIso, bIso) {
  try {
    return Math.max(0, Math.round((new Date(bIso).getTime() - new Date(aIso).getTime()) / 1000));
  } catch (err) {
    return null;
  }
}

/** "8'24\"" - phút + giây như mockup C-05. */
function formatResponse(totalSeconds) {
  if (totalSeconds == null) return '—';
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}'${String(s).padStart(2, '0')}"`;
}

function formatClock(iso) {
  try {
    return new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  } catch (err) {
    return '';
  }
}

export default function CompletionScreen({ navigation }) {
  const { emergency, timeline, hospital, tripDistanceKm, submitRating, clear } = useEmergencyStore();
  const [stars, setStars] = useState(4); // mockup: 4 sao vàng đang chọn
  const [leaving, setLeaving] = useState(false);

  if (!emergency) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.center}>
          <Text style={styles.emptyText}>Không có ca cứu hộ nào để hiển thị</Text>
        </View>
      </SafeAreaView>
    );
  }

  const findEvent = (s) => timeline.find((t) => t.status === s);
  const assigned = findEvent('AMBULANCE_ASSIGNED');
  const arrived = findEvent('ARRIVED_ON_SCENE');
  const atHospital = findEvent('AT_HOSPITAL');

  // Metric tính từ mốc GỬI SOS (emergency.created_at) tới timestamp event thật trong
  // timeline - hoạt động đúng với cả mock lẫn backend thật (EmergencyOut.created_at).
  const sentAt = emergency.created_at;
  const responseSec = arrived ? secondsBetween(sentAt, arrived.at) : null;
  const dispatchSec = assigned ? secondsBetween(sentAt, assigned.at) : null;
  const distanceKm = tripDistanceKm ?? null;

  const code = emergencyCode(emergency.id);
  const hospitalName = hospital?.name || atHospital?.hospital || 'Bệnh viện';
  const doneAt = formatClock(atHospital?.at || emergency.created_at);

  const goHome = async () => {
    if (leaving) return;
    setLeaving(true);
    try {
      await submitRating(stars); // mock lưu luôn; backend thật thiếu endpoint cũng không chặn
      clear();
      navigation.popToTop();
    } finally {
      setLeaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Banner xanh hoàn tất (mockup C-05) */}
        <View style={styles.banner}>
          <Ionicons name="checkmark-circle" size={44} color={colors.success} />
          <Text style={styles.bannerTitle}>Bệnh nhân đã được bàn giao an toàn</Text>
          <Text style={styles.bannerSub}>
            {code} · {hospitalName} · {doneAt}
          </Text>
        </View>

        {/* 3 metric golden hour (mockup C-05) */}
        <View style={styles.metricRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{formatResponse(responseSec)}</Text>
            <Text style={styles.metricLabel}>phản hồi</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{dispatchSec != null ? `${dispatchSec}s` : '—'}</Text>
            <Text style={styles.metricLabel}>điều phối</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{distanceKm != null ? `${distanceKm}km` : '—'}</Text>
            <Text style={styles.metricLabel}>tuyến</Text>
          </View>
        </View>
        <Text style={styles.metricNote}>Mục tiêu: phản hồi trong "giờ vàng" (golden hour)</Text>

        {/* Đánh giá 5 sao (mockup C-05) */}
        <View style={styles.ratingCard}>
          <Text style={styles.ratingTitle}>Đánh giá trải nghiệm cứu hộ</Text>
          <StarRating value={stars} onChange={setStars} size={40} style={styles.ratingStars} />
          <Text style={styles.ratingHint}>Chạm để chọn số sao (trước khi về trang chủ)</Text>
        </View>

        <AppButton
          title={leaving ? 'Đang gửi đánh giá...' : 'Về trang chủ'}
          size="lg"
          onPress={goHome}
          disabled={leaving}
          icon={leaving ? <ActivityIndicator size="small" color={colors.textOnPrimary} /> : null}
          style={styles.homeBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyText: { color: colors.textSecondary, fontSize: fontSize.s, textAlign: 'center' },

  container: { padding: spacing.xl, paddingBottom: spacing.xxl },

  banner: {
    backgroundColor: colors.successBg,
    borderRadius: radius.l,
    alignItems: 'center',
    padding: spacing.xl,
  },
  bannerTitle: {
    color: colors.successStrong,
    fontSize: fontSize.l,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
    marginTop: spacing.s,
  },
  bannerSub: { color: colors.successStrong, fontSize: fontSize.s, marginTop: spacing.xs, opacity: 0.85 },

  metricRow: { flexDirection: 'row', gap: spacing.m, marginTop: spacing.l },
  metricCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.m,
    alignItems: 'center',
    paddingVertical: spacing.l,
  },
  metricValue: { color: colors.success, fontSize: fontSize.xl, fontWeight: fontWeight.bold }, // xanh lá cây - chỉ số đạt "giờ vàng"
  metricLabel: { color: colors.textSecondary, fontSize: fontSize.xs, marginTop: 2 },
  metricNote: { color: colors.textMuted, fontSize: fontSize.xs, textAlign: 'center', marginTop: spacing.s },

  ratingCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.l,
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.xl,
  },
  ratingTitle: { color: colors.text, fontSize: fontSize.m, fontWeight: fontWeight.semibold, textAlign: 'center' },
  ratingStars: { marginTop: spacing.l },
  ratingHint: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: spacing.m },

  homeBtn: { marginTop: spacing.xxl },
});
