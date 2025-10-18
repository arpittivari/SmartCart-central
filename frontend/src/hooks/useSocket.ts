import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { Cart } from '../api/cartApi';

const SOCKET_URL = 'http://localhost:5000'; // Your backend URL

/**
 * A custom React hook to connect to a Socket.IO server and listen for a specific event.
 * @param eventName The name of the event to listen for (e.g., 'cartUpdate').
 * @param callback The function to call when the event is received.
 */
export const useSocket = (eventName: string, callback: (data: any) => void) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Create and connect the socket when the component mounts
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('🔌 Connected to WebSocket server!');
    });

    // Listen for the specific event passed into the hook
    newSocket.on(eventName, callback);

    newSocket.on('disconnect', () => {
      console.log('WebSocket disconnected.');
    });

    // Cleanup function: This runs when the component unmounts
    return () => {
      newSocket.off(eventName, callback); // Stop listening for the event
      newSocket.disconnect(); // Disconnect the socket
    };
  }, [eventName, callback]); // Re-run the effect if the event or callback changes

  return socket;
};
