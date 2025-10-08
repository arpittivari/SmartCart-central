// Placeholder for useSocket.ts
import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { Cart } from '../api/cartApi';

const SOCKET_URL = 'http://localhost:5000'; // Your backend URL

export const useSocket = (onCartUpdate: (updatedCart: Cart) => void) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Create and connect the socket
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('🔌 Connected to WebSocket server!');
    });

    // Listen for our custom 'cartUpdate' event
    newSocket.on('cartUpdate', (updatedCart: Cart) => {
      console.log('WebSocket received cartUpdate:', updatedCart);
      onCartUpdate(updatedCart); // Call the callback function to update state
    });

    newSocket.on('disconnect', () => {
      console.log('WebSocket disconnected.');
    });

    // Cleanup on component unmount
    return () => {
      newSocket.disconnect();
    };
  }, [onCartUpdate]);

  return socket;
};