import { LandmarksResult, xyzPosition } from '../interface/propsType';

export function filterLandmark(landMarkData: LandmarksResult): any {
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

export function getIrisDiameter(landMarkData: LandmarksResult): any {
  let leftIris1 = landMarkData?.faceResults
    ?.faceLandmarks[0][474] as xyzPosition;
  let leftIris2 = landMarkData?.faceResults
    ?.faceLandmarks[0][476] as xyzPosition;
  let rightIris1 = landMarkData?.faceResults
    ?.faceLandmarks[0][469] as xyzPosition;
  let rightIris2 = landMarkData?.faceResults
    ?.faceLandmarks[0][471] as xyzPosition;

  const result = {
    leftIrisDiameter: Math.sqrt(
      Math.pow(leftIris1.x - leftIris2.x, 2) +
        Math.pow(leftIris1.y - leftIris2.y, 2),
    ),
    rightIrisDiameter: Math.sqrt(
      Math.pow(rightIris1.x - rightIris2.x, 2) +
        Math.pow(rightIris1.y - rightIris2.y, 2),
    ),
  };
  return result;
}
