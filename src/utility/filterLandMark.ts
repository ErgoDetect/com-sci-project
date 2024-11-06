import { LandmarksResult } from '../interface/propsType';

const filterLandmark = (landMarkData: LandmarksResult) => {
  const result = {
    faceDetect: !!landMarkData?.faceResults.faceLandmarks[0],
    leftShoulder: landMarkData?.poseResults?.landmarks[0]?.[11] ?? null,
    rightShoulder: landMarkData?.poseResults?.landmarks[0]?.[11] ?? null,
    rightEye: {
      '33': landMarkData?.faceResults?.faceLandmarks[0]?.[33] ?? null,
      '133': landMarkData?.faceResults?.faceLandmarks[0]?.[133] ?? null,
      '144': landMarkData?.faceResults?.faceLandmarks[0]?.[144] ?? null,
      '153': landMarkData?.faceResults?.faceLandmarks[0]?.[153] ?? null,
      '158': landMarkData?.faceResults?.faceLandmarks[0]?.[158] ?? null,
      '160': landMarkData?.faceResults?.faceLandmarks[0]?.[160] ?? null,
    },
    leftEye: {
      '263': landMarkData?.faceResults?.faceLandmarks[0]?.[263] ?? null,
      '362': landMarkData?.faceResults?.faceLandmarks[0]?.[362] ?? null,
      '373': landMarkData?.faceResults?.faceLandmarks[0]?.[373] ?? null,
      '380': landMarkData?.faceResults?.faceLandmarks[0]?.[380] ?? null,
      '385': landMarkData?.faceResults?.faceLandmarks[0]?.[385] ?? null,
      '387': landMarkData?.faceResults?.faceLandmarks[0]?.[387] ?? null,
    },
    rightIris: {
      '469': landMarkData?.faceResults?.faceLandmarks[0]?.[469] ?? null,
      '471': landMarkData?.faceResults?.faceLandmarks[0]?.[471] ?? null,
    },
    leftIris: {
      '474': landMarkData?.faceResults?.faceLandmarks[0]?.[474] ?? null,
      '476': landMarkData?.faceResults?.faceLandmarks[0]?.[476] ?? null,
    },
  };
  return result;
};

export default filterLandmark;
