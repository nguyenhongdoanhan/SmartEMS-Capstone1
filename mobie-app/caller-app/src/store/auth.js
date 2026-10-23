/**
 * Store xác thực (zustand) - giữ phiên đăng nhập qua AsyncStorage để không phải login lại.
 */
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, setAuthToken } from '../services';

const TOKEN_KEY = '@smartems/token';
const USER_KEY = '@smartems/user';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  loading: false,
  error: null,
  ready: false, // đã khôi phục phiên xong chưa (để hiện splash thay vì nhấp nháy màn Login)

  /** Gọi 1 lần lúc khởi động app - khôi phục phiên đăng nhập cũ (nếu có). */
  init: async () => {
    try {
      const [token, user] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(USER_KEY),
      ]);
      if (token) {
        setAuthToken(token);
        set({ token, user: user ? JSON.parse(user) : null });
      }
    } catch (err) {
      // AsyncStorage lỗi (hiếm) - coi như chưa đăng nhập
    }
    set({ ready: true });
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const token = await authApi.login(email, password);
      setAuthToken(token.access_token);
      const user = await authApi.me();
      await AsyncStorage.multiSet([
        [TOKEN_KEY, token.access_token],
        [USER_KEY, JSON.stringify(user)],
      ]);
      set({ token: token.access_token, user, loading: false });
      return user;
    } catch (err) {
      set({ loading: false, error: err.message || 'Đăng nhập thất bại' });
      throw err;
    }
  },

  /** Đăng ký tài khoản caller mới xong tự đăng nhập luôn. */
  register: async (data) => {
    set({ loading: true, error: null });
    try {
      await authApi.register(data);
      await get().login(data.email, data.password);
    } catch (err) {
      set({ loading: false, error: err.message || 'Đăng ký thất bại' });
      throw err;
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    } catch (err) {
      // bỏ qua lỗi storage khi logout
    }
    setAuthToken(null);
    set({ user: null, token: null, error: null });
  },

  clearError: () => set({ error: null }),
}));
