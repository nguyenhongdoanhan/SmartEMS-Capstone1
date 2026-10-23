/**
 * Bộ GIẢ LẬP API - cùng interface với services/api.js, dùng khi MOCK_MODE=true.
 * Cho phép demo app chạy đủ luồng (đăng nhập -> SOS -> theo dõi realtime) mà KHÔNG cần backend.
 * Response shape bám đúng backend:
 *   Token { access_token, token_type } | UserOut { id, email, full_name, role }
 *   EmergencyOut { id, status: 'CREATED', priority: 2, description, latitude, longitude, created_at }
 */
import { mockEngine } from './mockEngine';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let nextEmergencyId = 1;
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
      priority: 2, // giống default của model Emergency bên backend (1 critical ... 3 low)
      description: data.description || null,
      latitude: data.latitude,
      longitude: data.longitude,
      created_at: new Date().toISOString(),
    };
    // Kích hoạt luồng event realtime mô phỏng (xem mockEngine.TIMELINE)
    mockEngine.startTrip(emergency.id);
    return emergency;
  },
};
