import React, { useEffect, useMemo } from 'react';
import { Modal, Image } from 'antd';
import { WebcamDisplayProps } from '../../interface/propsType';
import useVideoStream from '../../hooks/useVideoStream';
import useCaptureImage from '../../hooks/useCaptureImages';
import { useResData } from '../../context';
import DraggableInfoBox from '../dashboard/DraggableInfoBox';
import infoImage from '../../img/Info.jpg';

const WebcamDisplay: React.FC<WebcamDisplayProps> = ({
  deviceId,
  width = '35vw',
  borderRadius = '12px',
  drawingDot,
  showBlendShapes,
}) => {
  const { startVideoStream, stopVideoStream } = useVideoStream({
    deviceId,
    width,
    borderRadius,
    drawingDot,
    showBlendShapes,
    showLandmarks: false,
  });

  const {
    webcamRef,
    showDetailedData,
    trackingData,
    landMarkData,
    streaming,
    isAligned,
    setIsAligned,
    initialModal,
    setInitialModal,
    setStreaming,
    initializationSuccess,
  } = useResData();

  const THRESHOLD = 50; // Alignment threshold

  const handleOk = () => {
    setStreaming(true);
    setInitialModal(false); // Close the modal
  };

  // Handle Modal Cancel
  const handleCancel = () => {
    setInitialModal(false); // Just close the modal without starting the session
  };

  useCaptureImage(webcamRef);

  // Start and stop video stream based on `deviceId`
  useEffect(() => {
    if (deviceId) {
      startVideoStream();
    }
    return () => {
      stopVideoStream();
    };
  }, [deviceId, startVideoStream, stopVideoStream]);

  // Monitor alignment and frame capture
  useEffect(() => {
    if (!landMarkData?.poseResults?.landmarks?.length) {
      setIsAligned(false);
      return;
    }

    const { landmarks } = landMarkData.poseResults;
    const currentLandmarks = landmarks[0];

    if (!currentLandmarks?.length) {
      setIsAligned(false);
      return;
    }

    const pointer = currentLandmarks[0];
    if (!pointer) {
      setIsAligned(false);
      return;
    }

    // Check visibility of required points
    const requiredPointsVisible = [7, 8, 11, 12].every(
      (index) => currentLandmarks[index]?.visibility > 0.985,
    );

    if (!requiredPointsVisible) {
      setIsAligned(false);
      return;
    }

    // Proceed to check nose alignment
    const videoElement = webcamRef.current;
    if (!videoElement) {
      setIsAligned(false);
      return;
    }

    const { videoWidth } = videoElement;
    const centerX = videoWidth / 2;
    const noseX = pointer.x; // Get the nose x-coordinate
    const nosePixelX = noseX * videoWidth;
    const offsetFromCenter = Math.abs(nosePixelX - centerX);

    // Check if nose is aligned within the threshold
    if (streaming && !initializationSuccess) {
      setIsAligned(offsetFromCenter <= THRESHOLD);
    } else {
      setIsAligned(false);
    }
  }, [landMarkData, webcamRef, streaming, setIsAligned, initializationSuccess]);

  // Memoized container styles
  const containerStyles = useMemo<React.CSSProperties>(
    () => ({
      position: 'relative',
      width,
      borderRadius,
      overflow: 'hidden',
    }),
    [width, borderRadius],
  );

  // Memoized video styles
  const videoStyles = useMemo<React.CSSProperties>(
    () => ({
      width: '100%',
      height: 'auto',
      borderRadius,
      transform: 'rotateY(180deg)',
      position: 'relative',
    }),
    [borderRadius],
  );

  // Memoized overlay styles with alignment check
  const overlayStyles = useMemo<React.CSSProperties>(() => {
    let backgroundColor = 'transparent'; // Default to transparent

    if (streaming && !initializationSuccess) {
      if (isAligned) {
        backgroundColor = 'rgba(0, 255, 0, 0.2)'; // Green if aligned
      } else {
        backgroundColor = 'rgba(255, 0, 0, 0.2)'; // Red if not aligned
      }
    }

    return {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor,
      borderRadius,
      zIndex: 1,
    };
  }, [streaming, initializationSuccess, borderRadius, isAligned]);

  return (
    <>
      <Modal
        title="Prepare Your Position"
        open={initialModal}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="I'm Ready"
        cancelText="Cancel"
      >
        <Image src={infoImage} />
        {/* https://www.siphhospital.com/th/news/article/share/849 */}
        <p>Source : Siriraj Piyamaharajkarun Hospital</p>
        <p>
          Please ensure your face is centered in the frame and properly aligned
          before starting the session.
        </p>
      </Modal>
      <div style={containerStyles}>
        <div style={!initializationSuccess ? overlayStyles : {}} />
        <video ref={webcamRef} style={videoStyles} />

        {showDetailedData && (
          <DraggableInfoBox
            blink={trackingData?.blink}
            sitting={trackingData?.sitting}
            distance={trackingData?.distance}
            thoracic={trackingData?.thoracic}
          />
        )}
      </div>
    </>
  );
};

export default WebcamDisplay;
