/** @format */

import React, { ReactNode } from 'react';

export interface PositionData {
  headPosition: { x: number; y: number };
  depthLeftIris: number;
  depthRightIris: number;
  shoulderPosition: {
    shoulder_left: { x: number; y: number; z: number };
    shoulder_right: { x: number; y: number; z: number };
  };
  // headPosition: Record<number, number>;
  // headPosition: Record<number, number>;
  // headRotationDegree: Record<number, number>;
  // depth: number;
  // shoulderLeftPosition: Record<number, number>;
  // shoulderRightPosition: Record<number, number>;
  // shoulderPosition: Record<number, number>;
}

export interface xyzPosition {
  x: number;
  y: number;
  z: number;
}

export interface ResContextType {
  resData?: PositionData;
  setResData: React.Dispatch<React.SetStateAction<PositionData | undefined>>;
}

export interface DebugData {
  frameCount: number;
  latency: number;
}
export interface CombineResult {
  shoulderPosition: xyzPosition;
  blinkRight: number;
  blinkLeft: number;
  leftIrisDiameter: number;
  rightIrisDiameter: number;
}

export interface ContainerProps {
  children: React.ReactNode;
}
export interface Detection {
  children?: ReactNode;
}

export interface InputProps {
  text: ReactNode;
  value: number;
  onChange: (value: number) => void;
}

export interface DeviceProps {
  label?: string;
  deviceId?: string;
}

export interface VideoFeedProps {
  width?: number | string;
  borderRadius?: number | string;
  drawingDot?: { x: number[]; y: number[] };
  // setData: React.Dispatch<React.SetStateAction<DataProps | undefined>>;
  // Add setData prop
}

export interface WebcamDisplayProps {
  deviceId: string | undefined;
  width?: number | string;
  borderRadius?: number | string;
  drawingDot?: { x: number[]; y: number[] };
  showBlendShapes?: boolean;
  canShowDetail?: boolean;
}

export interface DeviceSelectorProps {
  deviceId: string | undefined;
  devices: DeviceProps[];
  onChange: (value: string) => void;
}

export interface CalibrationData {
  cameraMatrix: number[][];
  distCoeffs: number[];
  mean_error: number;
}

export interface PositionTabProps {
  combineResult?: CombineResult;
  mode?: number;
}

export interface VideoProgressBarChapterProps {
  percent?: number;
  background?: string;
  height?: number;
}

// Define the Chapter interface
export interface Chapter {
  id: string;
  start: number;
  end: number;
}

// Update videoProgressBarProps interface
export interface videoProgressBarProps {
  clickPercent: number;
  setClickPercent: (percent: number) => void;
  playerRef: React.RefObject<any>;
  chapters: Chapter[];
  maxDuration: number;
  normalColor: string;
  highlightColor: string;
  dotColor: string;
}

export interface FaceResults {
  faceLandmarks: Array<any>;
  faceBlendshapes: Array<any>;
  facialTransformationMatrixes: Array<any>;
}

export interface PoseResults {
  landmarks: Array<any>;
  worldLandmarks: Array<any>;
  segmentationMasks: any;
}

// Define the overall results interface
export interface LandmarksResult {
  faceResults: FaceResults;
  poseResults: PoseResults;
}
export interface ModalProps {
  visible: boolean;
  title: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  onClose: () => void;
  confirmText?: string;
  cancelText?: string;
  items: React.ReactNode;
}

export interface websocketProcessData {
  shoulderPosition: xyzPosition;
  blinkRight: number;
  blinkLeft: number;
}

export interface VideoSourceCardProps {
  useVideoFile: boolean;
  setUseVideoFile: (value: boolean) => void;
}

export interface UseVideoProcessorProps {
  mainVideoElementRef: React.RefObject<HTMLVideoElement>;
  goodPostureTime: number | null;
  setGoodPostureTime: React.Dispatch<React.SetStateAction<number | null>>;
  setHideVideo: React.Dispatch<React.SetStateAction<boolean>>;
  setVideoFile: (file: File | null) => void;
  setNewVideoSrc: React.Dispatch<React.SetStateAction<string>>;
  videoFileName: string;
  thumbnailName: string;
}

export interface OAuthTokens {
  access_token: string;
  refresh_token?: string | null | undefined;
  scope?: string;
  token_type?: string | null | undefined;
  expiry_date?: number | null | undefined;
}

export interface GoogleAuthResponse {
  user_info: {
    id: string;
    email: string;
    verified_email: boolean;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
  };
  access_token: string;
  success: boolean;
}

export interface AuthStatusResponse {
  status: 'Authenticated' | 'Refresh' | 'LoginRequired' | 'Not Found'; // Expected status values
  message?: string; // Optional error or informational message
  user_id?: string; // Optional user ID if needed
}

// types.ts

export interface SignUpFormValues {
  email: string;
  password: string;
  display_name: string;
  confirm: string;
}

export interface FormErrorInfo {
  errorFields: Array<{
    name: string[];
    errors: string[];
  }>;
  outOfDate: boolean;
}
