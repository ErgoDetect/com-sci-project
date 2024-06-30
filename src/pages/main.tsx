/** @format */

import { useEffect, useState } from "react";
import Container from "../container/mainContainer";
import VideoFeed from "../components/videoFeed";

const App = () => {
	const [data, setData] = useState({
		frameCount: 0,
		latency: 0,
	});

	useEffect(() => {
		console.log(
			"Received Frame : ",
			data?.frameCount,
			"Latency : ",
			data?.latency.toFixed(2),
			"ms"
		);
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
