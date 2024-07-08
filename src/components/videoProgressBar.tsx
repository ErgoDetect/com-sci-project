import React, { useEffect, useRef, useState } from "react";
import { videoProgressBarProps } from "../interface/propsType";
import "../styles/progressBar.css";
import VideoProgressBarChapter from "../components/videoProgressBarChapter";

const VideoProgressBar: React.FC<videoProgressBarProps> = ({
	clickPercent,
	setClickPercent,
	playerRef,
}) => {
	const max_time = 415.77;

	const handleBarClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const clickX = e.clientX - rect.left;
		const clickXPercent = clickX / rect.width;
		if (setClickPercent) {
			setClickPercent(clickXPercent);
			if (playerRef && playerRef.current) {
				playerRef.current.seekTo(clickXPercent, "fraction");
			}
		}
	};
	const chapters = [
		[25, 50],
		[90, 92],
	];

	return (
		<div className="bar" onClick={handleBarClick}>
			<div className="bar_chapter">
				{chapters.map((chapter, index) => {
					if (index === 0) {
						if (chapter[0] === 0) {
							return (
								<VideoProgressBarChapter
									highlight={true}
									percent={chapter[1] - chapter[0]}
								></VideoProgressBarChapter>
							);
						} else {
							return (
								<>
									<VideoProgressBarChapter
										percent={chapter[0]}
									></VideoProgressBarChapter>
									<VideoProgressBarChapter
										highlight={true}
										percent={chapter[1] - chapter[0]}
									></VideoProgressBarChapter>
								</>
							);
						}
					} else if (chapters[index - 1][1] !== chapter[0]) {
						return (
							<>
								<VideoProgressBarChapter
									percent={chapter[0] - chapters[index - 1][1]}
								></VideoProgressBarChapter>
								<VideoProgressBarChapter
									highlight={true}
									percent={chapter[1] - chapter[0]}
								></VideoProgressBarChapter>
							</>
						);
					} else {
						return (
							<VideoProgressBarChapter
								highlight={true}
								percent={chapter[1] - chapter[0]}
							></VideoProgressBarChapter>
						);
					}
				})}
				{chapters[chapters.length - 1][1] !== 100 ? (
					<VideoProgressBarChapter
						percent={100 - chapters[chapters.length - 1][1]}
					></VideoProgressBarChapter>
				) : (
					<></>
				)}
			</div>
			<div
				className="bar_dot"
				style={{
					transform: "scale(1.5) translateY(-50%)",
					left: `${clickPercent ? clickPercent * 100 : 0}%`,
				}}
			>
				<div className="bar_dot_i"></div>
			</div>
		</div>
	);
};

export default VideoProgressBar;
