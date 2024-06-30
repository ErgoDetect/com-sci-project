/** @format */

import { useEffect, useState } from "react";
import Container from "../container/mainContainer";
import VideoFeed from "../components/videoFeed";
import { DataProps } from "../interface/propsType";

const App = () => {
	const [data, setData] = useState<DataProps | undefined>(undefined);

	useEffect(() => {
		if (data) {
			console.log(
				"data :",
				data,
				"Head Position : ",
				data.headPosition,
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
						<VideoFeed setData={setData} />
					</div>
				</div>
			}
		/>
	);
};

export default App;
