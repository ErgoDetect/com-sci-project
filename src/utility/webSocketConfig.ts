import { useRef, useEffect, useCallback, useMemo } from 'react';

type WebSocketMessageHandler = (data: any) => void;

const useWebSocket = (url: string, onMessage: WebSocketMessageHandler) => {
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const initializeWebSocket = useCallback(() => {
    const socket = new WebSocket(url);
    socketRef.current = socket;

    const handleOpen = () => {
      console.info('WebSocket connection established');
    };

    const handleMessage = (event: MessageEvent) => {
      try {
        const inputData = JSON.parse(event.data);
        onMessage(inputData);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
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
      reconnectTimeoutRef.current = setTimeout(() => {
        initializeWebSocket();
      }, 5000);
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
  }, [url, onMessage]);

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

  return useMemo(() => ({ send }), [send]);
};

export default useWebSocket;
