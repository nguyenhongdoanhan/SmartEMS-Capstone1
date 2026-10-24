/**
 * Bảng màu CHÍNH THỨC SmartEMS - trích xuất từ UI_design_SmartEMS.pdf (đã được team chốt).
 * Nguyên tắc: mọi màu dùng trong app đều lấy từ đây, KHÔNG hard-code hex ở screen.
 * Legacy keys (primaryDark, infoBg...) giữ nguyên tên để các màn nền tảng không vỡ.
 */
export const colors = {
  // ===== Thương hiệu - đỏ SOS =====
  primary: '#DC2626', // nút chính, tab active, SOS, logo "+"
  primaryDark: '#B91C1C', // trạng thái pressed / glow đậm hơn
  primaryLight: '#FEF2F2', // nền hồng nhạt (card y tế, badge khẩn cấp)
  textOnPrimary: '#FFFFFF',

  // ===== Nền & bề mặt =====
  background: '#F8FAFC', // nền trang (slate-50)
  surface: '#FFFFFF', // card, app bar
  bgSubtle: '#F3F4F6', // nút phụ, nền chip xám (gray-100)
  overlay: 'rgba(15, 23, 42, 0.55)',

  // ===== Navy - splash M-01, chip active lịch sử =====
  dark: '#0F172A',
  darkSoft: '#1E293B',
  chipActiveBg: '#111827',
  chipActiveText: '#FFFFFF',

  // ===== Chữ =====
  text: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF', // footer version, disclaimer
  textDisabled: '#9CA3AF', // legacy alias

  // ===== Viền =====
  border: '#E5E7EB',

  // ===== Xanh dương - link "Sửa" / "Cập nhật" / badge vận chuyển =====
  blue: '#2563EB',
  blueBg: '#DBEAFE',
  info: '#2563EB',
  infoBg: '#EFF4FF',

  // ===== Trạng thái =====
  success: '#22C55E', // banner hoàn tất, checkmark, switch ON
  successStrong: '#166534', // chữ trên badge xanh đậm
  successBg: '#DCFCE7', // badge HOÀN TẤT
  warning: '#F97316', // cam - trạng thái pending / matching
  warningAmber: '#F59E0B',
  warningBg: '#FFF8E1', // vàng nhạt - card "Trong lúc chờ"
  error: '#DC2626',
  errorBg: '#FFEBEE', // badge KHẨN CẤP

  // ===== Badge pastel (C-08 lịch sử, C-09 event log, C-07) =====
  badge: {
    success: { bg: '#DCFCE7', text: '#166534' }, // HOÀN TẤT
    transport: { bg: '#DBEAFE', text: '#1E40AF' }, // ĐANG VẬN CHUYỂN
    danger: { bg: '#FFEBEE', text: '#DC2626' }, // KHẨN CẤP
    warning: { bg: '#FFF8E1', text: '#B45309' }, // đang xử lý
    neutral: { bg: '#F3F4F6', text: '#374151' }, // thông tin chung
  },
};
