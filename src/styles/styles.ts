/** @format */

import styled from 'styled-components';
import { Card, Button, Upload } from 'antd';

export const Container = styled.div`
  padding: 40px 75px;
  display: flex;
  flex-direction: column;
  gap: 40px;
  background-color: #f5f5f5;
  height: 100%;
`;

export const FlexRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 40px;
  flex-wrap: wrap;
`;

export const StyledCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
`;

export const VideoCard = styled(StyledCard)`
  flex: 1 1 60%;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

export const VideoContent = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
`;

export const MetricsCard = styled(StyledCard)`
  flex: 1 1 35%;
  text-align: center;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  height: max-content;
`;

export const SummaryCard = styled(StyledCard)`
  width: 100%;
`;

export const VideoContainer = styled.div`
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
`;

export const UploadButton = styled(Upload)`
  margin-top: 16px;
`;

export const PlayPauseButton = styled(Button)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 48px;
  color: #fff;
  background: none;
  border: none;
  &:hover {
    color: #1890ff;
  }
`;

export const InfoBox = styled.div<{ x: number; y: number }>`
  position: absolute;
  bottom: ${({ y }) => (y ? `${y}px` : '16px')};
  right: ${({ x }) => (x ? `${x}px` : '16px')};
  background-color: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  cursor: move;
  z-index: 10;
  user-select: none;
`;

export const Indicator = styled.div<{ isGood: boolean }>`
  padding: 2px 0;
  border-radius: 4px;
  background-color: ${({ isGood }) => (isGood ? '#52c41a' : '#ff4d4f')};
  display: flex;
  justify-content: center;
  color: #fff;
  font-weight: 500;
  font-size: 24px;
`;
