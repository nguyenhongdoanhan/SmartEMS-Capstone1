/**
 * C-08 · Lịch sử yêu cầu (placeholder Giai đoạn 1).
 * Giai đoạn 4: filter chips (Tất cả / Đang xử lý / Hoàn tất) + danh sách chuyến từ emergency store
 * (mock: AsyncStorage; real: GET /emergencies/mine khi backend bổ sung).
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { EmptyState } from '../../../components';
import { colors } from '../../../theme';

export default function HistoryScreen() {
  return (
    <View style={styles.screen}>
      <EmptyState
        icon="time-outline"
        title="Chưa có yêu cầu nào"
        message="Lịch sử các yêu cầu cấp cứu của bạn sẽ hiển thị ở đây sau khi bạn gửi SOS."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
});
