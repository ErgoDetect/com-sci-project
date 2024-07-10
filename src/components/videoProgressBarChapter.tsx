import React, { useEffect } from "react";
import { VideoProgressBarChapterProps } from "../interface/propsType";
import "../styles/progressBar.css";

const VideoProgressBarChapter: React.FC<VideoProgressBarChapterProps> = ({
	percent,
	background,
	height,
}) => {
	const text = percent + " 1 0%";
	return (
		<div className="bar_chapter_i" style={{ flex: `${text}` }}>
			<div className="bar_chapter_i_w" style={{ height: height }}>
				<div
					className="bar_chapter_i_b"
					style={{
						transform: `scaleX(1)`,
						background: `${background}`,
					}}
				></div>
				<div
					className="bar_chapter_i_h"
					style={{ transform: `scaleX(0)` }}
				></div>
				<div
					className="bar_chapter_i_p"
					style={{ transform: `scaleX(0)` }}
				></div>
			</div>
		</div>
	);
};

export default VideoProgressBarChapter;
