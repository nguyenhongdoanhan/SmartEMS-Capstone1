/**
 * Mock API điều động tài xế (chạy khi MOCK_MODE=true - dispatch backend còn stub, gap D1).
 * Sinh ca GIỐNG mockup D-02 để nghiệm thu: EMG-0031, CRITICAL, ngã 6 Lê Duẩn,
 * 2 nạn nhân, ghi chú "1 người bất tỉnh, chảy máu đầu".
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
const FALLBACK_ANCHOR = { latitude: 16.0785, longitude: 108.2467 };

/** Khoảng cách đặt hiện trường so với tài xế (km) - khớp "1.8 km" mockup D-02. */
const SCENE_OFFSET_KM = 1.8;

let emgSeq = 31; // EMG-0031, EMG-0032... (D-07 dùng EMG-0032 cho ca tái điều động)

/**
 * Sinh 1 ca điều động mới.
 * @param {{latitude:number, longitude:number}|null} driverPos vị trí GPS thật mới nhất (nullable).
 */
export function generateDispatch(driverPos) {
  const anchor = driverPos && Number.isFinite(driverPos.latitude) ? driverPos : FALLBACK_ANCHOR;

  // Offset ~1.8 km theo hướng ngẫu nhiên (đổi vĩ độ/kinh độ bằng công thức địa lý).
  const bearing = Math.random() * 2 * Math.PI;
  const kmPerLatDeg = 111.32;
  const kmPerLngDeg = 111.32 * Math.cos((anchor.latitude * Math.PI) / 180);
  const coords = {
    latitude: anchor.latitude + (SCENE_OFFSET_KM * Math.cos(bearing)) / kmPerLatDeg,
    longitude: anchor.longitude + (SCENE_OFFSET_KM * Math.sin(bearing)) / kmPerLngDeg,
  };

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
