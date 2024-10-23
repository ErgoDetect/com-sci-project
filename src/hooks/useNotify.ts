import { useResData } from '../context';

const useNotify = () => {
  const { resData } = useResData();

  if (resData && resData.type === 'triggered_alerts') {
    const { blink, sitting, distance, thoractic } = resData.data;

    if (blink) {
      window.electron.ipcRenderer.showNotification('Blink', 'blink more');
    }

    if (sitting) {
      window.electron.ipcRenderer.showNotification(
        'Sitting Alert',
        'Take a break from sitting.',
      );
    }

    if (distance) {
      window.electron.ipcRenderer.showNotification(
        'Distance Alert',
        'Maintain proper distance.',
      );
    }

    if (thoractic) {
      window.electron.ipcRenderer.showNotification(
        'Posture Alert',
        'Adjust your thoracic posture.',
      );
    }
  }
};

export default useNotify;
