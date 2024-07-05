/** @format */

import React, { useState, useEffect } from "react";
import { PositionData, PositionTabProps } from "../interface/propsType";
import { Checkbox, Typography, Col, Row } from "antd";
import type { CheckboxProps } from "antd";

const PositionTab: React.FC<PositionTabProps> = ({
	data,
	onShowLandmarkChange,
}) => {
	const { Title, Text } = Typography;
	const positionData: PositionData | undefined =
		data as unknown as PositionData;
	const frameTracking = data?.frameCount;
	const latency = data?.latency;

	const [showHeadLandmark, setShowHeadLandmark] = useState(false);
	const [showShoulderLandmark, setShowShoulderLandmark] = useState(false);

	useEffect(() => {
		if (onShowLandmarkChange) {
			const showLandmark = {
				showHeadLandmark,
				showShoulderLandmark,
			};
			onShowLandmarkChange(showLandmark);
		}
	}, [showHeadLandmark, showShoulderLandmark, onShowLandmarkChange]);

	const onChangeShowHeadLandmark: CheckboxProps["onChange"] = (e) => {
		setShowHeadLandmark(e.target.checked);
	};

	const onChangeShowShoulderLandmark: CheckboxProps["onChange"] = (e) => {
		setShowShoulderLandmark(e.target.checked);
	};

	return (
		<div style={{ overflowY: "scroll", height: 450, alignItems: "center" }}>
			<Row>
				<Col span={2}>
					<Checkbox
						checked={showHeadLandmark}
						onChange={onChangeShowHeadLandmark}
					></Checkbox>
				</Col>
				<Col>
					<Title level={5} style={{ margin: 0 }}>
						Head Position
					</Title>
				</Col>
			</Row>
			<Row>
				<Col span={2}></Col>
				<Col>
					<Text>
						x:{" "}
						{positionData?.headPosition
							? (Math.round(positionData?.headPosition.x * 100) / 100).toFixed(
									2
							  )
							: "No data"}
						<br />
						y:{" "}
						{positionData?.headPosition
							? (Math.round(positionData?.headPosition.y * 100) / 100).toFixed(
									2
							  )
							: "No data"}
						<br />
					</Text>
				</Col>
			</Row>
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
