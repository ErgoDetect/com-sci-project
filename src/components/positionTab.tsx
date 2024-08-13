/** @format */

import React, { useState, useEffect } from 'react';
import { Checkbox, Typography, Col, Row } from 'antd';
import { PositionTabProps } from '../interface/propsType';
import { useResData } from '../context';

const PositionTab: React.FC<PositionTabProps> = ({ mode }) => {
  const { Title, Text } = Typography;
  const { resData, debugData, combineResult } = useResData();
  // const positionData = resData;
  // const frameTracking = debugData?.frameCount;
  // const latency = debugData?.latency;

  // console.log(combineResult);

  const formatCoordinate = (value?: number) =>
    value ? (Math.round(value * 100) / 100).toFixed(2) : 'No data';

  return (
    <div style={{ overflowY: 'scroll', height: 450 }}>
      <Row align="middle">
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
            x: {formatCoordinate(combineResult?.shoulderPosition?.x)}
            <br />
            y: {formatCoordinate(combineResult?.shoulderPosition?.y)}
            <br />
            z: {formatCoordinate(combineResult?.shoulderPosition?.z)}
            <br />
          </Text>
        </Col>
      </Row>
      <Row align="middle">
        <Col>
          <Title level={5} style={{ margin: 0 }}>
            Blink Left
          </Title>
        </Col>
      </Row>
      <Row>
        <Col span={2} />
        <Col>
          <Text>
            eAR: {formatCoordinate(combineResult?.blinkLeft)}
            <br />
          </Text>
        </Col>
      </Row>
      <Row align="middle">
        <Col>
          <Title level={5} style={{ margin: 0 }}>
            Blink Right
          </Title>
        </Col>
      </Row>
      <Row>
        <Col span={2} />
        <Col>
          <Text>
            eAR: {formatCoordinate(combineResult?.blinkRight)}
            <br />
          </Text>
        </Col>
      </Row>

      <Row align="middle">
        <Col>
          <Title level={5} style={{ margin: 0 }}>
            Left Iris Diameter
          </Title>
        </Col>
      </Row>
      <Row>
        <Col span={2} />
        <Col>
          <Text>
            Diameter: {formatCoordinate(combineResult?.leftIrisDiameter)}
            <br />
          </Text>
        </Col>
      </Row>
      <Row align="middle">
        <Col>
          <Title level={5} style={{ margin: 0 }}>
            Right Iris Diameter
          </Title>
        </Col>
      </Row>
      <Row>
        <Col span={2} />
        <Col>
          <Text>
            Diameter: {formatCoordinate(combineResult?.rightIrisDiameter)}
            <br />
          </Text>
        </Col>
      </Row>
    </div>
  );
};

export default PositionTab;
