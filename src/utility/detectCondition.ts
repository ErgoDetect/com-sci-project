// stack is numbers of frame that user not blink
export function blinkDetection(currentData: number, stack: number): any {
  if (currentData >= 0.3) {
    stack = 0;
  } else {
    stack = stack + 1;
  }
  return stack;
}

// stack is numbers of frame that user near the screen than normal
export function distanceDetection(
  currentData: number,
  correctData: number,
  stack: number,
): any {
  if (currentData >= correctData * 1.1) {
    stack = stack + 1;
  } else {
    stack = 0;
  }
  return stack;
}

// if not sitting straight it's will return true
export function thoracicDetection(
  currentData: number,
  correctData: number,
): any {
  if (currentData >= correctData * 1.1) {
    return true;
  } else {
    return false;
  }
}
