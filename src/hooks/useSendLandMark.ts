import { useRef, useCallback, useEffect } from 'react';
import useThrottle from './useThrottle';
import useWebSocket from '../utility/webSocketConfig';
import filterLandmark from '../utility/filterLandMark';
import { LandmarksResult } from '../interface/propsType';

const useSendLandmarkData = (landMarkData: any, logInterval: number) => {
  const lastLogTimeRef = useRef<number>(0);
  const { send } = useWebSocket('ws://localhost:8000/ws', () => {});

  const sendLandMarkData = useCallback(() => {
    const currentTime = Date.now();
    if (currentTime - lastLogTimeRef.current >= logInterval) {
      send(
        JSON.stringify({
          data: filterLandmark(landMarkData as LandmarksResult),
          timestamp: currentTime,
        }),
      );
      lastLogTimeRef.current = currentTime;
    }
  }, [landMarkData, logInterval, send]);

  const throttledSend = useThrottle(sendLandMarkData, logInterval);

  useEffect(() => {
    const intervalId: ReturnType<typeof setInterval> = setInterval(
      throttledSend,
      logInterval,
    );

    return () => {
      clearInterval(intervalId);
    };
  }, [throttledSend, logInterval]);

  return null;
};

export default useSendLandmarkData;
