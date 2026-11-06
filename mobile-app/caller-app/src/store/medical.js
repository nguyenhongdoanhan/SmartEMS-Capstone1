/**
 * Store hồ sơ y tế khẩn cấp (C-10) - zustand + AsyncStorage.
 * Lưu local theo thiết bị (backend chưa có bảng user_medical_profile - TODO #7),
 * tự gộp vào payload mỗi lần gửi SOS để tài xế/bệnh viện kịp ứng phó.
 */
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MEDICAL_KEY = '@smartems/medical_profile';

export const EMPTY_MEDICAL = {
  bloodType: '', // vd "O+"
  allergies: '', // vd "Penicillin"
  conditions: '', // bệnh nền, vd "hen suyễn nhẹ"
  contactName: '', // người thân
  contactPhone: '',
  homeAddress: '', // địa chỉ thường trú (menu C-10)
};

/** true khi hồ sơ trống hoàn toàn (chưa từng nhập). */
export function isEmptyMedical(profile) {
  if (!profile) return true;
  return Object.keys(EMPTY_MEDICAL).every((k) => !(profile[k] || '').trim());
}

export const useMedicalStore = create((set, get) => ({
  profile: null,
  loaded: false,

  /** Khôi phục hồ sơ đã lưu - gọi 1 lần lúc khởi động app. */
  init: async () => {
    try {
      const raw = await AsyncStorage.getItem(MEDICAL_KEY);
      if (raw) set({ profile: JSON.parse(raw) });
    } catch (err) {
      // lỗi storage không chặn app
    }
    set({ loaded: true });
  },

  /** Lưu hồ sơ mới (merge với hồ sơ cũ). */
  save: async (patch) => {
    const next = { ...EMPTY_MEDICAL, ...(get().profile || {}), ...patch };
    set({ profile: next });
    try {
      await AsyncStorage.setItem(MEDICAL_KEY, JSON.stringify(next));
    } catch (err) {
      // vẫn giữ state trong phiên nếu persist lỗi
    }
    return next;
  },

  /** Bản sao hồ sơ để gắn vào payload SOS (null nếu chưa có gì). */
  snapshotForSOS: () => {
    const p = get().profile;
    if (isEmptyMedical(p)) return null;
    return {
      blood_type: (p.bloodType || '').trim(),
      allergies: (p.allergies || '').trim(),
      conditions: (p.conditions || '').trim(),
      contact_name: (p.contactName || '').trim(),
      contact_phone: (p.contactPhone || '').trim(),
    };
  },
}));
