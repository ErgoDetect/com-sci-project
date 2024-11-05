import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import axiosInstance from './axiosInstance';
import { useResData } from '../context';

type WebSocketMessageHandler = (data: any) => void;

interface UseWebSocketResult {
  send: (data: any) => void;
  message: any;
}

const getDeviceIdentifier = async (): Promise<string> => {
  const deviceIdentifier = await window.electron.system.getMacAddress();
  if (!deviceIdentifier) {
    throw new Error('Device identifier not found');
  }
  return deviceIdentifier;
};

const useWebSocket = (
  dest: string,
  onMessage?: WebSocketMessageHandler,
): UseWebSocketResult => {
  const location = useLocation();
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const messageQueue = useRef<any[]>([]);
  const [message, setMessage] = useState<any>(null);

  const { calibrationData, useFocalLength, contextLoading } = useResData();

  const send = useCallback((data: any) => {
    const compressedMessage = JSON.stringify(data);
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(compressedMessage);
    } else {
      messageQueue.current.push(compressedMessage);
    }
  }, []);

  const flushMessageQueue = useCallback(() => {
    if (
      socketRef.current?.readyState === WebSocket.OPEN &&
      messageQueue.current.length > 0
    ) {
      messageQueue.current.forEach((msg) => socketRef.current?.send(msg));
      messageQueue.current = [];
    }
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const deviceIdentifier = await getDeviceIdentifier();
      await axiosInstance.post('/auth/refresh-token', null, {
        headers: { 'Device-Identifier': deviceIdentifier },
      });
    } catch (error) {
      console.error('Error refreshing token:', error);
    }
  }, []);

  const initializeWebSocket = useCallback(() => {
    const protocol = 'ws';
    const socketUrl = `${protocol}://localhost:8000/${dest}`;

    if (
      socketRef.current &&
      socketRef.current.readyState !== WebSocket.CLOSED
    ) {
      socketRef.current.close(1000, 'Reinitializing WebSocket');
    }

    const socket = new WebSocket(socketUrl);
    socketRef.current = socket;

    socket.addEventListener('open', () => {
      console.info('WebSocket connection opened');

      if (useFocalLength) {
        socket.send(JSON.stringify({ focal_length: calibrationData }));
      }

      flushMessageQueue();

      // Reset reconnect attempts
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      // Set up heartbeat to keep connection alive
      // heartbeatIntervalRef.current = setInterval(() => {
      //   if (socketRef.current?.readyState === WebSocket.OPEN) {
      //     socketRef.current.send(JSON.stringify({ type: 'ping' }));
      //   }
      // }, 10); // every 30 seconds
    });

    socket.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      setMessage(data);
      onMessage?.(data);
    });

    socket.addEventListener('error', (error) => {
      console.error('WebSocket error:', error);
    });

    socket.addEventListener('close', async (event) => {
      console.warn('WebSocket closed:', event);

      if (reconnectTimeoutRef.current)
        clearTimeout(reconnectTimeoutRef.current);
      if (heartbeatIntervalRef.current)
        clearInterval(heartbeatIntervalRef.current);

      // Handle specific close codes that might indicate a need to refresh the token
      if (event.code === 1008 || event.reason.includes('Token has expired')) {
        await refreshToken();
      }

      // Immediately attempt to reconnect
      reconnectTimeoutRef.current = setTimeout(initializeWebSocket, 1000);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.close(1000, 'Component unmounting');
        socketRef.current = null;
      }
      if (reconnectTimeoutRef.current)
        clearTimeout(reconnectTimeoutRef.current);
      if (heartbeatIntervalRef.current)
        clearInterval(heartbeatIntervalRef.current);
    };
  }, [
    calibrationData,
    dest,
    flushMessageQueue,
    onMessage,
    refreshToken,
    useFocalLength,
  ]);

  useEffect(() => {
    // Check if the current path matches the page where WebSocket should be active
    if (location.pathname === '/' && !contextLoading) {
      const cleanupWebSocket = initializeWebSocket();
      return () => {
        cleanupWebSocket();
        if (reconnectTimeoutRef.current)
          clearTimeout(reconnectTimeoutRef.current);
      };
    }
    return undefined;
  }, [initializeWebSocket, contextLoading, location.pathname]);

  return useMemo(() => ({ send, message }), [send, message]);
};

export default useWebSocket;
