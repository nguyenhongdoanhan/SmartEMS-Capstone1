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
