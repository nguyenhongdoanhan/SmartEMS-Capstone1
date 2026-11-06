/**
 * C-04 Theo dõi xe (real-time) - đúng mockup tài liệu thiết kế:
 * - Map full màn: pin đỏ người gọi + vòng xanh xe cấp cứu (di chuyển realtime)
 *   + polyline tuyến đi + vòng độ chính xác tại hiện trường
 * - Bottom sheet: badge trạng thái · mã EMG, dòng xe 🚑 + biển số, tài xế + điểm,
 *   ETA lớn đỏ + khoảng cách, 3 nút Gọi / Nhắn / Chia sẻ vị trí, FSM stepper 5 bước
 * - Khi TRIP_COMPLETED -> tự chuyển C-05 (Hoàn tất & đánh giá)
 * Vị trí xe cập nhật qua event "ambulance_position" (mock ~1.5s/lần);
 * camera tự fit cả 2 pin mỗi lần cập nhật.
 */
import React, { useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Linking, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import MapView, { Circle, Marker, Polyline } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FsmStepper } from '../../../components';
import { useEmergencyStore } from '../../../store/emergency';
import { emergencyCode, isFinalStatus, isMatchingStatus } from '../../../constants/trip';
import { colors, fontSize, fontWeight, radius, spacing } from '../../../theme';

const DRIVER_PHONE = '0905123456'; // demo - backend chưa trả phone tài xế (TODO)

/** Badge trạng thái bottom sheet theo event backend. */
const SHEET_BADGE = {
  DRIVER_EN_ROUTE: { text: 'ĐANG TRÊN ĐƯỜNG ĐẾN HIỆN TRƯỜNG', bg: colors.badge.transport.bg, tc: colors.badge.transport.text },
  ARRIVED_ON_SCENE: { text: 'XE ĐÃ TỚI HIỆN TRƯỜNG', bg: colors.badge.success.bg, tc: colors.badge.success.text },
  TRANSPORTING: { text: 'ĐANG VẬN CHUYỂN', bg: colors.badge.transport.bg, tc: colors.badge.transport.text },
  AT_HOSPITAL: { text: 'ĐÃ TỚI BỆNH VIỆN', bg: colors.badge.success.bg, tc: colors.badge.success.text },
  TRIP_COMPLETED: { text: 'HOÀN TẤT CA CỨU', bg: colors.badge.success.bg, tc: colors.badge.success.text },
};

export default function TrackingScreen({ navigation }) {
  const { emergency, ambulance, hospital, route } = useEmergencyStore();
  const mapRef = useRef(null);

  const status = emergency?.status;
  const scene = emergency ? { latitude: emergency.latitude, longitude: emergency.longitude } : null;

  // Vào nhầm C-04 khi vẫn còn đang matching -> đẩy về C-03 (bảo vệ luồng)
  useEffect(() => {
    if (status && isMatchingStatus(status)) navigation.replace('Matching');
  }, [status, navigation]);

  // Hoàn tất -> sang C-05 đánh giá
  useEffect(() => {
    if (status === 'TRIP_COMPLETED') navigation.replace('Completion');
  }, [status, navigation]);

  // Mỗi lần vị trí xe cập nhật -> camera fit cả 2 pin (lần đầu fit ngay khi có xe)
  useEffect(() => {
    if (!scene || !ambulance?.coords || !mapRef.current) return;
    if (ambulance.coords.latitude === scene.latitude && ambulance.coords.longitude === scene.longitude) return;
    mapRef.current.fitToCoordinates([scene, ambulance.coords], {
      edgePadding: { top: 90, right: 50, bottom: 400, left: 50 },
      animated: true,
    });
  }, [ambulance?.coords, scene]);

  if (!emergency || !scene) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>Chưa có yêu cầu cấp cứu nào</Text>
          <Text style={styles.emptySub}>Khi bạn gửi SOS, xe cấp cứu sẽ hiện realtime tại đây.</Text>
          <Pressable style={styles.homeBtn} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.homeBtnText}>Về trang chủ</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const code = emergencyCode(emergency.id);
  const badge = SHEET_BADGE[status] || SHEET_BADGE.DRIVER_EN_ROUTE;
  const handover = status === 'AT_HOSPITAL' || status === 'TRIP_COMPLETED';
  const etaText = handover
    ? 'Đã bàn giao'
    : status === 'ARRIVED_ON_SCENE'
      ? 'Xe đã tới'
      : ambulance?.etaMinutes != null
        ? `${Math.max(1, Math.ceil(ambulance.etaMinutes))}'`
        : '—';
  const etaDone = handover || status === 'ARRIVED_ON_SCENE';
  const showDistance =
    !etaDone && ambulance?.distanceKm != null;

  const callDriver = () => Linking.openURL(`tel:${DRIVER_PHONE}`).catch(() => {});

  const smsDriver = () =>
    Linking.openURL(`sms:${DRIVER_PHONE}?body=${encodeURIComponent(`SmartEMS ${code}: `)}`).catch(() => {});

  const shareLocation = () =>
    Share.share({
      message: `SmartEMS ${code} — vị trí sự cố: https://maps.google.com/?q=${scene.latitude},${scene.longitude}`,
    }).catch(() => {});

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <View style={styles.flex}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: scene.latitude,
            longitude: scene.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
          accessibilityLabel="Bản đồ theo dõi xe cứu thương"
        >
          {/* Vòng độ chính xác tại hiện trường */}
          <Circle
            center={scene}
            radius={25}
            strokeColor="rgba(220, 38, 38, 0.35)"
            fillColor="rgba(220, 38, 38, 0.08)"
          />

          {/* Pin đỏ: vị trí người gọi */}
          <Marker coordinate={scene} pinColor={colors.primary} title="Vị trí của bạn" description={emergency.address || ''} />

          {/* Pin xe cứu thương: vòng xanh + icon (mockup C-04) */}
          {ambulance?.coords && (
            <Marker coordinate={ambulance.coords} title={`Xe ${ambulance.id || ''}`} description={ambulance.plate || ''}>
              <View style={styles.ambPin}>
                <Ionicons name="medical" size={20} color={colors.textOnPrimary} />
              </View>
            </Marker>
          )}

          {/* Polyline tuyến đi */}
          {route?.length > 1 && (
            <Polyline coordinates={route} strokeColor={colors.mapRoute} strokeWidth={4} />
          )}
        </MapView>

        {/* Bottom sheet thông tin chuyến (mockup C-04) */}
        <View style={styles.sheet}>
          <View style={[styles.badge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.badgeText, { color: badge.tc }]}>
              {badge.text} · {code}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <Text style={styles.ambTitle}>
                🚑 {ambulance?.id || '—'} · {ambulance?.plate || ''}
              </Text>
              <Text style={styles.driverText}>
                Tài xế {ambulance?.driver || '—'} · ⭐ {ambulance?.rating ?? '—'}
              </Text>
              {(status === 'TRANSPORTING' || status === 'AT_HOSPITAL') && !!hospital?.name && (
                <Text style={styles.hospitalText}>Đưa tới: {hospital.name}</Text>
              )}
            </View>
            <View style={styles.etaBox}>
              <Text style={[styles.etaText, etaDone && styles.etaTextDone]}>{etaText}</Text>
              {showDistance && (
                <Text style={styles.etaSub}>{ambulance.distanceKm.toFixed(1)} km</Text>
              )}
            </View>
          </View>

          {/* 3 nút hành động (mockup: Gọi / Nhắn / Chia sẻ vị trí) */}
          <View style={styles.actionRow}>
            <Pressable style={({ pressed }) => [styles.actionBtn, styles.callBtn, pressed && { opacity: 0.85 }]} onPress={callDriver}>
              <Ionicons name="call" size={18} color={colors.textOnPrimary} />
              <Text style={[styles.actionText, { color: colors.textOnPrimary }]}>Gọi</Text>
            </Pressable>
            <Pressable style={({ pressed }) => [styles.actionBtn, styles.smsBtn, pressed && { opacity: 0.85 }]} onPress={smsDriver}>
              <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.text} />
              <Text style={[styles.actionText, { color: colors.text }]}>Nhắn</Text>
            </Pressable>
            <Pressable style={({ pressed }) => [styles.actionBtn, styles.shareBtn, pressed && { opacity: 0.85 }]} onPress={shareLocation}>
              <Ionicons name="share-social-outline" size={18} color={colors.textOnPrimary} />
              <Text style={[styles.actionText, { color: colors.textOnPrimary }]}>Chia sẻ vị trí</Text>
            </Pressable>
          </View>

          <View style={styles.steerWrap}>
            <FsmStepper status={status} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  map: { flex: 1 },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyTitle: { fontSize: fontSize.l, fontWeight: fontWeight.semibold, color: colors.text, textAlign: 'center' },
  emptySub: { fontSize: fontSize.s, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.s, marginBottom: spacing.xl, lineHeight: 20 },
  homeBtn: { backgroundColor: colors.primary, borderRadius: radius.m, paddingVertical: spacing.m, paddingHorizontal: spacing.xl },
  homeBtnText: { color: colors.textOnPrimary, fontWeight: fontWeight.semibold },

  ambPin: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.blue,
    borderWidth: 3,
    borderColor: 'rgba(37, 99, 235, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.l,
    paddingBottom: spacing.l,
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -3 },
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs + 2,
    marginBottom: spacing.m,
  },
  badgeText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, letterSpacing: 0.3 },

  infoRow: { flexDirection: 'row', alignItems: 'center' },
  infoLeft: { flex: 1, marginRight: spacing.m },
  ambTitle: { fontSize: fontSize.l, fontWeight: fontWeight.bold, color: colors.text },
  driverText: { fontSize: fontSize.s, color: colors.textSecondary, marginTop: 2 },
  hospitalText: { fontSize: fontSize.s, color: colors.blue, marginTop: 2, fontWeight: fontWeight.medium },
  etaBox: { alignItems: 'flex-end' },
  etaText: { fontSize: 34, fontWeight: fontWeight.bold, color: colors.primary, lineHeight: 38 },
  etaTextDone: { fontSize: fontSize.l, color: colors.successStrong, lineHeight: 38 },
  etaSub: { fontSize: fontSize.s, color: colors.textSecondary, marginTop: 2 },

  actionRow: { flexDirection: 'row', gap: spacing.m, marginTop: spacing.l },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.s,
    minHeight: 46,
    borderRadius: radius.m,
  },
  callBtn: { backgroundColor: colors.primary },
  smsBtn: { backgroundColor: colors.bgSubtle },
  shareBtn: { backgroundColor: colors.dark },
  actionText: { fontSize: fontSize.s, fontWeight: fontWeight.semibold },

  steerWrap: { marginTop: spacing.l },
});
