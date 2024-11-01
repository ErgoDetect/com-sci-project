import { useEffect } from 'react';
import { useResData } from '../context';

const useReceiveData = () => {
  const {
    resData,
    setTrackingData,
    setInitializationSuccess,
    setRealTimeSessionId,
    streaming,
    setIsAligned,
  } = useResData();

  useEffect(() => {
    // Reset state when `streaming` becomes false, indicating a new session start
    if (!streaming) {
      setInitializationSuccess(false);
      setTrackingData(null);
      setIsAligned(false);
    }

    // Process `resData` only if `streaming` is true
    if (resData) {
      if (resData.type === 'all_topic_alerts') {
        setTrackingData((prevData: any) =>
          prevData !== resData.data ? resData.data : prevData,
        );
      } else if (resData.type === 'initialization_success') {
        setInitializationSuccess(true);
        setRealTimeSessionId(resData.sitting_session_id);
        console.log('init success');
      } else if (resData === 'sitting_session_id') {
        console.log(resData);
      }
    }
  }, [
    resData,
    streaming,
    setTrackingData,
    setInitializationSuccess,
    setRealTimeSessionId,
    setIsAligned,
  ]);

  // Optional: Return any data if needed for the component that uses this hook
};

export default useReceiveData;
