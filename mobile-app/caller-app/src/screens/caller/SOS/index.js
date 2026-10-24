/**
 * C-02 Xác nhận vị trí & mức độ - đúng mockup tài liệu thiết kế:
 * - "Xác nhận vị trí của bạn" + "Kiểm tra trước khi gửi để xe đến đúng chỗ"
 * - Map preview: pin đỏ + vòng độ chính xác GPS + dòng "📍 Độ chính xác GPS: ±X m"
 * - Ô địa chỉ (reverse geocode) + nút "Sửa" (xanh) bật chế độ chỉnh tay
 * - Ô "Mô tả tình huống (tùy chọn)..."
 * - Segmented MỨC ĐỘ KHẨN CẤP: Nghiêm trọng / Nặng / Nhẹ (priority 1|2|3 - backend TODO #3)
 * - Nút đỏ lớn "📞 GỬI YÊU CẦU CỨU THƯƠNG" + note mục tiêu sub-second
 * Gửi xong -> replace sang Matching (C-03).
 */
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '../../../components';
import { getCurrentLocation, reverseGeocodeAddress } from '../../../services/location';
import { useEmergencyStore } from '../../../store/emergency';
import { useMedicalStore } from '../../../store/medical';
import { useSettingsStore } from '../../../store/settings';
import { isFinalStatus, isMatchingStatus, statusLabel } from '../../../constants/trip';
import { colors, fontSize, fontWeight, radius, spacing } from '../../../theme';

const PRIORITIES = [
  { value: 1, label: 'Nghiêm trọng', desc: 'Nguy hiểm tính mạng' },
  { value: 2, label: 'Nặng', desc: 'Cần xử lý sớm' },
  { value: 3, label: 'Nhẹ', desc: 'Ổn định, không nguy cấp' },
];

export default function SOSScreen({ navigation }) {
  const { emergency, createSOS } = useEmergencyStore();
  const shareGps = useSettingsStore((s) => s.shareGps); // cảnh báo khi user tắt GPS (C-11)
  const [location, setLocation] = useState(null);
  const [locating, setLocating] = useState(true);
  const [locError, setLocError] = useState(null);
  const [address, setAddress] = useState('');
  const [editingAddress, setEditingAddress] = useState(false);
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState(1); // mockup: "Nghiêm trọng" đang chọn
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const active = emergency && !isFinalStatus(emergency.status);

  const loadLocation = useCallback(async () => {
    setLocating(true);
    setLocError(null);
    try {
      const loc = await getCurrentLocation();
      setLocation(loc);
      const text = await reverseGeocodeAddress(loc);
      if (text) setAddress(text);
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
        address: address.trim() || null,
        description: description.trim() || null,
        priority,
        // Hồ sơ y tế khẩn cấp (C-10) gộp vào payload - backend TODO #7
        medical: useMedicalStore.getState().snapshotForSOS(),
      });
      navigation.replace('Matching');
    } catch (err) {
      setSubmitError(err.message || 'Gửi yêu cầu thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  // Đang có yêu cầu hoạt động -> không cho gửi trùng, đưa về đúng màn đang chạy
  if (active) {
    return (
      <View style={styles.center}>
        <Text style={styles.blockedTitle}>Bạn đang có yêu cầu đang hoạt động</Text>
        <Text style={styles.blockedSub}>{statusLabel(emergency.status)}</Text>
        <AppButton
          title="Theo dõi chuyến hiện tại"
          size="lg"
          onPress={() => navigation.replace(isMatchingStatus(emergency.status) ? 'Matching' : 'Tracking')}
        />
      </View>
    );
  }

  return (
    <SafeAreaView edges={['bottom']} style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Xác nhận vị trí của bạn</Text>
        <Text style={styles.subtitle}>Kiểm tra trước khi gửi để xe đến đúng chỗ</Text>

        {/* Map preview: pin đỏ + vòng độ chính xác (mockup C-02) */}
        <View style={styles.mapWrap}>
          {locating ? (
            <View style={styles.mapLoading}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.mapLoadingText}>Đang định vị vị trí của bạn...</Text>
            </View>
          ) : locError ? (
            <View style={styles.mapLoading}>
              <Text style={styles.locErrorText}>{locError}</Text>
              <Pressable style={styles.retryBtn} onPress={loadLocation}>
                <Text style={styles.retryBtnText}>Thử lại</Text>
              </Pressable>
            </View>
          ) : (
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.004,
                longitudeDelta: 0.004,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
              rotateEnabled={false}
              toolbarEnabled={false}
              accessibilityLabel="Bản đồ vị trí hiện tại"
            >
              <Circle
                center={{ latitude: location.latitude, longitude: location.longitude }}
                radius={Math.max(location.accuracy || 10, 8)}
                strokeColor="rgba(220, 38, 38, 0.4)"
                fillColor="rgba(220, 38, 38, 0.08)"
              />
              <Marker
                coordinate={{ latitude: location.latitude, longitude: location.longitude }}
                pinColor={colors.primary}
                title="Vị trí của bạn"
              />
            </MapView>
          )}
        </View>
        {location && (
          <Text style={styles.accuracy}>
            📍 Độ chính xác GPS: ±{Math.max(1, Math.round(location.accuracy || 5))} m
          </Text>
        )}
        {!shareGps && (
          <Text style={styles.gpsOffNote}>
            ⚠️ Bạn đã tắt "Chia sẻ GPS khi SOS" trong Cài đặt — yêu cầu SOS vẫn cần vị trí này để điều phối xe tới đúng chỗ.
          </Text>
        )}

        {/* Địa chỉ + nút Sửa (mockup: link xanh) */}
        <Text style={styles.label}>ĐỊA CHỈ HIỆN TẠI</Text>
        <View style={styles.addressRow}>
          <TextInput
            style={[styles.addressInput, editingAddress && styles.addressInputEditing]}
            value={address}
            onChangeText={setAddress}
            editable={editingAddress}
            placeholder="Đang xác định địa chỉ..."
            placeholderTextColor={colors.textMuted}
            multiline
          />
          <Pressable
            onPress={() => {
              if (!editingAddress) {
                setEditingAddress(true);
              } else {
                setEditingAddress(false);
              }
            }}
            hitSlop={8}
            accessibilityLabel={editingAddress ? 'Xong sửa địa chỉ' : 'Sửa địa chỉ'}
          >
            <Text style={styles.editLink}>{editingAddress ? 'Xong' : 'Sửa'}</Text>
          </Pressable>
        </View>
        {editingAddress && <Text style={styles.editHint}>Sửa địa chỉ nếu GPS sai lệch (tên đường, số nhà...)</Text>}

        {/* Mô tả tình huống (tùy chọn) */}
        <Text style={styles.label}>MÔ TẢ TÌNH HUỐNG</Text>
        <TextInput
          style={styles.descInput}
          placeholder="Mô tả tình huống (tùy chọn)..."
          placeholderTextColor={colors.textMuted}
          value={description}
          onChangeText={setDescription}
          multiline
          textAlignVertical="top"
        />

        {/* Segmented mức độ khẩn cấp (mockup C-02) */}
        <Text style={styles.label}>MỨC ĐỘ KHẨN CẤP</Text>
        <View style={styles.segmentRow}>
          {PRIORITIES.map((p) => {
            const selected = priority === p.value;
            return (
              <Pressable
                key={p.value}
                style={[styles.segment, selected && styles.segmentSelected]}
                onPress={() => setPriority(p.value)}
                accessibilityLabel={`Mức độ ${p.label}`}
              >
                <Text style={[styles.segmentLabel, selected && styles.segmentLabelSelected]}>{p.label}</Text>
                <Text style={[styles.segmentDesc, selected && styles.segmentDescSelected]}>{p.desc}</Text>
              </Pressable>
            );
          })}
        </View>

        {!!submitError && <Text style={styles.submitError}>{submitError}</Text>}

        <AppButton
          title="📞 GỬI YÊU CẦU CỨU THƯƠNG"
          size="lg"
          onPress={submit}
          disabled={!location}
          loading={submitting}
          style={styles.submitBtn}
        />
        <Text style={styles.note}>Điều phối viên nhận trong &lt;1 giây (mục tiêu sub-second)</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  container: { padding: spacing.xl, paddingBottom: spacing.xxl },
  blockedTitle: { fontSize: fontSize.l, fontWeight: fontWeight.semibold, color: colors.text, textAlign: 'center' },
  blockedSub: { fontSize: fontSize.s, color: colors.textSecondary, marginTop: spacing.s, marginBottom: spacing.xl, textAlign: 'center' },

  title: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.text },
  subtitle: { fontSize: fontSize.s, color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.l },

  mapWrap: {
    borderRadius: radius.l,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  map: { height: 170, width: '100%' },
  mapLoading: { height: 170, alignItems: 'center', justifyContent: 'center', gap: spacing.m, padding: spacing.l },
  mapLoadingText: { color: colors.textSecondary, fontSize: fontSize.s },
  locErrorText: { color: colors.error, fontSize: fontSize.s, textAlign: 'center' },
  retryBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.s,
    paddingVertical: spacing.s + 2,
    paddingHorizontal: spacing.l,
  },
  retryBtnText: { color: colors.textOnPrimary, fontSize: fontSize.s, fontWeight: fontWeight.medium },
  accuracy: { color: colors.textSecondary, fontSize: fontSize.xs, marginTop: spacing.s, marginBottom: spacing.l },
  gpsOffNote: {
    color: colors.warning,
    fontSize: fontSize.xs,
    marginTop: -spacing.s,
    marginBottom: spacing.l,
    lineHeight: 17,
  },

  label: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.s,
    marginTop: spacing.s,
    letterSpacing: 0.5,
  },
  addressRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.m },
  addressInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.m,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    fontSize: fontSize.m,
    color: colors.text,
  },
  addressInputEditing: { borderColor: colors.blue },
  editLink: { color: colors.blue, fontSize: fontSize.s, fontWeight: fontWeight.bold, paddingTop: spacing.m + 2 },
  editHint: { color: colors.textMuted, fontSize: fontSize.xs, marginTop: spacing.s },

  descInput: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.m,
    padding: spacing.l,
    fontSize: fontSize.m,
    color: colors.text,
    minHeight: 88,
    marginBottom: spacing.s,
    textAlignVertical: 'top',
  },

  segmentRow: { flexDirection: 'row', gap: spacing.s, marginBottom: spacing.s },
  segment: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.m,
    alignItems: 'center',
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.xs,
  },
  segmentSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  segmentLabel: { color: colors.text, fontSize: fontSize.s, fontWeight: fontWeight.semibold, textAlign: 'center' },
  segmentLabelSelected: { color: colors.textOnPrimary },
  segmentDesc: { color: colors.textSecondary, fontSize: 10, marginTop: 2, textAlign: 'center' },
  segmentDescSelected: { color: 'rgba(255, 255, 255, 0.8)' },

  submitError: { color: colors.error, fontSize: fontSize.s, marginBottom: spacing.m },
  submitBtn: { marginTop: spacing.l },
  note: { color: colors.textSecondary, fontSize: fontSize.xs, textAlign: 'center', marginTop: spacing.m, lineHeight: 18 },
});
