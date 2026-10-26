/**
 * Store ca trực tài xế (driver) - D-01.
 * - Công tắc "TRẠNG THÁI TRỰC" là gate của GPS stream THẬT (expo-location
 *   watchPositionAsync 3 giây/lần - đúng mockup "GPS cập nhật 3 giây/lần").
 *   Bật trực = mở stream, tắt trực = đóng stream ngay.
 * - Mỗi vị trí mới cập nhật lastPosition + packets (đếm bản tin "đã gửi").
 *   MOCK_MODE chỉ đếm trong store; khi backend dispatch xong, GĐ3 sẽ nối
 *   POST /ambulances/{id}/location tại điểm đánh dấu (gap D4/D5 trong
 *   design/driver-design-analysis.md).
 * - KHÔNG persist onDuty: subscription GPS sống trong phiên app. Mở lại app
 *   luôn OFF cho an toàn - tránh stream ngầm chạy mà tài xế không biết.
 * - Xe / trạm / thống kê 3 ô là mock (backend chưa có bảng assignment và
 *   shift endpoints - gap D6/D7): AMB-07 gán cố định cho demo.
 */
import { create } from 'zustand';
import * as Location from 'expo-location';

/** Xe của tài xế trong phiên demo (mock - gap D6: backend chưa có gán xe). */
export const DRIVER_VEHICLE = {
  code: 'AMB-07',
  plate: '51K-234.56',
  type: 'Xe cấp cứu Loại A',
};

/** Trạm trực (mock). */
export const DRIVER_STATION = {
  id: 'S1',
  name: 'Trạm S1 Sơn Trà',
};

/** Thống kê 3 ô của D-01 (mock - GĐ4 nối shift data thật, gap D7). */
export const SHIFT_STATS_MOCK = {
  tripsToday: 3, // "3 ca đã chạy"
  kmToday: 62, // "62 km hôm nay"
  dutyHoursLabel: '4h30', // "4h30 giờ trực"
};

/** Chu kỳ GPS stream khi đang trực (ms) - đúng đặc tả 3 giây/lần. */
export const GPS_INTERVAL_MS = 3000;

// Subscription watchPositionAsync sống ngoài state (object EventSubscription,
// không cần render lại khi đổi).
let watchSub = null;

function teardownWatch() {
  if (watchSub) {
    watchSub.remove();
    watchSub = null;
  }
}

export const useDriverShiftStore = create((set, get) => ({
  onDuty: false,
  onDutySince: null, // timestamp bật trực (GĐ4 tính "giờ trực" thật)
  lastPosition: null, // { latitude, longitude, accuracy, at } - bản tin GPS cuối
  packets: 0, // số bản tin GPS "đã gửi" trong phiên trực hiện tại
  gpsError: null, // 'permission' | 'error' | null

  /**
   * Bật ca trực: xin quyền vị trí rồi mở GPS stream 3s/lần.
   * @returns {Promise<boolean>} true nếu bật thành công.
   */
  startDuty: async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== Location.PermissionStatus.GRANTED) {
        set({ gpsError: 'permission' });
        return false;
      }

      // Phòng double-tap: đóng stream cũ (nếu có) trước khi mở mới.
      teardownWatch();

      watchSub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: GPS_INTERVAL_MS },
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          set((s) => ({
            lastPosition: { latitude, longitude, accuracy, at: Date.now() },
            packets: s.packets + 1,
            gpsError: null, // nhận được bản tin = stream đang khỏe
          }));
          // GĐ3 (gap D4): !MOCK_MODE -> POST /ambulances/{id}/location
          // với DRIVER_VEHICLE.code ở đây (cần service driverApi riêng).
        },
      );

      set({ onDuty: true, onDutySince: Date.now(), gpsError: null, packets: 0 });
      return true;
    } catch (err) {
      // Thiết bị không có GPS / lỗi hệ thống - hiển thị cảnh báo ở D-01.
      set({ gpsError: 'error' });
      return false;
    }
  },

  /** Tắt ca trực: đóng GPS stream ngay (giữ lastPosition để hiện lần cuối). */
  stopDuty: () => {
    teardownWatch();
    set({ onDuty: false });
  },
}));
