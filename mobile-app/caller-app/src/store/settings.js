/**
 * Store cài đặt (C-11) - zustand + AsyncStorage, persist theo thiết bị.
 * Mặc định đúng mockup: WS push ON · cảnh báo xe gần (1km) OFF · chia sẻ GPS ON.
 * Push notification thật (expo-notifications) defer phase sau - v1 chỉ lưu lựa chọn.
 */
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = '@smartems/settings';

export const DEFAULT_SETTINGS = {
  wsPush: true, // "Tình trạng xe (WS push)"
  nearbyAlert: false, // "Xe đến gần (1 km)"
  shareGps: true, // "Chia sẻ GPS khi SOS"
};

export const useSettingsStore = create((set) => ({
  ...DEFAULT_SETTINGS,
  loaded: false,

  init: async () => {
    try {
      const raw = await AsyncStorage.getItem(SETTINGS_KEY);
      if (raw) set({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
    } catch (err) {
      // lỗi storage: dùng default
    }
    set({ loaded: true });
  },

  /** Bật/tắt 1 mục - persist ngay để sống sót qua lần mở app sau. */
  toggle: (key, value) => {
    set({ [key]: value });
    AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...useSettingsStore.getState(), loaded: undefined }))
      .catch(() => {});
  },
}));
