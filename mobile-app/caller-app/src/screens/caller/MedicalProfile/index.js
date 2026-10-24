/**
 * C-10 · Sửa hồ sơ y tế khẩn cấp (editor cho card ở màn Hồ sơ):
 * - Nhóm máu: chip chọn nhanh 8 loại (bấm lại để bỏ chọn)
 * - Dị ứng / Bệnh nền: nhập tự do
 * - Người thân: tên + SĐT (gọi được khi xe cấp cứu cần)
 * - Khác: địa chỉ thường trú (menu C-10 cũng dẫn về đây)
 * Lưu AsyncStorage (store/medical) - tự gộp vào payload mỗi SOS (TODO #7 backend).
 */
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppButton } from '../../../components';
import { EMPTY_MEDICAL, useMedicalStore } from '../../../store/medical';
import { colors, fontSize, fontWeight, radius, spacing } from '../../../theme';

const BLOOD_TYPES = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

function Field({ label, value, onChangeText, placeholder, multiline = false, keyboard = 'default', maxLength }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
        keyboardType={keyboard}
        maxLength={maxLength}
        autoCorrect={false}
      />
    </View>
  );
}

function SectionLabel({ children }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

export default function MedicalProfileScreen({ navigation }) {
  const profile = useMedicalStore((s) => s.profile) || EMPTY_MEDICAL;
  const save = useMedicalStore((s) => s.save);

  const [bloodType, setBloodType] = useState(profile.bloodType || '');
  const [allergies, setAllergies] = useState(profile.allergies || '');
  const [conditions, setConditions] = useState(profile.conditions || '');
  const [contactName, setContactName] = useState(profile.contactName || '');
  const [contactPhone, setContactPhone] = useState(profile.contactPhone || '');
  const [homeAddress, setHomeAddress] = useState(profile.homeAddress || '');
  const [saving, setSaving] = useState(false);

  const toggleBlood = (type) => setBloodType((cur) => (cur === type ? '' : type));

  const saveProfile = async () => {
    setSaving(true);
    try {
      await save({ bloodType, allergies, conditions, contactName, contactPhone, homeAddress });
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.noteBox}>
        <Ionicons name="information-circle-outline" size={18} color={colors.blue} />
        <Text style={styles.noteText}>
          Thông tin này được gửi kèm mỗi yêu cầu SOS giúp tài xế và bệnh viện kịp thời ứng phó. Chỉ lưu trên máy của
          bạn cho tới khi backend bổ sung hồ sơ y tế.
        </Text>
      </View>

      <SectionLabel>Nhóm máu</SectionLabel>
      <View style={styles.bloodRow}>
        {BLOOD_TYPES.map((type) => {
          const selected = bloodType === type;
          return (
            <Pressable
              key={type}
              onPress={() => toggleBlood(type)}
              style={[styles.bloodChip, selected && styles.bloodChipActive]}
              accessibilityLabel={`Nhóm máu ${type}`}
            >
              <Text style={[styles.bloodText, selected && styles.bloodTextActive]}>{type}</Text>
            </Pressable>
          );
        })}
      </View>

      <SectionLabel>Hồ sơ y tế</SectionLabel>
      <Field label="Dị ứng (thuốc, thực phẩm...)" value={allergies} onChangeText={setAllergies} placeholder="vd: Penicillin, tôm cua" />
      <Field label="Bệnh nền" value={conditions} onChangeText={setConditions} placeholder="vd: hen suyễn nhẹ, cao huyết áp" />

      <SectionLabel>Người thân cần liên hệ</SectionLabel>
      <Field label="Họ tên" value={contactName} onChangeText={setContactName} placeholder="vd: Nguyễn Văn Anh" />
      <Field
        label="Số điện thoại"
        value={contactPhone}
        onChangeText={setContactPhone}
        placeholder="vd: 0396 xxx 794"
        keyboard="phone-pad"
        maxLength={15}
      />

      <SectionLabel>Khác</SectionLabel>
      <Field
        label="Địa chỉ thường trú"
        value={homeAddress}
        onChangeText={setHomeAddress}
        placeholder="vd: 254 Nguyễn Văn Linh, Đà Nẵng"
      />

      <AppButton title="Lưu hồ sơ" size="lg" onPress={saveProfile} loading={saving} disabled={saving} style={styles.saveBtn} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.l, paddingBottom: spacing.xxl },

  noteBox: {
    flexDirection: 'row',
    gap: spacing.s,
    backgroundColor: colors.infoBg,
    borderRadius: radius.m,
    padding: spacing.l,
    marginBottom: spacing.l,
  },
  noteText: { flex: 1, color: colors.blue, fontSize: fontSize.xs, lineHeight: 18 },

  sectionLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.s,
    marginTop: spacing.s,
    marginLeft: spacing.xs,
  },

  bloodRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.s, marginBottom: spacing.s },
  bloodChip: {
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s + 2,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 56,
    alignItems: 'center',
  },
  bloodChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  bloodText: { color: colors.text, fontSize: fontSize.s, fontWeight: fontWeight.semibold },
  bloodTextActive: { color: colors.textOnPrimary },

  field: { marginBottom: spacing.l },
  fieldLabel: { color: colors.text, fontSize: fontSize.s, fontWeight: fontWeight.medium, marginBottom: spacing.s },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.m,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    fontSize: fontSize.m,
    color: colors.text,
  },
  inputMultiline: { minHeight: 72, textAlignVertical: 'top' },

  saveBtn: { marginTop: spacing.l },
});
