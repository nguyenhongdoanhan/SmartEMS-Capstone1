/**
 * D-05 Vận chuyển bệnh nhân tới bệnh viện (full màn, không tab) - đúng mockup:
 * - Map: vòng xanh xe tại GPS THẬT (store 3s/lần) + marker BV đích + polyline
 *   nét đứt từ vị trí hiện tại tới BV (cập nhật theo từng bản tin GPS).
 * - Bottom sheet: badge xanh dương "● ĐANG VẬN CHUYỂN BỆNH NHÂN" + card đích
 *   (tên BV + km còn lại + ETA sống 30 km/h) + badge "● Đã gửi" (phiếu triage
 *   đã gửi trước ở D-04) + stepper "VÒNG ĐỜI CHUYẾN ĐI" 5 bước (bước
 *   Vận chuyển active).
 * - Nút navy "ĐÃ ĐẾN BỆNH VIỆN — BÀN GIAO BỆNH NHÂN" -> FSM AT_HOSPITAL -> D-06.
 * Vào màn là đang TRANSPORTING (D-04 đã chốt khi bấm VẬN CHUYỂN BỆNH NHÂN).
 */
import React, { useEffect, useMemo, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '../../../components';
import { DRIVER_CASE_STATUS } from '../../../constants/driverTrip';
import { useDriverShiftStore } from '../../../store/driverShift';
import { colors, fontSize, fontWeight, radius, spacing } from '../../../theme';
import { etaMinutes, haversineKm } from '../../../utils/geo';

/** Stepper vòng đời chuyến đi (mockup D-05) - bước 3 "Vận chuyển" đang active. */
const TRIP_STEPS = ['Điều độ', 'Hiện trường', 'Vận chuyển', 'Bệnh viện', 'Về trạm'];
const ACTIVE_STEP = 2;

export default function DriverTransportScreen({ navigation }) {
  const { caseData, caseStatus, lastPosition, arriveAtHospital } = useDriverShiftStore();
  const mapRef = useRef(null);

  // Camera fit cả xe + BV mỗi khi có bản tin GPS mới (pattern D-03/C-04).
  useEffect(() => {
    if (!caseData?.hospital || !lastPosition || !mapRef.current) return;
    mapRef.current.fitToCoordinates([lastPosition, caseData.hospital.coords], {
      edgePadding: { top: 140, right: 50, bottom: 380, left: 50 },
      animated: true,
    });
  }, [lastPosition?.latitude, lastPosition?.longitude, caseData?.code]);

  // Bất thường: vào màn mà không ở pha TRANSPORTING (vd ca bị dọn) -> thoát.
  useEffect(() => {
    if (caseStatus !== DRIVER_CASE_STATUS.TRANSPORTING) navigation.goBack();
  }, [caseStatus, navigation]);

  // Vùng nhìn ban đầu: giữa xe (hoặc hiện trường nếu chưa có GPS) và BV.
  const initialRegion = useMemo(() => {
    if (!caseData?.hospital) return null;
    const from = lastPosition || caseData.coords;
    return {
      latitude: (from.latitude + caseData.hospital.coords.latitude) / 2,
      longitude: (from.longitude + caseData.hospital.coords.longitude) / 2,
      latitudeDelta: Math.max(Math.abs(from.latitude - caseData.hospital.coords.latitude) * 2.4, 0.012),
      longitudeDelta: Math.max(Math.abs(from.longitude - caseData.hospital.coords.longitude) * 2.4, 0.012),
    };
  }, [caseData?.code, !!lastPosition]);

  if (!caseData?.hospital || !initialRegion) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>Không có chuyến vận chuyển</Text>
        </View>
      </SafeAreaView>
    );
  }

  const hospital = caseData.hospital;
  // Đoạn đường còn lại: từ vị trí GPS thật (chưa có fix thì từ hiện trường) tới BV.
  const from = lastPosition || caseData.coords;
  const liveKm = haversineKm(from, hospital.coords) ?? hospital.distanceFromSceneKm;
  const liveEta = etaMinutes(liveKm);

  const arrive = () => {
    arriveAtHospital(); // TRANSPORTING -> AT_HOSPITAL
    navigation.replace('DriverHandover'); // sang D-06
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <View style={styles.flex}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={initialRegion}
          accessibilityLabel="Bản đồ vận chuyển bệnh nhân tới bệnh viện"
        >
          {/* Tuyến nét đứt từ xe tới BV - vẽ lại theo từng bản tin GPS */}
          <Polyline
            coordinates={[from, hospital.coords]}
            strokeColor={colors.mapRoute}
            strokeWidth={4}
            lineDashPattern={[10, 8]}
          />

          {/* Xe cứu thương tại vị trí GPS thật (vòng xanh - pattern D-03) */}
          <Marker coordinate={from} title={`Xe của bạn · ${caseData.code}`} description="GPS cập nhật 3 giây/lần">
            <View style={styles.carPin}>
              <Ionicons name="medical" size={20} color={colors.textOnPrimary} />
            </View>
          </Marker>

          {/* Bệnh viện đích (marker "+" màu xanh dương như mockup) */}
          <Marker
            coordinate={hospital.coords}
            title={hospital.name}
            description={hospital.department}
            accessibilityLabel={`Đích tới ${hospital.name}`}
          >
            <View style={styles.hospitalPin}>
              <Ionicons name="add" size={26} color={colors.textOnPrimary} />
            </View>
          </Marker>
        </MapView>

        {/* ===== Bottom sheet thông tin chuyến vận chuyển ===== */}
        <View style={styles.sheet}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>● ĐANG VẬN CHUYỂN BỆNH NHÂN</Text>
          </View>

          <View style={styles.destRow}>
            <View style={styles.destLeft}>
              <Text style={styles.hospitalName}>{hospital.name}</Text>
              <Text style={styles.destSub}>
                {liveKm.toFixed(1)} km · còn {liveEta} phút
              </Text>
            </View>
            <View style={styles.sentBox}>
              <View style={styles.sentBadge}>
                <Text style={styles.sentBadgeText}>● Đã gửi</Text>
              </View>
              <Text style={styles.sentLabel}>phiếu triage → BV</Text>
            </View>
          </View>

          {/* Stepper vòng đời chuyến đi (5 bước - mockup D-05) */}
          <Text style={styles.stepTitle}>VÒNG ĐỜI CHUYẾN ĐI — {caseData.code}</Text>
          <View style={styles.dotsRow}>
            {TRIP_STEPS.map((_, i) => (
              <React.Fragment key={i}>
                {i > 0 && <View style={[styles.stepLine, i <= ACTIVE_STEP && styles.stepLineDone]} />}
                <View
                  style={[
                    styles.stepDot,
                    i < ACTIVE_STEP && styles.stepDotDone,
                    i === ACTIVE_STEP && styles.stepDotActive,
                    i > ACTIVE_STEP && styles.stepDotTodo,
                  ]}
                />
              </React.Fragment>
            ))}
          </View>
          <View style={styles.labelsRow}>
            {TRIP_STEPS.map((label) => (
              <Text key={label} style={styles.stepLabel} numberOfLines={1}>
                {label}
              </Text>
            ))}
          </View>

          <AppButton
            variant="dark"
            size="lg"
            title="ĐÃ ĐẾN BỆNH VIỆN — BÀN GIAO BỆNH NHÂN"
            onPress={arrive}
            icon={<Ionicons name="business" size={20} color={colors.textOnPrimary} />}
          />
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
  hospitalPin: {
    width: 40,
    height: 40,
    borderRadius: radius.m,
    backgroundColor: colors.blue,
    borderWidth: 2,
    borderColor: colors.blueBg,
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
    backgroundColor: colors.blueBg,
    borderRadius: radius.full,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs + 2,
    marginBottom: spacing.m,
  },
  badgeText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: '#1E40AF', letterSpacing: 0.3 },

  destRow: { flexDirection: 'row', alignItems: 'center' },
  destLeft: { flex: 1, marginRight: spacing.m },
  hospitalName: { fontSize: fontSize.l, fontWeight: fontWeight.bold, color: colors.text },
  destSub: { fontSize: fontSize.s, color: colors.textSecondary, marginTop: 2 },
  sentBox: { alignItems: 'flex-end' },
  sentBadge: {
    backgroundColor: colors.successBg,
    borderRadius: radius.full,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs + 2,
  },
  sentBadgeText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.successStrong },
  sentLabel: { fontSize: 10, color: colors.textMuted, marginTop: 2 },

  // Stepper
  stepTitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginTop: spacing.l,
    marginBottom: spacing.s,
  },
  dotsRow: { flexDirection: 'row', alignItems: 'center' },
  stepDot: { width: 14, height: 14, borderRadius: radius.full },
  stepDotDone: { backgroundColor: colors.success },
  stepDotActive: {
    width: 20,
    height: 20,
    backgroundColor: colors.blue,
    borderWidth: 4,
    borderColor: colors.blueBg,
  },
  stepDotTodo: { backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.border },
  stepLine: { flex: 1, height: 2, backgroundColor: colors.border, marginHorizontal: 2 },
  stepLineDone: { backgroundColor: colors.success },
  labelsRow: { flexDirection: 'row', marginTop: spacing.s, marginBottom: spacing.l },
  stepLabel: { flex: 1, fontSize: 10, color: colors.textSecondary, textAlign: 'center' },
});
