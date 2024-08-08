/** @format */

import React, { useEffect, useState, useCallback } from 'react';
import { videoProgressBarProps, Chapter } from '../interface/propsType';
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

  // Define the fillChapter function
  const fillChapter = useCallback(
    (chaptersData: Chapter[], maxDurationData: number): Chapter[] => {
      const filledChapters: Chapter[] = [];

      for (let index = 0; index < chaptersData.length; index += 1) {
        if (index === 0 && chaptersData[0].start !== 0) {
          filledChapters.push({
            id: `empty-${index}`,
            start: 0,
            end: chaptersData[0].start,
          });
        } else if (chaptersData[index].start !== chaptersData[index - 1].end) {
          filledChapters.push({
            id: `empty-${index}`,
            start: chaptersData[index - 1].end,
            end: chaptersData[index].start,
          });
        }
        filledChapters.push(chaptersData[index]);
        if (
          index === chaptersData.length - 1 &&
          chaptersData[index].end !== maxDurationData
        ) {
          filledChapters.push({
            id: `empty-${index}`,
            start: chaptersData[index].end,
            end: maxDurationData,
          });
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
    >
      <div className="bar_chapter">
        {filledChapter.map((chapter) => (
          <VideoProgressBarChapter
            background={
              chapter.id.startsWith('empty') ? normalColor : highlightColor
            }
            percent={(chapter.end - chapter.start) / maxDuration}
            key={chapter.id} // Use unique identifier for the key
            height={chapter.id.startsWith('empty') ? 8 : 12}
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
