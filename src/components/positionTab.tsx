/** @format */

import React, { useState, useEffect } from 'react';
import { PositionData, PositionTabProps } from '../interface/propsType';
import { Checkbox, Typography, Col, Row } from 'antd';
import { useResData } from '../context';

const PositionTab: React.FC<PositionTabProps> = ({ onShowLandmarkChange }) => {
  const { Title, Text } = Typography;
  const { resData, debugData } = useResData();
  const positionData = resData;
  const frameTracking = debugData?.frameCount;
  const latency = debugData?.latency;

  const [landmarkState, setLandmarkState] = useState({
    showHeadLandmark: false,
    showShoulderLandmark: false,
  });

  useEffect(() => {
    if (onShowLandmarkChange) {
      onShowLandmarkChange(landmarkState);
    }
  }, [landmarkState, onShowLandmarkChange]);

  const handleCheckboxChange = (type: 'head' | 'shoulder') => (e: any) => {
    setLandmarkState((prevState) => ({
      ...prevState,
      [`show${type.charAt(0).toUpperCase() + type.slice(1)}Landmark`]:
        e.target.checked,
    }));
  };

  const formatCoordinate = (value?: number) =>
    value ? (Math.round(value * 100) / 100).toFixed(2) : 'No data';

  return (
    <div style={{ overflowY: 'scroll', height: 450 }}>
      <Row align="middle">
        <Col span={2}>
          <Checkbox
            checked={landmarkState.showHeadLandmark}
            onChange={handleCheckboxChange('head')}
          />
        </Col>
        <Col>
          <Title level={5} style={{ margin: 0 }}>
            Head Position
          </Title>
        </Col>
      </Row>
      <Row>
        <Col span={2} />
        <Col>
          <Text>
            x: {formatCoordinate(positionData?.headPosition?.x)}
            <br />
            y: {formatCoordinate(positionData?.headPosition?.y)}
            <br />
          </Text>
        </Col>
      </Row>
      <Row align="middle">
        <Col span={2}>
          <Checkbox
            checked={landmarkState.showShoulderLandmark}
            onChange={handleCheckboxChange('shoulder')}
          />
        </Col>
        <Col>
          <Title level={5} style={{ margin: 0 }}>
            Shoulder Position
          </Title>
        </Col>
      </Row>
      <Row>
        <Col span={2} />
        <Col>
          <Text>
            Left Shoulder Position
            <br />
            x:{' '}
            {formatCoordinate(positionData?.shoulderPosition?.shoulder_left.x)}
            <br />
            y:{' '}
            {formatCoordinate(positionData?.shoulderPosition?.shoulder_left.y)}
            <br />
            z:{' '}
            {formatCoordinate(positionData?.shoulderPosition?.shoulder_left.z)}
            <br />
            Right Shoulder Position
            <br />
            x:{' '}
            {formatCoordinate(positionData?.shoulderPosition?.shoulder_right.x)}
            <br />
            y:{' '}
            {formatCoordinate(positionData?.shoulderPosition?.shoulder_right.y)}
            <br />
            z:{' '}
            {formatCoordinate(positionData?.shoulderPosition?.shoulder_right.z)}
            <br />
          </Text>
        </Col>
      </Row>
      <h2>Depth</h2>
      <p>
        Left Iris: {formatCoordinate(positionData?.depthLeftIris)}
        <br />
        Right Iris: {formatCoordinate(positionData?.depthRightIris)}
        <br />
      </p>
      <br />
      Receive Frame: {frameTracking ?? 'No data'}
      <br />
      Latency: {latency ?? 'No data'}
    </div>
  );
};

export default PositionTab;
