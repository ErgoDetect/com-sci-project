/** @format */

import React, { useRef, useEffect, useCallback } from "react";
import { WebcamDisplayProps } from "../../interface/propsType";
import { drawCircle } from "../../utility/drawCircle";

const WebcamDisplay: React.FC<WebcamDisplayProps> = ({
	deviceId,
	streaming,
	width = "35vw",
	borderRadius = "12px",
	drawingDot,
	onCapture,
}) => {
	const webcamRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const showCanvasRef = useRef<HTMLCanvasElement>(null);
	const videoStreamRef = useRef<MediaStream | null>(null);
	const animationFrameIdRef = useRef<number | undefined>();
	const intervalIdRef = useRef<number | undefined>();

	const stopVideoStream = useCallback(() => {
		if (videoStreamRef.current) {
			videoStreamRef.current.getTracks().forEach((track) => track.stop());
			videoStreamRef.current = null;
		}
	}, []);

	const captureFrame = useCallback(() => {
		const canvas = canvasRef.current;
		const webcam = webcamRef.current;

		if (canvas && webcam) {
			const context = canvas.getContext("2d");
			if (context) {
				context.drawImage(webcam, 0, 0, canvas.width, canvas.height);
				canvas.toBlob((blob) => {
					if (blob) {
						onCapture(blob);
					}
				}, "image/jpeg");
			}
		}
	}, [onCapture]);

	const startVideoStream = useCallback(async () => {
		if (!deviceId) {
			console.error("No camera device selected.");
			return;
		}

		try {
			stopVideoStream();

			const videoStream = await navigator.mediaDevices.getUserMedia({
				video: {
					deviceId,
					width: { ideal: 1980 },
					height: { ideal: 1080 },
					frameRate: { ideal: 30 },
				},
			});

			videoStreamRef.current = videoStream;

			if (webcamRef.current) {
				webcamRef.current.srcObject = videoStream;
				await webcamRef.current.play();

				const { videoWidth, videoHeight } = webcamRef.current;
				if (canvasRef.current) {
					canvasRef.current.width = videoWidth;
					canvasRef.current.height = videoHeight;
				}
				if (showCanvasRef.current) {
					showCanvasRef.current.width = videoWidth;
					showCanvasRef.current.height = videoHeight;
				}
			}
		} catch (error) {
			console.error("Error accessing camera:", error);
		}
	}, [deviceId, stopVideoStream]);

	useEffect(() => {
		if (deviceId) {
			startVideoStream();
		}

		return () => {
			if (intervalIdRef.current) {
				clearInterval(intervalIdRef.current);
			}
			stopVideoStream();
		};
	}, [deviceId, startVideoStream, stopVideoStream]);

	const renderFrame = useCallback(() => {
		const showCanvas = showCanvasRef.current;
		const webcam = webcamRef.current;

		if (showCanvas && webcam) {
			const context = showCanvas.getContext("2d");
			if (context) {
				context.drawImage(webcam, 0, 0, showCanvas.width, showCanvas.height);
				if (drawingDot) {
					for (let index = 0; index < drawingDot.x.length; index++) {
						drawCircle(
							drawingDot.x[index],
							drawingDot.y[index],
							showCanvas.height,
							showCanvas.width,
							showCanvas
						);
					}
				}
			}
		}

		animationFrameIdRef.current = requestAnimationFrame(renderFrame);
	}, []);

	useEffect(() => {
		animationFrameIdRef.current = requestAnimationFrame(renderFrame);

		return () => {
			if (animationFrameIdRef.current !== undefined) {
				cancelAnimationFrame(animationFrameIdRef.current);
			}
		};
	}, [streaming, renderFrame]);

	useEffect(() => {
		if (streaming && intervalIdRef.current === undefined) {
			intervalIdRef.current = window.setInterval(captureFrame, 1000);
		} else if (!streaming && intervalIdRef.current !== undefined) {
			clearInterval(intervalIdRef.current);
			intervalIdRef.current = undefined;
		}
	}, [streaming, captureFrame]);

	return (
		<>
			<video
				ref={webcamRef}
				style={{
					display: "none",
				}}
			></video>
			<canvas ref={canvasRef} style={{ display: "none" }}></canvas>
			<canvas
				ref={showCanvasRef}
				style={{ width, borderRadius, transform: "scaleX(-1)" }}
			></canvas>
		</>
	);
};

export default WebcamDisplay;
