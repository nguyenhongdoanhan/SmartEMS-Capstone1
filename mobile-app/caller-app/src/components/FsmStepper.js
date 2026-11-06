/**
 * FSM Stepper 5 bước nằm trong bottom sheet màn Theo dõi xe (C-04):
 * Gửi SOS -> Điều độ -> Đến hiện trường -> Vận chuyển -> Bệnh viện.
 * Trạng thái mỗi bước suy ra từ event backend (không tự chế trạng thái):
 *   done    = các bước trước bước active (chấm xanh + check trắng)
 *   active  = bước đang diễn ra (viền đỏ + số đỏ, đúng mockup "③")
 *   upcoming= chưa tới (viền xám + số xám)
 */
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fontWeight } from '../theme';

const STEPS = ['Gửi SOS', 'Điều độ', 'Đến hiện trường', 'Vận chuyển', 'Bệnh viện'];

/** index bước ACTIVE (0..4) theo status backend; 5 = mọi bước hoàn tất. */
const ACTIVE_BY_STATUS = {
  CREATED: 1,
  SOS_CREATED: 1,
  AMBULANCE_ASSIGNED: 2,
  DRIVER_ACCEPTED: 2,
  DRIVER_EN_ROUTE: 2,
  ARRIVED_ON_SCENE: 3,
  TRANSPORTING: 3,
  AT_HOSPITAL: 4,
  TRIP_COMPLETED: 5,
};

export default function FsmStepper({ status = 'CREATED' }) {
  const active = ACTIVE_BY_STATUS[status] ?? 1;

  return (
    <View style={styles.row} accessibilityLabel="Tiến trình chuyến xe 5 bước">
      {STEPS.map((label, i) => {
        const done = i < active;
        const isActive = i === active;
        // đường nối bên trái bước i = chặng từ bước i-1 sang bước i;
        // xanh khi bước i-1 đã xong (i-1 < active)
        const lineDone = i - 1 < active;
        return (
          <View key={label} style={styles.step}>
            {i > 0 && <View style={[styles.line, lineDone && styles.lineDone]} />}
            <View
              style={[
                styles.dot,
                done && styles.dotDone,
                isActive && styles.dotActive,
                !done && !isActive && styles.dotUpcoming,
              ]}
            >
              {done ? (
                <Ionicons name="checkmark" size={13} color={colors.textOnPrimary} />
              ) : (
                <Text style={[styles.num, isActive && styles.numActive]}>{i + 1}</Text>
              )}
            </View>
            <Text style={[styles.label, (done || isActive) && styles.labelOn, isActive && styles.labelActive]} numberOfLines={2}>
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const DOT = 24;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  step: { flex: 1, alignItems: 'center', position: 'relative' },
  line: {
    position: 'absolute',
    top: DOT / 2 - 1,
    left: 0,
    right: '50%',
    height: 2,
    backgroundColor: colors.border,
  },
  lineDone: { backgroundColor: colors.success },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  dotDone: { backgroundColor: colors.success },
  dotActive: { borderWidth: 2, borderColor: colors.primary, backgroundColor: colors.surface },
  dotUpcoming: { borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface },
  num: { fontSize: 11, fontWeight: fontWeight.semibold, color: colors.textMuted },
  numActive: { color: colors.primary, fontWeight: fontWeight.bold },
  label: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 13,
  },
  labelOn: { color: colors.textSecondary },
  labelActive: { color: colors.primary, fontWeight: fontWeight.semibold },
});
