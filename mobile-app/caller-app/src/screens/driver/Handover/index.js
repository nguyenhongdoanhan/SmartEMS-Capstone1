/**
 * D-06 Bàn giao bệnh nhân tại bệnh viện - đúng mockup:
 * - Header: badge tím "● TẠI BỆNH VIỆN" + "Bàn giao bệnh nhân" + EMG code.
 * - Card: tên BV + "Khoa cấp cứu · tiếp nhận HH:MM" (giờ arriveAtHospital).
 * - Checklist XÁC NHẬN BÀN GIAO (1 chạm): Bệnh nhân & hồ sơ y tế · Dấu sinh
 *   tồn & triage đã gửi · Tài sản cá nhân (2 mục đầu đã tick sẵn).
 * - Nút navy "HOÀN TẤT BÀN GIAO → VỀ TRẠM" (mở khoá khi tick đủ 3 mục; bỏ icon mũi tên
 *   đầu theo review, "→" dán với "VỀ TRẠM" bằng NBSP để Android không vắt mũi tên
 *   xuống cuối dòng khi buộc phải wrap).
 * - Note: "Trạng thái xe chuyển sang RETURNING — có thể được tái điều động"
 *   -> completeHandover (FSM RETURNING) -> D-07.
 * Vào màn là đang AT_HOSPITAL (D-05 đã chốt khi bấm ĐÃ ĐẾN BỆNH VIỆN).
 */
import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '../../../components';
import { DRIVER_CASE_STATUS } from '../../../constants/driverTrip';
import { useDriverShiftStore } from '../../../store/driverShift';
import { colors, fontSize, fontWeight, radius, spacing } from '../../../theme';

/** "12:12" từ timestamp - giờ khoa cấp cứu tiếp nhận (mockup D-06). */
function formatClock(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  const p = (n) => String(n).padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}`;
}

const HANDOVER_ITEMS = [
  'Bệnh nhân & hồ sơ y tế',
  'Dấu sinh tồn & triage đã gửi',
  'Tài sản cá nhân',
];

export default function DriverHandoverScreen({ navigation }) {
  const { caseData, caseStatus, hospitalArrivedAt, completeHandover } = useDriverShiftStore();

  // 2 mục đầu đã tick sẵn theo mockup (bệnh nhân + triage đều đã có từ D-04/D-05).
  const [checked, setChecked] = useState([true, true, false]);

  // Bất thường: vào màn mà không ở pha AT_HOSPITAL (vd ca bị dọn) -> thoát.
  useEffect(() => {
    if (caseStatus !== DRIVER_CASE_STATUS.AT_HOSPITAL) navigation.goBack();
  }, [caseStatus, navigation]);

  const allChecked = checked.every(Boolean);

  const toggle = (i) => setChecked((prev) => prev.map((c, idx) => (idx === i ? !c : c)));

  const finish = () => {
    completeHandover(); // AT_HOSPITAL -> RETURNING (trip khép, xe rỗng về trạm)
    navigation.replace('DriverReturning'); // sang D-07
  };

  if (!caseData) return <View style={styles.screen} />;

  const hospital = caseData.hospital;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
        {/* ===== Header: badge tím + tiêu đề ===== */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>● TẠI BỆNH VIỆN</Text>
        </View>
        <Text style={styles.title}>Bàn giao bệnh nhân</Text>
        <Text style={styles.sub}>{caseData.code}</Text>

        {/* Card nơi tiếp nhận */}
        <View style={styles.hospitalCard}>
          <View style={styles.hospitalIcon}>
            <Ionicons name="business" size={24} color={colors.blue} />
          </View>
          <View style={styles.hospitalInfo}>
            <Text style={styles.hospitalName}>{hospital?.name || 'Bệnh viện tiếp nhận'}</Text>
            <Text style={styles.hospitalSub}>
              {hospital?.department || 'Khoa cấp cứu'} · tiếp nhận {formatClock(hospitalArrivedAt)}
            </Text>
          </View>
        </View>

        {/* ===== Checklist bàn giao (1 chạm) ===== */}
        <Text style={styles.sectionLabel}>XÁC NHẬN BÀN GIAO</Text>
        <View style={styles.checkList}>
          {HANDOVER_ITEMS.map((item, i) => (
            <Pressable
              key={item}
              style={({ pressed }) => [styles.checkRow, pressed && { opacity: 0.8 }]}
              onPress={() => toggle(i)}
              accessibilityLabel={`${checked[i] ? 'Bỏ chọn' : 'Chọn'} ${item}`}
            >
              <View style={[styles.checkBox, checked[i] && styles.checkBoxOn]}>
                {checked[i] && <Ionicons name="checkmark" size={18} color={colors.textOnPrimary} />}
              </View>
              <Text style={[styles.checkText, checked[i] && styles.checkTextOn]}>{item}</Text>
            </Pressable>
          ))}
        </View>

        {/* Note chính sách tái điều động khi RETURNING (dẫn tới D-07) */}
        <View style={styles.noteBox}>
          <Ionicons name="information-circle" size={20} color={colors.info} />
          <Text style={styles.noteText}>
            Trạng thái xe chuyển sang RETURNING — có thể được tái điều động khi đang về trạm.
          </Text>
        </View>
      </ScrollView>

      {/* ===== CTA: hoàn tất bàn giao (khoá tới khi tick đủ) ===== */}
      <View style={styles.footer}>
        <AppButton
          variant="dark"
          size="lg"
          // NBSP (\u00A0) dán chặt "→" với "VỀ TRẠM": Roboto Android in hoa rộng hơn SF iOS
          // nên có máy phải wrap - khi đó mũi tên dẫn đầu dòng dưới (đẹp) thay vì vắt
          // cuối dòng trên (bug đã thấy trên máy Android thật).
          title={'HOÀN TẤT BÀN GIAO →\u00A0VỀ\u00A0TRẠM'}
          onPress={finish}
          disabled={!allChecked}
        />
        {!allChecked && <Text style={styles.lockHint}>Xác nhận đủ 3 mục để tiếp tục</Text>}
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
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.purpleBg,
    borderRadius: radius.full,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs + 2,
    marginBottom: spacing.m,
  },
  badgeText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.purple, letterSpacing: 0.3 },
  title: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.text },
  sub: { fontSize: fontSize.s, color: colors.textSecondary, marginTop: 2, marginBottom: spacing.l },

  // Card BV
  hospitalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.l,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.l,
  },
  hospitalIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.m,
    backgroundColor: colors.blueBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
  },
  hospitalInfo: { flex: 1 },
  hospitalName: { fontSize: fontSize.m, fontWeight: fontWeight.bold, color: colors.text },
  hospitalSub: { fontSize: fontSize.s, color: colors.textSecondary, marginTop: 2 },

  // Checklist
  sectionLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginTop: spacing.l,
    marginBottom: spacing.s,
  },
  checkList: {
    backgroundColor: colors.surface,
    borderRadius: radius.l,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.l,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    minHeight: 56,
  },
  checkBox: {
    width: 26,
    height: 26,
    borderRadius: radius.s,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: spacing.m,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  checkBoxOn: { backgroundColor: colors.success, borderColor: colors.success },
  checkText: { flex: 1, fontSize: fontSize.m, color: colors.textSecondary },
  checkTextOn: { color: colors.text, fontWeight: fontWeight.medium },

  // Note
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.infoBg,
    borderRadius: radius.m,
    padding: spacing.l,
    marginTop: spacing.l,
  },
  noteText: { flex: 1, fontSize: fontSize.s, color: colors.textSecondary, marginLeft: spacing.s, lineHeight: 19 },

  // CTA
  footer: { padding: spacing.l, backgroundColor: colors.background },
  lockHint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.s,
  },
});
