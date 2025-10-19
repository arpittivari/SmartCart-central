import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

// This makes the WebSocket connection dynamic, just like the API client.
const SOCKET_URL = import.meta.env.VITE_WS_URL || 'http://localhost:5000';

export const useSocket = (eventName: string, callback: (data: any) => void) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);
    newSocket.on('connect', () => console.log('🔌 Connected to WebSocket server!'));
    newSocket.on(eventName, callback);
    newSocket.on('disconnect', () => console.log('WebSocket disconnected.'));
    return () => {
      newSocket.off(eventName, callback);
      newSocket.disconnect();
    };
  }, [eventName, callback]);

  return socket;
};