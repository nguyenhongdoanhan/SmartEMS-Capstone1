/**
 * Màn chờ của vai trò Tài xế (Driver) - role gate render khi currentRole === 'driver'.
 * Giai đoạn 2+: thay bằng DriverStack đầy đủ (Nhận ca · FSM chuyển · Điều hướng).
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useAuthStore } from '../../../store/auth';
import { AppButton, EmptyState } from '../../../components';
import { colors } from '../../../theme';

export default function DriverComingSoonScreen() {
  const setRole = useAuthStore((s) => s.setRole);

  return (
    <View style={styles.screen}>
      <EmptyState
        icon="medkit-outline"
        title="Tính năng tài xế đang phát triển"
        message="Vai trò Tài xế cứu thương (nhận ca, FSM chuyển trạng thái, điều hướng) sẽ được hoàn thiện ở giai đoạn tiếp theo của dự án."
        actionTitle="Về vai trò Người cần cứu trợ"
        onAction={() => setRole('caller')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
});
