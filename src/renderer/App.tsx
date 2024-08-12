import React, { useState, useMemo, useEffect } from 'react';
import { Layout, Menu, Modal, Button, RadioChangeEvent, Radio } from 'antd';
import { DebugData, PositionData } from '../interface/propsType';
import DetectionPage from '../pages/DetectionPage';
import ResultPage from '../pages/ResultPage';
import { VideoFeedVer1 } from '../components/videoFeed/videoFeedVer1';
import { VideoFeedVer2 } from '../components/videoFeed/videoFeedVer2';
import { useResData } from '../context';

// Define modal visibility and camera access state
const App: React.FC = () => {
  const { Header } = Layout;
  const { resData, debugData } = useResData();
  const [videoFeed, setVideoFeed] = useState(<VideoFeedVer1></VideoFeedVer1>);

  // Memoize menu items
  const headerMenu = useMemo(
    () => [
      { key: '0', label: 'Detection' },
      { key: '1', label: 'Result' },
    ],
    [],
  );

  const [currentMenu, setCurrentMenu] = useState<string>('0');
  const [landmarkState, setLandmarkState] = useState<{
    showHeadLandmark: boolean;
    showShoulderLandmark: boolean;
  }>({
    showHeadLandmark: false,
    showShoulderLandmark: false,
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [hasCameraAccess, setHasCameraAccess] = useState(false);

  // Handle landmark visibility changes
  const handleShowLandmarkChange = (updatedState: {
    showHeadLandmark: boolean;
    showShoulderLandmark: boolean;
  }) => {
    setLandmarkState(updatedState);
  };

  // Initialize data variables
  const positionData = resData as PositionData | undefined;

  // Create drawArray with memoization
  const drawArray = useMemo(
    () => ({
      x: [] as number[],
      y: [] as number[],
    }),
    [],
  );

  // Update drawArray on data or landmark state change
  // useEffect(() => {
  //   if (resData) {
  //     console.log(
  //       'data :',
  //       resData,
  //       'Received Frame : ',
  //       debugData?.frameCount,
  //       'Latency : ',
  //       debugData?.latency.toFixed(2),
  //       'ms',
  //     );

  //     drawArray.x.length = 0; // Clear x array
  //     drawArray.y.length = 0; // Clear y array

  //     const headPosition = positionData?.headPosition;
  //     const shoulderPosition = positionData?.shoulderPosition;

  //     if (landmarkState.showHeadLandmark && headPosition) {
  //       drawArray.x.push(headPosition.x);
  //       drawArray.y.push(headPosition.y);
  //     }

  //     if (landmarkState.showShoulderLandmark && shoulderPosition) {
  //       drawArray.x.push(
  //         shoulderPosition.shoulder_left.x,
  //         shoulderPosition.shoulder_right.x,
  //       );
  //       drawArray.y.push(
  //         shoulderPosition.shoulder_left.y,
  //         shoulderPosition.shoulder_right.y,
  //       );
  //     }
  //   }
  // }, [
  //   resData,
  //   landmarkState,
  //   positionData,
  //   drawArray,
  //   debugData?.frameCount,
  //   debugData?.latency,
  // ]);
  // let videoFeed;
  // let videoFeed;
  const onChange = (e: RadioChangeEvent) => {
    console.log(`radio checked:${e.target.value}`);
    if (e.target.value === '1') {
      setVideoFeed(<VideoFeedVer1></VideoFeedVer1>);
    } else if (e.target.value === '2') {
      setVideoFeed(<VideoFeedVer2></VideoFeedVer2>);
    }
  };

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
          selectedKeys={[currentMenu]}
          items={headerMenu}
          onClick={({ key }) => setCurrentMenu(key)}
          style={{ flex: 1, minWidth: 0 }}
        />
      </Header>
      {/* {modalVisible && (
        <Modal
          visible={modalVisible}
          title="Camera Access Required"
          onCancel={() => setModalVisible(false)}
          footer={[
            <Button key="back" onClick={() => setModalVisible(false)}>
              Cancel
            </Button>,
            // <Button key="submit" type="primary" onClick={requestCameraAccess}>
            //   Request Camera Access
            // </Button>,
          ]}
        >
          <p>
            Your application needs access to the webcam to function correctly.
            Please grant access when prompted.
          </p>
        </Modal>
      )} */}

      {currentMenu === '0' && (
        <>
          <DetectionPage onShowLandmarkChange={handleShowLandmarkChange}>
            <Radio.Group onChange={onChange} defaultValue="1">
              <Radio.Button value="1">Version 1</Radio.Button>
              <Radio.Button value="2">Version 2</Radio.Button>
            </Radio.Group>
            {videoFeed}
          </DetectionPage>
        </>
      )}
      {currentMenu === '1' && <ResultPage />}
    </Layout>
  );
};

export default App;
