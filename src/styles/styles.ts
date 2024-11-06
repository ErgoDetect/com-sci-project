import styled from 'styled-components';
import { Card, Button, Upload } from 'antd';

export const Container = styled.div`
  padding: 50px;
`;

export const FlexColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 35%;
`;

export const StyledCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

export const VideoCard = styled(StyledCard)`
  width: 100%;
  height: max-content;
`;

export const MetricsCard = styled(StyledCard)`
  text-align: center;
  height:100%
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

export const SummaryCard = styled(StyledCard)`
  width: 100%;
  height: 100%;
  padding: 0px 30px;
`;

export const VideoContainer = styled.div`
  width: 100%;
  border-radius: 12px;
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

export const InfoBox = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.7);
  margin: 8px;
  color: #fff;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  z-index: 10;
  width: max-content;
  min-width: 10rem;
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
