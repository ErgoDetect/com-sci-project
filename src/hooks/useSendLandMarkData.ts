import { useRef, useEffect } from 'react';
import { LandmarksResult } from '../interface/propsType';
import { filterLandmark } from '../utility/filterLandMark';
import { useResData } from '../context';
import useWebSocket from '../utility/webSocketConfig';

interface UseSendLandmarkDataOptions {
  combineResults?: boolean;
}

const useSendLandmarkData = ({
  combineResults = false,
}: UseSendLandmarkDataOptions = {}) => {
  const lastLandmarkDataRef = useRef<LandmarksResult | null>(null); // Store the last sent data
  const { landMarkData, setResData, streaming, setCombineResult } =
    useResData();
  const { send, message } = useWebSocket('landmark/results', setResData);

  // Ref to keep track of how many times the data is sent
  const countRef = useRef<number>(0);

  useEffect(() => {
    const sendLandMarkData = () => {
      if (landMarkData && streaming) {
        try {
          const currentDataString = JSON.stringify(landMarkData);
          const lastDataString = JSON.stringify(lastLandmarkDataRef.current);

          if (lastDataString !== currentDataString) {
            const filteredData = filterLandmark(
              landMarkData as LandmarksResult,
            );
            const currentTime = Date.now();
            const dataToSend = {
              data: filteredData,
              timestamp: currentTime,
            };

            countRef.current += 1;
            console.log('Send Count:', countRef.current);
            console.log('Sending Data:', dataToSend);

            send(dataToSend);
            lastLandmarkDataRef.current = landMarkData;
          }
        } catch (error) {
          console.error('Failed to send landmark data:', error);
        }
      } else {
        countRef.current = 0;
      }
    };

    sendLandMarkData(); // Call the function when landMarkData or streaming changes
  }, [landMarkData, streaming, send]);
};

export default useSendLandmarkData;
