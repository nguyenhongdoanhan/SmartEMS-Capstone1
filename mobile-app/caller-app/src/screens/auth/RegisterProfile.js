/**
 * Đăng ký bước 3/3 - hoàn tất hồ sơ: Họ tên + Mật khẩu (flow user chốt).
 * Bấm "HOÀN TẤT" -> store.register() sinh email ẩn từ SĐT, tạo tài khoản rồi
 * tự đăng nhập -> AppNavigator thấy token + chưa chọn vai trò -> hiện M-05.
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

import { AppButton } from '../../components';
import { useAuthStore } from '../../store/auth';
import { colors, fontSize, fontWeight, radius, spacing } from '../../theme';

export default function RegisterProfileScreen({ route }) {
  const { phone } = route.params;
  const { register, loading, error, clearError } = useAuthStore();
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [hide, setHide] = useState(true);
  const [touched, setTouched] = useState({}); // chỉ báo lỗi sau khi người dùng chạm field

  const nameOk = fullName.trim().length >= 2;
  const passOk = password.length >= 6;
  const confirmOk = confirm.length > 0 && confirm === password;

  const submit = async () => {
    clearError();
    setTouched({ name: true, pass: true, confirm: true });
    if (!nameOk || !passOk || !confirmOk) return;
    try {
      // Thành công: token vào store, currentRole vẫn null -> tự chuyển sang M-05
      await register({ phone, fullName: fullName.trim(), password });
    } catch (err) {
      // store đã lưu error - hiển thị ở errorBox
    }
  };

  const fieldError = (key, ok, message) =>
    touched[key] && !ok ? <Text style={styles.hint}>{message}</Text> : null;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Hoàn tất hồ sơ</Text>
          <Text style={styles.subtitle}>
            Cho chúng tôi biết tên của bạn và đặt mật khẩu để đăng nhập lần sau.
          </Text>

          <Text style={styles.label}>HỌ VÀ TÊN</Text>
          <TextInput
            style={styles.input}
            placeholder="Nguyễn Văn A"
            placeholderTextColor={colors.textMuted}
            value={fullName}
            onChangeText={setFullName}
            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
            autoCapitalize="words"
            autoComplete="name"
            textContentType="name"
          />
          {fieldError('name', nameOk, 'Vui lòng nhập họ tên (tối thiểu 2 ký tự).')}

          <Text style={styles.label}>MẬT KHẨU</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.inputFlex}
              placeholder="Ít nhất 6 ký tự"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              onBlur={() => setTouched((t) => ({ ...t, pass: true }))}
              secureTextEntry={hide}
              textContentType="newPassword"
              autoComplete="password-new"
            />
            <Pressable
              onPress={() => setHide(!hide)}
              hitSlop={8}
              style={styles.eyeBtn}
              accessibilityLabel={hide ? 'Hiện mật khẩu' : 'Ẩn mật khẩu'}
            >
              <Ionicons name={hide ? 'eye-outline' : 'eye-off-outline'} size={22} color={colors.textSecondary} />
            </Pressable>
          </View>
          {fieldError('pass', passOk, 'Mật khẩu tối thiểu 6 ký tự.')}

          <Text style={styles.label}>NHẬP LẠI MẬT KHẨU</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập lại mật khẩu"
            placeholderTextColor={colors.textMuted}
            value={confirm}
            onChangeText={setConfirm}
            onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
            secureTextEntry={hide}
            textContentType="newPassword"
          />
          {fieldError('confirm', confirmOk, 'Mật khẩu nhập lại chưa khớp.')}

          {!!error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.submitWrap}>
            <AppButton title="HOÀN TẤT" size="lg" onPress={submit} loading={loading} />
          </View>
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
  title: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.text },
  subtitle: { fontSize: fontSize.s, color: colors.textSecondary, marginTop: spacing.xs, lineHeight: 20 },
  label: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    marginTop: spacing.l,
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
  hint: { color: colors.error, fontSize: fontSize.xs, marginTop: spacing.xs },
  errorBox: {
    backgroundColor: colors.errorBg,
    borderRadius: radius.m,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    marginTop: spacing.l,
  },
  errorText: { color: colors.error, fontSize: fontSize.s },
  submitWrap: { marginTop: spacing.xxl },
});
