import React, { useState, useRef, useEffect } from "react";
import videoFile from "../result/dummyVideo.mkv"; // Adjust the path accordingly
import ReactPlayer from "react-player";
import ProgressBar from "ppbar";
import "ppbar/dist/index.min.css";
import VideoProgressBar from "../components/videoProgressBar";

const videoWidth = 600;

const ResultPage: React.FC = () => {
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

	// const div = document.createElement("div");
	// div.style.width = "100%";
	// const bar = new ProgressBar(div, {
	// 	chapters: [
	// 		{ time: 10, title: "chapter1" },
	// 		{ time: 20, title: "chapter2" },
	// 		{ title: "chapter3" },
	// 	],
	// });

	// useEffect(() => {
	// 	const progressBar1 = document.getElementById("progressBar1");
	// 	progressBar1?.appendChild(div);
	// }, []);

	return (
		<div
			className="result-page"
			style={{ alignItems: "center", alignSelf: "center" }}
		>
			<h1>Result Page</h1>
			<ReactPlayer
				ref={playerRef}
				url={videoFile}
				width={videoWidth}
				onProgress={handleProgress}
				onDuration={handleDuration}
				controls={false}
			/>
			<input
				type="range"
				min="0"
				max="1"
				step="0.01"
				value={played}
				onChange={handleSeekChange}
				style={{ width: videoWidth }}
			/>
			<div>Duration: {duration} seconds</div>
			<VideoProgressBar />
			{/* <br />
			<div id="progressBar1"></div> */}
		</div>
	);
};

export default ResultPage;
