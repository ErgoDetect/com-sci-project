import { useEffect, useRef } from 'react';
import { useResData } from '../context';

const useNotify = () => {
  const {
    resData,
    showBlinkNotification,
    showSittingNotification,
    showDistanceNotification,
    showThoracticNotification,
  } = useResData();

  const lastResDataRef = useRef(null);

  useEffect(() => {
    // Only trigger notifications if resData is different from the previous value
    if (
      resData &&
      resData.type === 'triggered_alerts' &&
      lastResDataRef.current !== resData
    ) {
      const { blink, sitting, distance, thoracic } = resData.data;

      if (blink) {
        window.electron.notifications.showNotification(
          'Blink',
          'Blink more',
          showBlinkNotification,
        );
      }

      if (sitting) {
        window.electron.notifications.showNotification(
          'Sitting Alert',
          'Take a break from sitting.',
          showSittingNotification,
        );
      }

      if (distance) {
        window.electron.notifications.showNotification(
          'Distance Alert',
          'Maintain proper distance.',
          showDistanceNotification,
        );
      }

      if (thoracic) {
        window.electron.notifications.showNotification(
          'Posture Alert',
          'Adjust your thoracic posture.',
          showThoracticNotification,
        );
      }

      // Update the lastResDataRef to the current resData
      lastResDataRef.current = resData;
    }
  }, [
    resData,
    showBlinkNotification,
    showSittingNotification,
    showDistanceNotification,
    showThoracticNotification,
  ]);
};

export default useNotify;
