/**
 * Tab "Bản đồ" - FE tự thiết kế (mockup driver không có trang riêng, chốt trong
 * design/driver-design-analysis.md): map tổng quan vị trí tài xế GPS THẬT +
 * trạm S1 + tuyến của ca đang chạy (nếu có) - tái dùng đúng style từng màn:
 * - Đi hiện trường (D-03) / chở bệnh nhân tới BV (D-05): polyline nét đứt
 *   xanh info + marker hiện trường (cam) / BV ("+" xanh).
 * - Về trạm (D-07): polyline nét đứt slate + marker trạm S1.
 * - Camera tự fit (xe + đích) theo từng bản tin GPS 3s/lần.
 * - Chip nổi trên map: trạng thái trực / nhãn pha chuyến đang chạy.
 * - Card nhỏ dưới map: xe AMB-07 + dòng GPS sống (bằng chứng stream thật).
 * Chưa bật trực: map neo quanh trạm S1 + gợi ý bật trực ở tab Tổng quan.
 */
import React, { useEffect, useMemo, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

import { driverCaseLabel, DRIVER_CASE_STATUS } from '../../../constants/driverTrip';
import { DRIVER_STATION, DRIVER_VEHICLE, useDriverShiftStore } from '../../../store/driverShift';
import { colors, fontSize, fontWeight, radius, spacing } from '../../../theme';

/** "12:34:56" từ timestamp - giờ bản tin GPS cuối. */
function formatClock(ts) {
  const d = new Date(ts);
  const p = (n) => String(n).padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

export default function DriverMapOverviewScreen() {
  const { onDuty, lastPosition, packets, caseData, caseStatus } = useDriverShiftStore();
  const mapRef = useRef(null);

  // Ca đang chạy (đã CHẤP NHẬN - đề xuất D-02 tự đẩy fullscreen nên khỏi vẽ ở đây).
  const activeCase = caseData && caseStatus !== DRIVER_CASE_STATUS.DISPATCH_PENDING ? caseData : null;

  // Chân đường hiện tại theo pha FSM (màu/đích đúng màn tương ứng D-03/D-05/D-07).
  const leg = useMemo(() => {
    if (!activeCase) return null;
    if (caseStatus === DRIVER_CASE_STATUS.TRANSPORTING || caseStatus === DRIVER_CASE_STATUS.AT_HOSPITAL) {
      return activeCase.hospital ? { kind: 'hospital', coords: activeCase.hospital.coords, color: colors.mapRoute } : null;
    }
    if (caseStatus === DRIVER_CASE_STATUS.RETURNING) {
      return { kind: 'station', coords: DRIVER_STATION.coords, color: colors.darkSoft };
    }
    return { kind: 'scene', coords: activeCase.coords, color: colors.mapRoute }; // tới hiện trường
  }, [activeCase?.code, caseStatus]);

  // Camera fit (xe + đích chân đường; không có ca thì xe + trạm) mỗi bản tin GPS.
  useEffect(() => {
    if (!mapRef.current || !lastPosition) return;
    const target = leg?.coords || DRIVER_STATION.coords;
    mapRef.current.fitToCoordinates([lastPosition, target], {
      edgePadding: { top: 120, right: 60, bottom: 200, left: 60 },
      animated: true,
    });
  }, [lastPosition?.latitude, lastPosition?.longitude, leg?.kind]);

  // Vùng nhìn ban đầu: giữa xe (hoặc trạm nếu chưa có GPS) và đích.
  const initialRegion = useMemo(() => {
    const from = lastPosition || DRIVER_STATION.coords;
    const to = leg?.coords || DRIVER_STATION.coords;
    return {
      latitude: (from.latitude + to.latitude) / 2,
      longitude: (from.longitude + to.longitude) / 2,
      latitudeDelta: Math.max(Math.abs(from.latitude - to.latitude) * 2.4, 0.02),
      longitudeDelta: Math.max(Math.abs(from.longitude - to.longitude) * 2.4, 0.02),
    };
  }, [!!lastPosition, leg?.kind]);

  // Chip trạng thái nổi trên map.
  const chipText = activeCase
    ? `${driverCaseLabel(caseStatus)} · ${activeCase.code}`
    : onDuty
      ? 'Đang trực — sẵn sàng nhận ca'
      : 'Ngoài giờ trực — bật trực ở tab Tổng quan';

  return (
    <View style={styles.screen}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        accessibilityLabel="Bản đồ tổng quan vị trí và tuyến trực"
      >
        {/* Tuyến của chân đường hiện tại - nét đứt đúng màu từng màn D-03/D-05/D-07 */}
        {leg && lastPosition && (
          <Polyline
            coordinates={[lastPosition, leg.coords]}
            strokeColor={leg.color}
            strokeWidth={4}
            lineDashPattern={[10, 8]}
          />
        )}

        {/* Xe cứu thương tại vị trí GPS thật (vòng xanh - pattern D-03/D-05) */}
        {lastPosition && (
          <Marker
            coordinate={lastPosition}
            title={`Xe của bạn · ${DRIVER_VEHICLE.code}`}
            description="GPS cập nhật 3 giây/lần"
          >
            <View style={styles.carPin}>
              <Ionicons name="medical" size={20} color={colors.textOnPrimary} />
            </View>
          </Marker>
        )}

        {/* Hiện trường của ca đang chạy (chân đường tới hiện trường - D-03) */}
        {leg?.kind === 'scene' && (
          <Marker
            coordinate={leg.coords}
            title={activeCase?.code}
            description={activeCase?.shortAddress}
            accessibilityLabel={`Hiện trường ${activeCase?.code}`}
          >
            <View style={styles.scenePin}>
              <Ionicons name="flash" size={20} color={colors.textOnPrimary} />
            </View>
          </Marker>
        )}

        {/* Bệnh viện đích (đang vận chuyển - marker "+" như D-05) */}
        {leg?.kind === 'hospital' && (
          <Marker
            coordinate={leg.coords}
            title={activeCase?.hospital?.name}
            description={activeCase?.hospital?.department}
            accessibilityLabel={`Bệnh viện ${activeCase?.hospital?.name}`}
          >
            <View style={styles.hospitalPin}>
              <Ionicons name="add" size={26} color={colors.textOnPrimary} />
            </View>
          </Marker>
        )}

        {/* Trạm S1 - luôn hiện (trạm trực của tài xế) */}
        <Marker
          coordinate={DRIVER_STATION.coords}
          title={DRIVER_STATION.name}
          description="Trạm trực của bạn"
          accessibilityLabel={DRIVER_STATION.name}
        >
          <View style={styles.stationPin}>
            <Ionicons name="home" size={20} color={colors.textOnPrimary} />
          </View>
        </Marker>
      </MapView>

      {/* Chip trạng thái nổi (không chặn thao tác map) */}
      <View style={styles.chip} pointerEvents="none">
        <View style={[styles.chipDot, onDuty ? styles.chipDotOn : styles.chipDotOff]} />
        <Text style={styles.chipText} numberOfLines={1}>
          {chipText}
        </Text>
      </View>

      {/* Card nhỏ dưới map: xe + dòng GPS sống (bằng chứng stream thật) */}
      <View style={styles.bottomCard}>
        <View style={styles.vehicleIcon}>
          <Ionicons name="medkit" size={20} color={colors.warning} />
        </View>
        <View style={styles.vehicleInfo}>
          <Text style={styles.vehicleTitle}>
            {DRIVER_VEHICLE.code} · {DRIVER_VEHICLE.plate}
          </Text>
          <Text style={styles.vehicleSub} numberOfLines={1}>
            {onDuty && lastPosition
              ? `${lastPosition.latitude.toFixed(5)}, ${lastPosition.longitude.toFixed(5)} · ${formatClock(
                  lastPosition.at,
                )} · đã gửi ${packets} bản tin`
              : onDuty
                ? 'Đang chờ bản tin GPS đầu tiên...'
                : 'GPS đã tắt — bật trực để mở stream 3 giây/lần'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  map: { flex: 1 },

  // Marker (pattern D-03/D-05/D-07)
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
  scenePin: {
    width: 40,
    height: 40,
    borderRadius: radius.m,
    backgroundColor: colors.warning,
    borderWidth: 2,
    borderColor: colors.warningBg,
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

  // Chip trạng thái nổi trên map
  chip: {
    position: 'absolute',
    top: spacing.m,
    left: spacing.m,
    right: spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  chipDot: { width: 8, height: 8, borderRadius: radius.full, marginRight: spacing.s },
  chipDotOn: { backgroundColor: colors.success },
  chipDotOff: { backgroundColor: colors.textMuted },
  chipText: { fontSize: fontSize.s, fontWeight: fontWeight.semibold, color: colors.text, flexShrink: 1 },

  // Card dưới map
  bottomCard: {
    position: 'absolute',
    left: spacing.l,
    right: spacing.l,
    bottom: spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.l,
    padding: spacing.m,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  vehicleIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.m,
    backgroundColor: colors.warningBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
  },
  vehicleInfo: { flex: 1 },
  vehicleTitle: { fontSize: fontSize.m, fontWeight: fontWeight.bold, color: colors.text },
  vehicleSub: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
});
