import React, { useEffect, useMemo } from 'react';
import { WebcamDisplayProps } from '../../interface/propsType';
import useVideoStream from '../../hooks/useVideoStream';
import useCaptureImage from '../../hooks/useCaptureImages';
import { useResData } from '../../context';

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
  const { webcamRef } = useResData();

  useCaptureImage(webcamRef);

  useEffect(() => {
    if (deviceId) {
      startVideoStream();
    }
    return stopVideoStream;
  }, [deviceId, startVideoStream, stopVideoStream]);

  // Memoized styles with correct typing
  const containerStyles = useMemo<React.CSSProperties>(
    () => ({
      position: 'relative',
      width,
      borderRadius,
      overflow: 'hidden',
    }),
    [width, borderRadius],
  );

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

  // const canvasStyles = useMemo<React.CSSProperties>(
  //   () => ({
  //     width: '100%',
  //     height: 'auto',
  //     borderRadius,
  //     transform: 'rotateY(180deg)',
  //     position: 'absolute',
  //     top: 0,
  //     left: 0,
  //   }),
  //   [borderRadius],
  // );

  return (
    <div style={containerStyles}>
      <video ref={webcamRef} style={videoStyles} />
      {/* <canvas ref={showCanvasRef} style={canvasStyles} />
      {showBlendShapes && (
        <div style={{ height: '2px' }} id="video-blend-shapes" />
      )} */}
    </div>
  );
};

export default WebcamDisplay;
