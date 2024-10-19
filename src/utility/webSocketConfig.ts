import { useRef, useState, useEffect, useCallback, useMemo } from 'react';

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
  const messageQueue = useRef<any[]>([]); // Queue for messages while reconnecting
  const [message, setMessage] = useState<any>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState<number>(0);

  const isJSON = useCallback((str: string): boolean => {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
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

  const initializeWebSocket = useCallback(() => {
    const protocol = window.location.protocol === 'http:' ? 'ws' : 'wss';
    const socketUrl = `${protocol}://localhost:8000/${dest}`;

    // Close any existing socket connection before creating a new one
    if (
      socketRef.current &&
      socketRef.current.readyState !== WebSocket.CLOSED
    ) {
      socketRef.current.close(1000, 'Reinitializing WebSocket');
    }

    const socket = new WebSocket(socketUrl);
    socketRef.current = socket;

    const handleOpen = () => {
      console.info('WebSocket connection established');
      setReconnectAttempts(0);
      flushMessageQueue(); // Send any queued messages
    };

    const handleMessage = (event: MessageEvent) => {
      const data = isJSON(event.data) ? JSON.parse(event.data) : event.data;
      console.info('WebSocket message received:', data);
      setMessage(data);
      onMessage?.(data);
    };

    const handleError = (error: Event) => {
      console.error('WebSocket error:', error);
    };

    const handleClose = () => {
      console.info('WebSocket connection closed');
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      // Exponential backoff with a cap
      reconnectTimeoutRef.current = setTimeout(
        () => {
          setReconnectAttempts((prev) => prev + 1);
          initializeWebSocket();
        },
        Math.min(5000 * (reconnectAttempts + 1), 30000),
      );
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
        socket.close(1000, 'Component unmounting');
      }
    };
  }, [dest, isJSON, onMessage, reconnectAttempts, flushMessageQueue]);

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
    const messages = JSON.stringify(data);
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(messages);
    } else {
      console.warn('WebSocket not open. Queuing message.');
      messageQueue.current.push(messages);
    }
  }, []);

  return useMemo(() => ({ send, message }), [send, message]);
};

export default useWebSocket;
