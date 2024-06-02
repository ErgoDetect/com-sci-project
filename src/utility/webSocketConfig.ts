/** @format */

import { useRef, useEffect, useCallback } from "react";

const useWebSocket = (url: string, onMessage: (data: any) => void) => {
	const socketRef = useRef<WebSocket | null>(null);

	const initializeWebSocket = useCallback(() => {
		const socket = new WebSocket(url);
		socketRef.current = socket;

		const handleOpen = () => {
			console.log("WebSocket connection established");
		};

		const handleMessage = (event: MessageEvent) => {
			const inputData = JSON.parse(event.data);
			onMessage(inputData);
		};

		const handleError = (error: Event) => {
			console.error("WebSocket error:", error);
		};

		const handleClose = () => {
			console.log("WebSocket connection closed");
		};

		socket.addEventListener("open", handleOpen);
		socket.addEventListener("message", handleMessage);
		socket.addEventListener("error", handleError);
		socket.addEventListener("close", handleClose);

		return () => {
			if (
				socketRef.current &&
				socketRef.current.readyState === WebSocket.OPEN
			) {
				socketRef.current.close();
			}
		};
	}, [url, onMessage]);

	useEffect(() => {
		const cleanupWebSocket = initializeWebSocket();

		return cleanupWebSocket;
	}, [initializeWebSocket]);

	const send = (data: any) => {
		if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
			socketRef.current.send(data);
		}
	};

	return { send };
};

export default useWebSocket;
