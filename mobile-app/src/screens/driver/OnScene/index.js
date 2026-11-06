/**
 * D-04 Tại hiện trường — đánh giá nhanh bệnh nhân (triage) - đúng mockup:
 * - Header cam: badge "● TẠI HIỆN TRƯỜNG" + "Đánh giá nhanh bệnh nhân" + EMG
 *   + đồng hồ tại hiện trường đếm từ lúc ĐÃ ĐẾN HIỆN TRƯỜNG (onSceneAt).
 * - PHÂN LOẠI TRIAGE: 3 nút Critical (mặc định) / Urgent / Delayed.
 * - DẤU SINH TỒN: 3 ô nhập SpO₂ / nhịp tim / huyết áp (mặc định 92 · 110 · 90/60).
 * - Ý THỨC (AVPU): Tỉnh / Âm thanh / Đau / Không đáp ứng (mặc định Tỉnh).
 * - Ô ghi chú + hộp xanh "Gửi trước cho BV — khoa cấp cứu chuẩn bị tiếp nhận".
 * - Nút xanh lá "VẬN CHUYỂN BỆNH NHÂN" (bỏ mũi tên 2 đầu theo review) -> startTransport (FSM TRANSPORTING,
 *   lưu phiếu triage) -> D-05.
 * FSM vào màn là ARRIVED_ON_SCENE (D-03 đã chốt khi bấm ĐÃ ĐẾN HIỆN TRƯỜNG).
 */
import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '../../../components';
import { AVPU_LEVELS, DRIVER_CASE_STATUS, TRIAGE_LEVELS } from '../../../constants/driverTrip';
import { useDriverShiftStore } from '../../../store/driverShift';
import { colors, fontSize, fontWeight, radius, spacing } from '../../../theme';

/** "03:12" từ số giây - đồng hồ tại hiện trường của mockup D-04. */
function formatElapsed(totalSec) {
  const p = (n) => String(n).padStart(2, '0');
  return `${p(Math.floor(totalSec / 60))}:${p(totalSec % 60)}`;
}

export default function DriverOnSceneScreen({ navigation }) {
  const { caseData, caseStatus, onSceneAt, startTransport } = useDriverShiftStore();

  // Form triage - mặc định đúng con số mockup (92 · 110 · 90/60 · Critical · Tỉnh).
  const [level, setLevel] = useState('CRITICAL');
  const [spo2, setSpo2] = useState('92');
  const [heartRate, setHeartRate] = useState('110');
  const [bloodPressure, setBloodPressure] = useState('90/60');
  const [avpu, setAvpu] = useState('ALERT');
  const [note, setNote] = useState('');
  const [elapsed, setElapsed] = useState(0);

  // Đồng hồ tại hiện trường: đếm từ lúc arrivedOnScene (onSceneAt trong store,
  // back vào lại màn vẫn đếm đúng mốc cũ).
  useEffect(() => {
    if (!onSceneAt) return;
    const tick = () => setElapsed(Math.max(0, Math.floor((Date.now() - onSceneAt) / 1000)));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [onSceneAt]);

  // Bất thường: vào màn mà không còn ở pha AT SCENE (vd ca bị dọn) -> thoát.
  useEffect(() => {
    if (caseStatus !== DRIVER_CASE_STATUS.ARRIVED_ON_SCENE) navigation.goBack();
  }, [caseStatus, navigation]);

  const startTrip = () => {
    startTransport({
      level,
      vitals: { spo2, heartRate, bloodPressure },
      avpu,
      note: note.trim(),
    });
    navigation.replace('DriverTransport'); // sang D-05
  };

  if (!caseData) return <View style={styles.screen} />;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
        {/* ===== Header: badge cam + tiêu đề + đồng hồ tại hiện trường ===== */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>● TẠI HIỆN TRƯỜNG</Text>
            </View>
            <Text style={styles.title}>Đánh giá nhanh bệnh nhân</Text>
            <Text style={styles.sub}>
              {caseData.code} · {caseData.victims} nạn nhân
            </Text>
          </View>
          <View style={styles.clockBox}>
            <Text style={styles.clock}>{formatElapsed(elapsed)}</Text>
            <Text style={styles.clockLabel}>tại hiện trường</Text>
          </View>
        </View>

        {/* ===== PHÂN LOẠI TRIAGE: 3 mức (1 chọn) ===== */}
        <Text style={styles.sectionLabel}>PHÂN LOẠI TRIAGE</Text>
        <View style={styles.triageRow}>
          {TRIAGE_LEVELS.map((t) => {
            const selected = level === t.key;
            return (
              <Pressable
                key={t.key}
                style={({ pressed }) => [
                  styles.triageBtn,
                  styles[t.key],
                  selected && styles[`${t.key}On`],
                  pressed && { opacity: 0.85 },
                ]}
                onPress={() => setLevel(t.key)}
                accessibilityLabel={`Chọn mức triage ${t.label}`}
              >
                <Text style={[styles.triageTitle, styles[`${t.key}Title`], selected && styles.triageTextOn]}>
                  {t.label}
                </Text>
                <Text style={[styles.triageHint, styles[`${t.key}Hint`], selected && styles.triageHintOn]}>
                  {t.hint}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* ===== DẤU SINH TỒN: 3 ô nhập số ===== */}
        <Text style={styles.sectionLabel}>DẤU SINH TỒN</Text>
        <View style={styles.vitalsRow}>
          <View style={styles.vitalBox}>
            <TextInput
              style={styles.vitalValue}
              value={spo2}
              onChangeText={setSpo2}
              keyboardType="number-pad"
              maxLength={3}
              accessibilityLabel="SpO2"
            />
            <Text style={styles.vitalLabel}>SpO₂ %</Text>
          </View>
          <View style={styles.vitalBox}>
            <TextInput
              style={styles.vitalValue}
              value={heartRate}
              onChangeText={setHeartRate}
              keyboardType="number-pad"
              maxLength={3}
              accessibilityLabel="Nhịp tim"
            />
            <Text style={styles.vitalLabel}>Nhịp tim</Text>
          </View>
          <View style={styles.vitalBox}>
            <TextInput
              style={styles.vitalValue}
              value={bloodPressure}
              onChangeText={setBloodPressure}
              keyboardType="numbers-and-punctuation"
              maxLength={7}
              accessibilityLabel="Huyết áp"
            />
            <Text style={styles.vitalLabel}>Huyết áp</Text>
          </View>
        </View>

        {/* ===== Ý THỨC (AVPU): 4 mức ===== */}
        <Text style={styles.sectionLabel}>Ý THỨC (AVPU)</Text>
        <View style={styles.avpuRow}>
          {AVPU_LEVELS.map((a) => {
            const selected = avpu === a.key;
            return (
              <Pressable
                key={a.key}
                style={({ pressed }) => [styles.avpuBtn, selected && styles.avpuSelected, pressed && { opacity: 0.85 }]}
                onPress={() => setAvpu(a.key)}
                accessibilityLabel={`Ý thức ${a.label}`}
              >
                <Text style={[styles.avpuText, selected && styles.avpuTextSelected]} numberOfLines={2}>
                  {a.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* ===== Ghi chú hiện trường ===== */}
        <Text style={styles.sectionLabel}>GHI CHÚ</Text>
        <TextInput
          style={styles.noteInput}
          value={note}
          onChangeText={setNote}
          placeholder="Triệu chứng, thuốc đã dùng, tiền sử..."
          placeholderTextColor={colors.textMuted}
          multiline
          textAlignVertical="top"
        />

        {/* Gửi trước cho BV đích (payload dispatch mock đã kèm BV - D-05 badge "Đã gửi") */}
        <View style={styles.hospitalBox}>
          <Ionicons name="paper-plane" size={20} color={colors.info} />
          <Text style={styles.hospitalText}>
            Gửi trước cho {caseData.hospital?.name} — khoa cấp cứu chuẩn bị tiếp nhận ngay khi bắt
            đầu vận chuyển.
          </Text>
        </View>
      </ScrollView>

      {/* ===== CTA: bắt đầu vận chuyển (luôn thấy khi cuộn) ===== */}
      <View style={styles.footer}>
        <AppButton
          variant="success"
          size="lg"
          title="VẬN CHUYỂN BỆNH NHÂN"
          onPress={startTrip}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.l, paddingBottom: spacing.xl },

  // Header
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.l },
  headerLeft: { flex: 1, marginRight: spacing.m },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.warningBg,
    borderRadius: radius.full,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs + 2,
    marginBottom: spacing.m,
  },
  badgeText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: '#B45309', letterSpacing: 0.3 },
  title: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text },
  sub: { fontSize: fontSize.s, color: colors.textSecondary, marginTop: 2 },
  clockBox: { alignItems: 'flex-end' },
  clock: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.warning, fontVariant: ['tabular-nums'] },
  clockLabel: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },

  // Nhãn section
  sectionLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: spacing.s,
    marginTop: spacing.l,
  },

  // Triage 3 nút
  triageRow: { flexDirection: 'row', gap: spacing.s },
  triageBtn: {
    flex: 1,
    borderRadius: radius.m,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
    minHeight: 72,
    justifyContent: 'center',
  },
  // Mặc định từng mức (chưa chọn): nhạt theo màu mức
  CRITICAL: { backgroundColor: colors.errorBg, borderColor: 'rgba(220, 38, 38, 0.35)' },
  URGENT: { backgroundColor: colors.warningBg, borderColor: 'rgba(249, 115, 22, 0.35)' },
  DELAYED: { backgroundColor: colors.bgSubtle, borderColor: colors.border },
  // Đang chọn: nền đặc màu mức + viền đậm (mockup: Critical đỏ, chọn)
  CRITICALOn: { backgroundColor: colors.primary, borderColor: colors.primaryDark },
  URGENTOn: { backgroundColor: colors.warning, borderColor: '#C2410C' },
  DELAYEDOn: { backgroundColor: colors.textSecondary, borderColor: '#4B5563' },
  triageTextOn: { color: colors.textOnPrimary },
  triageHintOn: { color: 'rgba(255, 255, 255, 0.85)' },
  triageTitle: { fontSize: fontSize.m, fontWeight: fontWeight.bold },
  CRITICALTitle: { color: colors.primary },
  URGENTTitle: { color: colors.warning },
  DELAYEDTitle: { color: colors.textSecondary },
  triageHint: { fontSize: 10, marginTop: 2, textAlign: 'center', lineHeight: 13 },
  CRITICALHint: { color: 'rgba(220, 38, 38, 0.75)' },
  URGENTHint: { color: 'rgba(180, 83, 9, 0.75)' },
  DELAYEDHint: { color: colors.textMuted },

  // Dấu sinh tồn 3 ô
  vitalsRow: { flexDirection: 'row', gap: spacing.s },
  vitalBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.m,
    alignItems: 'center',
  },
  vitalValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    padding: 0,
    textAlign: 'center',
    minWidth: 64,
    fontVariant: ['tabular-nums'],
  },
  vitalLabel: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },

  // AVPU 4 mức
  avpuRow: { flexDirection: 'row', gap: spacing.s },
  avpuBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.m,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
  },
  avpuSelected: { backgroundColor: colors.primary, borderColor: colors.primaryDark },
  avpuText: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: colors.textSecondary, textAlign: 'center' },
  avpuTextSelected: { color: colors.textOnPrimary },

  // Ghi chú
  noteInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.m,
    fontSize: fontSize.s,
    color: colors.text,
    minHeight: 84,
    lineHeight: 20,
  },

  // Hộp gửi BV
  hospitalBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.infoBg,
    borderRadius: radius.m,
    padding: spacing.l,
    marginTop: spacing.l,
  },
  hospitalText: { flex: 1, fontSize: fontSize.s, color: colors.textSecondary, marginLeft: spacing.s, lineHeight: 19 },

  // CTA
  footer: { padding: spacing.l, backgroundColor: colors.background },
});
