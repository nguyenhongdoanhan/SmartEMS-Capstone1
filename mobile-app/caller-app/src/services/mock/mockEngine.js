/**
 * Engine mô phỏng event WebSocket của backend (chạy khi MOCK_MODE=true).
 *
 * Message shape bám đúng backend (app/events/handlers.py):
 *   { "type": "trip_status", "trip_id": 1, "status": "DRIVER_EN_ROUTE" }
 * Backend hiện mới broadcast tới kênh "dispatchers"; mock bổ sung cho phía caller
 * kèm field hiển thị thêm (emergency_id, plate_number, eta_minutes, hospital,
 * ambulance_id, driver_name, driver_rating, score, route, total_distance_km) -
 * dạng additive nên không phá vỡ shape khi đổi sang backend thật.
 *
 * GĐ3 thêm message "ambulance_position" (vị trí xe di chuyển trên map C-04):
 *   { "type": "ambulance_position", "emergency_id", "trip_id",
 *     "latitude", "longitude", "eta_minutes", "distance_km" }
 * Tương ứng POST /ambulances/{id}/location mà driver-app sẽ gọi trong tương lai.
 *
 * LƯU Ý DEMO: thời gian tuyến nén còn ~50 giây (ETA 8' chỉ là hiển thị theo design);
 * chỉnh pacing ở các hằng số bên dưới.
 */

// ===== Nhịp demo (ms tính từ lúc startTrip) - chỉnh ở đây cho demo nhanh/chậm =====
const T_SOS_ECHO = 1500; // dispatch center echo SOS_CREATED (C-03 bước 2)
const T_ASSIGNED = 7000; // matching engine ghép xong xe
const T_EN_ROUTE = 11000; // xe bắt đầu chạy + nhận ETA -> chuyển C-04
const T_ARRIVED = 27000; // tới hiện trường
const T_TRANSPORT = 33000; // bắt đầu vận chuyển tới bệnh viện
const T_AT_HOSPITAL = 47000; // tới bệnh viện
const T_COMPLETED = 52000; // hoàn tất ca -> chuyển C-05
const POSITION_INTERVAL = 1500; // chu kỳ cập nhật vị trí xe

const AMBULANCE_INFO = {
  ambulance_id: 'AMB-07', // khớp mockup C-04/C-09
  plate_number: '51K-234.56',
  driver_name: 'Nguyễn Văn B',
  driver_rating: 4.9,
  score: 92, // điểm matching (C-09 "score 92")
};
const HOSPITAL_NAME = 'BV Đa khoa Đà Nẵng';
const EN_ROUTE_ETA_MIN = 8; // hiển thị theo design ("8'")
const TRANSPORT_ETA_MIN = 5;

const listeners = new Set();
let timers = [];
let currentTripId = null;

function emit(message) {
  const msg = { ...message, timestamp: new Date().toISOString() };
  listeners.forEach((cb) => {
    try {
      cb(msg);
    } catch (err) {
      // listener lỗi thì kệ listener đó, không làm sập engine
    }
  });
}

// ===== Hình học tuyến đường (polyline giả L-shape cho map C-04) =====

/** Khoảng cách 2 điểm theo haversine (km) - đủ chính xác cho hiển thị demo. */
function kmBetween(a, b) {
  const rad = Math.PI / 180;
  const dLat = (b.latitude - a.latitude) * rad;
  const dLng = (b.longitude - a.longitude) * rad;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.latitude * rad) * Math.cos(b.latitude * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(s));
}

/**
 * Sinh polyline giả hình chữ L (đi ngang theo kinh độ rồi dọc theo vĩ độ),
 * dày đặc điểm để polyline mượt + nội suy vị trí xe mượt.
 */
function makeRoute(from, to) {
  const corner = { latitude: from.latitude, longitude: to.longitude };
  const corners = kmBetween(from, corner) < 0.005 ? [from, to] : [from, corner, to];
  const points = [];
  for (let leg = 0; leg < corners.length - 1; leg++) {
    const a = corners[leg];
    const b = corners[leg + 1];
    const legKm = kmBetween(a, b);
    const steps = Math.max(2, Math.ceil(legKm / 0.05)); // ~50m một điểm
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      points.push({
        latitude: a.latitude + (b.latitude - a.latitude) * t,
        longitude: a.longitude + (b.longitude - a.longitude) * t,
      });
    }
  }
  points.push({ ...to });
  return points;
}

function routeKm(route) {
  let km = 0;
  for (let i = 1; i < route.length; i++) km += kmBetween(route[i - 1], route[i]);
  return km;
}

/** Điểm ở phân số f (0..1) dọc polyline - dùng cho vị trí xe di chuyển. */
function pointAtFraction(route, f) {
  const total = routeKm(route);
  const target = total * f;
  let acc = 0;
  for (let i = 1; i < route.length; i++) {
    const seg = kmBetween(route[i - 1], route[i]);
    if (acc + seg >= target || i === route.length - 1) {
      const t = seg > 0 ? (target - acc) / seg : 0;
      return {
        latitude: route[i - 1].latitude + (route[i].latitude - route[i - 1].latitude) * t,
        longitude: route[i - 1].longitude + (route[i].longitude - route[i - 1].longitude) * t,
      };
    }
    acc += seg;
  }
  return route[route.length - 1];
}

/**
 * Lập lịch trình phát vị trí xe mỗi POSITION_INTERVAL ms trong khoảng [fromMs, toMs],
 * di chuyển dọc `route` từ đầu tới cuối, ETA + khoảng cách co lại theo tiến độ.
 */
function schedulePositions(fromMs, toMs, route, etaFrom, distFrom, emergencyId, tripId, isLive) {
  const steps = Math.max(1, Math.floor((toMs - fromMs) / POSITION_INTERVAL));
  for (let s = 1; s <= steps; s++) {
    const f = s / steps;
    const t = setTimeout(() => {
      if (!isLive()) return;
      const p = pointAtFraction(route, f);
      emit({
        type: 'ambulance_position',
        emergency_id: emergencyId,
        trip_id: tripId,
        latitude: p.latitude,
        longitude: p.longitude,
        eta_minutes: +(etaFrom * (1 - f)).toFixed(1),
        distance_km: +(distFrom * (1 - f)).toFixed(2),
      });
    }, fromMs + s * POSITION_INTERVAL);
    timers.push(t);
  }
}

export const mockEngine = {
  /** Đăng ký listener nhận event - trả về hàm hủy đăng ký. */
  subscribe(cb) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },

  /**
   * Bắt đầu mô phỏng 1 chuyến cấp cứu cho emergency vừa tạo.
   * @param {number} emergencyId
   * @param {{latitude:number, longitude:number}} scene tọa độ hiện trường (GPS caller)
   */
  startTrip(emergencyId, scene) {
    this.cancelTrip();
    const tripId = 1000 + emergencyId;
    currentTripId = tripId;
    const isLive = () => currentTripId === tripId;

    // Hình học: không có GPS (máy ảo/test) thì fallback toạ độ Đà Nẵng để map vẫn chạy
    const scenePt = {
      latitude: scene?.latitude ?? 16.0544,
      longitude: scene?.longitude ?? 108.2022,
    };
    // Xe xuất phát ~2.3km phía Nam-Đông hiện trường; bệnh viện ~1.9km phía Bắc
    const ambStart = { latitude: scenePt.latitude - 0.008, longitude: scenePt.longitude + 0.018 };
    const hospitalPt = { latitude: scenePt.latitude + 0.014, longitude: scenePt.longitude + 0.006 };

    const routeToScene = makeRoute(ambStart, scenePt);
    const routeToHospital = makeRoute(scenePt, hospitalPt);
    const enRouteKm = routeKm(routeToScene);
    const transportKm = routeKm(routeToHospital);

    const fire = (delayMs, message) => {
      const t = setTimeout(() => {
        if (!isLive()) return;
        emit({ type: 'trip_status', emergency_id: emergencyId, trip_id: tripId, ...message });
      }, delayMs);
      timers.push(t);
    };

    // ===== Mốc trạng thái (đúng tên event_types của backend) =====
    fire(T_SOS_ECHO, { status: 'SOS_CREATED' });
    fire(T_ASSIGNED, { status: 'AMBULANCE_ASSIGNED', ...AMBULANCE_INFO });
    fire(T_EN_ROUTE, {
      status: 'DRIVER_EN_ROUTE',
      ...AMBULANCE_INFO,
      eta_minutes: EN_ROUTE_ETA_MIN,
      distance_km: +enRouteKm.toFixed(1),
      route: routeToScene,
    });
    fire(T_ARRIVED, { status: 'ARRIVED_ON_SCENE' });
    fire(T_TRANSPORT, {
      status: 'TRANSPORTING',
      hospital: HOSPITAL_NAME,
      ...AMBULANCE_INFO,
      eta_minutes: TRANSPORT_ETA_MIN,
      distance_km: +transportKm.toFixed(1),
      route: routeToHospital,
    });
    fire(T_AT_HOSPITAL, {
      status: 'AT_HOSPITAL',
      hospital: HOSPITAL_NAME,
      total_distance_km: +(enRouteKm + transportKm).toFixed(1),
    });
    fire(T_COMPLETED, { status: 'TRIP_COMPLETED' });

    // ===== Vị trí xe di chuyển trên map (C-04) =====
    schedulePositions(T_EN_ROUTE, T_ARRIVED, routeToScene, EN_ROUTE_ETA_MIN, enRouteKm, emergencyId, tripId, isLive);
    schedulePositions(T_TRANSPORT, T_AT_HOSPITAL, routeToHospital, TRANSPORT_ETA_MIN, transportKm, emergencyId, tripId, isLive);
  },

  /** Hủy mô phỏng hiện tại (đăng xuất / hủy yêu cầu C-03 / tạo SOS mới / tắt app). */
  cancelTrip() {
    timers.forEach(clearTimeout);
    timers = [];
    currentTripId = null;
  },
};
