import { useEffect, useMemo, useState } from "react";
import Container from "../container/mainContainer";
import VideoFeed from "../components/videoFeed";
import { DataProps, PositionData } from "../interface/propsType";

const App = () => {
	const [data, setData] = useState<DataProps | undefined>(undefined);

	const [landmarkState, setLandmarkState] = useState({
		showHeadLandmark: false,
		showShoulderLandmark: false,
	});

	const handleShowLandmarkChange = (updatedState: {
		showHeadLandmark: boolean;
		showShoulderLandmark: boolean;
	}) => {
		setLandmarkState(updatedState);
	};

	const positionData = data as PositionData | undefined;

	const drawArray = useMemo(
		() => ({
			x: [] as number[],
			y: [] as number[],
		}),
		[]
	);

	useEffect(() => {
		if (data) {
			console.log(
				"data :",
				data,
				"Received Frame : ",
				data.frameCount,
				"Latency : ",
				data.latency.toFixed(2),
				"ms"
			);

			drawArray.x = [];
			drawArray.y = [];

			const headPosition = positionData?.headPosition;
			const shoulderPosition = positionData?.shoulderPosition;

			if (landmarkState.showHeadLandmark && headPosition) {
				drawArray.x.push(headPosition.x as number);

				drawArray.y.push(headPosition.y as number);
			}

			if (landmarkState.showShoulderLandmark && shoulderPosition) {
				drawArray.x.push(shoulderPosition.shoulder_left.x as number);
				drawArray.y.push(shoulderPosition.shoulder_left.y as number);

				drawArray.x.push(shoulderPosition.shoulder_right.x as number);
				drawArray.y.push(shoulderPosition.shoulder_right.y as number);
			}
		}
	}, [
		data,
		drawArray,
		landmarkState.showHeadLandmark,
		landmarkState.showShoulderLandmark,
		positionData,
	]);

	return (
		<Container
			data={data}
			onShowLandmarkChange={handleShowLandmarkChange}
			children={
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "1fr",
						height: "100%",
					}}
				>
					<div style={{ placeSelf: "center" }}>
						<VideoFeed setData={setData} drawingDot={drawArray} />
					</div>
				</div>
			}
		/>
	);
};

export default App;
