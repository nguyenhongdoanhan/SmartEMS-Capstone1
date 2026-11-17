/**
 * Service vị trí GPS (expo-location).
 * Dùng cho màn SOS: tự lấy tọa độ hiện tại gửi kèm yêu cầu cấp cứu,
 * thay vì bắt người dùng gõ tay lat/lng.
 */
import * as Location from 'expo-location';

/**
 * Lấy vị trí hiện tại. Tự hỏi quyền truy cập nếu chưa được cấp.
 * @returns {Promise<{ latitude: number, longitude: number, accuracy: number }>}
 * @throws Error nếu người dùng từ chối cấp quyền hoặc không đọc được vị trí.
 */
export async function getCurrentLocation() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== Location.PermissionStatus.GRANTED) {
    throw new Error('Bạn chưa cấp quyền vị trí. Vui lòng bật trong Cài đặt để gửi SOS đến đúng chỗ.');
  }

  // Giảm timeout để người dùng không phải chờ quá lâu khi GPS yếu,
  // sau đó mới retry với độ chính xác cân bằng.
  let position;
  try {
    position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
  } catch (err) {
    position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
  }

  const { latitude, longitude, accuracy } = position.coords;
  return { latitude, longitude, accuracy };
}

/** Format tọa độ cho hiển thị, ví dụ "10.762622, 106.682318 (±12m)" */
export function formatCoords({ latitude, longitude, accuracy } = {}) {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') return '';
  const base = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  return typeof accuracy === 'number' ? `${base} (±${Math.round(accuracy)}m)` : base;
}

/**
 * Địa chỉ dạng text từ tọa độ (C-01 "Xin chào" card, C-02 ô địa chỉ).
 * Dùng reverseGeocodeAsync của expo-location - KHÔNG cần Google Maps key.
 * @returns {Promise<string|null>} vd "254 Nguyễn Văn Linh, Hải Châu" | null nếu không tra được
 */
export async function reverseGeocodeAddress({ latitude, longitude }) {
  try {
    const results = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (!results || !results.length) return null;
    const r = results[0];
    // Ghép các phần có ý nghĩa nhất: số nhà + tên đường, sau đó quận/huyện
    const street = [r.streetNumber, r.street].filter(Boolean).join(' ');
    const area = [r.district, r.subregion, r.city].filter(Boolean)[0] || r.region || '';
    const parts = [street, area].filter(Boolean);
    return parts.length ? parts.join(', ') : [r.name].filter(Boolean).join('') || null;
  } catch (err) {
    return null; // reverse geocode thất bại không chặn luồng SOS - caller vẫn gửi tọa độ
  }
}
