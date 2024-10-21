import { useRef, useState, useEffect, useCallback, useMemo } from 'react';

type WebSocketMessageHandler = (data: any) => void;

interface UseWebSocketResult {
  send: (data: any) => void;
  message: any;
  reconnectAttempts: number; // Exposed to provide feedback on reconnection attempts
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
      setReconnectAttempts(0); // Reset reconnection attempts on successful connection
      flushMessageQueue(); // Send any queued messages
    };

    const handleMessage = (event: MessageEvent) => {
      const data = isJSON(event.data) ? JSON.parse(event.data) : event.data;
      console.info('WebSocket message received:', data);
      setMessage(data);
      onMessage?.(data); // Pass the message to the onMessage callback if provided
    };

    const handleError = (error: Event) => {
      console.error('WebSocket error occurred:', error);
      // Optional: handle specific error codes here or trigger additional error-handling strategies
    };

    const handleClose = () => {
      console.info('WebSocket connection closed');
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      // Exponential backoff with a cap of 30 seconds
      reconnectTimeoutRef.current = setTimeout(
        () => {
          setReconnectAttempts((prev) => prev + 1); // Increment the reconnection attempts
          initializeWebSocket(); // Attempt to reconnect
        },
        Math.min(5000 * (reconnectAttempts + 1), 30000),
      );
    };

    socket.addEventListener('open', handleOpen);
    socket.addEventListener('message', handleMessage);
    socket.addEventListener('error', handleError);
    socket.addEventListener('close', handleClose);

    // Clean up event listeners and close the WebSocket connection on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.removeEventListener('open', handleOpen);
        socketRef.current.removeEventListener('message', handleMessage);
        socketRef.current.removeEventListener('error', handleError);
        socketRef.current.removeEventListener('close', handleClose);

        if (socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.close(1000, 'Component unmounting');
        }
      }
    };
  }, [dest, isJSON, onMessage, reconnectAttempts, flushMessageQueue]);

  // Effect to initialize the WebSocket connection when the component mounts or the destination changes
  useEffect(() => {
    const cleanupWebSocket = initializeWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      cleanupWebSocket(); // Cleanup the WebSocket connection
    };
  }, [initializeWebSocket]);

  // Function to send messages through the WebSocket
  const send = useCallback((data: any) => {
    const compressedMessage = JSON.stringify(data); // Compress the message by stringifying it
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(compressedMessage); // Send the message if the WebSocket is open
    } else {
      console.warn('WebSocket not open. Queuing message.');
      messageQueue.current.push(compressedMessage); // Queue the message if WebSocket is not open
    }
  }, []);

  // Memoize the result to prevent unnecessary re-renders
  return useMemo(
    () => ({
      send,
      message,
      reconnectAttempts, // Expose reconnect attempts for UI feedback
    }),
    [send, message, reconnectAttempts],
  );
};

export default useWebSocket;
