import React, { useEffect, useState } from 'react';
import { videoProgressBarProps } from '../interface/propsType';
import '../styles/progressBar.css';
import VideoProgressBarChapter from '../components/videoProgressBarChapter';

const VideoProgressBar: React.FC<videoProgressBarProps> = ({
  clickPercent,
  setClickPercent,
  playerRef,
  chapters,
  maxDuration,
  normalColor,
  highlightColor,
  dotColor,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  function fillChapter(chapters: number[][], maxDuration: number) {
    type Custom3dArray = [string, number, number];
    const emptyArray: Custom3dArray[] = [];
    for (let index = 0; index < chapters.length; index++) {
      if (index === 0 && chapters[0][0] !== 0) {
        emptyArray.push(['n', 0, chapters[0][0]]);
      } else {
        if (chapters[index][0] !== chapters[index - 1][1]) {
          emptyArray.push(['n', chapters[index - 1][1], chapters[index][0]]);
        }
      }
      emptyArray.push(['h', chapters[index][0], chapters[index][1]]);
      if (index === chapters.length - 1 && chapters[index][1] !== maxDuration) {
        emptyArray.push(['n', chapters[index][1], maxDuration]);
      }
    }
    return emptyArray;
  }

  const filledChapter = fillChapter(chapters, maxDuration);

  const handleBarClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickXPercent = clickX / rect.width;
    if (setClickPercent) {
      setClickPercent(clickXPercent);
      if (playerRef && playerRef.current) {
        playerRef.current.seekTo(clickXPercent, 'fraction');
      }
    }
  };

  const handleBarMouseDown = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    setIsDragging(true);
    handleBarClick(e);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const bar = document.querySelector('.bar');
      if (bar) {
        const rect = bar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickXPercent = Math.min(Math.max(clickX / rect.width, 0), 1);
        if (setClickPercent) {
          setClickPercent(clickXPercent);
          if (playerRef && playerRef.current) {
            playerRef.current.seekTo(clickXPercent, 'fraction');
          }
        }
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      className="bar"
      onClick={handleBarClick}
      onMouseDown={handleBarMouseDown}
    >
      <div className="bar_chapter">
        {filledChapter.map((chapter, index) => {
          if (chapter[0] === 'h') {
            return (
              <VideoProgressBarChapter
                background={highlightColor}
                percent={(chapter[2] - chapter[1]) / maxDuration}
                key={index}
                height={12}
              />
            );
          } else {
            return (
              <VideoProgressBarChapter
                background={normalColor}
                percent={(chapter[2] - chapter[1]) / maxDuration}
                key={index}
                height={8}
              />
            );
          }
        })}
      </div>
      <div
        className="bar_dot"
        style={{
          transform: 'scale(1.5) translateY(-50%)',
          left: `${clickPercent ? clickPercent * 100 : 0}%`,
        }}
      >
        <div className="bar_dot_i" style={{ backgroundColor: dotColor }}></div>
      </div>
    </div>
  );
};

export default VideoProgressBar;
