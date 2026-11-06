/**
 * Nút dùng chung - khớp hệ thống thiết kế SmartEMS.
 * variant: 'primary' (đỏ đầy) | 'secondary' (nền xám nhạt) | 'outline' (viền đỏ) | 'link' (chữ xanh)
 *        | 'success' (xanh lá - driver nhận ca, D-02/D-04) | 'dark' (navy - driver kết chuyến, D-05/D-06)
 * size: 'md' | 'lg' (CTA lớn full-width).
 * Tích hợp loading (spinner) + disabled, touch target tối thiểu ~48px.
 */
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { colors, fontSize, fontWeight, radius, spacing } from '../theme';

export default function AppButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon = null,
  style,
  textStyle,
}) {
  const isDisabled = disabled || loading;
  // Variant nền đậm -> spinner trắng; nền nhạt/transparent -> spinner đỏ.
  const DARK_BG_VARIANTS = ['primary', 'outline', 'success', 'dark'];

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        size === 'lg' ? styles.lg : styles.md,
        pressed && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={DARK_BG_VARIANTS.includes(variant) ? colors.textOnPrimary : colors.primary} />
      ) : (
        <>
          {icon}
          <Text style={[styles[`${variant}Text`], size === 'lg' && styles.lgText, textStyle]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.s,
    borderRadius: radius.m,
  },
  md: { paddingVertical: spacing.m, paddingHorizontal: spacing.l, minHeight: 48 },
  lg: { paddingVertical: spacing.l + 2, paddingHorizontal: spacing.xl, minHeight: 54 },

  primary: { backgroundColor: colors.primary },
  primaryText: { color: colors.textOnPrimary, fontSize: fontSize.m, fontWeight: fontWeight.semibold },

  secondary: { backgroundColor: colors.bgSubtle },
  secondaryText: { color: colors.text, fontSize: fontSize.m, fontWeight: fontWeight.medium },

  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary },
  outlineText: { color: colors.primary, fontSize: fontSize.m, fontWeight: fontWeight.semibold },

  success: { backgroundColor: colors.success },
  successText: { color: colors.textOnPrimary, fontSize: fontSize.m, fontWeight: fontWeight.semibold },

  dark: { backgroundColor: colors.dark },
  darkText: { color: colors.textOnPrimary, fontSize: fontSize.m, fontWeight: fontWeight.semibold },

  link: { backgroundColor: 'transparent', paddingVertical: spacing.xs, paddingHorizontal: 0, minHeight: 32 },
  linkText: { color: colors.blue, fontSize: fontSize.s, fontWeight: fontWeight.semibold },

  pressed: { opacity: 0.85, transform: [{ scale: 0.985 }] },
  disabled: { opacity: 0.5 },
});
