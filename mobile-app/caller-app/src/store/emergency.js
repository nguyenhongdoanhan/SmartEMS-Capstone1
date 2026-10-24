/**
 * Store tình huống cấp cứu (zustand) - Emergency đang hoạt động + realtime qua WebSocket.
 * UI không cần biết nguồn event là mock hay backend thật, mọi thứ đi qua handleEvent().
 *
 * GĐ3 bổ sung state cho hành trình SOS (C-03 -> C-04 -> C-05):
 *   ambulance { id, plate, driver, rating, score, coords, etaMinutes, distanceKm }
 *   hospital  { name }
 *   route     [{latitude, longitude}] - polyline hiện tại (xe->hiện trường, rồi ->BV)
 *   tripDistanceKm - tổng quãng đường ca cứu hộ (metric C-05)
 *   rating    - số sao user đánh giá sau ca (C-05)
 */
import { create } from 'zustand';
import { connectSocket } from '../services/socket';
import { emergencyApi } from '../services';
import { mockEngine } from '../services/mock/mockEngine';

/** State rỗng của 1 chuyến - factory để tránh share tham chiếu mảng route giữa các chuyến. */
const emptyTrip = () => ({
  ambulance: null,
  hospital: null,
  route: [],
  tripDistanceKm: null,
  rating: null,
});

export const useEmergencyStore = create((set, get) => ({
  /** EmergencyOut của emergency đang hoạt động (null = chưa có) */
  emergency: null,
  /** [{ status, at, plate, eta, hospital }] - dòng thời gian realtime các bước */
  timeline: [],
  /** Trạng thái WS: 'idle' | 'connected' | 'closed' | 'error' | 'unauthorized' */
  wsStatus: 'idle',
  ...emptyTrip(),
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

  /** Gửi SOS mới. Trả về EmergencyOut từ API/mock, timeline bắt đầu từ CREATED
   *  (status gốc của EmergencyOut). Event SOS_CREATED trên WS là ECHO từ dispatch
   *  center - C-03 dùng nó làm dấu hiệu "Điều phối viên đã nhận" nên không được gieo sẵn. */
  createSOS: async (data) => {
    const emergency = await emergencyApi.createSOS(data);
    set({
      emergency,
      timeline: [{ status: 'CREATED', at: emergency.created_at }],
      ...emptyTrip(),
    });
    return emergency;
  },

  /** Hủy yêu cầu đang ghép xe (C-03) - backend chưa có endpoint, mock hủy luôn. */
  cancelSOS: async () => {
    const { emergency } = get();
    if (!emergency) return;
    try {
      await emergencyApi.cancelSOS(emergency.id);
    } catch (err) {
      // backend thật chưa có DELETE /emergencies (TODO) - vẫn hủy phía FE để user thoát
    }
    mockEngine.cancelTrip();
    set({ emergency: null, timeline: [], ...emptyTrip() });
  },

  /** Gửi đánh giá 5 sao sau ca cứu hộ (C-05). Không chặn user khi backend thiếu endpoint. */
  submitRating: async (stars) => {
    const { emergency } = get();
    if (!emergency) return;
    set({ rating: stars });
    try {
      await emergencyApi.rateTrip(emergency.id, stars);
    } catch (err) {
      // backend thật chưa có POST /emergencies/{id}/rating (TODO #8) - đã lưu local
    }
  },

  /** Nơi duy nhất xử lý event realtime đẩy về từ WS (thật hoặc mock). */
  handleEvent: (msg) => {
    const { emergency, timeline } = get();
    if (!msg || !emergency) return;
    // Backend thật hiện chỉ gửi trip_id (chưa có emergency_id) - chấp nhận luôn;
    // khi có emergency_id thì phải khớp mới nhận, tránh lẫn SOS của người khác.
    if (msg.emergency_id !== undefined && msg.emergency_id !== emergency.id) return;

    // Vị trí xe di chuyển trên map (C-04) - cập nhật mượt, KHÔNG thêm dòng timeline
    if (msg.type === 'ambulance_position') {
      const amb = get().ambulance || {};
      set({
        ambulance: {
          ...amb,
          coords: { latitude: msg.latitude, longitude: msg.longitude },
          etaMinutes: msg.eta_minutes ?? amb.etaMinutes ?? null,
          distanceKm: msg.distance_km ?? amb.distanceKm ?? null,
        },
      });
      return;
    }
    if (msg.type !== 'trip_status') return;

    // Gom field xe/tài xế từ event (AMBULANCE_ASSIGNED / DRIVER_EN_ROUTE / TRANSPORTING)
    const amb = { ...(get().ambulance || {}) };
    let ambChanged = false;
    if (msg.ambulance_id && msg.ambulance_id !== amb.id) { amb.id = msg.ambulance_id; ambChanged = true; }
    if (msg.plate_number) { amb.plate = msg.plate_number; ambChanged = true; }
    if (msg.driver_name) { amb.driver = msg.driver_name; ambChanged = true; }
    if (msg.driver_rating) { amb.rating = msg.driver_rating; ambChanged = true; }
    if (msg.score) { amb.score = msg.score; ambChanged = true; }
    if (msg.eta_minutes != null) { amb.etaMinutes = msg.eta_minutes; ambChanged = true; }
    if (msg.distance_km != null) { amb.distanceKm = msg.distance_km; ambChanged = true; }
    if (Array.isArray(msg.route) && msg.route.length) {
      amb.coords = msg.route[0]; // xe đứng ở đầu tuyến khi vừa nhận tuyến mới
      ambChanged = true;
    } else if (msg.status === 'ARRIVED_ON_SCENE' || msg.status === 'TRANSPORTING') {
      amb.coords = { latitude: emergency.latitude, longitude: emergency.longitude };
      ambChanged = true;
    }

    const entry = {
      status: msg.status,
      at: msg.timestamp || new Date().toISOString(),
      plate: msg.plate_number || null,
      eta: msg.eta_minutes ?? null,
      hospital: msg.hospital || null,
    };

    const patch = {
      timeline: [...timeline, entry],
      emergency: { ...emergency, status: msg.status },
    };
    if (ambChanged) patch.ambulance = amb;
    if (msg.hospital) patch.hospital = { ...(get().hospital || {}), name: msg.hospital };
    if (Array.isArray(msg.route) && msg.route.length) patch.route = msg.route;
    if (msg.total_distance_km != null) patch.tripDistanceKm = msg.total_distance_km;
    set(patch);
  },

  /** Xóa tình huống sau khi kết thúc (C-05 "Về trang chủ") / đăng xuất. */
  clear: () => {
    mockEngine.cancelTrip();
    set({ emergency: null, timeline: [], ...emptyTrip() });
  },
}));
