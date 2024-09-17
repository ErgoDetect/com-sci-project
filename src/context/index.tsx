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

// Define the theme type
type Theme = 'light' | 'dark';

interface ResContextProps {
  resData: PositionData | undefined;
  setResData: React.Dispatch<React.SetStateAction<PositionData | undefined>>;
  isLogin: boolean;
  setIsLogin: React.Dispatch<React.SetStateAction<boolean>>;
  loginResponse: boolean;
  setLoginResponse: React.Dispatch<React.SetStateAction<boolean>>;
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
  url: string;
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  showDetailedData: boolean;
  setShowDetailedData: React.Dispatch<React.SetStateAction<boolean>>;
}

const ResContext = createContext<ResContextProps | null>(null);

export const ResProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [resData, setResData] = useState<PositionData | undefined>(undefined);
  const [isLogin, setIsLogin] = useState<boolean>(false);
  const [loginResponse, setLoginResponse] = useState<boolean>(false);
  const [landMarkData, setLandMarkData] = useState<LandmarksResult | undefined>(
    undefined,
  );
  const [streaming, setStreaming] = useState<boolean>(false);
  const [startCapture, setStartCapture] = useState<boolean>(false);
  const [calibrationData, setCalibrationData] = useState<any>(null);
  const [combineResult, setCombineResult] = useState<CombineResult | undefined>(
    undefined,
  );

  // Theme management
  const [theme, setTheme] = useState<Theme>('light');

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };
  const [showDetailedData, setShowDetailedData] = useState<boolean>(false);

  const url = 'localhost:8000'; // Change this based on environment

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
      theme,
      toggleTheme,
      setTheme,
      loginResponse,
      setLoginResponse,
      isLogin,
      setIsLogin,
      showDetailedData,
      setShowDetailedData,
    }),
    [
      resData,
      debugData,
      landMarkData,
      streaming,
      startCapture,
      calibrationData,
      combineResult,
      theme,
      loginResponse,
      isLogin,
      showDetailedData,
    ],
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
