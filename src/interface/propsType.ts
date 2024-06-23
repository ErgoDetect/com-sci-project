/** @format */

import React, { ReactNode } from "react";

export interface PositionData {
	headPosition: { x: number; y: number };

	// headPosition: Record<number, number>;
	// headPosition: Record<number, number>;
	// headRotationDegree: Record<number, number>;
	// depth: number;
	// shoulderLeftPosition: Record<number, number>;
	// shoulderRightPosition: Record<number, number>;
	// shoulderPosition: Record<number, number>;
}

export interface ContainerProps {
	children?: React.ReactNode;
	data?: PositionData | Record<string, any>;
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
	setData: React.Dispatch<React.SetStateAction<Object>>; // Add setData prop
}

export interface WebcamDisplayProps {
	deviceId: string | undefined;
	streaming: boolean;
	width?: number | string;
	borderRadius?: number | string;
	captureAndSendFrame?: () => void;
	onCapture: (blob: Blob) => void;
}

export interface DeviceSelectorProps {
	deviceId: string | undefined;
	devices: DeviceProps[];
	onChange: (value: string) => void;
}
