import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, message, Modal, Switch } from 'antd';
import { useNavigate } from 'react-router-dom';
import { CaretRightOutlined } from '@ant-design/icons';
import { Container, FlexColumn, VideoCard } from '../styles/styles'; // Assuming FlexColumn exists or will be created
import SessionMetricsCard from '../components/dashboard/SessionMetricsCard';
import SessionSummaryCard from '../components/SessionSummaryCard';
import { useResData } from '../context';
import WebcamDisplay from '../components/camera/webcamDisplay';
import useDevices from '../hooks/useDevices';

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
              sessionDuration=""
              toggleStreaming={toggleStreaming}
              blinkRate={0}
              goodPostureTime={0}
            />
            <SessionSummaryCard />
          </FlexColumn>
        </div>
      </Container>
      <Modal
        open={openModal}
        centered
        width="60%"
        onCancel={() => {
          setOpenModal(false);
        }}
        footer={
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 20,
            }}
          >
            <Button
              onClick={() => {
                setOpenModal(false);
              }}
              style={{ marginTop: '1rem' }}
            >
              Continue Detect
            </Button>
            <Button
              type="primary"
              style={{
                marginTop: '1rem',
              }}
              icon={<CaretRightOutlined />}
              onClick={() => {
                navigate(`/summary?session_id=${realTimeSessionId}`);
              }}
            >
              View Detect Result
            </Button>
          </div>
        }
      />
    </>
  );
};

export default Dashboard;
