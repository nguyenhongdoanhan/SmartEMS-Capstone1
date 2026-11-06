/**
 * CỔNG RA DUY NHẤT của tầng dữ liệu.
 * Store/UI chỉ import từ đây, không import trực tiếp api.js hay mockApi.js.
 * Khi chuyển giữa demo (mock) và backend thật, chỉ cần đổi EXPO_PUBLIC_MOCK_MODE trong .env.
 */
import { ENV } from '../config/env';
import * as real from './api';
import * as mock from './mock/mockApi';

const impl = ENV.MOCK_MODE ? mock : real;

export const authApi = impl.authApi;
export const emergencyApi = impl.emergencyApi;
export const hospitalsApi = impl.hospitalsApi;

// Token chỉ có ý nghĩa với backend thật; mock bỏ qua nhưng vẫn an toàn khi gọi.
export const setAuthToken = real.setAuthToken;
