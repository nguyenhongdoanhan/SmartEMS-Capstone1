/**
 * Store xác thực (zustand) - giữ phiên đăng nhập qua AsyncStorage để không phải login lại.
 * currentRole: 'caller' | 'driver' | null (persist theo thiết bị) - null nghĩa là
 * người dùng chưa chọn vai trò -> AppNavigator hiện M-05 Chọn vai trò (Giai đoạn 2).
 * onboarded: đã xem onboarding lần đầu chưa -> không hiện lại (logout không reset).
 *
 * Lưu ý email ẩn: backend chỉ hiểu email (OAuth2) - FE tự sinh từ SĐT qua
 * emailFromPhone(), user không bao giờ nhìn thấy khái niệm email trong app.
 */
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, setAuthToken } from '../services';

const TOKEN_KEY = '@smartems/token';
const USER_KEY = '@smartems/user';
const ROLE_KEY = '@smartems/role';
const ONBOARDED_KEY = '@smartems/onboarded';

/** Sinh email nội bộ từ SĐT để khớp backend (user chốt: user không bao giờ thấy email). */
export const emailFromPhone = (phone) => `${phone}@caller.smartems.app`;

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  currentRole: null, // 'caller' | 'driver' | null - null -> hiện M-05
  onboarded: false, // đã xem onboarding chưa
  loading: false,
  error: null,
  ready: false, // đã khôi phục phiên xong chưa (để hiện splash thay vì nhấp nháy màn Login)

  /** Gọi 1 lần lúc khởi động app - khôi phục phiên đăng nhập cũ (nếu có). */
  init: async () => {
    try {
      const [token, user, role, onboarded] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(USER_KEY),
        AsyncStorage.getItem(ROLE_KEY),
        AsyncStorage.getItem(ONBOARDED_KEY),
      ]);
      const patch = { onboarded: onboarded === 'true' };
      if (token) {
        setAuthToken(token);
        patch.token = token;
        patch.user = user ? JSON.parse(user) : null;
        patch.currentRole = role; // null nếu chưa chọn -> hiện M-05 (không default caller nữa)
      }
      set(patch);
    } catch (err) {
      // AsyncStorage lỗi (hiếm) - coi như chưa đăng nhập
    }
    set({ ready: true });
  },

  /** Đăng nhập bằng SĐT + mật khẩu (M-03). Store tự map SĐT -> email nội bộ. */
  login: async (phone, password) => {
    set({ loading: true, error: null });
    try {
      const token = await authApi.login(emailFromPhone(phone), password);
      setAuthToken(token.access_token);
      const user = await authApi.me();
      // Giữ vai trò đã chọn trước đó (nếu có) - chưa từng chọn thì để null -> hiện M-05
      const role = await AsyncStorage.getItem(ROLE_KEY);
      const persist = [
        [TOKEN_KEY, token.access_token],
        [USER_KEY, JSON.stringify(user)],
      ];
      if (role) persist.push([ROLE_KEY, role]);
      await AsyncStorage.multiSet(persist);
      set({ token: token.access_token, user, currentRole: role, loading: false });
      return user;
    } catch (err) {
      set({ loading: false, error: err.message || 'Đăng nhập thất bại' });
      throw err;
    }
  },

  /**
   * Đăng ký 3 bước xong gọi (RegisterProfile): sinh email ẩn từ SĐT, tạo tài khoản
   * backend (UserCreate: email/full_name/password/phone) rồi TỰ ĐĂNG NHẬP luôn.
   * Thành công -> token vào store, currentRole null -> AppNavigator hiện M-05.
   */
  register: async ({ phone, fullName, password }) => {
    set({ loading: true, error: null });
    try {
      await authApi.register({
        email: emailFromPhone(phone),
        full_name: fullName,
        password,
        phone,
      });
      set({ loading: false });
      await get().login(phone, password); // auto-login
    } catch (err) {
      set({ loading: false, error: err.message || 'Đăng ký thất bại' });
      throw err;
    }
  },

  /** Đã xem onboarding -> không hiện lại cho các lần mở app sau (kể cả sau logout). */
  completeOnboarding: async () => {
    try {
      await AsyncStorage.setItem(ONBOARDED_KEY, 'true');
    } catch (err) {
      // lỗi storage không chặn flow
    }
    set({ onboarded: true });
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
      // Không xóa ONBOARDED_KEY - onboarding chỉ hiện đúng 1 lần trọn đời cài app
    } catch (err) {
      // bỏ qua lỗi storage khi logout
    }
    setAuthToken(null);
    set({ user: null, token: null, currentRole: null, error: null });
  },

  clearError: () => set({ error: null }),
}));
