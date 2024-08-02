/** @format */

import React, { useEffect, useState, useCallback } from 'react';
import { videoProgressBarProps } from '../interface/propsType';
import '../styles/progressBar.css';
import VideoProgressBarChapter from './videoProgressBarChapter';

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

  const fillChapter = useCallback(
    (chaptersData: number[][], maxDurationData: number) => {
      type Custom3dArray = [string, number, number];
      const filledChapters: Custom3dArray[] = [];

      for (let index = 0; index < chaptersData.length; index += 1) {
        if (index === 0 && chaptersData[0][0] !== 0) {
          filledChapters.push(['n', 0, chaptersData[0][0]]);
        } else if (chaptersData[index][0] !== chaptersData[index - 1][1]) {
          filledChapters.push([
            'n',
            chaptersData[index - 1][1],
            chaptersData[index][0],
          ]);
        }
        filledChapters.push([
          'h',
          chaptersData[index][0],
          chaptersData[index][1],
        ]);
        if (
          index === chaptersData.length - 1 &&
          chaptersData[index][1] !== maxDurationData
        ) {
          filledChapters.push(['n', chaptersData[index][1], maxDurationData]);
        }
      }
      return filledChapters;
    },
    [],
  );

  const filledChapter = fillChapter(chapters, maxDuration);

  const handleBarClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickXPercent = clickX / rect.width;
      if (setClickPercent) {
        setClickPercent(clickXPercent);
        if (playerRef && playerRef.current) {
          playerRef.current.seekTo(clickXPercent, 'fraction');
        }
      }
    },
    [playerRef, setClickPercent],
  );

  const handleBarMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      setIsDragging(true);
      handleBarClick(e);
    },
    [handleBarClick],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
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
    },
    [isDragging, playerRef, setClickPercent],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

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
  }, [handleMouseMove, handleMouseUp, isDragging]);

  return (
    <div
      className="bar"
      onClick={handleBarClick}
      onMouseDown={handleBarMouseDown}
      role=""
    >
      <div className="bar_chapter">
        {filledChapter.map((chapter, index) => (
          <VideoProgressBarChapter
            background={chapter[0] === 'h' ? highlightColor : normalColor}
            percent={(chapter[2] - chapter[1]) / maxDuration}
            key={index}
            height={chapter[0] === 'h' ? 12 : 8}
          />
        ))}
      </div>
      <div
        className="bar_dot"
        style={{
          transform: 'scale(1.5) translateY(-50%)',
          left: `${clickPercent ? clickPercent * 100 : 0}%`,
        }}
      >
        <div className="bar_dot_i" style={{ backgroundColor: dotColor }} />
      </div>
    </div>
  );
};

export default VideoProgressBar;
