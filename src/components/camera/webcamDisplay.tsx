import React, { useEffect } from 'react';
import { WebcamDisplayProps } from '../../interface/propsType';
import useVideoStream from '../../hooks/useVideoStream';
import { useResData } from '../../context';

const WebcamDisplay: React.FC<WebcamDisplayProps> = ({
  deviceId,
  width = '35vw',
  borderRadius = '12px',
  drawingDot,
  showBlendShapes,
}) => {
  const { streaming } = useResData();
  const { webcamRef, showCanvasRef, startVideoStream, stopVideoStream } =
    useVideoStream({
      deviceId,
      width,
      borderRadius,
      drawingDot,
      showBlendShapes,
      showLandmarks: true, // Add default value for showLandmarks
    });

  useEffect(() => {
    if (deviceId) {
      startVideoStream();
    }

    return () => {
      stopVideoStream();
    };
  }, [deviceId, startVideoStream, stopVideoStream]);

  return (
    <div>
      {streaming ? (
        <>
          <video ref={webcamRef} style={{ display: 'none' }} />
          <canvas
            ref={showCanvasRef}
            style={{ width, borderRadius, transform: 'rotateY(180deg)' }}
          />
          {showBlendShapes && (
            <div style={{ height: '2px' }} id="video-blend-shapes" />
          )}
        </>
      ) : (
        <video
          ref={webcamRef}
          style={{ width, borderRadius, transform: 'rotateY(180deg)' }}
        />
      )}
    </div>
  );
};

export default WebcamDisplay;
