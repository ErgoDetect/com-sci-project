import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { Layout, Card, Tooltip, Button } from 'antd';
import { PlayCircleOutlined, DownloadOutlined } from '@ant-design/icons';
import JsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useLocation } from 'react-router-dom';
import ProgressCard from '../components/ProgressCard';
import axiosInstance from '../utility/axiosInstance';

const { Content } = Layout;

type EventType = 'blink' | 'distance' | 'thoracic' | 'sitting';
type VideoResponse = { success: false; error: string } | string;

const colorMap: Record<EventType, string> = {
  blink: '#FF4D4F',
  distance: '#FFC107',
  thoracic: '#52C41A',
  sitting: '#00B8D9',
};

const cardDetails: Record<EventType, { title: string; description: string }> = {
  blink: {
    title: 'Not Blinking longer than 5 seconds',
    description:
      'The red segments indicate when blinks were detected. You can analyze the time since the last blink to monitor fatigue.',
  },
  sitting: {
    title: 'Sitting longer than 45 minutes',
    description:
      'The teal segments indicate when the sitting duration exceeded the recommended time.',
  },
  distance: {
    title: 'Sitting too close to screen longer than 30 seconds',
    description:
      'The amber segments indicate when proximity issues were detected, i.e., when the user sat too close to the screen for extended periods.',
  },
  thoracic: {
    title: 'Thoracic posture detect longer than 2 seconds',
    description:
      'The green segments indicate when thoracic posture was detected. This helps track how long the user sat with poor posture.',
  },
};

interface Event {
  start: number;
  type: EventType;
  end: number;
}

const Summary: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [expandedCard, setExpandedCard] = useState<EventType | null>(null);
  const [isVideoAvailable, setIsVideoAvailable] = useState(false);
  const location = useLocation();
  const FPS = 15;
  const sessionTitle = useMemo(
    () => new URLSearchParams(location.search).get('session_title'),
    [location.search],
  );

  useEffect(() => {
    const fetchData = async () => {
      if (sessionTitle) {
        try {
          const response = await axiosInstance.get(
            `/user/summary?session_id=${sessionTitle}`,
          );
          setData(response?.data);
        } catch (error) {
          console.error('Error fetching summary data:', error);
        }
      }
    };
    fetchData();
  }, [sessionTitle]);

  useEffect(() => {
    const fetchVideo = async () => {
      if (data?.file_name) {
        try {
          const videoResponse: VideoResponse =
            await window.electron.video.getVideo(data.file_name);
          if (videoResponse) {
            if (typeof videoResponse === 'string') {
              setVideoSrc(videoResponse);
              setIsVideoAvailable(true);
            } else {
              setIsVideoAvailable(false);
            }
          } else {
            console.error('Failed to load video:');
            setIsVideoAvailable(false);
          }
        } catch (error) {
          console.error('Error fetching video:', error);
          setIsVideoAvailable(false);
        }
      }
    };
    fetchVideo();
  }, [data?.file_name]);

  const handlePlayPause = useCallback(() => {
    if (isVideoAvailable && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying((prev) => !prev);
    }
  }, [isPlaying, isVideoAvailable]);

  const handleSeek = useCallback(
    (time: number) => {
      if (isVideoAvailable && videoRef.current) {
        videoRef.current.currentTime = time;
        videoRef.current.play();
        setIsPlaying(true);
      }
    },
    [isVideoAvailable],
  );

  const getEvent = useCallback(() => {
    const event: Event[] = [];
    for (let index = 0; index < data?.blink.length; index + 1) {
      if (data?.blink[index].length === 1) {
        event.push({
          start: data?.blink[index][0],
          type: 'blink',
          end: data?.duration,
        });
      } else {
        event.push({
          start: data?.blink[index][0],
          type: 'blink',
          end: data?.blink[index][1],
        });
      }
    }
    for (let index = 0; index < data?.sitting.length; index + 1) {
      if (data?.sitting[index].length === 1) {
        event.push({
          start: data?.sitting[index][0],
          type: 'sitting',
          end: data?.duration,
        });
      } else {
        event.push({
          start: data?.sitting[index][0],
          type: 'sitting',
          end: data?.sitting[index][1],
        });
      }
    }
    for (let index = 0; index < data?.distance.length; index + 1) {
      if (data?.distance[index].length === 1) {
        event.push({
          start: data?.distance[index][0],
          type: 'distance',
          end: data?.duration,
        });
      } else {
        event.push({
          start: data?.distance[index][0],
          type: 'distance',
          end: data?.distance[index][1],
        });
      }
    }
    for (let index = 0; index < data?.thoracic.length; index + 1) {
      if (data?.thoracic[index].length === 1) {
        event.push({
          start: data?.thoracic[index][0],
          type: 'thoracic',
          end: data?.duration,
        });
      } else {
        event.push({
          start: data?.thoracic[index][0],
          type: 'thoracic',
          end: data?.thoracic[index][1],
        });
      }
    }
    return event;
  }, [data]);

  const event = getEvent();
  const createProgressBar = useCallback(
    (eventType: EventType) =>
      event
        .filter((events) => events.type === eventType)
        .map((events) => {
          const duration = data?.duration || 0;
          const startPosition = (events.start / duration) * 100;
          const eventLength = events.end - events.start;
          const width = (eventLength / duration) * 100;
          return (
            <Tooltip
              title={`${events.type} detected from ${new Date(
                (events.start / FPS) * 1000,
              )
                .toISOString()
                .substring(14, 19)} to ${new Date((events.end / FPS) * 1000)
                .toISOString()
                .substring(14, 19)}`}
              key={`${events.type}-${events.start}`}
            >
              <div
                style={{
                  position: 'absolute',
                  left: `${startPosition}%`,
                  width: `${width}%`,
                  height: '100%',
                  backgroundColor: colorMap[events.type],
                  cursor: 'pointer',
                  borderRadius: '5px',
                  transition: 'background-color 0.3s ease',
                }}
                onClick={(e) => {
                  if (isVideoAvailable) {
                    e.stopPropagation();
                    handleSeek(events.start / FPS);
                  }
                }}
              />
            </Tooltip>
          );
        }),
    [event, data?.duration, isVideoAvailable, handleSeek],
  );

  const videoPlayer = useMemo(
    () => (
      <div style={{ position: 'relative', textAlign: 'center' }}>
        <video
          ref={videoRef}
          style={{ width: '100%', borderRadius: '12px' }}
          controls
          src={isVideoAvailable ? videoSrc || '' : undefined}
        />
        {!isPlaying && isVideoAvailable && (
          <Button
            icon={<PlayCircleOutlined />}
            onClick={handlePlayPause}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '48px',
              color: '#fff',
              background: 'none',
              border: 'none',
            }}
          />
        )}
      </div>
    ),
    [videoSrc, isPlaying, handlePlayPause, isVideoAvailable],
  );

  const handleExportPDF = useCallback(async () => {
    if (summaryRef.current) {
      const canvas = await html2canvas(summaryRef.current);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new JsPDF();
      const imgWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('summary.pdf');
    }
  }, []);

  const handleExpandToggle = useCallback((type: EventType) => {
    setExpandedCard((prev) => (prev === type ? null : type));
  }, []);
  return (
    <Layout
      style={{
        display: 'flex',
        justifyContent: 'center', // Center horizontally
        alignItems: 'center', // Center vertically
        padding: '24px',
        minHeight: '100vh',
        position: 'relative', // Needed for absolutely positioning child elements
      }}
    >
      {/* Button at the top-right of the page */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
        }}
      >
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={handleExportPDF}
        >
          Export to PDF
        </Button>
      </div>

      <Content
        ref={summaryRef}
        style={{
          width: '100%',
          maxWidth: '80%', // Limit the width for better centering
          padding: '24px',
          borderRadius: '12px',
          backgroundColor: '#fff',
          boxShadow: '0px 0px 15px rgba(0, 0, 0, 0.1)',
        }}
      >
        <h2>{`Session : ${data?.session_id}`}</h2>
        <text>{`Date : ${data?.date}`}</text>

        <Card
          style={{
            margin: '24px 0px',
            padding: '0',
            borderRadius: '12px',
          }}
        >
          {videoPlayer}
        </Card>
        {data &&
          data.duration &&
          Object.entries(cardDetails).map(
            ([typeKey, { title, description }]) => {
              const eventType = typeKey as EventType;
              return (
                <ProgressCard
                  key={eventType}
                  title={title}
                  type={eventType}
                  expanded={expandedCard}
                  onExpandToggle={handleExpandToggle}
                  progressBar={createProgressBar(eventType)}
                  description={description}
                  data={data}
                />
              );
            },
          )}
      </Content>
    </Layout>
  );
};

export default Summary;
