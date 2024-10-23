import { useResData } from '../context';

const useNotify = () => {
  const { resData, setTrackingData } = useResData();

  if (!resData) return; // Early return if resData is null or undefined

  if (resData.type === 'all_topic_alerts') {
    setTrackingData(resData.data);
    return; // Exit early after handling this type
  }

  if (resData.type === 'triggered_alerts') {
    const { blink, sitting, distance, thoractic } = resData.data;

    let alertType = null; // Initialize alertType to null

    // Determine alert type based on conditions
    if (blink) {
      alertType = 'Blink';
    } else if (sitting) {
      alertType = 'Sitting';
    } else if (distance) {
      alertType = 'Distance';
    } else if (thoractic) {
      alertType = 'Thoractic';
    }

    // Trigger notification if any alertType is set
    if (alertType) {
      window.electron.ipcRenderer.showNotification(
        alertType,
        `Please adjust your ${alertType.toLowerCase()} behavior.`,
      );
    }
  }
};

export default useNotify;
