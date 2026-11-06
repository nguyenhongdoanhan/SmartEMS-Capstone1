/**
 * Đăng ký bước 2/3 - nhập mã OTP 6 chữ số.
 * PHIÊN BẢN DEMO (user chốt 2026-10-23): không gửi SMS thật, nhập mã nào cũng pass
 * miễn đủ 6 chữ số; countdown "Gửi lại mã sau 30s" chỉ là UI.
 * OTP thật cần SMS gateway -> đã nằm trong Backend TODO list.
 */
import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton, OtpInput } from '../../components';
import { colors, fontSize, fontWeight, radius, spacing } from '../../theme';

const RESEND_SECONDS = 30;

export default function RegisterOtpScreen({ navigation, route }) {
  const { phone } = route.params;
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(RESEND_SECONDS);

  // Đếm ngược resend mỗi giây; hết 30s thì mở nút "Gửi lại mã"
  useEffect(() => {
    if (countdown <= 0) return undefined;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const resend = () => {
    setCode(''); // xóa mã cũ cho người dùng nhập lại
    setCountdown(RESEND_SECONDS);
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()} hitSlop={8} accessibilityLabel="Quay lại">
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>

        <Text style={styles.title}>Xác minh số điện thoại</Text>
        <Text style={styles.subtitle}>
          Nhập mã 6 chữ số đã được gửi tới số{'\n'}
          <Text style={styles.phone}>{phone}</Text>
        </Text>

        <View style={styles.otpWrap}>
          <OtpInput value={code} onChange={setCode} />
          <Text style={styles.demoNote}>Phiên bản demo — mã bất kỳ cũng được chấp nhận.</Text>
        </View>

        <View style={styles.resendWrap}>
          {countdown > 0 ? (
            <Text style={styles.resendWaiting}>Gửi lại mã sau {countdown}s</Text>
          ) : (
            <Pressable onPress={resend} hitSlop={8}>
              <Text style={styles.resendLink}>Gửi lại mã</Text>
            </Pressable>
          )}
        </View>

        <AppButton
          title="XÁC NHẬN"
          size="lg"
          disabled={code.length < 6}
          onPress={() => navigation.navigate('RegisterProfile', { phone })}
        />
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.l,
    paddingBottom: spacing.l,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.text },
  subtitle: { fontSize: fontSize.s, color: colors.textSecondary, marginTop: spacing.xs, lineHeight: 20 },
  phone: { color: colors.text, fontWeight: fontWeight.bold },
  otpWrap: { marginTop: spacing.xxl },
  demoNote: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    textAlign: 'center',
    marginTop: spacing.m,
  },
  resendWrap: { alignItems: 'center', marginTop: spacing.l, marginBottom: spacing.xxl },
  resendWaiting: { color: colors.textMuted, fontSize: fontSize.s },
  resendLink: { color: colors.primary, fontSize: fontSize.s, fontWeight: fontWeight.bold },
});
