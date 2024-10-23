import React, { useEffect, useMemo, useState } from 'react';
import { Modal } from 'antd';
import { WebcamDisplayProps } from '../../interface/propsType';
import useVideoStream from '../../hooks/useVideoStream';
import useCaptureImage from '../../hooks/useCaptureImages';
import { useResData } from '../../context';
import DraggableInfoBox from '../dashboard/DraggableInfoBox';

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
    const { poseResults } = landMarkData || {};

    const pointer =
      poseResults?.landmarks?.length > 0 && poseResults.landmarks[0].length > 0
        ? poseResults.landmarks[0][0].x
        : undefined;

    if (pointer) {
      const noseX = pointer; // Get the nose x-coordinate
      const videoElement = webcamRef.current;

      if (videoElement) {
        const { videoWidth } = videoElement;
        const centerX = videoWidth / 2;

        const nosePixelX = noseX * videoWidth;
        const offsetFromCenter = Math.abs(nosePixelX - centerX);

        // Check if nose is aligned within the threshold
        if (streaming && !initializationSuccess) {
          if (offsetFromCenter <= THRESHOLD) {
            setIsAligned(true);
          } else {
            setIsAligned(false);
          }
        }
      }
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
        open={initialModal} // Changed `open` to `visible`
        onOk={handleOk} // Start session when user is ready
        onCancel={handleCancel} // Cancel the modal
        okText="I'm Ready" // Customize button text
        cancelText="Cancel"
      >
        <p>
          Please ensure your face is centered in the frame and properly aligned
          before starting the session.
        </p>
      </Modal>
      <div style={containerStyles}>
        <div style={overlayStyles} />
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
