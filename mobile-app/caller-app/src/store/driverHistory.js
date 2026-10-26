/**
 * Store lịch sử CHUYẾN CỦA TÀI XẾ (D-08 + stats 3 ô của D-01) - zustand + AsyncStorage,
 * mirror pattern store/history.js của caller.
 * Backend chưa có GET /trips/mine (gap D9 trong design/driver-design-analysis.md)
 * -> v1 chụp snapshot các chuyên ĐÃ BÀN GIAO XONG ngay trên máy.
 *
 * Điểm archive: completeHandover trong store/driverShift (bệnh nhân đã bàn giao
 * = TRIP_COMPLETED của ca - xe mới chuyển RETURNING). Chuyến dở dang (tắt trực
 * giữa đường) KHÔNG ghi - danh sách D-08 chỉ gồm trạng thái HOÀN TẤT đúng mockup.
 */
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DRIVER_HISTORY_KEY = '@smartems/driver-history';
const MAX_RECORDS = 50; // đủ cho tuần demo, tránh phình AsyncStorage

/**
 * Ghi 1 chuyến hoàn tất vào lịch sử (gọi từ driverShift.completeHandover).
 * @param {{id: number, code: string, shortAddress: string, priority: string,
 *          acceptedAt: number|null, onSceneAt: number|null, completedAt: number,
 *          responseSec: number|null, hospitalName: string|null,
 *          triageLevel: string|null, reassigned: boolean, km: number}} trip
 */
export function archiveDriverTrip(trip) {
  const store = useDriverHistoryStore.getState();
  const records = [trip, ...store.records.filter((r) => r.id !== trip.id)].slice(0, MAX_RECORDS);
  useDriverHistoryStore.setState({ records });
  AsyncStorage.setItem(DRIVER_HISTORY_KEY, JSON.stringify(records)).catch(() => {});
}

export const useDriverHistoryStore = create((set) => ({
  records: [], // mới nhất trước
  loaded: false,

  /** Nạp từ AsyncStorage (AppNavigator gọi 1 lần khi mở app). */
  init: async () => {
    try {
      const raw = await AsyncStorage.getItem(DRIVER_HISTORY_KEY);
      if (raw) set({ records: JSON.parse(raw) });
    } catch (err) {
      // lỗi storage: bắt đầu rỗng
    }
    set({ loaded: true });
  },

  /** Xóa toàn bộ lịch sử (chưa đưa vào UI - dùng khi cần reset demo). */
  clearAll: () => {
    set({ records: [] });
    AsyncStorage.removeItem(DRIVER_HISTORY_KEY).catch(() => {});
  },
}));
