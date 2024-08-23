import React, { useEffect } from 'react';
import { WebcamDisplayProps } from '../../interface/propsType';
import useVideoStream from '../../hooks/useVideoStream';
import useCaptureImage from '../../hooks/useCaptureImages';

const WebcamDisplay: React.FC<WebcamDisplayProps> = ({
  deviceId,
  width = '35vw',
  borderRadius = '12px',
  drawingDot,
  showBlendShapes,
}) => {
  const { webcamRef, showCanvasRef, startVideoStream, stopVideoStream } =
    useVideoStream({
      deviceId,
      width,
      borderRadius,
      drawingDot,
      showBlendShapes,
      showLandmarks: false,
    });

  useCaptureImage(webcamRef);

  useEffect(() => {
    if (deviceId) {
      startVideoStream();
    }

    return () => {
      stopVideoStream();
    };
  }, [deviceId, startVideoStream, stopVideoStream]);

  return (
    <div
      style={{ position: 'relative', width, borderRadius, overflow: 'hidden' }}
    >
      <video
        ref={webcamRef}
        style={{
          width: '100%',
          height: 'auto',
          borderRadius,
          transform: 'rotateY(180deg)',
          position: 'relative',
        }}
      />

      <canvas
        ref={showCanvasRef}
        style={{
          width: '100%',
          height: 'auto',
          borderRadius,
          transform: 'rotateY(180deg)',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      />

      {showBlendShapes && (
        <div style={{ height: '2px' }} id="video-blend-shapes" />
      )}
    </div>
  );
};

export default WebcamDisplay;
