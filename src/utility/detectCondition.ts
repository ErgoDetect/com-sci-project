/* eslint-disable camelcase */
// blinkDetection: stack is numbers of frames that user has not blinked
export function blinkDetection(currentData: number, stack: number): number {
  return currentData >= 0.3 ? 0 : stack + 1;
}

// distanceDetection: stack is numbers of frames that user is nearer to the screen than normal
export function distanceDetection(
  currentData: number,
  correctData: number,
  stack: number,
): number {
  return currentData >= correctData * 1.1 ? stack + 1 : 0;
}

// thoracicDetection: if not sitting straight, returns true
export function thoracicDetection(
  currentData: number,
  correctData: number,
): boolean {
  return currentData >= correctData * 1.1;
}

// depthEstimation: estimates the depth
export function depthEstimation(
  irisDiameter: number,
  focalLength: number,
  imageWidth: number,
  imageHeight: number,
): number {
  const real_iris_diameter = 1.17;
  const size = Math.min(imageWidth, imageHeight);
  const depth = (focalLength * real_iris_diameter * size) / irisDiameter;
  return depth;
}
