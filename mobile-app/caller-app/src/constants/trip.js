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

/**
 * Giai đoạn "đang ghép xe" (màn C-03): từ lúc tạo tới khi tài xế lên đường.
 * 'CREATED' là status gốc của EmergencyOut ngay khi POST /emergencies (chưa có event WS).
 */
export const MATCHING_STATUSES = ['CREATED', 'SOS_CREATED', 'AMBULANCE_ASSIGNED', 'DRIVER_ACCEPTED'];

/** Mã sự cố hiển thị cho user, vd id 31 -> "EMG-0031" (quy ước FE, backend chỉ có id int). */
export function emergencyCode(id) {
  return `EMG-${String(id).padStart(4, '0')}`;
}

export function statusLabel(status) {
  return STATUS_LABELS[status] || status || '';
}

export function isFinalStatus(status) {
  return FINAL_STATUSES.includes(status);
}

/** Đang ở giai đoạn ghép xe (C-03) hay đã lên đường (C-04)? */
export function isMatchingStatus(status) {
  return MATCHING_STATUSES.includes(status);
}

/** Số giây giữa 2 ISO timestamp (an toàn: lỗi date -> null, âm -> 0). */
export function secondsBetween(aIso, bIso) {
  try {
    const ms = new Date(bIso).getTime() - new Date(aIso).getTime();
    if (Number.isNaN(ms)) return null;
    return Math.max(0, Math.round(ms / 1000));
  } catch (err) {
    return null;
  }
}

/** "8'24\"" - định dạng phút'giây" dùng cho metric phản hồi (C-05/C-08/C-09). */
export function formatMinutesSeconds(totalSeconds) {
  if (totalSeconds == null) return null;
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}'${String(s).padStart(2, '0')}"`;
}

/** "26/08" từ ISO timestamp (dùng cho card lịch sử C-08). */
export function formatDayMonth(iso) {
  try {
    return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  } catch (err) {
    return '';
  }
}

/** "12:12" từ ISO timestamp. */
export function formatHm(iso) {
  try {
    return new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  } catch (err) {
    return '';
  }
}
