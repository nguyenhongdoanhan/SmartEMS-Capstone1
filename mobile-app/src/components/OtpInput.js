/**
 * Ô nhập mã OTP 6 chữ số - dùng cho màn Đăng ký bước 2 (RegisterOtp).
 * Focus tự chuyển: gõ xong ô i -> sang ô i+1; backspace ô trống cuối ->
 * xóa ký tự trước đó + lùi focus; bấm vào ô trống xa hơn ô chờ nhập ->
 * nhảy focus về ô chờ nhập. Parent giữ state `value` (chuỗi số).
 *
 * LƯU Ý: KHÔNG khoá ô chưa tới lượt bằng `editable` — trên Android
 * focus() vào TextInput đang editable=false là no-op, mà focus() lại được
 * gọi trước khi React re-render mở khoá ô kế tiếp -> không tự nhảy ô.
 * Mọi ô luôn editable, thứ tự nhập do focus-snap đảm bảo.
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
            autoFocus={autoFocus && i === 0}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
            onChangeText={(t) => handleChange(t, i)}
            onKeyPress={(e) => handleKey(e, i)}
            onFocus={() => {
              // Bấm vào ô trống xa hơn ô chờ nhập -> nhảy về ô chờ nhập
              if (i > value.length) focusAt(value.length);
            }}
            accessibilityLabel={`Ô mã thứ ${i + 1}`}
            style={[styles.box, !!char && styles.boxFilled, !char && isNext && styles.boxNext]}
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
