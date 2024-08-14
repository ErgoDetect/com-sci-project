import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
} from 'react';
import {
  CombineResult,
  DebugData,
  LandmarksResult,
  PositionData,
} from '../interface/propsType';

interface ResContextProps {
  resData: PositionData | undefined;
  setResData: React.Dispatch<React.SetStateAction<PositionData | undefined>>;
  debugData: DebugData | undefined;
  landMarkData: LandmarksResult | undefined;
  setLandMarkData: React.Dispatch<
    React.SetStateAction<LandmarksResult | undefined>
  >;
  streaming: boolean;
  setStreaming: React.Dispatch<React.SetStateAction<boolean>>;
  startCapture: boolean;
  setStartCapture: React.Dispatch<React.SetStateAction<boolean>>;
  calibrationData: any;
  setCalibrationData: React.Dispatch<React.SetStateAction<any>>;
  combineResult: CombineResult | undefined;
  setCombineResult: React.Dispatch<
    React.SetStateAction<CombineResult | undefined>
  >;
  url: string | undefined;
}

const ResContext = createContext<ResContextProps | null>(null);

export const ResProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [resData, setResData] = useState<PositionData | undefined>(undefined);
  const [landMarkData, setLandMarkData] = useState<LandmarksResult | undefined>(
    undefined,
  );
  const [streaming, setStreaming] = useState<boolean>(false);
  const [startCapture, setStartCapture] = useState<boolean>(false);
  const [calibrationData, setCalibrationData] = useState<any>(null);
  const [combineResult, setCombineResult] = useState<CombineResult | undefined>(
    undefined,
  );
  const url = 'localhost:8000';
  // const url = '192.168.1.56:8000';

  const debugData = useMemo(() => {
    if (resData) {
      return { ...resData } as unknown as DebugData;
    }
    return undefined;
  }, [resData]);

  const contextValue = useMemo(
    () => ({
      resData,
      setResData,
      debugData,
      landMarkData,
      setLandMarkData,
      streaming,
      setStreaming,
      startCapture,
      setStartCapture,
      calibrationData,
      setCalibrationData,
      combineResult,
      setCombineResult,
      url,
    }),
    [
      resData,
      debugData,
      landMarkData,
      streaming,
      startCapture,
      calibrationData,
      combineResult,
      url,
    ], // Add calibrationData to dependencies
  );

  return (
    <ResContext.Provider value={contextValue}>{children}</ResContext.Provider>
  );
};

export const useResData = (): ResContextProps => {
  const context = useContext(ResContext);
  if (context === null) {
    throw new Error('useResData must be used within a ResProvider');
  }
  return context;
};
