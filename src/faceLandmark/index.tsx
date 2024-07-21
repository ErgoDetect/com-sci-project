import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision';
import face_landmarker_task from '../model/face_landmarker.task';
import { useEffect } from 'react';

const FaceLandmark = () => {
  useEffect(() => {
    let faceLandmarker;
    let animationFrameId;

    const initializeHandDetection = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm',
        );
        faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: face_landmarker_task },
          numFaces: 1,
          runningMode: 'VIDEO',
        });
      } catch (error) {
        console.error('Error initializing hand detection:', error);
      }
    };
  });
};
export default FaceLandmark;
