/* eslint-disable camelcase */
// stack is numbers of frame that user not blink
export function blinkDetection(currentData: number, stack: number): number {
  let newStack = stack;

  if (currentData >= 0.3) {
    newStack = 0;
  } else {
    newStack += 1;
  }

  return newStack;
}

// stack is numbers of frame that user near the screen than normal
export function distanceDetection(
  currentData: number,
  correctData: number,
  stack: number,
): number {
  let newStack = stack;

  if (currentData >= correctData * 1.1) {
    newStack += 1;
  } else {
    newStack = 0;
  }

  return newStack;
}

// if not sitting straight it's will return true
export function thoracicDetection(
  currentData: number,
  correctData: number,
): any {
  if (currentData >= correctData * 1.1) {
    return true;
  }
  return false;
}

export function depthEstimation(
  irisDiameter: number,
  forcalLength: number,
  imageWidth: number,
  imageHeigh: number,
): any {
  const real_iris_diameter = 1.17;
  let size;
  if (imageWidth < imageHeigh) {
    size = imageWidth;
  } else {
    size = imageHeigh;
  }
  const depth = (forcalLength * real_iris_diameter * size) / irisDiameter;
  return depth;
}
