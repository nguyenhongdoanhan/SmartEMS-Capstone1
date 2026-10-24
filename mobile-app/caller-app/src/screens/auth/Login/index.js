/**
 * M-03 Đăng nhập - SĐT + mật khẩu (đúng mockup PDF).
 * SĐT được map sang email nội bộ `{sdt}@caller.smartems.app` ở tầng STORE
 * để khớp backend OAuth2 (bắt email) - user không bao giờ thấy khái niệm email.
 * Chưa có tài khoản -> "đăng ký nhanh bằng SĐT" (flow 3 bước OTP).
 */
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '../../../components';
import { ENV } from '../../../config/env';
import { useAuthStore } from '../../../store/auth';
import { colors, fontSize, fontWeight, radius, spacing } from '../../../theme';

const isPhoneValid = (p) => /^0\d{9}$/.test(p);

export default function LoginScreen({ navigation }) {
  const { login, loading, error, clearError } = useAuthStore();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [hidePassword, setHidePassword] = useState(true);

  const canSubmit = isPhoneValid(phone) && password.length >= 6;

  const submit = async () => {
    if (!canSubmit || loading) return;
    try {
      await login(phone, password); // store tự map SĐT -> email nội bộ
    } catch (err) {
      // store đã lưu error - chỉ bắt để không rơi unhandled rejection
    }
  };

  const goRegister = () => {
    clearError();
    navigation.navigate('RegisterPhone');
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.logoWrap}>
            <View style={styles.logoBox}>
              <Text style={styles.logoPlus}>+</Text>
            </View>
            <Text style={styles.brand}>
              Smart<Text style={styles.brandEms}>EMS</Text>
            </Text>
          </View>

          <Text style={styles.title}>Đăng nhập</Text>
          <Text style={styles.subtitle}>Dùng số điện thoại đã đăng ký</Text>

          <View style={styles.form}>
            <Text style={styles.label}>SỐ ĐIỆN THOẠI</Text>
            <TextInput
              style={styles.input}
              placeholder="0935 252 834"
              placeholderTextColor={colors.textMuted}
              value={phone}
              onChangeText={(t) => {
                if (error) clearError();
                setPhone(t.replace(/\D/g, ''));
              }}
              keyboardType="phone-pad"
              maxLength={10}
              textContentType="telephoneNumber"
              autoComplete="tel"
            />

            <Text style={styles.label}>MẬT KHẨU</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.inputFlex}
                placeholder="Ít nhất 6 ký tự"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={(t) => {
                  if (error) clearError();
                  setPassword(t);
                }}
                secureTextEntry={hidePassword}
                textContentType="password"
                autoComplete="password"
              />
              <Pressable
                onPress={() => setHidePassword(!hidePassword)}
                hitSlop={8}
                style={styles.eyeBtn}
                accessibilityLabel={hidePassword ? 'Hiện mật khẩu' : 'Ẩn mật khẩu'}
              >
                <Ionicons name={hidePassword ? 'eye-outline' : 'eye-off-outline'} size={22} color={colors.textSecondary} />
              </Pressable>
            </View>

            {!!error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <AppButton title="Đăng nhập" size="lg" onPress={submit} disabled={!canSubmit} loading={loading} />

            <View style={styles.registerRow}>
              <Text style={styles.registerPrefix}>hoặc </Text>
              <Pressable onPress={goRegister} hitSlop={8}>
                <Text style={styles.registerLink}>đăng ký nhanh bằng SĐT</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.rbacBox}>
            <Text style={styles.rbacText}>
              Hệ thống phân quyền: Caller · Driver · Dispatcher · Admin (Role-Based Access Control)
            </Text>
          </View>

          {ENV.MOCK_MODE && (
            <Text style={styles.mockHint}>Chế độ demo: đăng nhập bằng SĐT bất kỳ (vd 0935 252 834), mật khẩu từ 6 ký tự</Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.l,
  },
  logoWrap: { alignItems: 'center', marginBottom: spacing.xl },
  logoBox: {
    width: 56,
    height: 56,
    borderRadius: radius.l,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.s,
  },
  logoPlus: { color: colors.textOnPrimary, fontSize: 36, fontWeight: fontWeight.bold, marginTop: -4 },
  brand: { color: colors.text, fontSize: fontSize.xl, fontWeight: fontWeight.bold },
  brandEms: { color: colors.primary },
  title: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.text },
  subtitle: { fontSize: fontSize.s, color: colors.textSecondary, marginTop: spacing.xs },
  form: { marginTop: spacing.xl },
  label: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    marginTop: spacing.s,
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.m,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m + 2,
    fontSize: fontSize.m,
    color: colors.text,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  inputFlex: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.m,
    backgroundColor: colors.surface,
    paddingLeft: spacing.l,
    paddingRight: spacing.xl + spacing.m,
    paddingVertical: spacing.m + 2,
    fontSize: fontSize.m,
    color: colors.text,
  },
  eyeBtn: { position: 'absolute', right: spacing.m },
  errorBox: {
    backgroundColor: colors.errorBg,
    borderRadius: radius.m,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    marginBottom: spacing.m,
    marginTop: spacing.s,
  },
  errorText: { color: colors.error, fontSize: fontSize.s },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.l,
  },
  registerPrefix: { color: colors.textSecondary, fontSize: fontSize.s },
  registerLink: { color: colors.primary, fontSize: fontSize.s, fontWeight: fontWeight.bold },
  rbacBox: {
    backgroundColor: colors.bgSubtle,
    borderRadius: radius.l,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
    marginTop: spacing.xxl,
  },
  rbacText: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    textAlign: 'center',
    lineHeight: 18,
  },
  mockHint: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    textAlign: 'center',
    marginTop: spacing.m,
  },
});
