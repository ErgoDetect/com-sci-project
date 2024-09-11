import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useResData } from '../context';

type WebSocketMessageHandler = (data: any) => void;

interface UseWebSocketResult {
  send: (data: any) => void;
  message: any;
}

const useWebSocket = (
  dest: string,
  onMessage?: WebSocketMessageHandler,
): UseWebSocketResult => {
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
    const protocol = window.location.protocol === 'http:' ? 'ws' : 'wss';
    const socketUrl = `${protocol}://${url}/${dest}`;

    // Close previous WebSocket if still open
    if (
      socketRef.current &&
      socketRef.current.readyState !== WebSocket.CLOSED
    ) {
      socketRef.current.close();
    }

    const socket = new WebSocket(socketUrl);
    socketRef.current = socket;

    const handleOpen = () => {
      console.info('WebSocket connection established');
      setReconnectAttempts(0);
    };

    const handleMessage = (event: MessageEvent) => {
      const data = isJSON(event.data) ? JSON.parse(event.data) : event.data;
      setMessage(data);
      if (onMessage) {
        onMessage(data);
      }
    };

    const handleError = (error: Event) => {
      console.error('WebSocket error:', error);
    };

    const handleClose = () => {
      console.info('WebSocket connection closed');
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      reconnectTimeoutRef.current = setTimeout(
        () => {
          setReconnectAttempts((prev) => prev + 1);
          initializeWebSocket(); // Attempt to reconnect
        },
        Math.min(5000 * (reconnectAttempts + 1), 30000),
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
  }, [url, dest, isJSON, onMessage, reconnectAttempts]);

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
      socketRef.current.send(JSON.stringify(data));
    } else {
      console.error('WebSocket is not open. Unable to send data.');
    }
  }, []);

  return useMemo(() => ({ send, message }), [send, message]);
};

export default useWebSocket;
