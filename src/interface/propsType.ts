/** @format */

import React, { ReactNode } from "react";

export interface HeadPosition {
	x: number;
	y: number;

	// headPosition: Record<number, number>;
	// headPosition: Record<number, number>;
	// headRotationDegree: Record<number, number>;
	// depth: number;
	// shoulderLeftPosition: Record<number, number>;
	// shoulderRightPosition: Record<number, number>;
	// shoulderPosition: Record<number, number>;
}
export interface DataProps {
	headPosition: HeadPosition;
	frameCount: number;
	latency: number;
	// add other properties if necessary
}

export interface ContainerProps {
	children?: React.ReactNode;
	data: DataProps | undefined;
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
	setData: React.Dispatch<React.SetStateAction<DataProps | undefined>>;
	// Add setData prop
}

export interface WebcamDisplayProps {
	deviceId: string | undefined;
	streaming: boolean;
	width?: number | string;
	borderRadius?: number | string;
	onCapture: (blob: Blob) => void;
}

export interface DeviceSelectorProps {
	deviceId: string | undefined;
	devices: DeviceProps[];
	onChange: (value: string) => void;
}
