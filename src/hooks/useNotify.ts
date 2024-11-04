import { useEffect, useRef } from 'react';
import { useResData } from '../context';

const useNotify = () => {
  const {
    resData,
    showBlinkNotification,
    showSittingNotification,
    showDistanceNotification,
    showThoracticNotification,
    setStreaming,
  } = useResData();

  const lastResDataRef = useRef(null);

  useEffect(() => {
    // Only trigger notifications if resData is different from the previous value
    if (
      resData &&
      resData.type === 'triggered_alerts' &&
      lastResDataRef.current !== resData
    ) {
      const { blink, sitting, distance, thoracic, time_limit_exceed } =
        resData.data;

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

      if (time_limit_exceed) {
        window.electron.notifications.showNotification(
          'Time limit Alert',
          'Session Exceed 2 Hours.',
          showThoracticNotification,
        );
        setStreaming(false);
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
