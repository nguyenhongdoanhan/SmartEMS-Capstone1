import { useEffect } from "react";
import { connectSocket } from "../services/socket";

export function useWebSocket(token, onMessage) {
  useEffect(() => {
    if (!token) return;
    const ws = connectSocket(token, onMessage);
    return () => ws.close();
  }, [token]);
}
