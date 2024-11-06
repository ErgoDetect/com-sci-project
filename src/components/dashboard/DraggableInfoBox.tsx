/** @format */

import React from 'react';

import { InfoBox } from '../../styles/styles';

interface DraggableInfoBoxProps {
  blink: boolean;
  sitting: boolean;
  distance: boolean;
  thoracic: boolean;
}
const DraggableInfoBox: React.FC<DraggableInfoBoxProps> = ({
  blink,
  sitting,
  distance,
  thoracic,
}) => {
  // Set the position to the top-left corner relative to the video element

  return (
    <InfoBox>
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        <span>Blinks:</span>
        <span>{blink?.toString() || 'null'}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        <span>Sitting:</span>
        <span>{sitting?.toString() || 'null'}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        <span>Distance:</span>
        <span>{distance?.toString() || 'null'}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        <span>Thoracic:</span>
        <span>{thoracic?.toString() || 'null'}</span>
      </div>
    </InfoBox>
  );
};

export default DraggableInfoBox;
