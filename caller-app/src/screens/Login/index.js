/**
 * Màn Đăng nhập / Đăng ký.
 * Skeleton chức năng hoàn chỉnh: validation, loading, error state, lưu phiên.
 * (Giao diện sẽ được tinh chỉnh theo file thiết kế của team.)
 */
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ENV } from '../../config/env';
import { useAuthStore } from '../../store/auth';
import { colors, fontSize, fontWeight, radius, spacing } from '../../theme';

export default function LoginScreen() {
  const { login, register, loading, error, clearError } = useAuthStore();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  const isLogin = mode === 'login';

  const submit = async () => {
    if (loading) return;
    try {
      if (isLogin) {
        await login(email.trim(), password);
      } else {
        await register({ email: email.trim(), password, full_name: fullName.trim(), phone: phone.trim() || null });
      }
    } catch (err) {
      // store đã lưu error, chỉ cần bắt để không rơi unhandled rejection
    }
  };

  const switchMode = () => {
    clearError();
    setMode(isLogin ? 'register' : 'login');
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.logoWrap}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>+</Text>
          </View>
          <Text style={styles.brand}>SmartEMS</Text>
          <Text style={styles.brandSub}>Gọi xe cấp cứu - cứu người trong phút nguy nan</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>{isLogin ? 'Đăng nhập' : 'Tạo tài khoản'}</Text>

          {!isLogin && (
            <TextInput
              style={styles.input}
              placeholder="Họ và tên"
              placeholderTextColor={colors.textDisabled}
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
          )}
          {!isLogin && (
            <TextInput
              style={styles.input}
              placeholder="Số điện thoại (không bắt buộc)"
              placeholderTextColor={colors.textDisabled}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          )}
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.textDisabled}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
          />
          <TextInput
            style={styles.input}
            placeholder="Mật khẩu"
            placeholderTextColor={colors.textDisabled}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="password"
          />

          {!!error && <Text style={styles.errorText}>{error}</Text>}

          <Pressable
            style={({ pressed }) => [styles.submitBtn, (pressed || loading) && styles.submitBtnPressed]}
            onPress={submit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.textOnPrimary} />
            ) : (
              <Text style={styles.submitText}>{isLogin ? 'Đăng nhập' : 'Đăng ký'}</Text>
            )}
          </Pressable>

          <Pressable onPress={switchMode} hitSlop={8}>
            <Text style={styles.switchText}>
              {isLogin ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập'}
            </Text>
          </Pressable>
        </View>

        {ENV.MOCK_MODE && (
          <Text style={styles.mockHint}>
            Chế độ demo: đăng nhập bằng email & mật khẩu bất kỳ
          </Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.primary },
  container: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl },
  logoWrap: { alignItems: 'center', marginBottom: spacing.xl },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.m,
  },
  logoText: { color: colors.textOnPrimary, fontSize: fontSize.xxl, fontWeight: fontWeight.bold },
  brand: { color: colors.textOnPrimary, fontSize: fontSize.xxl, fontWeight: fontWeight.bold },
  brandSub: { color: 'rgba(255,255,255,0.85)', fontSize: fontSize.s, marginTop: spacing.xs, textAlign: 'center' },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.l,
    padding: spacing.xl,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  formTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.l },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.m,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    fontSize: fontSize.m,
    color: colors.text,
    marginBottom: spacing.m,
    backgroundColor: colors.background,
  },
  errorText: { color: colors.error, fontSize: fontSize.s, marginBottom: spacing.m },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.m,
    paddingVertical: spacing.m + 2,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  submitBtnPressed: { backgroundColor: colors.primaryDark },
  submitText: { color: colors.textOnPrimary, fontSize: fontSize.l, fontWeight: fontWeight.semibold },
  switchText: { color: colors.info, fontSize: fontSize.s, textAlign: 'center', marginTop: spacing.l },
  mockHint: { color: 'rgba(255,255,255,0.75)', fontSize: fontSize.xs, textAlign: 'center', marginTop: spacing.l },
});
