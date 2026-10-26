/**
 * Mock API điều động tài xế (chạy khi MOCK_MODE=true - dispatch backend còn stub, gap D1).
 * Sinh ca GIỐNG mockup D-02 để nghiệm thu: EMG-0031, CRITICAL, ngã 6 Lê Duẩn,
 * 2 nạn nhân, ghi chú "1 người bất tỉnh, chảy máu đầu".
 *
 * GĐ3 bổ sung:
 * - Mỗi ca kèm BV ĐICH (hospital) đặt ĐỐI DIỆN hiện trường qua neo GPS
 *   (khoảng cách hiện trường -> BV ~3.2 km như mockup D-05) - mô phỏng
 *   payload dispatch thật đã chốt sẵn BV tiếp nhận.
 * - generateReassignment: ca tái điều động trên tuyến về trạm (D-07 -
 *   EMG-0032 Cầu Rồng, cách tài xế ~0.9 km, khớp event backend
 *   RETURNING_TRIP_REASSIGNED).
 *
 * Mẹo demo: ca được đặt GẦN VỊ TRÍ GPS THẬT của tài xế (offset ~1.8 km, hướng
 * ngẫu nhiên) để khoảng cách/ETA trên D-02/D-03 trông thực tế và tài xế có thể
 * chạy thử ra hiện trường. Chưa có fix GPS thì neo về khu vực Trạm S1 Sơn Trà.
 *
 * Khi backend có dispatch thật: thay generateDispatch bằng event WS
 * (kênh user:{id}) - store driverShift nhận qua receiveDispatch như cũ.
 */
import { emergencyCode } from '../../constants/trip';
import { etaMinutes, haversineKm } from '../../utils/geo';

/** Fallback khi chưa có GPS: khu vực Sơn Trà, Đà Nẵng (gần trạm S1 mock). */
export const FALLBACK_ANCHOR = { latitude: 16.0785, longitude: 108.2467 };

/** Khoảng cách đặt hiện trường so với tài xế (km) - khớp "1.8 km" mockup D-02. */
const SCENE_OFFSET_KM = 1.8;
/** Khoảng cách đặt BV đối diện hiện trường (km) -> hiện trường tới BV ~3.2 km (mockup D-05). */
const HOSPITAL_OFFSET_KM = 1.4;
/** Ca tái điều động đặt gần tài xế bao nhiêu km (mockup D-07 "chỉ cách bạn 0.9 km"). */
const REASSIGN_OFFSET_KM = 0.9;

let emgSeq = 31; // EMG-0031, EMG-0032... (D-07 dùng EMG-0032 cho ca tái điều động)

/** Dời 1 điểm theo km + hướng (radian) từ neo - công thức địa lý thuần. */
function offsetKm(anchor, km, bearing) {
  const kmPerLatDeg = 111.32;
  const kmPerLngDeg = 111.32 * Math.cos((anchor.latitude * Math.PI) / 180);
  return {
    latitude: anchor.latitude + (km * Math.cos(bearing)) / kmPerLatDeg,
    longitude: anchor.longitude + (km * Math.sin(bearing)) / kmPerLngDeg,
  };
}

/** BV đích mock theo mockup D-05/D-06: đặt đối diện hiện trường qua neo GPS. */
function buildHospital(anchor, sceneBearing, sceneCoords) {
  const coords = offsetKm(anchor, HOSPITAL_OFFSET_KM, sceneBearing + Math.PI);
  return {
    name: 'BV Đa khoa Đà Nẵng',
    department: 'Khoa cấp cứu',
    coords,
    distanceFromSceneKm: haversineKm(sceneCoords, coords) || 3.2,
  };
}

/**
 * Sinh 1 ca điều động mới.
 * @param {{latitude:number, longitude:number}|null} driverPos vị trí GPS thật mới nhất (nullable).
 */
export function generateDispatch(driverPos) {
  const anchor = driverPos && Number.isFinite(driverPos.latitude) ? driverPos : FALLBACK_ANCHOR;

  // Offset ~1.8 km theo hướng ngẫu nhiên (đổi vĩ độ/kinh độ bằng công thức địa lý).
  const bearing = Math.random() * 2 * Math.PI;
  const coords = offsetKm(anchor, SCENE_OFFSET_KM, bearing);

  const distanceKm = haversineKm(anchor, coords) || SCENE_OFFSET_KM;
  const id = emgSeq++;

  return {
    id,
    code: emergencyCode(id), // "EMG-0031"
    priority: 'CRITICAL',
    address: 'Ngã 6 Lê Duẩn & Nguyễn Văn Linh, Hải Châu, Đà Nẵng',
    shortAddress: 'Ngã 6 Lê Duẩn',
    coords,
    distanceKm, // ~1.8 km theo dựng cảnh
    etaMinutes: etaMinutes(distanceKm), // ~4 phút với 30 km/h
    victims: 2,
    note: '1 người bất tỉnh, chảy máu đầu',
    createdAt: new Date().toISOString(),
    hospital: buildHospital(anchor, bearing, coords),
  };
}

/**
 * Sinh ca TÁI ĐIỀU ĐỘNG trên tuyến về trạm (D-07) - Returning Trip Optimization.
 * Đặt gần vị trí tài xế lúc đang RETURNING (~0.9 km) để_popup so sánh ETA
 * "nhanh hơn xe tại trạm" có ý nghĩa demo. Địa chỉ đúng mockup: Cầu Rồng.
 * @param {{latitude:number, longitude:number}|null} driverPos vị trí GPS thật mới nhất.
 */
export function generateReassignment(driverPos) {
  const anchor = driverPos && Number.isFinite(driverPos.latitude) ? driverPos : FALLBACK_ANCHOR;

  const bearing = Math.random() * 2 * Math.PI;
  const coords = offsetKm(anchor, REASSIGN_OFFSET_KM, bearing);
  const distanceKm = haversineKm(anchor, coords) || REASSIGN_OFFSET_KM;
  const id = emgSeq++;

  return {
    id,
    code: emergencyCode(id), // ca kế tiếp - thường là EMG-0032
    priority: 'CRITICAL',
    address: 'Cầu Rồng, Hải Châu, Đà Nẵng',
    shortAddress: 'Cầu Rồng',
    coords,
    distanceKm, // ~0.9 km so với tài xế trên tuyến về
    etaMinutes: etaMinutes(distanceKm), // ~2 phút
    victims: 1,
    note: 'Người lớn ngã xe máy, nghi gãy xương đùi',
    createdAt: new Date().toISOString(),
    hospital: buildHospital(anchor, bearing + Math.PI * 1.5, coords),
    reassigned: true, // từ popup RETURNING - đã chủ động xác nhận, không đếm ngược lại
  };
}

/**
 * Chỉ dẫn rút gọn giả lập cho D-03 (turn-by-turn thật do Google Maps lo qua
 * deep-link; card này chỉ mang tính minh họa nhịp lái).
 */
export const MOCK_TURN_INSTRUCTIONS = [
  'Rẽ trái · vào Nguyễn Văn Linh · 250 m',
  'Đi thẳng · qua ngã 6 Lê Duẩn · 800 m',
  'Chấp nhận làn phải · 400 m',
  'Đến nơi · hiện trường EMG · 120 m',
];
