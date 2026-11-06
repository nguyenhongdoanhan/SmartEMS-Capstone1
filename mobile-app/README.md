# SmartEMS Caller

App React Native (Expo) cho người gọi cấp cứu: đăng nhập -> gửi SOS kèm vị trí GPS -> theo dõi realtime tình trạng xe qua WebSocket -> xem hướng dẫn sơ cấp cứu offline.

## Chạy app

```bash
# 1. Cài dependencies (lần đầu)
npm install

# 2. Tạo file cấu hình từ mẫu (có sẵn .env mặc định mock mode)
cp .env.example .env

# 3. Chạy dev server, quét QR bằng app Expo Go trên điện thoại
npm start
```

## Hai chế độ dữ liệu (`.env`)

| Biến | Ý nghĩa |
|---|---|
| `EXPO_PUBLIC_MOCK_MODE=true` | Demo bằng dữ liệu giả lập - không cần backend, luồng SOS đầy đủ được mô phỏng tự động |
| `EXPO_PUBLIC_MOCK_MODE=false` | Gọi backend thật qua `EXPO_PUBLIC_API_URL` / `EXPO_PUBLIC_WS_URL` (mặc định `10.0.2.2:8000` = máy tính host, nhìn từ Android emulator) |

Chỉ cần đổi giá trị rồi restart dev server (không cần sửa code).

## Cấu trúc `src/`

```
config/env.js          - đọc biến môi trường EXPO_PUBLIC_*
theme/                 - màu, spacing, typography (tập trung 1 chỗ)
constants/trip.js      - nhãn tiếng Việt cho các trạng thái (khớp backend event_types)
services/
  api.js               - API client backend thật (REST + form-encoded login)
  mock/mockApi.js      - bộ giả lập cùng interface với api.js
  mock/mockEngine.js   - mô phỏng event WebSocket (timeline chuyến xe)
  socket.js            - WebSocket client thật / mock, cùng interface
  location.js          - GPS (expo-location)
  index.js             - CỔNG RA DUY NHẤT: chọn api.js hoặc mockApi.js theo MOCK_MODE
store/
  auth.js              - phiên đăng nhập (zustand + AsyncStorage)
  emergency.js         - emergency đang hoạt động + timeline realtime
navigation/AppNavigator.js
screens/               - Login, Home, SOS, Tracking, FirstAid
assets/firstaid/       - nội dung sơ cứu offline (JSON bundle trong app)
```

## Lưu ý kỹ thuật

- Backend `/auth/login` dùng OAuth2 form-encoded (không phải JSON) - đã xử lý trong `services/api.js`.
- Message WebSocket shape: `{"type": "trip_status", "trip_id", "status"}` - khớp `backend/app/events/`.
- Bản đồ: có `react-native-maps` sẵn trong dependencies; nhét `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` vào `.env` (và config `android.config.googleMaps.apiKey` trong `app.json`) khi cần build APK/AAB.
- Google Maps key hiện chưa có -> các màn vẫn chạy với dạng textual, sẽ lồng map khi có key + design chính thức.
