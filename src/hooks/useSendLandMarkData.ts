import { useRef, useMemo } from 'react';
import { debounce } from 'lodash'; // Optionally use lodash for debouncing
import { LandmarksResult } from '../interface/propsType';
import { filterLandmark } from '../utility/filterLandMark';
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
  const logInterval = 75; // Interval for sending landmark data
  const { landMarkData, setResData, streaming, setCombineResult } =
    useResData();
  const { send, message } = useWebSocket('landmark/results', setResData);

  // Debounced function to avoid rapid sends in a short time frame
  const sendLandMarkData = useMemo(
    () =>
      debounce(() => {
        const currentTime = Date.now();
        if (
          landMarkData &&
          currentTime - lastLogTimeRef.current >= logInterval
        ) {
          try {
            const filteredData = filterLandmark(
              landMarkData as LandmarksResult,
            );
            const dataToSend = {
              data: filteredData,
              timestamp: currentTime,
            };

            send(dataToSend); // Send filtered data
            lastLogTimeRef.current = currentTime;
          } catch (error) {
            console.error('Failed to send landmark data:', error);
          }
        }
      }, logInterval),
    [landMarkData, send],
  );

  // Only send data when streaming is active
  useInterval(sendLandMarkData, logInterval, streaming);
};

export default useSendLandmarkData;
