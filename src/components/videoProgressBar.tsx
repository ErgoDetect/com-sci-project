import React, { useEffect, useState } from "react";
import { videoProgressBarProps } from "../interface/propsType";
import "../styles/progressBar.css";
import VideoProgressBarChapter from "../components/videoProgressBarChapter";

const VideoProgressBar: React.FC<videoProgressBarProps> = () => {
	const max_time = 415.77;

	const chapters = [
		[25, 50],
		[90, 92],
	];

	return (
		<div className="bar">
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
				style={{ transform: "scale(1.5) translateY(-50%)", left: "10.23077%" }}
			>
				<div className="bar_dot_i"></div>
			</div>
		</div>
	);
};

export default VideoProgressBar;
