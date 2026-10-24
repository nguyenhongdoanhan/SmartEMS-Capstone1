/**
 * Store xác thực (zustand) - giữ phiên đăng nhập qua AsyncStorage để không phải login lại.
 * Có currentRole để hỗ trợ 1-app-2-vai: 'caller' | 'driver' (persist theo thiết bị).
 */
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, setAuthToken } from '../services';

const TOKEN_KEY = '@smartems/token';
const USER_KEY = '@smartems/user';
const ROLE_KEY = '@smartems/role';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  currentRole: null, // 'caller' | 'driver' - quyết định AppNavigator render CallerTabs hay DriverStack
  loading: false,
  error: null,
  ready: false, // đã khôi phục phiên xong chưa (để hiện splash thay vì nhấp nháy màn Login)

  /** Gọi 1 lần lúc khởi động app - khôi phục phiên đăng nhập cũ (nếu có). */
  init: async () => {
    try {
      const [token, user, role] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(USER_KEY),
        AsyncStorage.getItem(ROLE_KEY),
      ]);
      if (token) {
        setAuthToken(token);
        set({ token, user: user ? JSON.parse(user) : null, currentRole: role || 'caller' });
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
      // TODO(Giai đoạn 2): sau login chuyển sang màn Chọn vai trò (M-05) thay vì mặc định caller.
      const role = (await AsyncStorage.getItem(ROLE_KEY)) || 'caller';
      await AsyncStorage.multiSet([
        [TOKEN_KEY, token.access_token],
        [USER_KEY, JSON.stringify(user)],
        [ROLE_KEY, role],
      ]);
      set({ token: token.access_token, user, currentRole: role, loading: false });
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

  /** Đổi vai trò hiện tại ('caller' | 'driver') - persist theo thiết bị. */
  setRole: async (role) => {
    try {
      await AsyncStorage.setItem(ROLE_KEY, role);
    } catch (err) {
      // lỗi storage không chặn đổi vai trò trong phiên
    }
    set({ currentRole: role });
  },

  logout: async () => {
    try {
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY, ROLE_KEY]);
    } catch (err) {
      // bỏ qua lỗi storage khi logout
    }
    setAuthToken(null);
    set({ user: null, token: null, currentRole: null, error: null });
  },

  clearError: () => set({ error: null }),
}));
