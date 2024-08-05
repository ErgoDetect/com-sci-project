import { useCallback, useRef } from 'react';

type ThrottleFunction = (...args: unknown[]) => void;

const useThrottle = (
  func: ThrottleFunction,
  limit: number,
): ThrottleFunction => {
  const lastFuncRef = useRef<NodeJS.Timeout | undefined>();
  const lastRanRef = useRef<number | undefined>();

  const throttledFunction = useCallback(
    (...args: unknown[]) => {
      if (lastRanRef.current === undefined) {
        func(...args);
        lastRanRef.current = Date.now();
      } else {
        if (lastFuncRef.current) clearTimeout(lastFuncRef.current);
        lastFuncRef.current = setTimeout(
          () => {
            if (Date.now() - (lastRanRef.current ?? 0) >= limit) {
              func(...args);
              lastRanRef.current = Date.now();
            }
          },
          limit - (Date.now() - (lastRanRef.current ?? 0)),
        );
      }
    },
    [func, limit],
  );

  return throttledFunction;
};

export default useThrottle;
