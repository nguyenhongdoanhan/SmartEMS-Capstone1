/**
 * Nút SOS tròn giữ 2 giây (C-01) - đúng mockup: tròn đỏ lớn >= 200px, glow,
 * chữ "SOS" + "NHẤN GIỜ 2 GIÂY", progress ring ĐỎ chạy quanh khi đang giữ.
 * Thả sớm -> ring co về 0 (hủy); giữ đủ 2s -> onComplete() (sang C-02).
 * Ring dùng react-native-svg (Expo Go nhúng sẵn native module, không cần config).
 */
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors, fontSize, fontWeight } from '../theme';

export const HOLD_MS = 2000;
const SIZE = 224; // toàn khối gồm ring
const BTN = 176; // đường kính nút đỏ (design >= 200px cả ring)
const STROKE = 6;
const R = (SIZE - STROKE) / 2 - 4;
const CIRC = 2 * Math.PI * R;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function SosHoldButton({ onComplete, hint = 'NHẤN GIỜ 2 GIÂY' }) {
  const progress = useRef(new Animated.Value(0)).current;
  const holding = useRef(false);
  const anim = useRef(null);

  useEffect(
    () => () => {
      // unmount giữa chừng (vd điều hướng đi nơi khác) -> dừng animation
      anim.current?.stop();
    },
    [],
  );

  const startHold = () => {
    if (holding.current) return;
    holding.current = true;
    anim.current = Animated.timing(progress, {
      toValue: 1,
      duration: HOLD_MS,
      easing: Easing.linear,
      useNativeDriver: false, // strokeDashoffset của SVG phải chạy JS driver
    });
    anim.current.start(({ finished }) => {
      if (finished && holding.current) {
        holding.current = false;
        progress.setValue(0);
        onComplete?.();
      }
    });
  };

  const cancelHold = () => {
    if (!holding.current) return;
    holding.current = false;
    anim.current?.stop();
    // thả sớm -> ring co về 0 kiểu spring cho tự nhiên
    Animated.spring(progress, { toValue: 0, useNativeDriver: false, friction: 7, tension: 60 }).start();
  };

  const strokeOffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRC, 0],
  });

  return (
    <View style={styles.wrap} accessibilityLabel="Nút SOS, giữ 2 giây để gửi">
      {/* Vòng glow đỏ mờ phía sau (mockup có hiệu ứng phát sáng) */}
      <View style={styles.glow} />

      {/* Progress ring: quay từ đỉnh (rotate -90), nét nền mờ + nét đỏ chạy theo tiến độ */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width={SIZE} height={SIZE}>
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            stroke="rgba(220, 38, 38, 0.15)"
            strokeWidth={STROKE}
            fill="none"
          />
          <AnimatedCircle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            stroke={colors.primary}
            strokeWidth={STROKE}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${CIRC} ${CIRC}`}
            strokeDashoffset={strokeOffset}
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          />
        </Svg>
      </View>

      <Pressable
        style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
        onPressIn={startHold}
        onPressOut={cancelHold}
      >
        {/* Highlight trắng nhẹ phía trên tạo cảm giác gradient 3D như mockup */}
        <View style={styles.highlight} pointerEvents="none" />
        <Text style={styles.sos}>SOS</Text>
        <Text style={styles.hint}>{hint}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: 'rgba(220, 38, 38, 0.10)',
    transform: [{ scale: 1.06 }],
  },
  btn: {
    width: BTN,
    height: BTN,
    borderRadius: BTN / 2,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    elevation: 10,
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  btnPressed: { backgroundColor: colors.primaryDark, transform: [{ scale: 0.97 }] },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: BTN * 0.42,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderBottomLeftRadius: BTN,
    borderBottomRightRadius: BTN,
  },
  sos: {
    color: colors.textOnPrimary,
    fontSize: fontSize.sos + 6,
    fontWeight: fontWeight.bold,
    letterSpacing: 2,
  },
  hint: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    marginTop: 2,
    letterSpacing: 0.5,
  },
});
