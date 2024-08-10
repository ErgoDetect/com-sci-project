import React, { useEffect } from 'react';
import { WebcamDisplayProps } from '../../interface/propsType';
import useVideoStream from '../../hooks/useVideoStream';
import { useResData } from '../../context';
import useCaptureImage from '../../hooks/useCaptureImages';

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
      showLandmarks: true,
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

  // Ensures the video is playing before capturing
  // useEffect(() => {
  //   const video = webcamRef.current;

  //   if (video) {
  //     const onLoadedData = () => {
  //       console.log('Video is playing and ready');
  //     };

  //     video.addEventListener('loadeddata', onLoadedData);

  //     return () => {
  //       video.removeEventListener('loadeddata', onLoadedData);
  //     };
  //   }
  //   return undefined;
  // }, [webcamRef, startCapture]);

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
          position: 'relative', // Set relative to parent container
        }}
      />
      {streaming && (
        <canvas
          ref={showCanvasRef}
          style={{
            width: '100%',
            height: 'auto',
            borderRadius,
            transform: 'rotateY(180deg)',
            position: 'absolute', // Overlay the canvas on the video
            top: 0,
            left: 0,
          }}
        />
      )}
      {showBlendShapes && (
        <div style={{ height: '2px' }} id="video-blend-shapes" />
      )}
    </div>
  );
};

export default WebcamDisplay;
