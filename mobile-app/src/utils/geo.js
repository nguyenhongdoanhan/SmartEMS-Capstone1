/**
 * Tiện ích hình học cho map driver (D-03/D-05).
 * Tách riêng để GĐ3 tái dùng (polyline quãng đường, ETA tới bệnh viện).
 */

/** Khoảng cách 2 điểm {latitude, longitude} theo haversine (km). */
export function haversineKm(a, b) {
  if (!a || !b) return null;
  const rad = Math.PI / 180;
  const dLat = (b.latitude - a.latitude) * rad;
  const dLng = (b.longitude - a.longitude) * rad;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.latitude * rad) * Math.cos(b.latitude * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(s));
}

/** Ước lượng phút cần đi - giả định tốc độ xe cấp cứu đô thị ~30 km/h. */
export function etaMinutes(km, speedKmh = 30) {
  if (km == null || Number.isNaN(km)) return null;
  return Math.max(1, Math.round((km / speedKmh) * 60));
}
