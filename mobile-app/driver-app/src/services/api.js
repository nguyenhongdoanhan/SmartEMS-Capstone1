// TODO: fetch wrapper (same shape as dispatcher-web/src/services/api.js) + WebSocket client
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from '../config/env';

const TOKEN_KEY = 'driver_token';
let authToken = null;

export async function setAuthToken(token) {
  authToken = token;
  if (token) await AsyncStorage.setItem(TOKEN_KEY, token);
  else await AsyncStorage.removeItem(TOKEN_KEY);
}

export async function loadAuthToken() {
  authToken = await AsyncStorage.getItem(TOKEN_KEY);
  return authToken;
}

export class ApiError extends Error {
  constructor(status, message) {
    super(message || `Lỗi máy chủ (HTTP ${status})`);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function readDetail(res) {
  try {
    const j = await res.json();
    return typeof j.detail === 'string' ? j.detail : '';
  } catch {
    return '';
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
  if (!res.ok) throw new ApiError(res.status, await readDetail(res));
  return res.status === 204 ? null : res.json();
}

export const authApi = {
  // Backend dùng OAuth2PasswordRequestForm => form-encoded, không phải JSON.
  login: async (email, password) => {
    const body = `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
    const res = await fetch(`${ENV.API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    if (!res.ok) {
      throw new ApiError(res.status, (await readDetail(res)) || 'Email hoặc mật khẩu không đúng');
    }
    return res.json(); // { access_token, token_type }
  },
  me: () => request('/auth/me'),
};

export const dispatchApi = {
  accept: (dispatchId) => request(`/dispatch/${dispatchId}/accept`, { method: 'POST' }),
  reject: (dispatchId) => request(`/dispatch/${dispatchId}/reject`, { method: 'POST' }),
  // status: ON_SCENE | TRANSPORTING | AT_HOSPITAL | RETURNING | AVAILABLE
  setTripStatus: (tripId, status) =>
    request(`/dispatch/trips/${tripId}/status`, { method: 'PATCH', body: { status } }),
};

export const ambulanceApi = {
  postLocation: (ambulanceId, data) =>
    request(`/ambulances/${ambulanceId}/location`, { method: 'POST', body: data }),
};