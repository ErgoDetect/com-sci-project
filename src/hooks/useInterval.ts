import { useEffect, useRef } from 'react';

const useInterval = (
  callback: () => void,
  delay: number | null,
  isActive: boolean,
) => {
  const savedCallback = useRef<() => void>();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    if (!isActive || delay === null) {
      return undefined;
    }

    const tick = () => {
      if (savedCallback.current) {
        savedCallback.current();
      }
    };

    const id = setInterval(tick, delay);
    return () => clearInterval(id);
  }, [delay, isActive]);
};

export default useInterval;
