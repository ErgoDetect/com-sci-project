/** @format */

import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import VideoProgressBar from '../components/videoProgressBar';
import { Col, Row, Typography } from 'antd';
import { importVideo } from '../utility/importVideo';

const videoWidth = 600;

const ResultPage: React.FC = () => {
  const { Title, Text } = Typography;
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const playerRef = useRef<ReactPlayer | null>(null);

  useEffect(() => {
    async function loadVideo() {
      try {
        const video = await importVideo('dummyVideo'); // Use the base name of the video
        setVideoUrl(video);
      } catch (error) {
        console.error('Error loading video:', error);
      }
    }

    loadVideo();
  }, []);

  // const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  // 	const newPlayed = parseFloat(e.target.value);
  // 	setPlayed(newPlayed);
  // 	if (playerRef.current) {
  // 		playerRef.current.seekTo(newPlayed, "fraction");
  // 	}
  // };

  const handleProgress = (state: { played: number }) => {
    setPlayed(state.played);
  };

  const handleDuration = (duration: number) => {
    setDuration(duration);
  };

  const maxDuration = 200;
  const chapters = [
    [25, 50],
    [90, 92],
  ];

  if (!videoUrl) {
    return <div>Loading video...</div>;
  }

  return (
    <div
      style={{
        alignItems: 'center',
        alignSelf: 'center',
        width: '80%',
        overflowY: 'scroll',
      }}
    >
      <Row>
        <Col span={24} style={{ textAlign: 'center' }}>
          <Title level={2}>Result Page</Title>
        </Col>
      </Row>
      <Row>
        <Col span={4}></Col>
        <Col span={20}>
          <ReactPlayer
            ref={playerRef}
            url={videoUrl}
            width={videoWidth}
            onProgress={handleProgress}
            onDuration={handleDuration}
            controls={true}
          />
        </Col>
      </Row>
      <Row align={'middle'}>
        <Col span={4}>
          <Title level={5}>Blinking</Title>
        </Col>
        <Col span={20}>
          <VideoProgressBar
            clickPercent={played}
            setClickPercent={setPlayed}
            playerRef={playerRef}
            maxDuration={maxDuration}
            chapters={chapters}
            normalColor="#91caff"
            highlightColor="#1677ff"
            dotColor="#001d66"
          />
        </Col>
      </Row>
      <Row>
        <Col span={4}></Col>
        <Col span={20}>
          <Text>Times: , Average Duration : </Text>
        </Col>
      </Row>
      <Row align={'middle'}>
        <Col span={4}>
          <Title level={5}>Dynamic sitting </Title>
        </Col>
        <Col span={20}>
          <VideoProgressBar
            clickPercent={played}
            setClickPercent={setPlayed}
            playerRef={playerRef}
            maxDuration={maxDuration}
            chapters={chapters}
            normalColor="#91caff"
            highlightColor="#1677ff"
            dotColor="#001d66"
          />
        </Col>
      </Row>
      <Row>
        <Col span={4}></Col>
        <Col span={20}>
          <Text>Times: , Average Duration : </Text>
        </Col>
      </Row>
      <Row align={'middle'}>
        <Col span={4}>
          <Title level={5}>Dynamic sitting </Title>
        </Col>
        <Col span={20}>
          <VideoProgressBar
            clickPercent={played}
            setClickPercent={setPlayed}
            playerRef={playerRef}
            maxDuration={maxDuration}
            chapters={chapters}
            normalColor="#91caff"
            highlightColor="#1677ff"
            dotColor="#001d66"
          />
        </Col>
      </Row>
      <Row>
        <Col span={4}></Col>
        <Col span={20}>
          <Text>Times: , Average Duration : </Text>
        </Col>
      </Row>
    </div>
  );
};

export default ResultPage;