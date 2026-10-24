/**
 * Ô nhập mã OTP 6 chữ số - dùng cho màn Đăng ký bước 2 (RegisterOtp).
 * Mỗi ô 1 ký tự, focus tự chuyển: gõ xong ô i -> sang ô i+1; backspace ở ô trống
 * cuối -> xóa ký tự trước đó và lùi focus. Parent giữ state `value` (chuỗi số).
 */
import React, { useRef } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { colors, fontSize, fontWeight, radius, spacing } from '../theme';

export default function OtpInput({ length = 6, value = '', onChange, autoFocus = true, style }) {
  const refs = useRef([]).current;

  const focusAt = (i) => {
    const idx = Math.max(0, Math.min(i, length - 1));
    if (refs[idx]) refs[idx].focus();
  };

  const handleChange = (text, i) => {
    const digits = (text || '').replace(/\D/g, '');
    if (!digits) {
      // Backspace khi ô i đang có chữ số -> xóa đúng chữ số đó, giữ focus
      if (i < value.length) {
        onChange(value.slice(0, i) + value.slice(i + 1));
      }
      return;
    }
    // Nhập số: thay thế tại ô i, hoặc nối thêm nếu đang ở ô kế tiếp
    const digit = digits[digits.length - 1];
    const next = i < value.length ? value.slice(0, i) + digit + value.slice(i + 1) : (value + digit).slice(0, length);
    onChange(next);
    if (next.length < length) focusAt(next.length);
  };

  const handleKey = ({ nativeEvent: { key } }, i) => {
    // Backspace ở ô trống cuối chuỗi -> xóa ký tự trước đó (một số bàn phím
    // không bắn onChangeText khi giá trị rỗng nên phải bắt ở onKeyPress)
    if (key === 'Backspace' && i === value.length && i > 0) {
      onChange(value.slice(0, -1));
      focusAt(i - 1);
    }
  };

  return (
    <View style={[styles.row, style]}>
      {Array.from({ length }).map((_, i) => {
        const char = value[i] || '';
        const isNext = i === value.length; // ô đang chờ nhập
        return (
          <TextInput
            key={i}
            ref={(r) => {
              refs[i] = r;
            }}
            value={char}
            editable={i <= value.length}
            autoFocus={autoFocus && i === 0}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
            onChangeText={(t) => handleChange(t, i)}
            onKeyPress={(e) => handleKey(e, i)}
            accessibilityLabel={`Ô mã thứ ${i + 1}`}
            style={[styles.box, !!char && styles.boxFilled, !char && isNext && styles.boxNext, style]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', gap: spacing.s },
  box: {
    width: 48,
    height: 56,
    borderRadius: radius.m,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    textAlign: 'center',
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  boxFilled: { borderColor: colors.primary },
  boxNext: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
});
