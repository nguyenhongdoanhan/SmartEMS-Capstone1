/**
 * Ba chấm động (loader) - dùng cho splash M-01, tái dùng cho C-03 matching (GĐ3).
 * Mỗi chấm nhún LÊN - RƠI XUỐNG theo phương dọc (translateY), lệch pha 150ms
 * tạo hiệu ứng sóng; easing out/in (quad) cho cảm giác bay lên - rơi tự nhiên.
 * Chu kỳ đều 1000ms/chấm nên loop không trôi pha.
 */
import React, { useEffect, useMemo } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { colors } from '../theme';

const DOT_COUNT = 3;
const STAGGER = 150; // lệch pha giữa các chấm (ms)
const HALF = 350;    // thời gian đi lên / đi xuống (ms)

export default function DotsLoader({
  color = colors.primary,
  dotSize = 9,
  travel = 8,
  gap = 8,
  style,
}) {
  // tạo 1 lần, không cần eslint-disable nữa
  const phases = useMemo(
    () => Array.from({ length: DOT_COUNT }, () => new Animated.Value(0)),
    []
  );

  useEffect(() => {
    const loops = phases.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * STAGGER),
          Animated.timing(v, {
            toValue: 1,
            duration: HALF,
            easing: Easing.out(Easing.quad), // lên: nhanh rồi chậm dần
            useNativeDriver: true,
          }),
          Animated.timing(v, {
            toValue: 0,
            duration: HALF,
            easing: Easing.in(Easing.quad), // xuống: chậm rồi nhanh dần, có cảm giác rơi
            useNativeDriver: true,
          }),
          Animated.delay((DOT_COUNT - 1 - i) * STAGGER), // bù cho đủ chu kỳ đều nhau
        ])
      )
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [phases]);

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel="Đang tải"
      style={[styles.row, { paddingTop: travel }, style]}
    >
      {phases.map((v, i) => (
        <Animated.View
          key={i}
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: color,
            marginRight: i < DOT_COUNT - 1 ? gap : 0,
            opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }),
            transform: [
              { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -travel] }) },
              { scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] }) },
            ],
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
