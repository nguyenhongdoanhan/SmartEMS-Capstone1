/**
 * D-04 Tại hiện trường - PLACEHOLDER Giai đoạn 2 (đích của nút "ĐÃ ĐẾN HIỆN
 * TRƯỜNG" ở D-03, FSM đã sang ARRIVED_ON_SCENE).
 * GĐ3 sẽ thay bằng khung triage thật theo mockup: phân loại Critical/Urgent/
 * Delayed, dấu sinh tồn (SpO2/nhịp tim/huyết áp), ý thức AVPU, ghi chú + gửi
 * trước cho bệnh viện.
 */
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';

import { EmptyState } from '../../../components';
import { useDriverShiftStore } from '../../../store/driverShift';
import { colors } from '../../../theme';

export default function DriverOnSceneScreen({ navigation }) {
  const clearCase = useDriverShiftStore((s) => s.clearCase);

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <EmptyState
        icon="medkit-outline"
        title="Tại hiện trường"
        message="D-04 — Đánh giá nhanh bệnh nhân (triage, dấu sinh tồn, AVPU) sẽ hoàn thiện ở Giai đoạn 3."
        actionTitle="Về ca trực"
        onAction={() => {
          clearCase(); // kết thúc ca demo, 12s sau có ca mới để test tiếp
          navigation.popToTop();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
});
