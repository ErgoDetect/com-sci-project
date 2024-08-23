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
    const socket = new WebSocket(socketUrl); // Use the constructed socketUrl
    socketRef.current = socket;

    const handleOpen = () => {
      console.info('WebSocket connection established');
      setReconnectAttempts(0);
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
      console.info('WebSocket connection closed');

      // Reconnection logic
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      reconnectTimeoutRef.current = setTimeout(
        () => {
          setReconnectAttempts((prev) => prev + 1);
          initializeWebSocket(); // Attempt to reconnect
        },
        Math.min(5000 * (reconnectAttempts + 1), 30000), // Exponential backoff with a max of 30 seconds
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
      socketRef.current.send(JSON.stringify(data)); // Ensure the data is sent as JSON
    } else {
      console.error('WebSocket is not open. Unable to send data.');
    }
  }, []);

  return useMemo(() => ({ send, message }), [send, message]);
};

export default useWebSocket;
