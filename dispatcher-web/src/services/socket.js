export function connectSocket(token, onMessage) {
  const ws = new WebSocket(`${import.meta.env.VITE_WS_URL}?token=${token}`);
  ws.onmessage = (e) => onMessage(JSON.parse(e.data));
  // TODO: reconnect with backoff + show connection status (proposal: handle temporary connection loss)
  return ws;
}
