/** @format */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Layout, Button, Tabs, Menu, Checkbox, theme } from 'antd';
import { LaptopOutlined } from '@ant-design/icons';
import { PositionData, Detection } from '../interface/propsType';
import { useResData } from '../context';
import CustomSlider from '../components/slider';
import PositionTab from '../components/positionTab';
import '../styles/styles.css';
import chalk from 'chalk';

const { Content, Sider } = Layout;

const DetectionPage: React.FC<Detection> = ({ children, combineResult }) => {
  const { resData } = useResData();
  const positionData = resData;

  const [sliderValues, setSliderValues] = useState({
    headRotationX: 0.1,
    headRotationY: 0.1,
    headRotationZ: 0.1,
  });

  const handleSliderChange = useCallback((key: string, value: number) => {
    setSliderValues((prevValues) => ({
      ...prevValues,
      [key]: value,
    }));
  }, []);

  const sensitiveMenu = useMemo(
    () => [
      {
        key: '1',
        icon: (
          <Checkbox>
            <LaptopOutlined />
          </Checkbox>
        ),
        label: 'Head pose rotation angle',
        children: [
          {
            key: '11',
            label: (
              <CustomSlider
                value={sliderValues.headRotationX}
                onChange={(value: number) =>
                  handleSliderChange('headRotationX', value)
                }
                text="x :"
              />
            ),
          },
          {
            key: '12',
            label: (
              <CustomSlider
                value={sliderValues.headRotationY}
                onChange={(value: number) =>
                  handleSliderChange('headRotationY', value)
                }
                text="y :"
              />
            ),
          },
          {
            key: '13',
            label: (
              <CustomSlider
                value={sliderValues.headRotationZ}
                onChange={(value: number) =>
                  handleSliderChange('headRotationZ', value)
                }
                text="z :"
              />
            ),
          },
        ],
      },
      { key: '2', icon: <LaptopOutlined />, label: 'Option 2' },
    ],
    [sliderValues, handleSliderChange],
  );

  const rightTab = useMemo(
    () => [
      {
        key: 'rightTab1',
        label: 'Sensitive',
        children: (
          <Menu
            mode="inline"
            style={{ height: '100%' }}
            items={sensitiveMenu}
          />
        ),
      },
      {
        key: 'rightTab2',
        label: 'Output',
        children: 'Content of Tab Pane 2',
      },
      {
        key: 'rightTab3',
        label: 'Position',
        children: <PositionTab combineResult={combineResult} />,
      },
    ],
    [sensitiveMenu],
  );

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  // useEffect(() => {
  //   const checkPositionChange = () => {
  //     if (conditionPositionData && positionData) {
  //       const positionChanged =
  //         Math.abs(
  //           positionData.headPosition.x - conditionPositionData.headPosition.x,
  //         ) > sliderValues.headRotationX;

  //       if (positionChanged) {
  //         console.info('Position changed');
  //       }
  //     }
  //   };

  //   checkPositionChange();
  // }, [conditionPositionData, positionData, sliderValues]);

  return (
    <Content className="Content">
      <Layout style={{ height: '100%' }}>
        <Content style={{ padding: '10px' }}>
          {/* <Button onClick={setPositionData}>Set</Button> */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              height: '100%',
            }}
          >
            <div style={{ placeSelf: 'center' }}>{children}</div>
          </div>
        </Content>
        <Sider width={300} style={{ background: colorBgContainer }}>
          <Tabs
            style={{ padding: '10px' }}
            defaultActiveKey="1"
            items={rightTab}
          />
        </Sider>
      </Layout>
    </Content>
  );
};

export default DetectionPage;
