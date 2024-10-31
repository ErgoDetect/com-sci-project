import { useResData } from '../context';

const useReceiveData = () => {
  const {
    resData,
    setTrackingData,
    setInitializationSuccess,
    setRealTimeSessionId,
  } = useResData();
  if (!resData) {
    return;
  }
  if (resData.type === 'all_topic_alerts') {
    setTrackingData(resData.data); // Update tracking data
  } else if (resData.type === 'initialization_success') {
    setInitializationSuccess(true);
    setRealTimeSessionId(resData.sitting_session_id);
    console.log('init success');
  } else if (resData === 'sitting_session_id') {
    console.log(resData);
  }
};
export default useReceiveData;
