/**
 * Engine mô phỏng event WebSocket của backend (chạy khi MOCK_MODE=true).
 *
 * Message shape bám đúng backend (app/events/handlers.py):
 *   { "type": "trip_status", "trip_id": 1, "status": "DRIVER_EN_ROUTE" }
 * Backend hiện mới broadcast tới kênh "dispatchers"; mock bổ sung cho phía caller kèm
 * vài field hiển thị thêm (emergency_id, plate_number, eta_minutes, hospital) -
 * dạng additive nên không phá vỡ shape khi đổi sang backend thật.
 */
const TIMELINE = [
  { delayMs: 2000, status: 'SOS_CREATED' },
  { delayMs: 6000, status: 'AMBULANCE_ASSIGNED', plate_number: '30B-456.78' },
  { delayMs: 12000, status: 'DRIVER_EN_ROUTE', eta_minutes: 7 },
  { delayMs: 22000, status: 'ARRIVED_ON_SCENE' },
  { delayMs: 30000, status: 'TRANSPORTING' },
  { delayMs: 42000, status: 'AT_HOSPITAL', hospital: 'Bệnh viện Đa khoa Trung tâm' },
  { delayMs: 50000, status: 'TRIP_COMPLETED' },
];

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

export const mockEngine = {
  /** Đăng ký listener nhận event - trả về hàm hủy đăng ký. */
  subscribe(cb) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },

  /** Bắt đầu mô phỏng 1 chuyến cấp cứu cho emergency vừa tạo. */
  startTrip(emergencyId) {
    this.cancelTrip();
    const tripId = 1000 + emergencyId;
    currentTripId = tripId;
    TIMELINE.forEach((step) => {
      const t = setTimeout(() => {
        if (currentTripId !== tripId) return;
        emit({ type: 'trip_status', emergency_id: emergencyId, trip_id: tripId, ...step });
      }, step.delayMs);
      timers.push(t);
    });
  },

  /** Hủy mô phỏng hiện tại (đăng xuất / tạo SOS mới / tắt app). */
  cancelTrip() {
    timers.forEach(clearTimeout);
    timers = [];
    currentTripId = null;
  },
};
