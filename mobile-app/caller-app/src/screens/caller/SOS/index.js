/**
 * Màn Gửi SOS: tự lấy vị trí GPS -> nhập mô tả -> bấm gửi -> chuyển sang Tracking.
 * Chặn gửi trùng nếu đã có chuyến đang hoạt động.
 */
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { getCurrentLocation, formatCoords } from '../../../services/location';
import { useEmergencyStore } from '../../../store/emergency';
import { isFinalStatus, statusLabel } from '../../../constants/trip';
import { colors, fontSize, fontWeight, radius, spacing } from '../../../theme';

export default function SOSScreen({ navigation }) {
  const { emergency, createSOS } = useEmergencyStore();
  const [location, setLocation] = useState(null);
  const [locating, setLocating] = useState(true);
  const [locError, setLocError] = useState(null);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const active = emergency && !isFinalStatus(emergency.status);

  const loadLocation = useCallback(async () => {
    setLocating(true);
    setLocError(null);
    try {
      const loc = await getCurrentLocation();
      setLocation(loc);
    } catch (err) {
      setLocError(err.message || 'Không đọc được vị trí.');
    } finally {
      setLocating(false);
    }
  }, []);

  useEffect(() => {
    loadLocation();
  }, [loadLocation]);

  const submit = async () => {
    if (!location || submitting || active) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await createSOS({
        latitude: location.latitude,
        longitude: location.longitude,
        description: description.trim() || null,
      });
      navigation.replace('Tracking');
    } catch (err) {
      setSubmitError(err.message || 'Gửi yêu cầu thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  if (active) {
    return (
      <View style={styles.center}>
        <Text style={styles.blockedTitle}>Bạn đang có yêu cầu đang hoạt động</Text>
        <Text style={styles.blockedSub}>{statusLabel(emergency.status)}</Text>
        <Pressable style={styles.trackBtn} onPress={() => navigation.replace('Tracking')}>
          <Text style={styles.trackBtnText}>Theo dõi chuyến hiện tại</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.sectionTitle}>Vị trí hiện tại</Text>
      <View style={styles.locationCard}>
        {locating ? (
          <View style={styles.locatingRow}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.locatingText}>Đang định vị vị trí của bạn...</Text>
          </View>
        ) : locError ? (
          <View style={styles.locErrorWrap}>
            <Text style={styles.locErrorText}>{locError}</Text>
            <Pressable style={styles.retryBtn} onPress={loadLocation}>
              <Text style={styles.retryBtnText}>Thử lại</Text>
            </Pressable>
          </View>
        ) : (
          <Text style={styles.coords}>{formatCoords(location)}</Text>
        )}
      </View>

      <Text style={styles.sectionTitle}>Tình trạng (không bắt buộc)</Text>
      <TextInput
        style={styles.descInput}
        placeholder="Ví dụ: người già ngất, khó thở, tai nạn giao thông..."
        placeholderTextColor={colors.textDisabled}
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />

      {!!submitError && <Text style={styles.submitError}>{submitError}</Text>}

      <Pressable
        style={({ pressed }) => [
          styles.sendBtn,
          (!location || submitting || pressed) && styles.sendBtnDisabled,
        ]}
        onPress={submit}
        disabled={!location || submitting}
      >
        {submitting ? (
          <ActivityIndicator color={colors.textOnPrimary} />
        ) : (
          <Text style={styles.sendText}>GỬI YÊU CẦU CỨU THƯƠNG</Text>
        )}
      </Pressable>

      <Text style={styles.note}>
        Khi bấm gửi, vị trí và mô tả sẽ được chuyển tới trung tâm điều phối ngay lập tức.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.xl, paddingBottom: spacing.xxl },
  center: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  blockedTitle: { fontSize: fontSize.l, fontWeight: fontWeight.semibold, color: colors.text, textAlign: 'center' },
  blockedSub: { fontSize: fontSize.s, color: colors.textSecondary, marginTop: spacing.s, marginBottom: spacing.xl, textAlign: 'center' },
  trackBtn: { backgroundColor: colors.primary, borderRadius: radius.m, paddingVertical: spacing.m, paddingHorizontal: spacing.xl },
  trackBtnText: { color: colors.textOnPrimary, fontWeight: fontWeight.semibold },
  sectionTitle: { fontSize: fontSize.m, fontWeight: fontWeight.semibold, color: colors.text, marginBottom: spacing.s },
  locationCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.m,
    padding: spacing.l,
    marginBottom: spacing.l,
  },
  locatingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.m },
  locatingText: { color: colors.textSecondary, fontSize: fontSize.s },
  coords: { fontSize: fontSize.l, fontWeight: fontWeight.semibold, color: colors.text },
  locErrorWrap: { gap: spacing.m },
  locErrorText: { color: colors.error, fontSize: fontSize.s },
  retryBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.s,
    paddingVertical: spacing.s + 2,
    paddingHorizontal: spacing.l,
    alignSelf: 'flex-start',
  },
  retryBtnText: { color: colors.textOnPrimary, fontSize: fontSize.s, fontWeight: fontWeight.medium },
  descInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.m,
    padding: spacing.l,
    fontSize: fontSize.m,
    color: colors.text,
    minHeight: 100,
    marginBottom: spacing.l,
    textAlignVertical: 'top',
  },
  sendBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    paddingVertical: spacing.l,
    alignItems: 'center',
    elevation: 6,
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  sendBtnDisabled: { backgroundColor: colors.textDisabled, elevation: 0, shadowOpacity: 0 },
  sendText: { color: colors.textOnPrimary, fontSize: fontSize.l, fontWeight: fontWeight.bold, letterSpacing: 0.5 },
  submitError: { color: colors.error, fontSize: fontSize.s, marginBottom: spacing.m },
  note: { color: colors.textSecondary, fontSize: fontSize.xs, textAlign: 'center', marginTop: spacing.l, lineHeight: 18 },
});
