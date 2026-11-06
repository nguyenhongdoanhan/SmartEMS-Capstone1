/**
 * M-02 Onboarding - 3 slide, chỉ hiện LẦN ĐẦU mở app (flag AsyncStorage, logout không reset).
 * Slide 1 bám mockup PDF: "Gửi SOS bằng một chạm" + nút SOS minh họa.
 * Slide 2-3 FE tự thiết kế theo format slide 1 (Q4 đã chốt): tracking realtime (C-04)
 * và sơ cứu offline (C-06). Vuốt ngang để đổi slide, nút Bỏ qua/Tiếp theo ở dưới.
 */
import React, { useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { FlatList, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '../../components';
import { useAuthStore } from '../../store/auth';
import { colors, fontSize, fontWeight, radius, spacing } from '../../theme';

/** Nút SOS minh họa (slide 1) - tái tạo hình nút "nhấn giữ 2 giây" từ mockup. */
function SosIllustration() {
  return (
    <View style={il.wrap}>
      <View style={il.ring}>
        <View style={il.button}>
          <Text style={il.sos}>SOS</Text>
          <Text style={il.hold}>NHẤN GIỜ 2 GIÂY</Text>
        </View>
      </View>
    </View>
  );
}

/** Minh họa icon tròn pastel (slide 2-3) - cùng format qui tắc màu slide 1. */
function IconIllustration({ name, color, bg }) {
  return (
    <View style={[il.circle, { backgroundColor: bg }]}>
      <Ionicons name={name} size={76} color={color} />
    </View>
  );
}

const SLIDES = [
  {
    id: 'sos',
    title: 'Gửi SOS bằng một chạm',
    desc: 'Vị trí GPS được gửi tự động — không cần mô tả địa chỉ qua điện thoại như truyền thống.',
    illustration: <SosIllustration />,
  },
  {
    id: 'tracking',
    title: 'Theo dõi xe theo thời gian thực',
    desc: 'Xem vị trí xe cứu thương, tài xế và thời gian dự kiến (ETA) ngay trên bản đồ — cập nhật liên tục từng giây.',
    illustration: <IconIllustration name="map-outline" color={colors.blue} bg={colors.infoBg} />,
  },
  {
    id: 'firstaid',
    title: 'Sơ cứu offline mọi lúc',
    desc: '8 chủ đề hướng dẫn sơ cứu khẩn cấp đọc offline — kịp thời xử lý trước khi xe tới nơi.',
    illustration: <IconIllustration name="medkit-outline" color={colors.primary} bg={colors.primaryLight} />,
  },
];

export default function OnboardingScreen() {
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding);
  const listRef = useRef(null);
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const isLast = index === SLIDES.length - 1;

  const goNext = () => {
    if (isLast) return;
    listRef.current?.scrollToOffset({ offset: (index + 1) * width, animated: true });
  };

  const finish = () => completeOnboarding();

  const onScrollEnd = (e) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
      <StatusBar style="dark" />
      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(s) => s.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={styles.illustration}>{item.illustration}</View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.desc}>{item.desc}</Text>
          </View>
        )}
      />
      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((s, i) => (
            <View key={s.id} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
        <View style={styles.actions}>
          <AppButton title="Bỏ qua" variant="secondary" size="lg" style={styles.actionBtn} onPress={finish} />
          <AppButton
            title={isLast ? 'Bắt đầu' : 'Tiếp theo'}
            variant="primary"
            size="lg"
            style={styles.actionBtn}
            onPress={isLast ? finish : goNext}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  slide: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  illustration: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.m,
  },
  desc: {
    fontSize: fontSize.m,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.l,
    paddingTop: spacing.l,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.s,
    marginBottom: spacing.l,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.m,
  },
  actionBtn: { flex: 1 },
});

const il = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  ring: {
    width: 196,
    height: 196,
    borderRadius: 98,
    borderWidth: 10,
    borderColor: 'rgba(220, 38, 38, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.45,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 14,
  },
  sos: { color: colors.textOnPrimary, fontSize: 44, fontWeight: fontWeight.bold, letterSpacing: 2 },
  hold: { color: 'rgba(255,255,255,0.85)', fontSize: fontSize.xs, marginTop: 2, fontWeight: fontWeight.medium },
  circle: {
    width: 176,
    height: 176,
    borderRadius: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
