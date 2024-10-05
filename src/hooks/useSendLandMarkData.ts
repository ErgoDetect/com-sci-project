import { useCallback, useRef, useEffect } from 'react';
import { LandmarksResult } from '../interface/propsType';
import { filterLandmark, getIrisDiameter } from '../utility/filterLandMark';
import useInterval from './useInterval';
import { useResData } from '../context';
import useWebSocket from '../utility/webSocketConfig';

interface UseSendLandmarkDataOptions {
  combineResults?: boolean;
}

const useSendLandmarkData = ({
  combineResults = false,
}: UseSendLandmarkDataOptions = {}) => {
  const lastLogTimeRef = useRef<number>(0);
  const logInterval = 1000;
  const { landMarkData, setResData, streaming, setCombineResult } =
    useResData();
  const { send, message } = useWebSocket('landmark/results/', setResData);

  const sendLandMarkData = useCallback(() => {
    const currentTime = Date.now();

    if (landMarkData && currentTime - lastLogTimeRef.current >= logInterval) {
      try {
        const filteredData = filterLandmark(landMarkData as LandmarksResult);
        const dataToSend = {
          data: filteredData,
          timestamp: currentTime,
        };

        // send(JSON.stringify(dataToSend));
        send(dataToSend);
        lastLogTimeRef.current = currentTime;
      } catch (error) {
        console.error('Failed to send landmark data:', error);
      }
    }
  }, [landMarkData, send]);

  useEffect(() => {
    if (combineResults && message && landMarkData) {
      try {
        const parsedMessage =
          typeof message === 'string' ? JSON.parse(message) : message;

        const newResult = {
          ...parsedMessage,
          ...getIrisDiameter(landMarkData as LandmarksResult),
        };

        setCombineResult(newResult);
      } catch (error) {
        console.error('Failed to combine results:', error);
      }
    }
  }, [combineResults, message, landMarkData, setCombineResult]);

  useInterval(sendLandMarkData, logInterval, streaming);
};

export default useSendLandmarkData;
