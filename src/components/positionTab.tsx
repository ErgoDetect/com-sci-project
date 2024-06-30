/** @format */

import React from "react";
import { PositionData, ContainerProps } from "../interface/propsType";

const PositionTab: React.FC<ContainerProps> = ({ data }) => {
	const positionData: PositionData | undefined =
		data as unknown as PositionData;
	// const positionData = data?.headPosition;
	const frameTracking = data?.frameCount;
	const latency = data?.latency;

	// return (
	// 	<div style={{ overflowY: "scroll", height: 450 }}>
	// 		<h2>Head Position</h2>
	// 		<p>
	// 			x:{" "}
	// 			{positionData && positionData.headPosition
	// 				? Math.round(positionData.headPosition[0] * 100) / 100
	// 				: "No data"}
	// 			<br />
	// 			y:{" "}
	// 			{positionData && positionData.headPosition
	// 				? Math.round(positionData.headPosition[1] * 100) / 100
	// 				: "No data"}
	// 		</p>

	// 		<h2>Head Rotation</h2>
	// 		<p>
	// 			x:{" "}
	// 			{positionData && positionData.headRotationDegree
	// 				? Math.round(positionData.headRotationDegree[0] * 100) / 100
	// 				: "No data"}
	// 			<br />
	// 			y:{" "}
	// 			{positionData && positionData.headRotationDegree
	// 				? Math.round(positionData.headRotationDegree[1] * 100) / 100
	// 				: "No data"}
	// 			<br />
	// 			z:{" "}
	// 			{positionData && positionData.headRotationDegree
	// 				? Math.round(positionData.headRotationDegree[2] * 100) / 100
	// 				: "No data"}
	// 		</p>

	// 		<h2>Shoulder Left Position</h2>
	// 		<p>
	// 			x:{" "}
	// 			{positionData && positionData.shoulderLeftPosition
	// 				? Math.round(positionData.shoulderLeftPosition[0] * 100) / 100
	// 				: "No data"}
	// 			<br />
	// 			y:{" "}
	// 			{positionData && positionData.shoulderLeftPosition
	// 				? Math.round(positionData.shoulderLeftPosition[1] * 100) / 100
	// 				: "No data"}
	// 			<br />
	// 			z:{" "}
	// 			{positionData && positionData.shoulderLeftPosition
	// 				? Math.round(positionData.shoulderLeftPosition[2] * 100) / 100
	// 				: "No data"}
	// 		</p>

	// 		<h2>Shoulder Right Position</h2>
	// 		<p>
	// 			x:{" "}
	// 			{positionData && positionData.shoulderRightPosition
	// 				? Math.round(positionData.shoulderRightPosition[0] * 100) / 100
	// 				: "No data"}
	// 			<br />
	// 			y:{" "}
	// 			{positionData && positionData.shoulderRightPosition
	// 				? Math.round(positionData.shoulderRightPosition[1] * 100) / 100
	// 				: "No data"}
	// 			<br />
	// 			z:{" "}
	// 			{positionData && positionData.shoulderRightPosition
	// 				? Math.round(positionData.shoulderRightPosition[2] * 100) / 100
	// 				: "No data"}
	// 		</p>

	// 		<h2>Depth</h2>
	// 		<p>
	// 			{positionData && positionData.depth
	// 				? Math.round(positionData.depth * 100) / 100
	// 				: "No data"}
	// 		</p>

	// 		<hr />

	// 		<h2>Set Head Position</h2>
	// 		<p>
	// 			x:{" "}
	// 			{positionData && positionData.headPosition
	// 				? Math.round(positionData.headPosition[0] * 100) / 100
	// 				: "No data"}
	// 			<br />
	// 			y:{" "}
	// 			{positionData && positionData.headPosition
	// 				? Math.round(positionData.headPosition[1] * 100) / 100
	// 				: "No data"}
	// 		</p>

	// 		<h2>Set Head Rotation</h2>
	// 		<p>
	// 			x:{" "}
	// 			{positionData && positionData.headRotationDegree
	// 				? Math.round(positionData.headRotationDegree[0] * 100) / 100
	// 				: "No data"}
	// 			<br />
	// 			y:{" "}
	// 			{positionData && positionData.headRotationDegree
	// 				? Math.round(positionData.headRotationDegree[1] * 100) / 100
	// 				: "No data"}
	// 			<br />
	// 			z:{" "}
	// 			{positionData && positionData.headRotationDegree
	// 				? Math.round(positionData.headRotationDegree[2] * 100) / 100
	// 				: "No data"}
	// 		</p>
	// 	</div>
	// );
	return (
		<div style={{ overflowY: "scroll", height: 450 }}>
			<h2>Head Position</h2>
			<p>
				x:{" "}
				{positionData?.headPosition
					? (Math.round(positionData?.headPosition.x * 100) / 100).toFixed(2)
					: "No data"}
				<br />
				<br />
				y:{" "}
				{positionData?.headPosition
					? (Math.round(positionData?.headPosition.y * 100) / 100).toFixed(2)
					: "No data"}
				<br />
			</p>
			<h2>Depth</h2>
			<p>
				Left Iris:{" "}
				{positionData && positionData.depthLeftIris
					? Math.round(positionData.depthLeftIris * 100) / 100
					: "No data"}
				<br />
			</p>
			<br />
			receive frame: {frameTracking ?? "No data"}
			<br />
			latency: {latency ?? "No data"}
		</div>
	);
};

export default PositionTab;
