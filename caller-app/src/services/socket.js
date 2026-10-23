/**
 * WebSocket client realtime.
 *
 * Backend: GET /ws?token=<JWT> - server xếp kênh theo role, caller nằm trên kênh user:{id}.
 * Message dạng JSON, ví dụ: {"type":"trip_status","trip_id":1,"status":"DRIVER_EN_ROUTE"}
 * Khi MOCK_MODE=true thì dùng mockEngine thay cho kết nối thật (cùng interface trả về).
 *
 * @param {string} token JWT sau khi đăng nhập
 * @param {(msg: object) => void} onMessage nhận mỗi event JSON
 * @param {(status: 'connected'|'closed'|'error'|'unauthorized') => void} onStatusChange
 *   trạng thái kết nối; 'unauthorized' = token bị từ chối (mã close 4401 của backend).
 * @returns {{ close: () => void }}
 */
import { ENV } from '../config/env';
import { mockEngine } from './mock/mockEngine';

export function connectSocket(token, onMessage, onStatusChange) {
  if (ENV.MOCK_MODE) {
    const unsubscribe = mockEngine.subscribe(onMessage);
    onStatusChange?.('connected');
    return {
      isMock: true,
      close: () => {
        unsubscribe();
        onStatusChange?.('closed');
      },
    };
  }

  const ws = new WebSocket(`${ENV.WS_URL}?token=${encodeURIComponent(token)}`);

  ws.onopen = () => onStatusChange?.('connected');
  ws.onmessage = (event) => {
    try {
      const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      onMessage(data);
    } catch (err) {
      // message không phải JSON hợp lệ - bỏ qua, không làm sập client
    }
  };
  ws.onerror = () => onStatusChange?.('error');
  ws.onclose = (event) => onStatusChange?.(event?.code === 4401 ? 'unauthorized' : 'closed');

  return {
    isMock: false,
    close: () => {
      try {
        ws.close();
      } catch (err) {
        // đã đóng từ trước
      }
    },
  };
}
