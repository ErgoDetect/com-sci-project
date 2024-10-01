/** @format */

import React, { useRef, useCallback } from 'react';

import { InfoBox } from '../../styles/styles';

interface DraggableInfoBoxProps {
  blinkRate: number;
  sessionDuration: string;
  proximityAlerts: number;
  badPostureAlerts: number;
  goodPostureTime: number;
  position: { x: number; y: number };
  setPosition: (pos: { x: number; y: number }) => void;
}

const DraggableInfoBox: React.FC<DraggableInfoBoxProps> = ({
  blinkRate,
  sessionDuration,
  proximityAlerts,
  badPostureAlerts,
  goodPostureTime,
  position,
  setPosition,
}) => {
  const boxRef = useRef<HTMLDivElement>(null);

  const onDragStart = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    const img = new Image();
    img.src =
      'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
    e.dataTransfer.setDragImage(img, 0, 0);
  }, []);

  const onDrag = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      setPosition({
        x: window.innerWidth - e.clientX - 100,
        y: window.innerHeight - e.clientY - 100,
      });
    },
    [setPosition],
  );

  return (
    <InfoBox
      ref={boxRef}
      x={position.x}
      y={position.y}
      draggable
      onDragStart={onDragStart}
      onDrag={onDrag}
    >
      <div>Blinks Detected: {blinkRate} per minute</div>
      <div>Session Duration: {sessionDuration}</div>
      <div>Proximity Alerts: {proximityAlerts}</div>
      <div>Hunchback Alerts: {badPostureAlerts}</div>
      <div>Good Posture Time: {goodPostureTime} min</div>
    </InfoBox>
  );
};

export default DraggableInfoBox;
