/**
 * Store ca trực tài xế (driver) - D-01 + toàn bộ vòng đời ca GĐ2/GĐ3 (D-02 -> D-07).
 * - Công tắc "TRẠNG THÁI TRỰC" là gate của GPS stream THẬT (expo-location
 *   watchPositionAsync 3 giây/lần - đúng mockup "GPS cập nhật 3 giây/lần").
 *   Bật trực = mở stream, tắt trực = đóng stream ngay.
 * - Mỗi vị trí mới cập nhật lastPosition + packets (đếm bản tin "đã gửi").
 *   MOCK_MODE chỉ đếm trong store; khi backend dispatch xong, sẽ nối
 *   POST /ambulances/{id}/location tại điểm đánh dấu (gap D4/D5 trong
 *   design/driver-design-analysis.md).
 * - FSM ca: DISPATCH_PENDING -> DRIVER_ACCEPTED -> DRIVER_EN_ROUTE ->
 *   ARRIVED_ON_SCENE (D-04 triage) -> TRANSPORTING (D-05) -> AT_HOSPITAL
 *   (D-06 bàn giao) -> RETURNING (D-07 về trạm, có thể bị tái điều động).
 * - MOCK_MODE scheduler: sinh ca sau khi bật trực (gap D1) + đề xuất tái
 *   điều động 6-10s sau khi vào RETURNING (gap D1 - event thật là WS
 *   RETURNING_TRIP_REASSIGNED).
 * - KHÔNG persist onDuty/case: subscription GPS sống trong phiên app. Mở lại
 *   app luôn OFF cho an toàn - tránh stream ngầm chạy mà tài xế không biết.
 * - Xe / trạm là mock (backend chưa có bảng assignment - gap D6): AMB-07 gán
 *   cố định cho demo. Riêng THỐNG KÊ (ca/km/giờ trực) từ GĐ4 là SỐ THẬT:
 *   chuyến hoàn tất lưu store/driverHistory (AsyncStorage, gap D9), km tích lũy
 *   theo từng bản tin GPS của chuyến đang chạy (tripKm), giờ trực tính từ
 *   onDutySince.
 */
import { create } from 'zustand';
import * as Location from 'expo-location';

import { ENV } from '../config/env';
import { DRIVER_CASE_STATUS } from '../constants/driverTrip';
import { generateDispatch, generateReassignment } from '../services/mock/mockDriverApi';
import { haversineKm } from '../utils/geo';
import { archiveDriverTrip } from './driverHistory';

/** Xe của tài xế trong phiên demo (mock - gap D6: backend chưa có gán xe). */
export const DRIVER_VEHICLE = {
  code: 'AMB-07',
  plate: '51K-234.56',
  type: 'Xe cấp cứu Loại A',
};

/** Trạm trực (mock) - coords trùng FALLBACK_ANCHOR của mockDriverApi (Sơn Trà). */
export const DRIVER_STATION = {
  id: 'S1',
  name: 'Trạm S1 Sơn Trà',
  coords: { latitude: 16.0785, longitude: 108.2467 },
};

/** Các pha mà GPS được tính vào km CHUYẾN đang chạy (nhận ca -> bàn giao xong).
 *  Sau completeHandover xe rỗng (RETURNING) nên km không thuộc chuyến nào. */
const TRIP_KM_STATUSES = [
  DRIVER_CASE_STATUS.DRIVER_ACCEPTED,
  DRIVER_CASE_STATUS.DRIVER_EN_ROUTE,
  DRIVER_CASE_STATUS.ARRIVED_ON_SCENE,
  DRIVER_CASE_STATUS.TRANSPORTING,
  DRIVER_CASE_STATUS.AT_HOSPITAL,
];

/** Chu kỳ GPS stream khi đang trực (ms) - đúng đặc tả 3 giây/lần. */
export const GPS_INTERVAL_MS = 3000;

// ===== Nhịp sinh ca mock (ms) - chỉnh cho demo nhanh/chậm =====
const FIRST_DISPATCH_MS = [8000, 15000]; // sau khi bật trực: 8-15s
const NEXT_AFTER_DECLINE_MS = 20000; // từ chối xong, chờ hơi lâu cho tài xế kịp đọc D-01
const NEXT_AFTER_CASE_MS = 12000; // kết thúc 1 chuyến -> ca kế tiếp
const REASSIGN_AFTER_RETURNING_MS = [6000, 10000]; // vào RETURNING -> đề xuất tái điều động
const REASSIGN_AFTER_DECLINE_MS = 20000; // từ chối tái điều động -> hẹn lại (demo)

// Subscription watchPositionAsync sống ngoài state (object EventSubscription,
// không cần render lại khi đổi).
let watchSub = null;
// Timer sinh ca mock tiếp theo (module-level như watchSub).
let dispatchTimer = null;
// Timer đề xuất tái điều động trên tuyến RETURNING (D-07).
let reassignTimer = null;

function teardownWatch() {
  if (watchSub) {
    watchSub.remove();
    watchSub = null;
  }
}

function teardownTimers() {
  clearTimeout(dispatchTimer);
  clearTimeout(reassignTimer);
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
  /** Phiếu triage D-04 (gửi kèm khi bắt đầu vận chuyển): level + vitals + AVPU + note. */
  triage: null,
  /** Giờ tới hiện trường (D-04 chạy đồng hồ "tại hiện trường"). */
  onSceneAt: null,
  /** Giờ tới bệnh viện (D-06 hiển thị "khoa cấp cứu tiếp nhận HH:MM"). */
  hospitalArrivedAt: null,
  /** Ca đề xuất TÁI ĐIỀU ĐỘNG khi đang RETURNING (D-07 popup) - không đè caseData. */
  reassignmentCase: null,
  /** Giờ bấm CHẤP NHẬN ca hiện tại (D-08 tính "Phản hồi Xm'Ys" tới hiện trường). */
  acceptedAt: null,
  /** Km GPS tích lũy của CHUYẾN đang chạy (D-01 "km hôm nay" + D-08 quãng đường). */
  tripKm: 0,

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
          const { lastPosition: prev, caseStatus } = get();
          // GĐ4: tích lũy km chuyến đang chạy = haversine 2 bản tin liền nhau.
          // Lọc nhiễu: < 10 m coi như đứng yên (GPS jitter), > 120 m trong 3s
          // (= 144 km/h) coi là bước nhảy GPS - cả hai đều không cộng.
          let { tripKm } = get();
          if (prev && TRIP_KM_STATUSES.includes(caseStatus)) {
            const d = haversineKm(prev, { latitude, longitude });
            if (d != null && d >= 0.01 && d <= 0.12) tripKm += d;
          }
          set((s) => ({
            lastPosition: { latitude, longitude, accuracy, at: Date.now() },
            packets: s.packets + 1,
            tripKm,
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
    teardownTimers();
    set({
      onDuty: false,
      caseData: null,
      caseStatus: null,
      triage: null,
      reassignmentCase: null,
      acceptedAt: null,
      tripKm: 0,
    });
  },

  // ===== Ca hiện tại (FSM driverTrip) =====

  /** Nhận đề xuất điều động (từ mock scheduler, sau này là WS backend). */
  receiveDispatch: (caseData) =>
    set({ caseData, caseStatus: DRIVER_CASE_STATUS.DISPATCH_PENDING, triage: null, acceptedAt: null, tripKm: 0 }),

  /** D-02 bấm CHẤP NHẬN (hoặc hết 12s xem như từ chối - FE tự chốt). */
  acceptDispatch: () => {
    if (get().caseStatus !== DRIVER_CASE_STATUS.DISPATCH_PENDING) return;
    set({ caseStatus: DRIVER_CASE_STATUS.DRIVER_ACCEPTED, acceptedAt: Date.now() });
  },

  /** Vào D-03 bắt đầu chạy tới hiện trường. */
  markEnRoute: () => {
    if (get().caseStatus !== DRIVER_CASE_STATUS.DRIVER_ACCEPTED) return;
    set({ caseStatus: DRIVER_CASE_STATUS.DRIVER_EN_ROUTE });
  },

  /** D-03 bấm ĐÃ ĐẾN HIỆN TRƯỜNG -> D-04 (ghi giờ đến để chạy đồng hồ tại hiện trường). */
  arrivedOnScene: () => {
    const s = get().caseStatus;
    if (s !== DRIVER_CASE_STATUS.DRIVER_EN_ROUTE && s !== DRIVER_CASE_STATUS.DRIVER_ACCEPTED) return;
    set({ caseStatus: DRIVER_CASE_STATUS.ARRIVED_ON_SCENE, onSceneAt: Date.now() });
  },

  /**
   * D-04 bấm VẬN CHUYỂN BỆNH NHÂN: lưu phiếu triage + chuyển TRANSPORTING.
   * GĐ3 marker (gap D3): !MOCK_MODE -> POST phiếu triage trước cho BV đích
   * (caseData.hospital) để khoa cấp cứu chuẩn bị tiếp nhận.
   */
  startTransport: (triage) => {
    if (get().caseStatus !== DRIVER_CASE_STATUS.ARRIVED_ON_SCENE) return;
    set({ caseStatus: DRIVER_CASE_STATUS.TRANSPORTING, triage: { ...triage, sentAt: Date.now() } });
  },

  /** D-05 bấm ĐÃ ĐẾN BỆNH VIỆN (ghi giờ đến cho D-06 hiển thị giờ tiếp nhận). */
  arriveAtHospital: () => {
    if (get().caseStatus !== DRIVER_CASE_STATUS.TRANSPORTING) return;
    set({ caseStatus: DRIVER_CASE_STATUS.AT_HOSPITAL, hospitalArrivedAt: Date.now() });
  },

  /**
   * D-06 bấm HOÀN TẤT BÀN GIAO: chuyến đi khép (backend phát TRIP_COMPLETED
   * cho emergency + RETURNING cho ambulance) -> xe rỗng về trạm, D-07 lo nốt.
   * MOCK_MODE: hẹn đề xuất tái điều động 6-10s sau (gap D1).
   */
  completeHandover: () => {
    const s = get();
    if (s.caseStatus !== DRIVER_CASE_STATUS.AT_HOSPITAL) return;
    // GĐ4: bàn giao xong = TRIP_COMPLETED của ca này -> ghi lịch sử ca trực
    // (D-08) TRƯỚC khi xe chuyển RETURNING. Nếu ngay sau đó bị tái điều động
    // (acceptReassignment đè ca mới) thì chuyến cũ vẫn đã ghi đủ.
    const c = s.caseData;
    if (c) {
      archiveDriverTrip({
        id: c.id,
        code: c.code,
        shortAddress: c.shortAddress || c.address || '',
        priority: c.priority,
        acceptedAt: s.acceptedAt,
        onSceneAt: s.onSceneAt,
        completedAt: Date.now(),
        responseSec:
          s.acceptedAt && s.onSceneAt ? Math.max(0, Math.round((s.onSceneAt - s.acceptedAt) / 1000)) : null,
        hospitalName: c.hospital?.name || null,
        triageLevel: s.triage?.level || null,
        reassigned: c.reassigned === true, // nhận trên tuyến về trạm (D-07)
        km: Math.round((s.tripKm || 0) * 10) / 10,
      });
    }
    set({ caseStatus: DRIVER_CASE_STATUS.RETURNING, acceptedAt: null, tripKm: 0 });
    get().scheduleReassignment(REASSIGN_AFTER_RETURNING_MS);
  },

  /** D-07 popup bấm CHẤP NHẬN CA MỚI: nhận thẳng ca tái điều động (không đếm
   *  ngược lại - tài xế đã chủ động xác nhận) -> quay lại D-03 với ca mới. */
  acceptReassignment: (newCase) => {
    if (get().caseStatus !== DRIVER_CASE_STATUS.RETURNING) return;
    set({
      caseData: newCase,
      caseStatus: DRIVER_CASE_STATUS.DRIVER_ACCEPTED,
      triage: null,
      reassignmentCase: null,
      onSceneAt: null,
      hospitalArrivedAt: null,
      acceptedAt: Date.now(), // km + "Phản hồi" của CHUYẾN MỚI tính từ đây
      tripKm: 0,
    });
  },

  /** D-07 popup bấm TIẾP TỤC VỀ TRẠM: bỏ qua đề xuất này, mock hẹn lại sau. */
  declineReassignment: () => {
    set({ reassignmentCase: null });
    get().scheduleReassignment([REASSIGN_AFTER_DECLINE_MS, REASSIGN_AFTER_DECLINE_MS]);
  },

  /** D-07 bấm ĐÃ VỀ TRẠM: kết thúc hẳn ca hiện tại (TRIP_COMPLETED) - GĐ4
   *  sẽ ghi chuyến vào lịch sử; mock hẹn ca kế tiếp như clearCase. */
  arriveStation: () => {
    if (get().caseStatus !== DRIVER_CASE_STATUS.RETURNING) return;
    get().clearCase();
  },

  /** Từ chối ca (nút bấm hoặc hết 12s) - ghi nhận rồi chờ ca khác. */
  declineDispatch: () => {
    set({ caseData: null, caseStatus: null, acceptedAt: null, tripKm: 0 });
    get().scheduleNextDispatch([NEXT_AFTER_DECLINE_MS, NEXT_AFTER_DECLINE_MS]);
  },

  /** Dọn ca sau khi kết thúc luồng - mock hẹn ca kế tiếp. */
  clearCase: () => {
    clearTimeout(reassignTimer);
    set({
      caseData: null,
      caseStatus: null,
      triage: null,
      reassignmentCase: null,
      onSceneAt: null,
      hospitalArrivedAt: null,
      acceptedAt: null,
      tripKm: 0,
    });
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

  /**
   * Hẹn đề xuất TÁI ĐIỀU ĐỘNG khi đang RETURNING (D-07 - gap D1: backend thật
   * đẩy WS RETURNING_TRIP_REASSIGNED). Ca mới sinh GẦN VỊ TRÍ GPS THẬT lúc đó.
   */
  scheduleReassignment: (rangeMs) => {
    clearTimeout(reassignTimer);
    if (!ENV.MOCK_MODE) return;
    const [minMs, maxMs] = rangeMs;
    const delay = minMs + Math.random() * (maxMs - minMs);
    reassignTimer = setTimeout(() => {
      const { onDuty, caseStatus, reassignmentCase } = useDriverShiftStore.getState();
      if (!onDuty || caseStatus !== DRIVER_CASE_STATUS.RETURNING || reassignmentCase) return;
      const newCase = generateReassignment(useDriverShiftStore.getState().lastPosition);
      set({ reassignmentCase: newCase });
    }, delay);
  },
}));
