import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

// Use the Vercel environment variable or fall back to the local URL
const SOCKET_URL = import.meta.env.VITE_WS_URL || 'http://localhost:5000';

export const useSocket = (eventName: string, callback: (data: any) => void) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'], // Improves connection reliability
      reconnection: true,
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('🔌 Connected to WebSocket server at', SOCKET_URL);
    });

    newSocket.on(eventName, callback);

    newSocket.on('disconnect', () => {
      console.warn('⚠️ WebSocket disconnected');
    });

    // Cleanup function to prevent memory leaks
    return () => {
      newSocket.off(eventName, callback);
      newSocket.disconnect();
    };
  }, [eventName, callback]);

  return socket;
};