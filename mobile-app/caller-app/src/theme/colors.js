/**
 * Bảng màu - tông "khẩn cấp đỏ" (BẢN TẠM).
 * Sẽ được cập nhật lại cho khớp file thiết kế chính thức của team.
 * Nguyên tắc: mọi màu dùng trong app đều lấy từ đây, KHÔNG hard-code hex ở screen.
 */
export const colors = {
  // Thương hiệu - đỏ khẩn cấp
  primary: '#D32F2F',
  primaryDark: '#9A0007',
  primaryLight: '#FFEBEE',
  textOnPrimary: '#FFFFFF',

  // Nền & bề mặt
  background: '#F7F8FA',
  surface: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.45)',

  // Chữ
  text: '#1D2433',
  textSecondary: '#667085',
  textDisabled: '#A8B0BF',

  // Viền
  border: '#E4E7EC',

  // Trạng thái
  success: '#16A34A',
  successBg: '#ECFDF3',
  warning: '#F59E0B',
  warningBg: '#FFFAEB',
  info: '#2563EB',
  infoBg: '#EFF4FF',
  error: '#B42318',
  errorBg: '#FEF3F2',
};
