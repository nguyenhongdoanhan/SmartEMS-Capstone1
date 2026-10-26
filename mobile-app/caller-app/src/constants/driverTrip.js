/**
 * FSM ca chạy phía tài xế (D-02 -> D-07) - khớp event_types của backend,
 * KHÔNG tự chế trạng thái backend. Riêng DISPATCH_PENDING là trạng thái FE-only:
 * đề xuất điều động đang chờ tài xế chốt trong 12s (D-02) - sau này khi có
 * dispatch thật, đây vẫn là điểm chờ phản hồi của tài xế.
 */
export const DRIVER_CASE_STATUS = {
  DISPATCH_PENDING: 'DISPATCH_PENDING', // FE-only: D-02 đang đếm ngược
  DRIVER_ACCEPTED: 'DRIVER_ACCEPTED', // đã bấm CHẤP NHẬN (backend event cùng tên)
  DRIVER_EN_ROUTE: 'DRIVER_EN_ROUTE', // D-03 đang chạy tới hiện trường
  ARRIVED_ON_SCENE: 'ARRIVED_ON_SCENE', // D-04 tại hiện trường
  // GĐ3 bổ sung: TRANSPORTING (D-05) · AT_HOSPITAL (D-06) · RETURNING (D-07) · TRIP_COMPLETED
};

/** Nhãn tiếng Việt góc nhìn TÀI XẾ (khác nhãn caller cùng event - vd
 *  DRIVER_EN_ROUTE: caller thấy "Xe đang trên đường tới", driver thấy "ĐANG ĐẾN HIỆN TRƯỜNG"). */
export const DRIVER_CASE_LABELS = {
  DISPATCH_PENDING: 'YÊU CẦU ĐIỀU ĐỘNG MỚI',
  DRIVER_ACCEPTED: 'ĐÃ NHẬN CA',
  DRIVER_EN_ROUTE: 'ĐANG ĐẾN HIỆN TRƯỜNG',
  ARRIVED_ON_SCENE: 'TẠI HIỆN TRƯỜNG',
  // GĐ3: TRANSPORTING: 'ĐANG VẬN CHUYỂN BỆNH NHÂN' · AT_HOSPITAL: 'TẠI BỆNH VIỆN' · RETURNING: 'ĐANG VỀ TRẠM'
};

/** Đếm ngược D-02 (giây) - mục tiêu dispatch < 30s, tài xế có 12s để chốt. */
export const DISPATCH_COUNTDOWN_S = 12;

/** Trang ca đang chạy bấm vào thì tới màn nào (D-01 card + tái vào luồng sau khi back). */
export const ACTIVE_CASE_SCREEN = {
  DRIVER_ACCEPTED: 'DriverNavigation',
  DRIVER_EN_ROUTE: 'DriverNavigation',
  ARRIVED_ON_SCENE: 'OnScene',
  // GĐ3: TRANSPORTING: 'DriverTransport' · AT_HOSPITAL: 'DriverHandover' · RETURNING: 'DriverReturning'
};

export function driverCaseLabel(status) {
  return DRIVER_CASE_LABELS[status] || status || '';
}
