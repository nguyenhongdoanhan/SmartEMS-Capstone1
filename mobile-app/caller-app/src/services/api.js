/**
 * API client gọi backend FastAPI THẬT (chế độ MOCK_MODE=false).
 * Interface: authApi.{login, register, me}, emergencyApi.createSOS
 * - cùng interface với services/mock/mockApi.js, được chọn ở services/index.js.
 * Payload/response bám đúng schema backend (schemas/auth.py, schemas/emergency.py).
 */
import { ENV } from '../config/env';

let authToken = null;

/** Gán token sau khi đăng nhập - tự gắn header Authorization cho mọi request. */
export function setAuthToken(token) {
  authToken = token;
}

export class ApiError extends Error {
  constructor(status, message) {
    super(message || `Lỗi máy chủ (HTTP ${status})`);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${ENV.API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let detail = '';
    try {
      const j = await res.json();
      detail = typeof j.detail === 'string' ? j.detail : '';
    } catch {
      // response không phải JSON - bỏ qua
    }
    throw new ApiError(res.status, detail);
  }
  return res.status === 204 ? null : res.json();
}

export const authApi = {
  /** POST /auth/register - body JSON { email, password, full_name, phone } */
  register: (data) => request('/auth/register', { method: 'POST', body: data }),

  /** POST /auth/login - backend dùng OAuth2PasswordRequestForm => form-encoded, KHÔNG phải JSON. */
  login: async (email, password) => {
    const body = `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
    const res = await fetch(`${ENV.API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    if (!res.ok) {
      let detail = '';
      try {
        const j = await res.json();
        detail = j.detail || '';
      } catch {
        // bỏ qua
      }
      throw new ApiError(res.status, detail || 'Email hoặc mật khẩu không đúng');
    }
    return res.json(); // Token { access_token, token_type }
  },

  /** GET /auth/me - trả về UserOut { id, email, full_name, role } */
  me: () => request('/auth/me'),
};

export const emergencyApi = {
  /** POST /emergencies - body { latitude, longitude, description } -> EmergencyOut */
  createSOS: (data) => request('/emergencies', { method: 'POST', body: data }),
};
