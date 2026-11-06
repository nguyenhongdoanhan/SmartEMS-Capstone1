/**
 * Cấu hình môi trường cho caller-app.
 * Expo tự động expose biến EXPO_PUBLIC_* từ file .env vào process.env lúc build.
 * Muốn đổi giá trị: sửa caller-app/.env (KHÔNG commit file .env), đừng sửa file này.
 */
export const ENV = {
  /** Địa chỉ REST API của backend FastAPI. 10.0.2.2 = localhost máy tính (Android emulator). */
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000/api/v1',

  /** Endpoint WebSocket realtime của backend. */
  WS_URL: process.env.EXPO_PUBLIC_WS_URL || 'ws://10.0.2.2:8000/ws',

  /** Google Maps API key (dùng khi build app thật trên Android; Expo Go vẫn chạy được khi trống). */
  GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '',

  /** true = chạy bằng dữ liệu giả lập (demo không cần backend). Mặc định true cho an toàn. */
  MOCK_MODE: (process.env.EXPO_PUBLIC_MOCK_MODE ?? 'true') !== 'false',
};
