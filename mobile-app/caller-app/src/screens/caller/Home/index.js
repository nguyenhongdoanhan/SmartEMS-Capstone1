/**
 * C-01 Home / Nút SOS - đúng mockup tài liệu thiết kế:
 * - Card user: avatar chữ nền hồng + "Xin chào, {tên}" + địa chỉ hiện tại + icon chuông
 * - Nút SOS tròn đỏ GIỮ 2 GIÂY (progress ring) -> sang C-02 xác nhận
 * - 2 quick card: Sơ cứu khẩn cấp (offline) / Bệnh viện gần nhất
 * - Có chuyến đang chạy -> card trạng thái nhảy thẳng C-03/C-04
 * Bottom nav 4 tab nằm ở CallerTabs (không đụng ở đây).
 */
import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { SosHoldButton } from '../../../components';
import { hospitalsApi } from '../../../services';
import { formatCoords, reverseGeocodeAddress } from '../../../services/location';
import { useAuthStore } from '../../../store/auth';
import { useEmergencyStore } from '../../../store/emergency';
import { isFinalStatus, isMatchingStatus, statusLabel } from '../../../constants/trip';
import { colors, fontSize, fontWeight, radius, spacing } from '../../../theme';
import { ENV } from '../../../config/env';

const firstName = (fullName) => (fullName || 'bạn').trim().split(/\s+/).pop();

export default function HomeScreen({ navigation }) {
  const { user } = useAuthStore();
  const { emergency } = useEmergencyStore();
  const [address, setAddress] = useState(null); // null = đang xác định

  const active = emergency && !isFinalStatus(emergency.status);
  const matching = active && isMatchingStatus(emergency.status);

  // Địa chỉ cho card chào: chỉ đọc khi ĐÃ cấp quyền (không hỏi popup ngay trên Home),
  // vì màn C-02 mới thật sự cần GPS và sẽ hỏi quyền ở đó.
  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (!dead) setAddress('Cấp quyền vị trí để hiện địa chỉ');
          return;
        }
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const text = (await reverseGeocodeAddress(pos.coords)) || formatCoords(pos.coords);
        if (!dead) setAddress(text);
      } catch (err) {
        if (!dead) setAddress('Không xác định được vị trí');
      }
    })();
    return () => {
      dead = true;
    };
  }, []);

  const openSos = () => navigation.navigate('SOS');

  const openActive = () => navigation.navigate(matching ? 'Matching' : 'Tracking');

  const openHospitals = async () => {
    try {
      const list = await hospitalsApi.nearby();
      Alert.alert(
        'Bệnh viện gần nhất',
        list.map((h, i) => `${i + 1}. ${h.name}\n    ${h.address} · ${h.distance_km} km · ${h.phone}`).join('\n\n'),
        [{ text: 'Đóng', style: 'cancel' }],
      );
    } catch (err) {
      Alert.alert('Bệnh viện gần nhất', 'Chưa tải được danh sách bệnh viện (backend /hospitals còn stub).');
    }
  };

  const openBell = () => {
    Alert.alert('Thông báo', 'Bạn chưa có thông báo mới.\nCảnh báo xe đến gần sẽ hiện ở đây (bản kế tiếp).');
  };

  const initials = (user?.full_name || 'S').trim().charAt(0).toUpperCase();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      {/* Card user - mockup C-01 */}
      <View style={styles.userCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.greeting}>Xin chào, {firstName(user?.full_name)}</Text>
          <Text style={styles.address} numberOfLines={2}>
            📍 {address || 'Đang xác định vị trí...'}
          </Text>
        </View>
        <Pressable onPress={openBell} hitSlop={8} accessibilityLabel="Thông báo">
          <View style={styles.bell}>
            <Ionicons name="notifications-outline" size={20} color={colors.textSecondary} />
          </View>
        </Pressable>
      </View>

      {/* Có chuyến đang chạy -> thẻ trạng thái nhảy vào C-03/C-04 */}
      {active && (
        <Pressable style={({ pressed }) => [styles.activeCard, pressed && { opacity: 0.9 }]} onPress={openActive}>
          <View style={styles.activeDot} />
          <View style={styles.activeInfo}>
            <Text style={styles.activeTitle}>
              {matching ? 'Đang tìm xe phù hợp...' : statusLabel(emergency.status)}
            </Text>
            <Text style={styles.activeSub}>Chạm để theo dõi chuyến cấp cứu</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </Pressable>
      )}

      {/* Nút SOS giữ 2 giây - trung tâm màn hình */}
      <View style={styles.sosWrap}>
        <SosHoldButton onComplete={openSos} />
        <Text style={styles.sosNote}>Vị trí GPS sẽ được gửi tự động</Text>
      </View>

      {/* 2 quick card - mockup C-01 */}
      <View style={styles.quickRow}>
        <Pressable style={({ pressed }) => [styles.quickCard, pressed && { opacity: 0.85 }]} onPress={() => navigation.navigate('FirstAid')}>
          <View style={[styles.quickIcon, styles.quickIconRed]}>
            <Ionicons name="medkit-outline" size={22} color={colors.primary} />
          </View>
          <Text style={styles.quickTitle}>Sơ cứu khẩn cấp</Text>
          <Text style={styles.quickSub}>Offline sẵn</Text>
        </Pressable>
        <Pressable style={({ pressed }) => [styles.quickCard, pressed && { opacity: 0.85 }]} onPress={openHospitals}>
          <View style={[styles.quickIcon, styles.quickIconBlue]}>
            <Ionicons name="business-outline" size={22} color={colors.blue} />
          </View>
          <Text style={styles.quickTitle}>Bệnh viện gần nhất</Text>
          <Text style={styles.quickSub}>3 cơ sở · 2 km</Text>
        </Pressable>
      </View>

      {ENV.MOCK_MODE && <Text style={styles.mockBadge}>Chế độ demo (mock data)</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.xl, paddingBottom: spacing.xxl },

  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.l,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.l,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
  },
  avatarText: { color: colors.primary, fontSize: fontSize.l, fontWeight: fontWeight.bold },
  userInfo: { flex: 1, marginRight: spacing.s },
  greeting: { fontSize: fontSize.m, fontWeight: fontWeight.bold, color: colors.text },
  address: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  bell: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    backgroundColor: colors.bgSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },

  activeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningBg,
    borderWidth: 1,
    borderColor: '#FDE4C7',
    borderRadius: radius.m,
    padding: spacing.l,
    marginTop: spacing.l,
  },
  activeDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.warning, marginRight: spacing.m },
  activeInfo: { flex: 1 },
  activeTitle: { fontSize: fontSize.m, fontWeight: fontWeight.semibold, color: colors.text },
  activeSub: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },

  sosWrap: { alignItems: 'center', marginTop: spacing.xxl },
  sosNote: { color: colors.textSecondary, fontSize: fontSize.s, marginTop: spacing.l },

  quickRow: { flexDirection: 'row', gap: spacing.m, marginTop: spacing.xxl },
  quickCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.l,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.l,
    alignItems: 'flex-start',
  },
  quickIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.m,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.m,
  },
  quickIconRed: { backgroundColor: colors.primaryLight },
  quickIconBlue: { backgroundColor: colors.blueBg },
  quickTitle: { fontSize: fontSize.s, fontWeight: fontWeight.semibold, color: colors.text },
  quickSub: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },

  mockBadge: {
    color: colors.textDisabled,
    fontSize: fontSize.xs,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
