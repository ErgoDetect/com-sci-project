import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useResData } from '../context';

type WebSocketMessageHandler = (data: any) => void;

const useWebSocket = (dest: string, onMessage?: WebSocketMessageHandler) => {
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [message, setMessage] = useState<any>(null);
  const { url } = useResData();
  const [reconnectAttempts, setReconnectAttempts] = useState<number>(0);

  const isJSON = useCallback((str: string): boolean => {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  }, []);

  const initializeWebSocket = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const socketUrl = `${protocol}://${url}/${dest}`;
    const socket = new WebSocket(socketUrl);
    socketRef.current = socket;

    const handleOpen = () => {
      console.info('WebSocket connection established');
      setReconnectAttempts(0); // Reset the reconnect attempts after a successful connection
    };

    const handleMessage = (event: MessageEvent) => {
      let inputData: any = event.data;

      if (isJSON(event.data)) {
        inputData = JSON.parse(event.data);
      }

      setMessage(inputData);

      if (onMessage) {
        onMessage(inputData);
      }
    };

    const handleError = (error: Event) => {
      console.error('WebSocket error:', error);
    };

    const handleClose = () => {
      console.info('WebSocket connection closed, attempting to reconnect');
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      reconnectTimeoutRef.current = setTimeout(
        () => {
          setReconnectAttempts((prev) => prev + 1);
          initializeWebSocket();
        },
        Math.min(5000 * reconnectAttempts, 30000),
      ); // Exponential backoff
    };

    socket.addEventListener('open', handleOpen);
    socket.addEventListener('message', handleMessage);
    socket.addEventListener('error', handleError);
    socket.addEventListener('close', handleClose);

    return () => {
      socket.removeEventListener('open', handleOpen);
      socket.removeEventListener('message', handleMessage);
      socket.removeEventListener('error', handleError);
      socket.removeEventListener('close', handleClose);

      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [url, dest, onMessage, isJSON, reconnectAttempts]);

  useEffect(() => {
    const cleanupWebSocket = initializeWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      cleanupWebSocket();
    };
  }, [initializeWebSocket]);

  const send = useCallback((data: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(data);
    } else {
      console.error('WebSocket is not open. Unable to send data.');
    }
  }, []);

  return useMemo(() => ({ send, message }), [send, message]);
};

export default useWebSocket;
