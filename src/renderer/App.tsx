import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Layout, Menu, Modal, Button, Radio, RadioChangeEvent } from 'antd';
import DetectionPage from '../pages/DetectionPage';
import ResultPage from '../pages/ResultPage';
import VideoFeedVer1 from '../components/videoFeed/videoFeedVer1';
import VideoFeedVer2 from '../components/videoFeed/videoFeedVer2';
import { useResData } from '../context';

const { Header } = Layout;

interface LandmarkState {
  showHeadLandmark: boolean;
  showShoulderLandmark: boolean;
}

interface ModalState {
  visible: boolean;
  hasCameraAccess: boolean;
}

const App: React.FC = () => {
  // Memoize menu items
  const headerMenu = useMemo(
    () => [
      { key: '0', label: 'Detection' },
      { key: '1', label: 'Result' },
    ],
    [],
  );

  const [currentMenu, setCurrentMenu] = useState<string>('0');
  const [landmarkState, setLandmarkState] = useState<LandmarkState>({
    showHeadLandmark: false,
    showShoulderLandmark: false,
  });

  const [modalState, setModalState] = useState<ModalState>({
    visible: false,
    hasCameraAccess: false,
  });

  const [videoFeedVersion, setVideoFeedVersion] = useState<'1' | '2'>('1');
  const { calibrationData, setCalibrationData } = useResData();
  // Load calibration data when the app starts
  useEffect(() => {
    const loadCalibrationData = async () => {
      try {
        // Get the path to the hidden calibration data file
        const filePath = await window.electron.fs.getUserDataPath();

        // Check if the file exists
        const fileExists = await window.electron.fs.fileExists(filePath);

        if (fileExists) {
          // Read the file if it exists
          const data = await window.electron.fs.readFile(filePath);

          // Parse the JSON data and set it to state
          setCalibrationData(JSON.parse(data));

          console.log('Calibration data loaded successfully');
        } else {
          console.log('Calibration data file does not exist');
        }
      } catch (error) {
        console.error('Failed to load calibration data:', error);
      }
    };

    // Call the function to load the calibration data
    loadCalibrationData();
  }, [setCalibrationData]); // Only run on mount

  const handleShowLandmarkChange = useCallback(
    (updatedState: LandmarkState) => {
      setLandmarkState(updatedState);
    },
    [],
  );

  const handleMenuClick = useCallback(({ key }: { key: string }) => {
    setCurrentMenu(key);
  }, []);

  const handleRadioChange = useCallback((e: RadioChangeEvent) => {
    setVideoFeedVersion(e.target.value as '1' | '2');
  }, []);

  const videoFeed = useMemo(() => {
    return videoFeedVersion === '1' ? <VideoFeedVer1 /> : <VideoFeedVer2 />;
  }, [videoFeedVersion]);

  console.log(calibrationData);

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
          onClick={handleMenuClick}
          style={{ flex: 1, minWidth: 0 }}
        />
      </Header>

      <Modal
        visible={modalState.visible}
        title="Camera Access Required"
        onCancel={() => setModalState({ ...modalState, visible: false })}
        footer={[
          <Button
            key="back"
            onClick={() => setModalState({ ...modalState, visible: false })}
          >
            Cancel
          </Button>,
        ]}
      >
        <p>
          Your application needs access to the webcam to function correctly.
          Please grant access when prompted.
        </p>
      </Modal>

      {currentMenu === '0' && (
        <DetectionPage>
          <Radio.Group onChange={handleRadioChange} value={videoFeedVersion}>
            <Radio.Button value="1">Version 1</Radio.Button>
            <Radio.Button value="2">Version 2</Radio.Button>
          </Radio.Group>
          {videoFeed}
        </DetectionPage>
      )}
      {currentMenu === '1' && <ResultPage />}
    </Layout>
  );
};

export default App;
