/**
 * Nhãn tiếng Việt cho từng trạng thái chuyến xe.
 * Khớp 100% với backend/app/events/event_types.py - KHÔNG tự chế trạng thái mới ở FE.
 */
export const STATUS_LABELS = {
  SOS_CREATED: 'Đã gửi yêu cầu cấp cứu',
  AMBULANCE_ASSIGNED: 'Đã phân công xe cấp cứu',
  DRIVER_ACCEPTED: 'Tài xế đã nhận ca',
  DRIVER_EN_ROUTE: 'Xe đang trên đường tới',
  ARRIVED_ON_SCENE: 'Xe đã tới hiện trường',
  TRANSPORTING: 'Đang vận chuyển tới bệnh viện',
  AT_HOSPITAL: 'Đã tới bệnh viện',
  RETURNING: 'Xe đang quay về trạm',
  TRIP_COMPLETED: 'Hoàn tất ca cấp cứu',
};

/** Trạng thái kết thúc - sau bước này chuyến xe không cập nhật nữa. */
export const FINAL_STATUSES = ['TRIP_COMPLETED'];

export function statusLabel(status) {
  return STATUS_LABELS[status] || status || '';
}

export function isFinalStatus(status) {
  return FINAL_STATUSES.includes(status);
}
