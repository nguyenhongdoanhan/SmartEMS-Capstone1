/**
 * D-09 Hồ sơ tài xế (tab "Hồ sơ") - PLACEHOLDER Giai đoạn 1.
 * GĐ4: card tài xế + chuyên môn (hạng bằng, chứng chỉ, kinh nghiệm),
 * menu (đăng ký ca trực tuần sau, liên hệ khẩn cấp) và nút "Kết thúc ca trực".
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { EmptyState } from '../../../components';
import { colors } from '../../../theme';

export default function DriverProfileScreen() {
  return (
    <View style={styles.screen}>
      <EmptyState
        icon="person-outline"
        title="Hồ sơ tài xế"
        message="Hạng bằng, chứng chỉ, đánh giá và kết thúc ca trực (màn D-09) sẽ hoàn thiện ở Giai đoạn 4."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
});
