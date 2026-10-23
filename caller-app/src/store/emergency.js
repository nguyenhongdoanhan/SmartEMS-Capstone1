/**
 * Store tình huống cấp cứu (zustand) - Emergency đang hoạt động + realtime qua WebSocket.
 * UI không cần biết nguồn event là mock hay backend thật, mọi thứ đi qua handleEvent().
 */
import { create } from 'zustand';
import { connectSocket } from '../services/socket';
import { emergencyApi } from '../services';
import { mockEngine } from '../services/mock/mockEngine';

export const useEmergencyStore = create((set, get) => ({
  /** EmergencyOut của emergency đang hoạt động (null = chưa có) */
  emergency: null,
  /** [{ status, at, plate, eta, hospital }] - dòng thời gian realtime các bước */
  timeline: [],
  /** Trạng thái WS: 'idle' | 'connected' | 'closed' | 'error' | 'unauthorized' */
  wsStatus: 'idle',
  /** socket hiện tại (giấu khỏi UI bằng dấu gạch dưới) */
  _socket: null,

  /** Gọi sau khi đăng nhập thành công - mở 1 kết nối WS duy nhất cho phiên. */
  connectRealtime: (token) => {
    const { _socket } = get();
    if (_socket) return;
    const socket = connectSocket(
      token,
      (msg) => get().handleEvent(msg),
      (status) => set({ wsStatus: status }),
    );
    set({ _socket: socket });
  },

  /** Đóng WS khi đăng xuất. */
  disconnectRealtime: () => {
    const { _socket } = get();
    if (_socket) {
      _socket.close();
      set({ _socket: null, wsStatus: 'idle' });
    }
  },

  /** Gửi SOS mới. Trả về EmergencyOut từ API/mock, timeline bắt đầu từ SOS_CREATED. */
  createSOS: async (data) => {
    const emergency = await emergencyApi.createSOS(data);
    set({
      emergency,
      timeline: [{ status: 'SOS_CREATED', at: new Date().toISOString() }],
    });
    return emergency;
  },

  /** Nơi duy nhất xử lý event realtime đẩy về từ WS (thật hoặc mock). */
  handleEvent: (msg) => {
    const { emergency, timeline } = get();
    if (!msg || msg.type !== 'trip_status' || !emergency) return;
    // Backend thật hiện chỉ gửi trip_id (chưa có emergency_id) - chấp nhận luôn;
    // khi có emergency_id thì phải khớp mới nhận, tránh lẫn SOS của người khác.
    if (msg.emergency_id !== undefined && msg.emergency_id !== emergency.id) return;

    const entry = {
      status: msg.status,
      at: msg.timestamp || new Date().toISOString(),
      plate: msg.plate_number || null,
      eta: msg.eta_minutes ?? null,
      hospital: msg.hospital || null,
    };
    set({
      timeline: [...timeline, entry],
      emergency: { ...emergency, status: msg.status },
    });
  },

  /** Xóa tình huống sau khi kết thúc / đăng xuất. */
  clear: () => {
    mockEngine.cancelTrip();
    set({ emergency: null, timeline: [] });
  },
}));
