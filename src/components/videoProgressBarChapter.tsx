import React, { useEffect } from "react";
import { VideoProgressBarChapterProps } from "../interface/propsType";
import "../styles/progressBar.css";

const VideoProgressBarChapter: React.FC<VideoProgressBarChapterProps> = ({
	percent,
	highlight,
}) => {
	const text = percent + " 1 0%";
	return (
		<div className="bar_chapter_i" style={{ flex: `${text}` }}>
			<div className="bar_chapter_i_w">
				{highlight ? (
					<div
						className="bar_chapter_i_b"
						style={{ transform: `scaleX(1)`, background: "rgb(179, 209, 6)" }}
					></div>
				) : (
					<div
						className="bar_chapter_i_b"
						style={{ transform: `scaleX(1)` }}
					></div>
				)}

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
