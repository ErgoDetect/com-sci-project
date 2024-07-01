/** @format */

import { useEffect, useState } from "react";
import Container from "../container/mainContainer";
import VideoFeed from "../components/videoFeed";
import { DataProps } from "../interface/propsType";

const App = () => {
	const [data, setData] = useState<DataProps | undefined>(undefined);

	let drawArray: { x: number[]; y: number[] } = {
		x: [],
		y: [],
	};
	drawArray.x.push(0.5);
	drawArray.y.push(0.5);
	drawArray.x.push(0.5);
	drawArray.y.push(0.2);

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
		}
	}, [data]);

	return (
		<Container
			data={data}
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
