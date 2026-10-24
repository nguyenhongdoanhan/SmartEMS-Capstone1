/**
 * C-11 · Cài đặt (khung Giai đoạn 1 - switch là state local).
 * Giai đoạn 4: persist AsyncStorage + logic thật (gps permission, offline data, privacy link).
 */
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Card } from '../../../components';
import { colors, fontSize, fontWeight, radius, spacing } from '../../../theme';

function SectionLabel({ children }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

function ToggleRow({ label, value, onChange }) {
  return (
    <Pressable style={styles.row} onPress={() => onChange(!value)}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.border, true: colors.success }}
        thumbColor={colors.surface}
      />
    </Pressable>
  );
}

function InfoRow({ label, subLabel, actionLabel, onAction }) {
  return (
    <Pressable style={styles.row} onPress={onAction}>
      <View style={styles.rowInfo}>
        <Text style={styles.rowLabel}>{label}</Text>
        {subLabel ? <Text style={styles.rowSub}>{subLabel}</Text> : null}
      </View>
      {actionLabel ? (
        <View style={styles.updateChip}>
          <Text style={styles.updateChipText}>{actionLabel}</Text>
        </View>
      ) : (
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      )}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const [wsPush, setWsPush] = useState(true);
  const [nearbyAlert, setNearbyAlert] = useState(false);
  const [shareGps, setShareGps] = useState(true);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <SectionLabel>Thông báo</SectionLabel>
      <Card padded={false}>
        <ToggleRow label="Tình trạng xe (WS push)" value={wsPush} onChange={setWsPush} />
        <View style={styles.divider} />
        <ToggleRow label="Xe đến gần (1 km)" value={nearbyAlert} onChange={setNearbyAlert} />
      </Card>

      <SectionLabel>Dữ liệu &amp; riêng tư</SectionLabel>
      <Card padded={false}>
        <ToggleRow label="Chia sẻ GPS khi SOS" value={shareGps} onChange={setShareGps} />
        <View style={styles.divider} />
        <InfoRow
          label="Dữ liệu SOS cũ (offline)"
          subLabel="18 MB · cập nhật 24/08"
          actionLabel="Cập nhật"
          onAction={() => {}}
        />
        <View style={styles.divider} />
        <InfoRow label="Quyền riêng tư dữ liệu" subLabel="Nghị định 13/2023/NĐ-CP" onAction={() => {}} />
      </Card>

      <Text style={styles.footer}>SmartEMS v1.0.0 · Academic Prototype</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.l, paddingBottom: spacing.xxl },
  sectionLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: spacing.s,
    marginTop: spacing.s,
    marginLeft: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.m + 2,
    paddingHorizontal: spacing.l,
    minHeight: 52,
  },
  rowInfo: { flex: 1, paddingRight: spacing.m },
  rowLabel: { fontSize: fontSize.m, color: colors.text, flexShrink: 1 },
  rowSub: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.border, marginLeft: spacing.l },
  updateChip: {
    backgroundColor: colors.blueBg,
    borderRadius: radius.full,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  updateChipText: { color: colors.blue, fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
  footer: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
