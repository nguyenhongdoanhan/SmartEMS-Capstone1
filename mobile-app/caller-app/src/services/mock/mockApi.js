/**
 * Bộ GIẢ LẬP API - cùng interface với services/api.js, dùng khi MOCK_MODE=true.
 * Cho phép demo app chạy đủ luồng (đăng nhập -> SOS -> theo dõi realtime) mà KHÔNG cần backend.
 * Response shape bám đúng backend:
 *   Token { access_token, token_type } | UserOut { id, email, full_name, role }
 *   EmergencyOut { id, status: 'CREATED', priority: 2, description, latitude, longitude, created_at }
 *
 * Field FE tự bổ sung (backend chưa có - nằm trong Backend TODO list):
 *   priority (mức độ khẩn cấp 1|2|3), address (text), medical profile gộp payload (GĐ4).
 */
import { mockEngine } from './mockEngine';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let nextEmergencyId = 31; // khớp mã demo "EMG-0031" trong tài liệu thiết kế
let mockUser = {
  id: 1,
  email: 'demo@smartems.vn',
  full_name: 'Người dùng SmartEMS',
  role: 'caller',
};

export const authApi = {
  async login(email, password) {
    await delay(600);
    if (!email || !password) {
      throw new Error('Vui lòng nhập email và mật khẩu');
    }
    mockUser = { ...mockUser, email, full_name: mockUser.full_name || 'Người dùng SmartEMS' };
    return { access_token: 'mock-jwt-token', token_type: 'bearer' };
  },

  async register(data) {
    await delay(600);
    if (!data.email || !data.password || !data.full_name) {
      throw new Error('Vui lòng điền đủ họ tên, email và mật khẩu');
    }
    mockUser = { id: mockUser.id, email: data.email, full_name: data.full_name, role: 'caller' };
    return { ...mockUser };
  },

  async me() {
    await delay(250);
    return { ...mockUser };
  },
};

export const emergencyApi = {
  async createSOS(data) {
    await delay(700);
    const emergency = {
      id: nextEmergencyId++,
      status: 'CREATED',
      priority: data.priority || 2, // giống default của model Emergency bên backend (1 critical ... 3 low)
      description: data.description || null,
      address: data.address || null, // FE tự reverse geocode, backend chưa lưu (TODO #10)
      latitude: data.latitude,
      longitude: data.longitude,
      created_at: new Date().toISOString(),
    };
    // Kích hoạt luồng event realtime mô phỏng, truyền tọa độ hiện trường
    // để engine sinh tuyến đường + vị trí xe di chuyển trên map (C-04).
    mockEngine.startTrip(emergency.id, {
      latitude: data.latitude,
      longitude: data.longitude,
    });
    return emergency;
  },

  /** Đánh giá 5 sao sau ca cứu hộ (C-05). Backend chưa có bảng ratings (TODO #8). */
  async rateTrip(emergencyId, stars, note) {
    await delay(400);
    return { ok: true, emergency_id: emergencyId, stars, note: note || null };
  },

  /** Hủy yêu cầu đang ghép xe (C-03). Backend chưa có DELETE /emergencies (TODO). */
  async cancelSOS(emergencyId) {
    await delay(300);
    mockEngine.cancelTrip();
    return { ok: true, emergency_id: emergencyId };
  },
};

/** Bệnh viện gần nhất (C-01 quick card). Backend /hospitals đang là stub (TODO #9). */
export const hospitalsApi = {
  async nearby({ latitude, longitude } = {}) {
    await delay(350);
    return [
      { id: 1, name: 'BV Đa khoa Đà Nẵng', address: '124 Hải Phòng, Thanh Khê', distance_km: 2.1, phone: '0236 3821 229' },
      { id: 2, name: 'BV C Đà Nẵng', address: '100 Núi Thành, Hải Châu', distance_km: 2.8, phone: '0236 3821 253' },
      { id: 3, name: 'Trung tâm Cấp cứu 115 Đà Nẵng', address: '202 Nguyễn Hữu Thọ, Cẩm Lệ', distance_km: 3.6, phone: '115' },
    ];
  },
};
