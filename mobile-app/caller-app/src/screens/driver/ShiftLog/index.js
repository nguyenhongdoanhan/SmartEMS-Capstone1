/**
 * D-08 Lịch sử ca trực (tab "Ca trực") - PLACEHOLDER Giai đoạn 1.
 * Khung tab được dựng sẵn để navigation ổn định từ GĐ1; nội dung thật
 * (thống kê ca/km/tái điều động + danh sách chuyến trong ngày, filter "Hôm nay")
 * hoàn thiện ở Giai đoạn 4 theo mockup D-08.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { EmptyState } from '../../../components';
import { colors } from '../../../theme';

export default function DriverShiftLogScreen() {
  return (
    <View style={styles.screen}>
      <EmptyState
        icon="time-outline"
        title="Lịch sử ca trực"
        message="Thống kê và danh sách chuyến trong ngày (màn D-08) sẽ hoàn thiện ở Giai đoạn 4."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
});
