/**
 * Tab "Bản đồ" - PLACEHOLDER Giai đoạn 1 (mockup driver không có trang riêng
 * cho tab này - FE tự thiết kế theo design/driver-design-analysis.md).
 * GĐ4: map tổng quan - vị trí tài xế (GPS thật từ store driverShift),
 * trạm S1 và tuyến của ca đang chạy (nếu có), tái dùng style map D-03/D-05.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { EmptyState } from '../../../components';
import { colors } from '../../../theme';

export default function DriverMapOverviewScreen() {
  return (
    <View style={styles.screen}>
      <EmptyState
        icon="map-outline"
        title="Bản đồ"
        message="Tổng quan bản đồ — vị trí tài xế, trạm S1 và tuyến ca đang chạy — sẽ hoàn thiện ở Giai đoạn 4."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
});
