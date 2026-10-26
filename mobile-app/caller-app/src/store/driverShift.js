/**
 * Store ca trực tài xế (driver) - D-01 + luồng nhận ca GĐ2 (D-02/D-03).
 * - Công tắc "TRẠNG THÁI TRỰC" là gate của GPS stream THẬT (expo-location
 *   watchPositionAsync 3 giây/lần - đúng mockup "GPS cập nhật 3 giây/lần").
 *   Bật trực = mở stream, tắt trực = đóng stream ngay.
 * - Mỗi vị trí mới cập nhật lastPosition + packets (đếm bản tin "đã gửi").
 *   MOCK_MODE chỉ đếm trong store; khi backend dispatch xong, GĐ3 sẽ nối
 *   POST /ambulances/{id}/location tại điểm đánh dấu (gap D4/D5 trong
 *   design/driver-design-analysis.md).
 * - GĐ2: quản lý CA HIỆN TẠI (caseData + caseStatus theo FSM driverTrip).
 *   Khi MOCK_MODE, scheduler tự sinh ca điều động gần GPS thật sau khi bật
 *   trực (gap D1 - dispatch.py backend còn stub). Khi có dispatch thật: WS
 *   kênh user:{id} gọi receiveDispatch(case) - giữ nguyên phần còn lại.
 * - KHÔNG persist onDuty/case: subscription GPS sống trong phiên app. Mở lại
 *   app luôn OFF cho an toàn - tránh stream ngầm chạy mà tài xế không biết.
 * - Xe / trạm / thống kê 3 ô là mock (backend chưa có bảng assignment và
 *   shift endpoints - gap D6/D7): AMB-07 gán cố định cho demo.
 */
import { create } from 'zustand';
import * as Location from 'expo-location';

import { ENV } from '../config/env';
import { DRIVER_CASE_STATUS } from '../constants/driverTrip';
import { generateDispatch } from '../services/mock/mockDriverApi';

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

// ===== Nhịp sinh ca mock (ms) - chỉnh cho demo nhanh/chậm =====
const FIRST_DISPATCH_MS = [8000, 15000]; // sau khi bật trực: 8-15s
const NEXT_AFTER_DECLINE_MS = 20000; // từ chối xong, chờ hơi lâu cho tài xế kịp đọc D-01
const NEXT_AFTER_CASE_MS = 12000; // kết thúc 1 chuyến -> ca kế tiếp

// Subscription watchPositionAsync sống ngoài state (object EventSubscription,
// không cần render lại khi đổi).
let watchSub = null;
// Timer sinh ca mock tiếp theo (module-level như watchSub).
let dispatchTimer = null;

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

  /** Ca hiện tại: proposal D-02 (DISPATCH_PENDING) hoặc ca đang chạy. */
  caseData: null,
  /** Vị trí trong FSM - xem constants/driverTrip.js (bắt đầu bằng DISPATCH_PENDING). */
  caseStatus: null,

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
      // Bật trực = vào hàng chờ điều động -> mock sinh ca đầu tiên (gap D1).
      get().scheduleNextDispatch(FIRST_DISPATCH_MS);
      return true;
    } catch (err) {
      // Thiết bị không có GPS / lỗi hệ thống - hiển thị cảnh báo ở D-01.
      set({ gpsError: 'error' });
      return false;
    }
  },

  /** Tắt ca trực: đóng GPS stream ngay (giữ lastPosition để hiện lần cuối)
   *  và hủy luôn ca đang chạy/kế hoạch sinh ca - kết thúc phiên làm việc. */
  stopDuty: () => {
    teardownWatch();
    clearTimeout(dispatchTimer);
    set({ onDuty: false, caseData: null, caseStatus: null });
  },

  // ===== Ca hiện tại (FSM driverTrip) =====

  /** Nhận đề xuất điều động (từ mock scheduler, sau này là WS backend). */
  receiveDispatch: (caseData) => set({ caseData, caseStatus: DRIVER_CASE_STATUS.DISPATCH_PENDING }),

  /** D-02 bấm CHẤP NHẬN (hoặc hết 12s xem như từ chối - FE tự chốt). */
  acceptDispatch: () => {
    if (get().caseStatus !== DRIVER_CASE_STATUS.DISPATCH_PENDING) return;
    set({ caseStatus: DRIVER_CASE_STATUS.DRIVER_ACCEPTED });
  },

  /** Vào D-03 bắt đầu chạy tới hiện trường. */
  markEnRoute: () => {
    if (get().caseStatus !== DRIVER_CASE_STATUS.DRIVER_ACCEPTED) return;
    set({ caseStatus: DRIVER_CASE_STATUS.DRIVER_EN_ROUTE });
  },

  /** D-03 bấm ĐÃ ĐẾN HIỆN TRƯỜNG -> sang D-04 (GĐ3 làm tiếp triage). */
  arrivedOnScene: () => {
    const s = get().caseStatus;
    if (s !== DRIVER_CASE_STATUS.DRIVER_EN_ROUTE && s !== DRIVER_CASE_STATUS.DRIVER_ACCEPTED) return;
    set({ caseStatus: DRIVER_CASE_STATUS.ARRIVED_ON_SCENE });
  },

  /** Từ chối ca (nút bấm hoặc hết 12s) - ghi nhận rồi chờ ca khác. */
  declineDispatch: () => {
    set({ caseData: null, caseStatus: null });
    get().scheduleNextDispatch([NEXT_AFTER_DECLINE_MS, NEXT_AFTER_DECLINE_MS]);
  },

  /** Dọn ca sau khi kết thúc luồng (D-04 placeholder "Về ca trực"; GĐ3 gọi ở TRIP_COMPLETED). */
  clearCase: () => {
    set({ caseData: null, caseStatus: null });
    get().scheduleNextDispatch([NEXT_AFTER_CASE_MS, NEXT_AFTER_CASE_MS]);
  },

  /**
   * Hẹn sinh ca mock tiếp theo (chỉ chạy khi MOCK_MODE - backend dispatch
   * thật sẽ đẩy WS thay cho timer này). Truyền đoạn [minMs, maxMs] để random.
   */
  scheduleNextDispatch: (rangeMs) => {
    clearTimeout(dispatchTimer);
    if (!ENV.MOCK_MODE) return;
    const [minMs, maxMs] = rangeMs;
    const delay = minMs + Math.random() * (maxMs - minMs);
    dispatchTimer = setTimeout(() => {
      const { onDuty, caseData } = useDriverShiftStore.getState();
      if (!onDuty || caseData) return; // điều kiện đã đổi thì bỏ lượt này
      const nextCase = generateDispatch(useDriverShiftStore.getState().lastPosition);
      get().receiveDispatch(nextCase);
    }, delay);
  },
}));
