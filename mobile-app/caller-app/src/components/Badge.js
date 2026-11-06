/**
 * Badge pastel dùng chung - khớp thiết kế C-08/C-09.
 * variant: 'success' (HOÀN TẤT) | 'transport' (ĐANG VẬN CHUYỂN) | 'danger' (KHẨN CẤP) | 'warning' | 'neutral'.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, fontWeight } from '../theme';

export default function Badge({ label, variant = 'neutral', style, textStyle }) {
  const palette = colors.badge[variant] || colors.badge.neutral;

  return (
    <View style={[styles.base, { backgroundColor: palette.bg }, style]}>
      <Text style={[styles.text, { color: palette.text }, textStyle]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  text: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.3,
  },
});
