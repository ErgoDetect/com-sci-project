import React, { useState, useRef, useEffect } from "react";
import videoFile from "../result/dummyVideo.mkv"; // Adjust the path accordingly
import ReactPlayer from "react-player";
import VideoProgressBar from "../components/videoProgressBar";
import { Col, Row, Typography } from "antd";

const videoWidth = 600;

const ResultPage: React.FC = () => {
	const { Title, Text } = Typography;
	const [played, setPlayed] = useState(0);
	const [duration, setDuration] = useState(0);
	const playerRef = useRef<ReactPlayer | null>(null);

	const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newPlayed = parseFloat(e.target.value);
		setPlayed(newPlayed);
		if (playerRef.current) {
			playerRef.current.seekTo(newPlayed, "fraction");
		}
	};

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

	return (
		<div
			style={{
				alignItems: "center",
				alignSelf: "center",
				width: "80%",
				overflowY: "scroll",
			}}
		>
			<Row>
				<Col span={24} style={{ textAlign: "center" }}>
					<Title level={2}>Result Page</Title>
				</Col>
			</Row>
			<Row>
				<Col span={4}></Col>
				<Col span={20}>
					<ReactPlayer
						ref={playerRef}
						url={videoFile}
						width={videoWidth}
						onProgress={handleProgress}
						onDuration={handleDuration}
						controls={true}
					/>
				</Col>
			</Row>
			<Row align={"middle"}>
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
			<Row align={"middle"}>
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
			<Row align={"middle"}>
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
