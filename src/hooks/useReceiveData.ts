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

      return;
    }

    // Process `resData` only if `streaming` is true
    if (resData && streaming) {
      if (resData.type === 'all_topic_alerts') {
        setTrackingData((prevData: any) =>
          prevData !== resData.data ? resData.data : prevData,
        );
      } else if (resData.type === 'initialization_success') {
        setInitializationSuccess(true);
        setRealTimeSessionId(resData.sitting_session_id);
        console.log('init success');
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
};

export default useReceiveData;
