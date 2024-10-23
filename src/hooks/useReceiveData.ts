import { useResData } from '../context';

const useReceiveData = () => {
  const { resData, setTrackingData, setInitializationSuccess } = useResData();
  if (!resData) {
    return;
  }
  if (resData.type === 'all_topic_alerts') {
    setTrackingData(resData.data); // Update tracking data
  } else if (resData.type === 'initialization_success') {
    setInitializationSuccess(true);
    console.log('init success');
  }
};
export default useReceiveData;
