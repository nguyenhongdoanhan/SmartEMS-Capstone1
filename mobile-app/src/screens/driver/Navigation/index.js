/**
 * D-03 Dẫn đường tới hiện trường (full màn, không tab) - đúng mockup:
 * - Map: pin đỏ hiện trường + vòng xanh xe cứu thương tại vị trí GPS THẬT
 *   (store driverShift 3s/lần) - camera tự fit cả 2 pin mỗi lần có bản tin.
 * - Card nổi trên map: chỉ dẫn rút gọn turn-by-turn (mock, tự đổi mỗi 6s)
 *   + nút "Mở Google Maps": Android dùng scheme google.navigation:q=... (bật
 *   dẫn đường luôn), iOS dùng universal link https://www.google.com/maps/dir
 *   (scheme riêng bị Expo Go chặn do không khai báo LSApplicationQueriesSchemes;
 *   universal link mở app Google Maps nếu đã cài, không thì mở web) - không tự
 *   build nav engine (gap D10).
 * - Bottom sheet: badge cam "ĐANG ĐẾN HIỆN TRƯỜNG" + mã EMG + ETA sống
 *   (tính từ khoảng cách GPS thật, giả định 30 km/h) + địa điểm + nút đỏ
 *   "ĐÃ ĐẾN HIỆN TRƯỜNG" -> FSM ARRIVED_ON_SCENE -> D-04.
 * - Vào màn là markEnRoute (DRIVER_ACCEPTED -> DRIVER_EN_ROUTE).
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Alert, Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { etaMinutes, haversineKm } from '../../../utils/geo';
import { MOCK_TURN_INSTRUCTIONS } from '../../../services/mock/mockDriverApi';
import { useDriverShiftStore } from '../../../store/driverShift';
import { colors, fontSize, fontWeight, radius, spacing } from '../../../theme';

const TURN_SWITCH_MS = 6000; // đổi chỉ dẫn giả lập mỗi 6s

export default function DriverNavigationScreen({ navigation }) {
  const { caseData, lastPosition, markEnRoute, arrivedOnScene } = useDriverShiftStore();
  const mapRef = useRef(null);
  const [turnIdx, setTurnIdx] = useState(0);

  // Vào màn = tài xế đã lên đường tới hiện trường.
  useEffect(() => {
    markEnRoute();
  }, []);

  // Chỉ dẫn giả lập tự luân chuyển cho map có "nhịp sống".
  useEffect(() => {
    const t = setInterval(() => setTurnIdx((i) => (i + 1) % MOCK_TURN_INSTRUCTIONS.length), TURN_SWITCH_MS);
    return () => clearInterval(t);
  }, []);

  // Camera fit cả tài xế + hiện trường mỗi khi có bản tin GPS mới (pattern C-04).
  useEffect(() => {
    if (!caseData || !lastPosition || !mapRef.current) return;
    if (
      lastPosition.latitude === caseData.coords.latitude &&
      lastPosition.longitude === caseData.coords.longitude
    ) {
      return;
    }
    mapRef.current.fitToCoordinates([lastPosition, caseData.coords], {
      edgePadding: { top: 150, right: 50, bottom: 400, left: 50 },
      animated: true,
    });
  }, [lastPosition?.latitude, lastPosition?.longitude, caseData?.code]);

  // Vùng nhìn ban đầu: phủ cả 2 điểm nếu đã có GPS, không thì quanh hiện trường.
  const initialRegion = useMemo(() => {
    if (!caseData) return null;
    if (!lastPosition) {
      return { ...caseData.coords, latitudeDelta: 0.02, longitudeDelta: 0.02 };
    }
    const mid = {
      latitude: (lastPosition.latitude + caseData.coords.latitude) / 2,
      longitude: (lastPosition.longitude + caseData.coords.longitude) / 2,
    };
    const dLat = Math.abs(lastPosition.latitude - caseData.coords.latitude);
    const dLng = Math.abs(lastPosition.longitude - caseData.coords.longitude);
    return {
      ...mid,
      latitudeDelta: Math.max(dLat * 2.4, 0.012),
      longitudeDelta: Math.max(dLng * 2.4, 0.012),
    };
  }, [caseData?.code, !!lastPosition]);

  if (!caseData || !initialRegion) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>Không có ca đang chạy</Text>
          <Text style={styles.emptySub}>Chấp nhận một yêu cầu điều động để bắt đầu dẫn đường.</Text>
          <Pressable style={styles.homeBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.homeBtnText}>Quay lại</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ETA sống: từ vị trí GPS thật tới hiện trường (~30 km/h đô thị).
  const liveKm = lastPosition ? haversineKm(lastPosition, caseData.coords) : caseData.distanceKm;
  const liveEta = etaMinutes(liveKm ?? caseData.distanceKm);

  const openGoogleMaps = () => {
    const { latitude, longitude } = caseData.coords;
    // Android: scheme google.navigation bật chế độ dẫn đường ngay trong app.
    // iOS: scheme google.navigation/comgooglemaps không tồn tại hoặc bị Expo Go
    // chặn (app Expo Go không khai báo LSApplicationQueriesSchemes) -> dùng
    // universal link Maps URLs chính thức của Google, mở được cả trong Expo Go.
    const url =
      Platform.OS === 'ios'
        ? `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`
        : `google.navigation:q=${latitude},${longitude}&mode=d`;
    Linking.openURL(url).catch(() =>
      Alert.alert('Không mở được Google Maps', 'Thiết bị chưa cài Google Maps hoặc đã từ chối mở ứng dụng.'),
    );
  };

  const arrive = () => {
    arrivedOnScene(); // DRIVER_EN_ROUTE -> ARRIVED_ON_SCENE
    navigation.replace('OnScene'); // sang D-04 triage (đánh giá nhanh bệnh nhân)
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <View style={styles.flex}>
        <MapView ref={mapRef} style={styles.map} initialRegion={initialRegion} accessibilityLabel="Bản đồ dẫn đường tới hiện trường">
          {/* Pin đỏ: hiện trường sự cố */}
          <Marker
            coordinate={caseData.coords}
            pinColor={colors.primary}
            title="Hiện trường"
            description={caseData.address}
          />

          {/* Xe cứu thương tại vị trí GPS thật (vòng xanh - pattern C-04) */}
          {lastPosition && (
            <Marker coordinate={lastPosition} title={`Xe của bạn ${'· AMB-07'}`} description="GPS cập nhật 3 giây/lần">
              <View style={styles.carPin}>
                <Ionicons name="medical" size={20} color={colors.textOnPrimary} />
              </View>
            </Marker>
          )}
        </MapView>

        {/* Card nổi trên: chỉ dẫn rút gọn + mở Google Maps */}
        <View style={styles.turnCard}>
          <View style={styles.turnRow}>
            <View style={styles.turnIcon}>
              <Ionicons name="navigate" size={22} color={colors.blue} />
            </View>
            <Text style={styles.turnText} numberOfLines={2}>
              {MOCK_TURN_INSTRUCTIONS[turnIdx]}
            </Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.gmapsBtn, pressed && { opacity: 0.8 }]}
            onPress={openGoogleMaps}
          >
            <Ionicons name="map" size={18} color={colors.text} />
            <Text style={styles.gmapsText}>Mở Google Maps</Text>
          </Pressable>
        </View>

        {/* Bottom sheet thông tin chuyến (mockup D-03) */}
        <View style={styles.sheet}>
          <View style={styles.sheetBadge}>
            <Text style={styles.sheetBadgeText}>● ĐANG ĐẾN HIỆN TRƯỜNG</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <Text style={styles.ambTitle}>{caseData.code}</Text>
              <Text style={styles.infoSub}>
                {liveKm != null ? `${liveKm.toFixed(1)} km` : '— km'} · {caseData.shortAddress}
              </Text>
            </View>
            <View style={styles.etaBox}>
              <Text style={styles.etaNum}>{liveEta}</Text>
              <Text style={styles.etaLabel}>phút</Text>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [styles.arriveBtn, pressed && { opacity: 0.85 }]}
            onPress={arrive}
          >
            <Ionicons name="location" size={20} color={colors.textOnPrimary} />
            <Text style={styles.arriveText}>ĐÃ ĐẾN HIỆN TRƯỜNG</Text>
          </Pressable>
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

  turnCard: {
    position: 'absolute',
    top: spacing.l,
    left: spacing.l,
    right: spacing.l,
    backgroundColor: colors.surface,
    borderRadius: radius.l,
    padding: spacing.m,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  turnRow: { flexDirection: 'row', alignItems: 'center' },
  turnIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.m,
    backgroundColor: colors.blueBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
  },
  turnText: { flex: 1, fontSize: fontSize.m, fontWeight: fontWeight.semibold, color: colors.text, lineHeight: 20 },
  gmapsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.s,
    backgroundColor: colors.bgSubtle,
    borderRadius: radius.m,
    paddingVertical: spacing.s + 2,
    marginTop: spacing.m,
  },
  gmapsText: { fontSize: fontSize.s, fontWeight: fontWeight.semibold, color: colors.text },

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
    backgroundColor: colors.warningBg,
    borderRadius: radius.full,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs + 2,
    marginBottom: spacing.m,
  },
  sheetBadgeText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: '#B45309', letterSpacing: 0.3 },

  infoRow: { flexDirection: 'row', alignItems: 'center' },
  infoLeft: { flex: 1, marginRight: spacing.m },
  ambTitle: { fontSize: fontSize.l, fontWeight: fontWeight.bold, color: colors.text },
  infoSub: { fontSize: fontSize.s, color: colors.textSecondary, marginTop: 2 },
  etaBox: { alignItems: 'center' },
  etaNum: { fontSize: 34, fontWeight: fontWeight.bold, color: colors.warning, lineHeight: 38 },
  etaLabel: { fontSize: fontSize.xs, color: colors.textSecondary },

  arriveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.s,
    backgroundColor: colors.primary,
    borderRadius: radius.m,
    minHeight: 54,
    marginTop: spacing.l,
  },
  arriveText: { color: colors.textOnPrimary, fontSize: fontSize.m, fontWeight: fontWeight.bold, letterSpacing: 0.3 },
});
