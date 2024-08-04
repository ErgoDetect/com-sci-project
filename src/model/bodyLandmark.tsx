import {
  PoseLandmarker,
  FilesetResolver,
  DrawingUtils,
  NormalizedLandmark,
} from '@mediapipe/tasks-vision';

export const initializePoseLandmarker = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm',
  );
  const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
      delegate: 'GPU',
    },
    runningMode: 'VIDEO',
    numPoses: 2,
  });
};
initializePoseLandmarker();

export const drawPoseLandmarker = (
  results: { landmarks: any },
  context: CanvasRenderingContext2D,
  drawingUtils: DrawingUtils,
) => {
  if (results.landmarks) {
    results.landmarks.forEach((landmark: NormalizedLandmark[] | undefined) => {
      drawingUtils.drawLandmarks(landmark, {
        radius: (data) => DrawingUtils.lerp(data.from!.z, -0.15, 0.1, 5, 1),
      });
      drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS);
    });
  }
};
