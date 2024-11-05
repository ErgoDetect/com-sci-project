import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, message, Modal, Spin, Switch, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  CaretRightOutlined,
  CheckCircleFilled,
  CheckCircleOutlined,
  Loading3QuartersOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { Container, FlexColumn, VideoCard } from '../styles/styles'; // Assuming FlexColumn exists or will be created
import SessionMetricsCard from '../components/dashboard/SessionMetricsCard';
import SessionSummaryCard from '../components/SessionSummaryCard';
import { useResData } from '../context';
import WebcamDisplay from '../components/camera/webcamDisplay';
import useDevices from '../hooks/useDevices';
import useVideoRecorder from '../hooks/useVideoRecorder';

const { Text } = Typography;

const Dashboard = () => {
  const navigate = useNavigate();
  const {
    streaming,
    setStreaming,
    setIsAligned,
    setInitialModal,
    setInitializationSuccess,
    setUseVideoFile,
    setVideoFile,
    useVideoFile,
    realTimeSessionId,
  } = useResData();

  const { deviceId } = useDevices();
  const [openModal, setOpenModal] = useState(false);
  const frameCountRef = useRef<number>(0);
  const { saveFinish } = useVideoRecorder();
  const toggleStreaming = useCallback(() => {
    if (streaming) {
      frameCountRef.current = 0;
      setIsAligned(false);
      setStreaming(false);
      setInitializationSuccess(false);
      message.info('Session stopped.');
      setOpenModal(true);
    } else {
      setInitialModal(true);
    }
  }, [
    streaming,
    setIsAligned,
    setStreaming,
    setInitializationSuccess,
    setInitialModal,
  ]);

  useEffect(() => {
    if (useVideoFile) {
      navigate('/video-upload');
    }
  }, [navigate, useVideoFile]);

  return (
    <>
      <Container>
        <div style={{ display: 'flex', gap: '25px' }}>
          <VideoCard
            style={{ width: '75%' }}
            title="Video Source"
            bordered={false}
            extra={
              <Switch
                checkedChildren="Video File"
                unCheckedChildren="Live Feed"
                onChange={(checked) => {
                  setUseVideoFile(checked);
                  setVideoFile(null);
                  setStreaming(false);
                }}
              />
            }
          >
            <WebcamDisplay
              deviceId={deviceId}
              width="100%"
              borderRadius={12}
              showBlendShapes={false}
            />
          </VideoCard>

          <FlexColumn>
            <SessionMetricsCard
              sessionActive={streaming}
              toggleStreaming={toggleStreaming}
            />
            <SessionSummaryCard />
          </FlexColumn>
        </div>
      </Container>
      <Modal
        open={openModal}
        centered
        width="45%"
        styles={{ body: { height: '100%' } }}
        onCancel={() => setOpenModal(false)}
        footer={
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20 }}>
            <Button
              onClick={() => setOpenModal(false)}
              style={{ marginTop: '1rem' }}
            >
              Continue Detect
            </Button>
            <Button
              type="primary"
              icon={<CaretRightOutlined />}
              style={{ marginTop: '1rem' }}
              onClick={() =>
                navigate(`/summary?session_id=${realTimeSessionId}`)
              }
              disabled={!saveFinish}
            >
              View Detect Result
            </Button>
          </div>
        }
      >
        <div style={{ textAlign: 'center', padding: '50px' }}>
          {!saveFinish ? (
            <>
              <Spin
                size="large"
                indicator={<LoadingOutlined style={{ fontSize: 180 }} spin />}
              />
              <Text
                type="secondary"
                style={{
                  display: 'block',
                  marginTop: '30px',
                  fontSize: '18px',
                }}
              >
                Video save in progress, please wait...
              </Text>
            </>
          ) : (
            <>
              <CheckCircleFilled
                style={{
                  display: 'block',
                  marginTop: '30px',
                  fontSize: '130px',
                  color: 'green',
                }}
              />
              <Text
                type="success"
                style={{
                  display: 'block',
                  marginTop: '30px',
                  fontSize: '18px',
                }}
              >
                Loaded Successfully!
              </Text>
            </>
          )}
        </div>
      </Modal>
    </>
  );
};

export default Dashboard;
