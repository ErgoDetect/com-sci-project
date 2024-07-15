/** @format */

const videoFormats = ["mp4", "webm", "ogg", "avi", "mov"]; // Add the formats you want to support

export async function importVideo(videoName: string): Promise<string> {
	for (const format of videoFormats) {
		try {
			const video = await import(`../result/${videoName}.${format}`);
			return video.default || video;
		} catch (e) {
			// Continue to the next format if the current one is not found
		}
	}
	throw new Error(
		`Video file with name ${videoName} not found in any supported format`
	);
}
