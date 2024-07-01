/** @format */

import React, {
	useState,
	useCallback,
	useEffect,
	useMemo,
	useRef,
} from "react";
import { Button } from "antd";
import { DeviceProps, videoFeedProps } from "../interface/propsType";
import DeviceSelector from "./camera/deviceSelector";
import WebcamDisplay from "./camera/webcamDisplay";
import useWebSocket from "../utility/webSocketConfig";

const VideoFeed: React.FC<videoFeedProps> = ({
	width,
	borderRadius,
	drawingDot,
	setData,
}) => {
	const [deviceId, setDeviceId] = useState<string | undefined>("");
	const [devices, setDevices] = useState<DeviceProps[]>([]);
	const [streaming, setStreaming] = useState(false);
	const [frameCount, setFrameCount] = useState(0);
	const frameCountRef = useRef(0);

	const { send } = useWebSocket("ws://localhost:8000/ws", setData);

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

	const handleDeviceChange = useCallback((value: string) => {
		setDeviceId(value);
	}, []);

	const toggleStreaming = () => {
		if (streaming) {
			setFrameCount(0);
			frameCountRef.current = 0;
		}
		setStreaming(!streaming);
	};

	useEffect(() => {
		handleDevices();
	}, [handleDevices]);

	const handleCapture = useCallback(
		(blob: Blob) => {
			console.log("Image size:", (blob.size / 1024).toFixed(2), "kilo bytes"); // Log image size

			const reader = new FileReader();
			reader.onload = () => {
				const dataUrl = reader.result as string;
				const timestamp = Date.now();
				const data = {
					frameCount: frameCountRef.current,
					image: dataUrl.split(",")[1],
					timestamp: timestamp,
				};

				send(JSON.stringify(data));
			};
			reader.readAsDataURL(blob);
			frameCountRef.current += 1;
		},
		[send]
	);

	const deviceSelectorMemo = useMemo(
		() => (
			<DeviceSelector
				deviceId={deviceId}
				devices={devices}
				onChange={handleDeviceChange}
			/>
		),
		[deviceId, devices, handleDeviceChange]
	);

	useEffect(() => {
		console.log("Frame count:", frameCount);
	}, [frameCount]);

	return (
		<>
			<WebcamDisplay
				deviceId={deviceId}
				streaming={streaming}
				width={width}
				borderRadius={borderRadius}
				drawingDot={drawingDot}
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
				{deviceSelectorMemo}
				<Button onClick={toggleStreaming}>
					{streaming ? "Stop" : "Start"}
				</Button>
			</div>
		</>
	);
};

export default VideoFeed;
