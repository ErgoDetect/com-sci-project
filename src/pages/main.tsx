/** @format */

import { useEffect, useMemo, useState } from 'react';
import { DataProps, PositionData } from '../interface/propsType';
import DetectionPage from './DetectionPage';
import ResultPage from './ResultPage';
import { Layout, Menu } from 'antd';
import { Header } from 'antd/es/layout/layout';
import VideoFeed from '../components/videoFeed';

const App = () => {
  const headerMenu = useMemo(
    () => [
      { key: '0', label: 'Detection' },
      { key: '1', label: 'Result' },
    ],
    [],
  );

  const [currentMenu, setCurrentMenu] = useState('0');
  const [data, setData] = useState<DataProps | undefined>(undefined);
  const [landmarkState, setLandmarkState] = useState({
    showHeadLandmark: false,
    showShoulderLandmark: false,
  });

  const handleShowLandmarkChange = (updatedState: {
    showHeadLandmark: boolean;
    showShoulderLandmark: boolean;
  }) => {
    setLandmarkState(updatedState);
  };

  const positionData = data as unknown as PositionData | undefined;

  const drawArray = useMemo(
    () => ({
      x: [] as number[],
      y: [] as number[],
    }),
    [],
  );

  useEffect(() => {
    if (data) {
      console.log(
        'data :',
        data,
        'Received Frame : ',
        data.frameCount,
        'Latency : ',
        data.latency.toFixed(2),
        'ms',
      );

      drawArray.x = [];
      drawArray.y = [];

      const headPosition = positionData?.headPosition;
      const shoulderPosition = positionData?.shoulderPosition;

      if (landmarkState.showHeadLandmark && headPosition) {
        drawArray.x.push(headPosition.x as number);
        drawArray.y.push(headPosition.y as number);
      }

      if (landmarkState.showShoulderLandmark && shoulderPosition) {
        drawArray.x.push(shoulderPosition.shoulder_left.x as number);
        drawArray.y.push(shoulderPosition.shoulder_left.y as number);
        drawArray.x.push(shoulderPosition.shoulder_right.x as number);
        drawArray.y.push(shoulderPosition.shoulder_right.y as number);
      }
    }
  }, [data, drawArray, landmarkState, positionData]);

  return (
    <Layout className="Layout">
      <Header
        className="Header"
        style={{ display: 'flex', alignItems: 'center' }}
      >
        <h2 style={{ padding: '5px' }}>Header</h2>
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={['0']}
          items={headerMenu}
          onClick={(e) => setCurrentMenu(e.key)}
          style={{ flex: 1, minWidth: 0 }}
        />
      </Header>
      {currentMenu === '0' && (
        <DetectionPage
          data={data}
          onShowLandmarkChange={handleShowLandmarkChange}
        >
          <VideoFeed setData={setData} drawingDot={drawArray} />
        </DetectionPage>
      )}
      {currentMenu === '1' && <ResultPage />}
    </Layout>
  );
};

export default App;
