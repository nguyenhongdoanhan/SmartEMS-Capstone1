/**
 * M-05 Chọn vai trò - hiện sau đăng nhập/đăng ký khi chưa có vai trò (thay vì
 * default 'caller' như Giai đoạn 1). Người dùng chủ động chọn, persist AsyncStorage,
 * chọn xong AppNavigator tự chuyển sang CallerTabs / DriverComingSoon.
 * Nội dung 2 card bám đúng mockup M-05 (Q7: giữ nguyên văn).
 */
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '../../store/auth';
import { colors, fontSize, fontWeight, radius, spacing } from '../../theme';

/** Chip SOS mini - icon đại diện vai trò "Tôi cần cứu trợ" (mockup: icon SOS). */
function SosChip() {
  return (
    <View style={styles.sosChip}>
      <Text style={styles.sosChipText}>SOS</Text>
    </View>
  );
}

function RoleCard({ title, desc, icon, onPress, disabled }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={`Chọn vai trò ${title}`}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed, disabled && styles.cardDisabled]}
    >
      <View style={styles.cardIcon}>{icon ? <Ionicons name={icon} size={36} color={colors.primary} /> : <SosChip />}</View>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDesc}>{desc}</Text>
    </Pressable>
  );
}

export default function RoleChoiceScreen() {
  const setRole = useAuthStore((s) => s.setRole);
  const [busy, setBusy] = useState(false); // chặn double-tap khi đang chuyển vai trò

  const choose = async (role) => {
    if (busy) return;
    setBusy(true);
    await setRole(role);
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <View style={styles.logoWrap}>
          <View style={styles.logoBox}>
            <Text style={styles.logoPlus}>+</Text>
          </View>
        </View>

        <Text style={styles.title}>Bạn dùng SmartEMS với vai trò?</Text>

        <View style={styles.cards}>
          <RoleCard
            title="Tôi cần cứu trợ"
            desc="Gửi SOS · theo dõi xe"
            onPress={() => choose('caller')}
            disabled={busy}
          />
          <RoleCard
            title="Tài xế cứu thương"
            desc="Nhận ca · FSM chuyển"
            icon="car-outline"
            onPress={() => choose('driver')}
            disabled={busy}
          />
        </View>

        <Text style={styles.note}>
          Có thể chuyển đổi vai trò bất kỳ lúc nào trong Hồ sơ.{'\n'}Điều phối viên dùng Web Dashboard riêng.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
    paddingBottom: spacing.xl,
  },
  logoWrap: { alignItems: 'center', marginBottom: spacing.xl },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoPlus: { color: colors.textOnPrimary, fontSize: 42, fontWeight: fontWeight.bold, marginTop: -4 },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  cards: {
    flexDirection: 'row',
    gap: spacing.m,
  },
  card: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.m,
  },
  cardPressed: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
    transform: [{ scale: 0.98 }],
  },
  cardDisabled: { opacity: 0.6 },
  cardIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.m,
  },
  cardTitle: { fontSize: fontSize.m, fontWeight: fontWeight.bold, color: colors.text, textAlign: 'center' },
  cardDesc: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: spacing.xs, textAlign: 'center' },
  sosChip: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosChipText: { color: colors.textOnPrimary, fontSize: fontSize.xs, fontWeight: fontWeight.bold, letterSpacing: 0.5 },
  note: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
    lineHeight: 18,
  },
});
