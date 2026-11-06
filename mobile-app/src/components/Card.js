/**
 * Card bề mặt trắng viền bo - nền tảng cho các khối nội dung (quick-card, menu group...).
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../theme';

export default function Card({ children, style, padded = true }) {
  return (
    <View style={[styles.base, padded && styles.padded, style]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.m,
  },
  padded: { padding: spacing.l },
});
