/**
 * Ba chấm động (loader) - dùng cho splash M-01, matching C-03...
 * Mỗi chấm đi qua đi lại theo phương ngang, lệch pha nhau tạo hiệu ứng sóng mềm mại.
 */
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { colors } from '../theme';

export default function DotsLoader({ color = colors.primary, dotSize = 9, travel = 6, gap = 10, style }) {
  const v1 = useRef(new Animated.Value(0)).current;
  const v2 = useRef(new Animated.Value(0)).current;
  const v3 = useRef(new Animated.Value(0)).current;
  const phases = [v1, v2, v3];

  useEffect(() => {
    const loops = phases.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(v, { toValue: 1, duration: 400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(v, { toValue: -1, duration: 800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(v, { toValue: 0, duration: 400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.delay((phases.length - 1 - i) * 150),
        ])
      )
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={[styles.row, style]}>
      {phases.map((v, i) => (
        <Animated.View
          key={i}
          style={[
            styles.dot,
            { width: dotSize, height: dotSize, borderRadius: dotSize / 2, backgroundColor: color },
            i < phases.length - 1 && { marginRight: gap },
            {
              transform: [
                { translateX: v.interpolate({ inputRange: [-1, 1], outputRange: [-travel, travel] }) },
              ],
            },
          ]}
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
  dot: {},
});
