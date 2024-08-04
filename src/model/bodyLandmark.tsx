/** @format */

import {
  DrawingUtils,
  PoseLandmarker,
  FilesetResolver,
  NormalizedLandmark,
} from '@mediapipe/tasks-vision';

/**
 * Initializes the FaceLandmarker with necessary configurations.
 * @returns {Promise<PoseLandmarker>} - An initialized FaceLandmarker instance.
 */

export const initializePoseLandmarker = async () => {
  try {
    const filesetResolver = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm',
    );
    const poseLandmarker = await PoseLandmarker.createFromOptions(
      filesetResolver,
      {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numPoses: 1,
      },
    );
    return poseLandmarker;
  } catch (error) {
    console.error('Error initializing PoseLandmarker:', error);
    throw error;
  }
};
