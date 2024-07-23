/** @format */

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
} from 'react';
import { DebugData, PositionData } from '../interface/propsType';

interface ResContextProps {
  resData: PositionData | undefined;
  setResData: React.Dispatch<React.SetStateAction<PositionData | undefined>>;
  debugData: DebugData | undefined;
  landMarkData: object;
  setLandMarkData: React.Dispatch<React.SetStateAction<object>>;
  streaming: boolean;
  setStreaming: React.Dispatch<React.SetStateAction<boolean>>;
}

const ResContext = createContext<ResContextProps | null>(null);

export const ResProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [resData, setResData] = useState<PositionData | undefined>(undefined);
  const [landMarkData, setLandMarkData] = useState<object>({});
  const [streaming, setStreaming] = useState<boolean>(false);
  // Compute debugData based on resData if needed
  const debugData = useMemo(() => {
    if (resData) {
      // Example conversion, adjust according to actual DebugData definition
      return { ...resData } as unknown as DebugData;
    }
    return undefined;
  }, [resData]);

  return (
    <ResContext.Provider
      value={{
        resData,
        setResData,
        debugData,
        landMarkData,
        setLandMarkData,
        streaming,
        setStreaming,
      }}
    >
      {children}
    </ResContext.Provider>
  );
};

export const useResData = (): ResContextProps => {
  const context = useContext(ResContext);
  if (context === null) {
    throw new Error('useResData must be used within a ResProvider');
  }
  return context;
};
