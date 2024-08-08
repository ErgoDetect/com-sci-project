import { LandmarksResult } from '../interface/propsType';

export default function filterLandmark(landMarkData: LandmarksResult): any {
  const result = {
    leftShoulder: landMarkData?.poseResults?.landmarks[0][11],
    rightShoulder: landMarkData?.poseResults?.landmarks[0][11],
    rightIris: {
      '33': landMarkData?.faceResults?.faceLandmarks[0][33],
      '133': landMarkData?.faceResults?.faceLandmarks[0][133],
      '144': landMarkData?.faceResults?.faceLandmarks[0][144],
      '153': landMarkData?.faceResults?.faceLandmarks[0][153],
      '158': landMarkData?.faceResults?.faceLandmarks[0][158],
      '160': landMarkData?.faceResults?.faceLandmarks[0][160],
    },
    leftIris: {
      '263': landMarkData?.faceResults?.faceLandmarks[0][263],
      '362': landMarkData?.faceResults?.faceLandmarks[0][362],
      '373': landMarkData?.faceResults?.faceLandmarks[0][373],
      '380': landMarkData?.faceResults?.faceLandmarks[0][380],
      '385': landMarkData?.faceResults?.faceLandmarks[0][385],
      '387': landMarkData?.faceResults?.faceLandmarks[0][387],
    },
  };
  return result;
}
