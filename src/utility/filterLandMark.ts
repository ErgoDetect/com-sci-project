import { LandmarksResult } from '../interface/propsType';

export default function filterLandmark(landMarkData: LandmarksResult): any {
  const result = {
    leftShoulder: landMarkData?.poseResults?.landmarks[0][11],
    rightShoulder: landMarkData?.poseResults?.landmarks[0][11],
    leftIris: [
      landMarkData?.faceResults?.faceLandmarks[0][474],
      landMarkData?.faceResults?.faceLandmarks[0][476],
    ],
    RightIris: [
      landMarkData?.faceResults?.faceLandmarks[0][469],
      landMarkData?.faceResults?.faceLandmarks[0][471],
    ],
  };
  return result;
}
