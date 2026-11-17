/**
 * Đăng ký bước 1/3 - nhập SĐT (flow user chốt 2026-10-23).
 * Nút "TIẾP TỤC" (đúng nguyên văn yêu cầu) -> màn OTP (RegisterOtp).
 */
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '../../components';
import { colors, fontSize, fontWeight, radius, spacing } from '../../theme';

const isPhoneValid = (p) => /^0\d{9}$/.test(p);

export default function RegisterPhoneScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const valid = isPhoneValid(phone);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()} hitSlop={8} accessibilityLabel="Quay lại">
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>

        <Text style={styles.title}>Đăng ký</Text>
        <Text style={styles.subtitle}>
          Nhập số điện thoại — chúng tôi sẽ gửi mã xác minh để kích hoạt tài khoản của bạn.
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>SỐ ĐIỆN THOẠI</Text>
          <TextInput
            style={styles.input}
            placeholder="0935 252 834"
            placeholderTextColor={colors.textMuted}
            value={phone}
            onChangeText={(t) => setPhone(t.replace(/\D/g, ''))}
            keyboardType="phone-pad"
            maxLength={10}
            autoFocus
            textContentType="telephoneNumber"
            autoComplete="tel"
          />
          {!!phone && !valid && (
            <Text style={styles.hint}>Số điện thoại gồm 10 chữ số, bắt đầu bằng 0.</Text>
          )}
        </View>

        <AppButton
          title="TIẾP TỤC"
          size="lg"
          disabled={!valid}
          onPress={() => navigation.navigate('RegisterOtp', { phone })}
        />

        <Text style={styles.terms}>Bằng việc tiếp tục, bạn đồng ý với Điều khoản sử dụng của SmartEMS.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
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
  form: { marginTop: spacing.xl, marginBottom: spacing.xl },
  label: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
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
  hint: { color: colors.error, fontSize: fontSize.xs, marginTop: spacing.xs },
  terms: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    textAlign: 'center',
    marginTop: spacing.l,
    lineHeight: 18,
  },
});
