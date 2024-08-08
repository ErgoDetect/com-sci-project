import React, { useState } from 'react';
import ReusableModal from './index';

const CameraAccess = () => {
  const [modalVisible, setModalVisible] = useState(true);
  const [hasCameraAccess, setHasCameraAccess] = useState(false);

  const requestCameraAccess = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      setHasCameraAccess(true);
      setModalVisible(false);
    } catch (error) {
      console.error('Camera access denied:', error);
    }
  };

  return (
    <>
      {!hasCameraAccess && (
        <ReusableModal
          visible={modalVisible}
          title="Camera Access Required"
          onConfirm={requestCameraAccess}
          onClose={() => setModalVisible(false)}
        >
          <p>
            Your application needs access to the webcam to function correctly.
            Please grant access when prompted.
          </p>
        </ReusableModal>
      )}
      {hasCameraAccess && <div>Your application is now using the webcam.</div>}
    </>
  );
};

export default CameraAccess;
