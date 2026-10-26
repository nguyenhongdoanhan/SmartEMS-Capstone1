/**
 * D-02 Thông báo điều động (full-screen, KHÔNG tab bar) - đúng mockup:
 * - Khối đỏ 2/3 màn: icon đèn nháy (pulse) + "YÊU CẦU ĐIỀU ĐỘNG MỚI"
 *   + vòng đếm ngược 12s (ring SVG co dần) + "Tự đóng sau 12 giây".
 * - Card trắng: badge CRITICAL + mã EMG + địa chỉ + 3 số (khoảng cách · ETA ·
 *   nạn nhân) + hộp vàng ghi chú hiện trường.
 * - 2 nút: "CHẤP NHẬN — BẮT ĐẦU CHUYẾN ĐI" (xanh lá - quy ước nhận ca) /
 *   "Từ chối (ghi nhận hệ thống)" (xám).
 * - Hết 12s không bấm -> coi như từ chối (tài xế bận) - FE tự chốt.
 * - Chặn nút back trong lúc đếm ngược: tài xế phải chọn hoặc chờ hết giờ.
 * Mục tiêu hệ thống: dispatch < 30s - countdown này là cam kết phía tài xế.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Animated, BackHandler, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { AppButton, Badge } from '../../../components';
import { DISPATCH_COUNTDOWN_S, DRIVER_CASE_STATUS } from '../../../constants/driverTrip';
import { useDriverShiftStore } from '../../../store/driverShift';
import { colors, fontSize, fontWeight, radius, spacing } from '../../../theme';

const RING_SIZE = 128;
const STROKE = 7;
const R = (RING_SIZE - STROKE) / 2 - 2;
const CIRC = 2 * Math.PI * R;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function DriverDispatchAlertScreen({ navigation }) {
  const { caseData, caseStatus, acceptDispatch, declineDispatch } = useDriverShiftStore();
  const [remaining, setRemaining] = useState(DISPATCH_COUNTDOWN_S);

  // Ring co dần đều trong 12s (JS driver - strokeDashoffset SVG như SosHoldButton).
  const progress = useRef(new Animated.Value(0)).current;
  // Icon đèn nháy: phồng lên - xẹp xuống lặp lại.
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: DISPATCH_COUNTDOWN_S * 1000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.15, duration: 450, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 450, useNativeDriver: true }),
      ]),
    ).start();

    const tick = setInterval(() => setRemaining((s) => Math.max(0, s - 1)), 1000);
    const expire = setTimeout(() => {
      // Hết giờ không chọn -> hệ thống ghi nhận tài xế bận (như nút Từ chối).
      declineDispatch();
      navigation.goBack();
    }, DISPATCH_COUNTDOWN_S * 1000);

    // Chặn back Android trong countdown - buộc chọn ý thức hoặc chờ hết giờ.
    const blockBack = BackHandler.addEventListener('hardwareBackPress', () => true);

    return () => {
      clearInterval(tick);
      clearTimeout(expire);
      blockBack.remove();
      progress.stopAnimation();
    };
  }, []);

  // Bất thường: vào màn mà đề xuất đã bị dọn (vd tắt trực từ nơi khác) -> thoát.
  useEffect(() => {
    if (caseStatus !== DRIVER_CASE_STATUS.DISPATCH_PENDING) navigation.goBack();
  }, [caseStatus, navigation]);

  const accept = () => {
    acceptDispatch(); // DISPATCH_PENDING -> DRIVER_ACCEPTED
    navigation.replace('DriverNavigation'); // sang D-03
  };

  const decline = () => {
    declineDispatch();
    navigation.goBack(); // về DriverTabs
  };

  if (!caseData) return <View style={styles.screen} />;

  const strokeOffset = progress.interpolate({ inputRange: [0, 1], outputRange: [0, CIRC] });

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      {/* ===== Khối đỏ: tiêu đề + vòng đếm ngược ===== */}
      <View style={styles.top}>
        <Animated.View style={[styles.beacon, { transform: [{ scale: pulse }] }]}>
          <Ionicons name="notifications" size={38} color={colors.textOnPrimary} />
        </Animated.View>
        <Text style={styles.title}>YÊU CẦU ĐIỀU ĐỘNG MỚI</Text>

        <View style={styles.ringWrap}>
          <Svg width={RING_SIZE} height={RING_SIZE}>
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={R}
              stroke="rgba(255, 255, 255, 0.25)"
              strokeWidth={STROKE}
              fill="none"
            />
            <AnimatedCircle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={R}
              stroke={colors.textOnPrimary}
              strokeWidth={STROKE}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={`${CIRC} ${CIRC}`}
              strokeDashoffset={strokeOffset}
              transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
            />
          </Svg>
          <View style={styles.ringCenter}>
            <Text style={styles.countNum}>{remaining}</Text>
            <Text style={styles.countUnit}>giây</Text>
          </View>
        </View>

        <Text style={styles.sub}>Tự đóng sau {DISPATCH_COUNTDOWN_S} giây</Text>
      </View>

      {/* ===== Card ca + 2 nút ===== */}
      <View style={styles.bottom}>
        <View style={styles.caseCard}>
          <View style={styles.caseHead}>
            <Badge label="CRITICAL" variant="danger" />
            <Text style={styles.caseCode}>{caseData.code}</Text>
          </View>
          <Text style={styles.caseAddress}>{caseData.address}</Text>

          <View style={styles.statRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{caseData.distanceKm.toFixed(1)} km</Text>
              <Text style={styles.statLabel}>khoảng cách</Text>
            </View>
            <View style={styles.statSep} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{caseData.etaMinutes} phút</Text>
              <Text style={styles.statLabel}>ETA</Text>
            </View>
            <View style={styles.statSep} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{caseData.victims}</Text>
              <Text style={styles.statLabel}>nạn nhân</Text>
            </View>
          </View>

          <View style={styles.noteBox}>
            <Text style={styles.noteText}>💡 {caseData.note}</Text>
          </View>
        </View>

        <AppButton
          variant="success"
          size="lg"
          title="CHẤP NHẬN — BẮT ĐẦU CHUYẾN ĐI"
          onPress={accept}
          icon={<Ionicons name="checkmark-circle" size={20} color={colors.textOnPrimary} />}
        />
        <AppButton variant="secondary" size="lg" title="Từ chối (ghi nhận hệ thống)" onPress={decline} style={styles.declineBtn} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.primary },
  top: {
    flex: 1.15,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  beacon: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.l,
  },
  title: {
    color: colors.textOnPrimary,
    fontSize: fontSize.l,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  ringWrap: { marginTop: spacing.xl, alignItems: 'center', justifyContent: 'center' },
  ringCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countNum: { color: colors.textOnPrimary, fontSize: 44, fontWeight: fontWeight.bold, lineHeight: 48 },
  countUnit: { color: 'rgba(255, 255, 255, 0.75)', fontSize: fontSize.xs, fontWeight: fontWeight.medium },
  sub: { color: 'rgba(255, 255, 255, 0.75)', fontSize: fontSize.s, marginTop: spacing.l },

  bottom: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.l,
    // Card nhô lên trên mép đỏ như mockup
    marginTop: -spacing.xl,
    paddingTop: spacing.xl,
  },
  caseCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.l,
    padding: spacing.l,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  caseHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  caseCode: { fontSize: fontSize.l, fontWeight: fontWeight.bold, color: colors.text },
  caseAddress: { fontSize: fontSize.s, color: colors.textSecondary, marginTop: spacing.s, lineHeight: 19 },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.l,
    paddingTop: spacing.m,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: fontSize.m, fontWeight: fontWeight.bold, color: colors.text },
  statLabel: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  statSep: { width: 1, height: 26, backgroundColor: colors.border },
  noteBox: {
    backgroundColor: colors.warningBg,
    borderRadius: radius.m,
    padding: spacing.m,
    marginTop: spacing.m,
  },
  noteText: { fontSize: fontSize.s, color: colors.text, lineHeight: 19 },
  declineBtn: { marginTop: spacing.m },
});
