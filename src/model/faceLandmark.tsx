/** @format */

import {
  DrawingUtils,
  FaceLandmarker,
  FilesetResolver,
  NormalizedLandmark,
} from '@mediapipe/tasks-vision';

/**
 * Initializes the FaceLandmarker with necessary configurations.
 * @returns {Promise<FaceLandmarker>} - An initialized FaceLandmarker instance.
 */
export const initializeFaceLandmarker = async () => {
  try {
    const filesetResolver = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm',
    );
    const faceLandmarker = await FaceLandmarker.createFromOptions(
      filesetResolver,
      {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
          delegate: undefined,
        },
        outputFaceBlendshapes: true,
        runningMode: 'VIDEO',
        numFaces: 1,
      },
    );
    return faceLandmarker;
  } catch (error) {
    console.error('Error initializing FaceLandmarker:', error);
    throw error;
  }
};

/**
 * Draws face landmarks on the given canvas context.
 * @param {object} results - The results from the FaceLandmarker detection.
 * @param {CanvasRenderingContext2D} context - The canvas context to draw on.
 * @param {DrawingUtils} drawingUtils - Utility for drawing on the canvas.
 */
export const drawFaceLandmarker = (
  results: { faceLandmarks: any },
  context: CanvasRenderingContext2D,
  drawingUtils: DrawingUtils,
) => {
  if (results.faceLandmarks) {
    results.faceLandmarks.forEach(
      (landmarks: NormalizedLandmark[] | undefined) => {
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_TESSELATION,
          { color: '#C0C0C070', lineWidth: 1 },
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
          { color: '#FF3030' },
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
          { color: '#FF3030' },
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
          { color: '#30FF30' },
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
          { color: '#30FF30' },
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
          { color: '#E0E0E0' },
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_LIPS,
          { color: '#E0E0E0' },
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
          { color: '#FF3030' },
        );
        drawingUtils.drawConnectors(
          landmarks,
          FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
          { color: '#30FF30' },
        );
      },
    );
  }
};
