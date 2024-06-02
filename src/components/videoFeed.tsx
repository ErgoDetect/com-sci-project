/** @format */

import React, { useState, useCallback, useEffect } from "react";
import { Button } from "antd";
import { DeviceProps, videoFeedProps } from "../interface/propsType";
import DeviceSelector from "./camera/deviceSelector";
import WebcamDisplay from "./camera/webcamDisplay";
import useWebSocket from "../utility/webSocketConfig";

const VideoFeed: React.FC<videoFeedProps> = ({
	width,
	borderRadius,
	setData,
}) => {
	const [deviceId, setDeviceId] = useState<string | undefined>("");
	const [devices, setDevices] = useState<DeviceProps[]>([]);
	const [streaming, setStreaming] = useState(false);

	const { send } = useWebSocket("ws://localhost:8000/ws", setData);

	// Handle devices
	const handleDevices = useCallback(async () => {
		try {
			const mediaDevices = await navigator.mediaDevices.enumerateDevices();
			const videoDevices = mediaDevices.filter(
				(device) => device.kind === "videoinput"
			);
			setDevices(videoDevices);
			if (videoDevices.length > 0 && !deviceId) {
				setDeviceId(videoDevices[0].deviceId);
			}
		} catch (error) {
			console.error("Error enumerating devices:", error);
		}
	}, [deviceId]);

	// Handle device change
	const handleDeviceChange = useCallback((value: string) => {
		setDeviceId(value);
	}, []);

	// Toggle streaming
	const toggleStreaming = useCallback(() => {
		setStreaming((prevStreaming) => !prevStreaming);
	}, []);

	useEffect(() => {
		handleDevices();
	}, [handleDevices]);

	const handleCapture = useCallback(
		(blob: Blob) => {
			send(blob);
		},
		[send]
	);

	return (
		<>
			<WebcamDisplay
				deviceId={deviceId}
				streaming={streaming}
				width={width}
				borderRadius={borderRadius}
				onCapture={handleCapture}
			/>
			<div
				style={{
					display: "flex",
					justifyContent: "center",
					margin: "10px",
					gap: "10px",
				}}
			>
				<DeviceSelector
					deviceId={deviceId}
					devices={devices}
					onChange={handleDeviceChange}
				/>
				<Button onClick={toggleStreaming}>
					{streaming ? "Stop" : "Start"}
				</Button>
			</div>
		</>
	);
};

export default VideoFeed;
