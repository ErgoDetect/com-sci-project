/** @format */

import React, { ReactNode } from "react";

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
export interface DataProps {
	frameCount: number;
	latency: number;
	// add other properties if necessary
}

export interface ContainerProps {
	children?: React.ReactNode;
	data: DataProps | undefined;
	onShowLandmarkChange?: (newState: {
		showHeadLandmark: boolean;
		showShoulderLandmark: boolean;
	}) => void;
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

export interface videoFeedProps {
	width?: number | string;
	borderRadius?: number | string;
	drawingDot?: { x: number[]; y: number[] };
	setData: React.Dispatch<React.SetStateAction<DataProps | undefined>>;
	// Add setData prop
}

export interface WebcamDisplayProps {
	deviceId: string | undefined;
	streaming: boolean;
	width?: number | string;
	borderRadius?: number | string;
	drawingDot?: { x: number[]; y: number[] };
	onCapture: (blob: Blob) => void;
}

export interface DeviceSelectorProps {
	deviceId: string | undefined;
	devices: DeviceProps[];
	onChange: (value: string) => void;
}

export interface PositionTabProps {
	data: DataProps | undefined;
	onShowLandmarkChange?: (newState: {
		showHeadLandmark: boolean;
		showShoulderLandmark: boolean;
	}) => void;
}
