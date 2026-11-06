/**
 * FSM ca chạy phía tài xế (D-02 -> D-07) - khớp event_types của backend,
 * KHÔNG tự chế trạng thái backend. Riêng DISPATCH_PENDING là trạng thái FE-only:
 * đề xuất điều động đang chờ tài xế chốt trong 12s (D-02) - sau này khi có
 * dispatch thật, đây vẫn là điểm chờ phản hồi của tài xế.
 * GĐ3 đóng đủ vòng đời: TRANSPORTING (D-05) -> AT_HOSPITAL (D-06) ->
 * RETURNING (D-07) -> TRIP_COMPLETED (GĐ4 ghi vào lịch sử ca trực).
 */
export const DRIVER_CASE_STATUS = {
  DISPATCH_PENDING: 'DISPATCH_PENDING', // FE-only: D-02 đang đếm ngược
  DRIVER_ACCEPTED: 'DRIVER_ACCEPTED', // đã bấm CHẤP NHẬN (backend event cùng tên)
  DRIVER_EN_ROUTE: 'DRIVER_EN_ROUTE', // D-03 đang chạy tới hiện trường
  ARRIVED_ON_SCENE: 'ARRIVED_ON_SCENE', // D-04 tại hiện trường
  TRANSPORTING: 'TRANSPORTING', // D-05 đang chở bệnh nhân tới bệnh viện
  AT_HOSPITAL: 'AT_HOSPITAL', // D-06 đang bàn giao tại bệnh viện
  RETURNING: 'RETURNING', // D-07 xe rỗng đang về trạm (event backend cùng tên)
  TRIP_COMPLETED: 'TRIP_COMPLETED', // chuyến đã khép - GĐ4 ghi lịch sử ca trực
};

/** Nhãn tiếng Việt góc nhìn TÀI XẾ (khác nhãn caller cùng event - vd
 *  DRIVER_EN_ROUTE: caller thấy "Xe đang trên đường tới", driver thấy "ĐANG ĐẾN HIỆN TRƯỜNG"). */
export const DRIVER_CASE_LABELS = {
  DISPATCH_PENDING: 'YÊU CẦU ĐIỀU ĐỘNG MỚI',
  DRIVER_ACCEPTED: 'ĐÃ NHẬN CA',
  DRIVER_EN_ROUTE: 'ĐANG ĐẾN HIỆN TRƯỜNG',
  ARRIVED_ON_SCENE: 'TẠI HIỆN TRƯỜNG',
  TRANSPORTING: 'ĐANG VẬN CHUYỂN BỆNH NHÂN',
  AT_HOSPITAL: 'TẠI BỆNH VIỆN',
  RETURNING: 'ĐANG VỀ TRẠM',
  TRIP_COMPLETED: 'HOÀN TẤT CHUYẾN ĐI',
};

/** Đếm ngược D-02 (giây) - mục tiêu dispatch < 30s, tài xế có 12s để chốt. */
export const DISPATCH_COUNTDOWN_S = 12;

/** Trang ca đang chạy bấm vào thì tới màn nào (D-01 card + tái vào luồng sau khi back). */
export const ACTIVE_CASE_SCREEN = {
  DRIVER_ACCEPTED: 'DriverNavigation',
  DRIVER_EN_ROUTE: 'DriverNavigation',
  ARRIVED_ON_SCENE: 'OnScene',
  TRANSPORTING: 'DriverTransport',
  AT_HOSPITAL: 'DriverHandover',
  RETURNING: 'DriverReturning',
};

/** Mức phân loại triage (D-04) - theo mockup: Critical / Urgent / Delayed. */
export const TRIAGE_LEVELS = [
  { key: 'CRITICAL', label: 'Critical', hint: 'Nguy kịch — ưu tiên tuyệt đối' },
  { key: 'URGENT', label: 'Urgent', hint: 'Khẩn cấp — can thiệp sớm' },
  { key: 'DELAYED', label: 'Delayed', hint: 'Hoãn — ổn định huyết động' },
];

/** Thang ý thức AVPU (D-04): A tỉnh / V đáp ứng âm thanh / P đáp ứng đau / U không đáp ứng. */
export const AVPU_LEVELS = [
  { key: 'ALERT', label: 'Tỉnh' },
  { key: 'VOICE', label: 'Âm thanh' },
  { key: 'PAIN', label: 'Đau' },
  { key: 'UNRESPONSIVE', label: 'Không đáp ứng' },
];

export function driverCaseLabel(status) {
  return DRIVER_CASE_LABELS[status] || status || '';
}
