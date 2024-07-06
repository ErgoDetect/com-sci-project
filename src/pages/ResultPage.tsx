import React, { useState, useRef } from "react";
import videoFile from "../result/dummyVideo.mkv"; // Adjust the path accordingly
import ReactPlayer from "react-player";

import ProgressBar from "ppbar";

import "../styles/resultPage.css";

const videoWidth = 600;

const ResultPage: React.FC = () => {
	const [played, setPlayed] = useState(0);
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
			<div className="bar">
				<div className="bar_chapter">
					<div className="bar_chapter_i" style={{ flex: "0.166667 1 0%" }}>
						<div className="bar_chapter_i_w">
							<div
								className="bar_chapter_i_b"
								style={{ transform: "scaleX(1)" }}
							></div>
							<div
								className="bar_chapter_i_h"
								style={{ transform: "scaleX(0.184615)" }}
							></div>
							<div
								className="bar_chapter_i_p"
								style={{ transform: "scaleX(1)" }}
							></div>
						</div>
					</div>
					<div className="bar_chapter_i" style={{ flex: "0.1 1 0%" }}>
						<div className="bar_chapter_i_w">
							<div
								className="bar_chapter_i_b"
								style={{ transform: "scaleX(1)" }}
							></div>
							<div
								className="bar_chapter_i_h"
								style={{ transform: "scaleX(0)" }}
							></div>
							<div
								className="bar_chapter_i_p"
								style={{ transform: "scaleX(1)" }}
							></div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ResultPage;
