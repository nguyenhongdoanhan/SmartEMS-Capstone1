/**
 * Store lịch sử yêu cầu cấp cứu (C-08/C-09) - zustand + AsyncStorage.
 * Backend chưa có GET /emergencies/mine (TODO #5) -> v1 lưu snapshot các ca
 * đã KẾT THÚC ngay trên máy, gọi là "archive".
 *
 * 2 điểm archive (đúng chỗ chuyến kết thúc, KHÔNG phải clear() vì logout
 * cũng gọi clear):
 *   1. Completion "Về trang chủ" (TRIP_COMPLETED)
 *   2. cancelSOS ở emergency store (CANCELED)
 */
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = '@smartems/history';
const MAX_RECORDS = 50; // giới hạn bộ nhớ demo, đủ cho portfolio

/** Gọi từ emergency store khi chuyến kết thúc - chụp toàn bộ state cần cho C-08/C-09. */
export function archiveTrip({ emergency, timeline, ambulance, hospital, tripDistanceKm, rating, status }) {
  const store = useHistoryStore.getState();
  const record = {
    id: emergency.id,
    status: status || emergency.status, // TRIP_COMPLETED | CANCELED
    priority: emergency.priority ?? null,
    address: emergency.address || null,
    createdAt: emergency.created_at,
    endedAt: new Date().toISOString(),
    timeline: timeline.map((t) => ({ ...t })),
    ambulance: ambulance ? { ...ambulance } : null,
    hospital: hospital ? { ...hospital } : null,
    tripDistanceKm: tripDistanceKm ?? null,
    rating: rating ?? null,
  };
  const records = [record, ...store.records.filter((r) => r.id !== record.id)].slice(0, MAX_RECORDS);
  useHistoryStore.setState({ records });
  AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(records)).catch(() => {});
}

export const useHistoryStore = create((set) => ({
  records: [], // mới nhất trước
  loaded: false,

  init: async () => {
    try {
      const raw = await AsyncStorage.getItem(HISTORY_KEY);
      if (raw) set({ records: JSON.parse(raw) });
    } catch (err) {
      // lỗi storage: bắt đầu rỗng
    }
    set({ loaded: true });
  },

  /** Xóa toàn bộ lịch sử (dùng khi cần - hiện chưa đưa vào UI). */
  clearAll: () => {
    set({ records: [] });
    AsyncStorage.removeItem(HISTORY_KEY).catch(() => {});
  },
}));
