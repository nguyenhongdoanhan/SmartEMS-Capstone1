/**
 * Đánh giá 5 sao (C-05 "Đánh giá trải nghiệm cứu hộ", tái dùng C-09/GĐ4).
 * Sao vàng khi chọn, xám khi chưa; readonly để hiển thị điểm đã chấm.
 */
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors } from '../theme';

export default function StarRating({ value = 0, onChange, size = 36, readonly = false, style }) {
  return (
    <View style={[styles.row, style]} pointerEvents={readonly ? 'none' : 'auto'} accessibilityLabel={`Đánh giá ${value} trên 5 sao`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Pressable key={i} onPress={() => onChange?.(i)} hitSlop={6} disabled={readonly}>
          <Ionicons
            name={i <= Math.round(value) ? 'star' : 'star-outline'}
            size={size}
            color={i <= Math.round(value) ? colors.star : colors.textMuted}
          />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', gap: 4 },
});
