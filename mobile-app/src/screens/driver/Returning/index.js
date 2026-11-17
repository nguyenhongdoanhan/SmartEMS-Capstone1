/**
 * D-07 Returning — xe rỗng về trạm + TÁI ĐIỀU ĐỘNG trên tuyến (innovation mockup):
 * - Map full màn: vòng xanh xe tại GPS THẬT + marker trạm S1 + polyline nét đứt
 *   màu slate (tuyến "rỗng" - khác màu polyline chở bệnh nhân ở D-05).
 * - Bottom sheet mỏng: badge "● ĐANG VỀ TRẠM" + km còn lại tới trạm + nút
 *   "ĐÃ VỀ TRẠM — KẾT THÚC CA" -> arriveStation (TRIP_COMPLETED) -> về D-01.
 * - 6-10s sau khi vào RETURNING, mock đẩy đề xuất tái điều động (event thật:
 *   WS RETURNING_TRIP_REASSIGNED) -> POPUP NỔI trên map: "Ca khẩn cấp gần
 *   tuyến của bạn" + Returning Trip Optimization + CRITICAL EMG-0032 · Cầu
 *   Rồng + "Chỉ cách bạn 0.9 km · ETA 2' — nhanh hơn xe tại trạm (9')" +
 *   2 nút: "Tiếp tục về trạm" / "CHẤP NHẬN CA MỚI" -> quay lại D-03 với ca mới.
 * Vào màn là đang RETURNING (D-06 đã chốt khi HOÀN TẤT BÀN GIAO).
 */
import React, { useEffect, useMemo, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DRIVER_CASE_STATUS } from '../../../constants/driverTrip';
import { DRIVER_STATION, useDriverShiftStore } from '../../../store/driverShift';
import { colors, fontSize, fontWeight, radius, spacing } from '../../../theme';
import { etaMinutes, haversineKm } from '../../../utils/geo';

export default function DriverReturningScreen({ navigation }) {
  const { caseData, caseStatus, lastPosition, reassignmentCase, acceptReassignment, declineReassignment, arriveStation } =
    useDriverShiftStore();
  const mapRef = useRef(null);

  // Camera fit cả xe + trạm mỗi khi có bản tin GPS mới (pattern D-03/D-05).
  useEffect(() => {
    if (!lastPosition || !mapRef.current) return;
    mapRef.current.fitToCoordinates([lastPosition, DRIVER_STATION.coords], {
      edgePadding: { top: 140, right: 50, bottom: 340, left: 50 },
      animated: true,
    });
  }, [lastPosition?.latitude, lastPosition?.longitude]);

  // Bất thường: vào màn mà không ở pha RETURNING (vd ca bị dọn) -> thoát.
  useEffect(() => {
    if (caseStatus !== DRIVER_CASE_STATUS.RETURNING) navigation.goBack();
  }, [caseStatus, navigation]);

  // Vùng nhìn ban đầu: giữa xe (hoặc hiện trường cũ nếu chưa có GPS) và trạm.
  const initialRegion = useMemo(() => {
    const from = lastPosition || caseData?.coords || DRIVER_STATION.coords;
    return {
      latitude: (from.latitude + DRIVER_STATION.coords.latitude) / 2,
      longitude: (from.longitude + DRIVER_STATION.coords.longitude) / 2,
      latitudeDelta: Math.max(Math.abs(from.latitude - DRIVER_STATION.coords.latitude) * 2.4, 0.012),
      longitudeDelta: Math.max(Math.abs(from.longitude - DRIVER_STATION.coords.longitude) * 2.4, 0.012),
    };
  }, [!!lastPosition, caseData?.code]);

  if (!caseData || !initialRegion) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>Không có chuyến về trạm</Text>
        </View>
      </SafeAreaView>
    );
  }

  const from = lastPosition || caseData.coords;
  const kmLeft = haversineKm(from, DRIVER_STATION.coords) ?? 0;
  const etaLeft = etaMinutes(kmLeft);

  const backToStation = () => {
    arriveStation(); // RETURNING -> TRIP_COMPLETED (mock hẹn ca kế 12s)
    navigation.popToTop(); // về DriverTabs (D-01)
  };

  const takeNewCase = () => {
    acceptReassignment(reassignmentCase); // RETURNING -> DRIVER_ACCEPTED với ca mới
    navigation.replace('DriverNavigation'); // quay lại D-03 (ca EMG-0032)
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <View style={styles.flex}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={initialRegion}
          accessibilityLabel="Bản đồ tuyến về trạm"
        >
          {/* Tuyến về trạm: nét đứt màu slate (xe rỗng - khác màu tuyến chở bệnh nhân) */}
          <Polyline
            coordinates={[from, DRIVER_STATION.coords]}
            strokeColor={colors.darkSoft}
            strokeWidth={4}
            lineDashPattern={[10, 8]}
          />

          {/* Xe cứu thương tại vị trí GPS thật (vòng xanh - pattern D-03/D-05) */}
          <Marker coordinate={from} title="Xe của bạn" description="GPS cập nhật 3 giây/lần">
            <View style={styles.carPin}>
              <Ionicons name="medical" size={20} color={colors.textOnPrimary} />
            </View>
          </Marker>

          {/* Trạm S1 - đích của tuyến returning */}
          <Marker
            coordinate={DRIVER_STATION.coords}
            title={DRIVER_STATION.name}
            description="Trạm trực của bạn"
            accessibilityLabel={`Đích ${DRIVER_STATION.name}`}
          >
            <View style={styles.stationPin}>
              <Ionicons name="home" size={20} color={colors.textOnPrimary} />
            </View>
          </Marker>
        </MapView>

        {/* ===== Bottom sheet mỏng: trạng thái về trạm ===== */}
        <View style={styles.sheet}>
          <View style={styles.sheetBadge}>
            <Text style={styles.sheetBadgeText}>● ĐANG VỀ TRẠM</Text>
          </View>
          <View style={styles.sheetRow}>
            <View style={styles.sheetLeft}>
              <Text style={styles.stationName}>{DRIVER_STATION.name}</Text>
              <Text style={styles.sheetSub}>
                {kmLeft.toFixed(1)} km · còn {etaLeft} phút
              </Text>
            </View>
            <Pressable
              style={({ pressed }) => [styles.homeBtn, pressed && { opacity: 0.85 }]}
              onPress={backToStation}
              accessibilityLabel="Đã về trạm, kết thúc ca"
            >
              <Text style={styles.homeBtnText}>ĐÃ VỀ TRẠM</Text>
            </Pressable>
          </View>
        </View>

        {/* ===== POPUP tái điều động trên tuyến (innovation D-07) ===== */}
        {reassignmentCase && (
          <View style={styles.popupOverlay}>
            <View style={styles.popupCard}>
              <View style={styles.popupIcon}>
                <Ionicons name="flash" size={26} color={colors.primary} />
              </View>
              <Text style={styles.popupTitle}>Ca khẩn cấp gần tuyến của bạn</Text>
              <Text style={styles.popupSub}>Returning Trip Optimization — đề xuất tái điều động</Text>

              <View style={styles.popupCaseRow}>
                <View style={styles.popupBadge}>
                  <Text style={styles.popupBadgeText}>CRITICAL</Text>
                </View>
                <Text style={styles.popupCode}>{reassignmentCase.code}</Text>
              </View>
              <Text style={styles.popupAddress}>{reassignmentCase.address}</Text>

              <View style={styles.popupCompare}>
                <Text style={styles.popupCompareText}>
                  Chỉ cách bạn {reassignmentCase.distanceKm.toFixed(1)} km · ETA{' '}
                  {reassignmentCase.etaMinutes}' — nhanh hơn xe tại trạm (9')
                </Text>
              </View>

              <Pressable
                style={({ pressed }) => [styles.takeBtn, pressed && { opacity: 0.85 }]}
                onPress={takeNewCase}
                accessibilityLabel="Chấp nhận ca tái điều động"
              >
                <Ionicons name="checkmark-circle" size={20} color={colors.textOnPrimary} />
                <Text style={styles.takeBtnText}>CHẤP NHẬN CA MỚI</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.skipBtn, pressed && { opacity: 0.8 }]}
                onPress={declineReassignment}
                accessibilityLabel="Từ chối, tiếp tục về trạm"
              >
                <Text style={styles.skipBtnText}>Tiếp tục về trạm</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  map: { flex: 1 },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyTitle: { fontSize: fontSize.l, fontWeight: fontWeight.semibold, color: colors.text },

  carPin: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.blue,
    borderWidth: 3,
    borderColor: 'rgba(37, 99, 235, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stationPin: {
    width: 40,
    height: 40,
    borderRadius: radius.m,
    backgroundColor: colors.darkSoft,
    borderWidth: 2,
    borderColor: 'rgba(30, 41, 59, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Bottom sheet mỏng
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
  sheetBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.successBg,
    borderRadius: radius.full,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs + 2,
    marginBottom: spacing.m,
  },
  sheetBadgeText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.successStrong, letterSpacing: 0.3 },
  sheetRow: { flexDirection: 'row', alignItems: 'center' },
  sheetLeft: { flex: 1, marginRight: spacing.m },
  stationName: { fontSize: fontSize.l, fontWeight: fontWeight.bold, color: colors.text },
  sheetSub: { fontSize: fontSize.s, color: colors.textSecondary, marginTop: 2 },
  homeBtn: {
    backgroundColor: colors.bgSubtle,
    borderRadius: radius.m,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeBtnText: { fontSize: fontSize.s, fontWeight: fontWeight.semibold, color: colors.text },

  // Popup tái điều động (nổi giữa màn trên map)
  popupOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  popupCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    elevation: 16,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },
  popupIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.errorBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.m,
  },
  popupTitle: { fontSize: fontSize.l, fontWeight: fontWeight.bold, color: colors.text, textAlign: 'center' },
  popupSub: { fontSize: fontSize.xs, color: colors.textSecondary, textAlign: 'center', marginTop: 2, marginBottom: spacing.l },
  popupCaseRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.s },
  popupBadge: {
    backgroundColor: colors.errorBg,
    borderRadius: radius.full,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs + 2,
  },
  popupBadgeText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.primary, letterSpacing: 0.3 },
  popupCode: { fontSize: fontSize.l, fontWeight: fontWeight.bold, color: colors.text },
  popupAddress: { fontSize: fontSize.s, color: colors.textSecondary, marginTop: spacing.s, textAlign: 'center' },
  popupCompare: {
    backgroundColor: colors.infoBg,
    borderRadius: radius.m,
    padding: spacing.m,
    marginTop: spacing.m,
    alignSelf: 'stretch',
  },
  popupCompareText: { fontSize: fontSize.s, color: colors.textSecondary, textAlign: 'center', lineHeight: 19 },

  takeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.s,
    backgroundColor: colors.primary,
    borderRadius: radius.m,
    minHeight: 54,
    alignSelf: 'stretch',
    marginTop: spacing.l,
  },
  takeBtnText: { color: colors.textOnPrimary, fontSize: fontSize.m, fontWeight: fontWeight.bold, letterSpacing: 0.3 },
  skipBtn: { alignSelf: 'stretch', alignItems: 'center', paddingVertical: spacing.m, minHeight: 48, justifyContent: 'center' },
  skipBtnText: { color: colors.textSecondary, fontSize: fontSize.s, fontWeight: fontWeight.medium },
});
