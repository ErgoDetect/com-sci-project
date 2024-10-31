import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
  useRef,
  useEffect,
} from 'react';
import {
  CombineResult,
  DebugData,
  LandmarksResult,
} from '../interface/propsType';

// Define the theme type

interface ResContextProps {
  resData: any;
  setResData: React.Dispatch<React.SetStateAction<any>>;
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
  showDetailedData: boolean;
  setShowDetailedData: React.Dispatch<React.SetStateAction<boolean>>;
  webcamRef: React.RefObject<HTMLVideoElement>;
  videoStreamRef: React.MutableRefObject<MediaStream | null>;
  renderSettings: boolean;
  setRenderSettings: React.Dispatch<React.SetStateAction<boolean>>;
  trackingData: any;
  setTrackingData: React.Dispatch<React.SetStateAction<any>>;
  isAligned: boolean;
  setIsAligned: React.Dispatch<React.SetStateAction<boolean>>;
  initializationSuccess: boolean;
  setInitializationSuccess: React.Dispatch<React.SetStateAction<boolean>>;
  initialModal: boolean;
  setInitialModal: React.Dispatch<React.SetStateAction<boolean>>;
  saveUploadVideo: boolean;
  setSaveUploadVideo: React.Dispatch<React.SetStateAction<boolean>>;
  videoFile: File;
  setVideoFile: React.Dispatch<React.SetStateAction<File>>;
  useVideoFile: boolean;
  setUseVideoFile: React.Dispatch<React.SetStateAction<boolean>>;
  realTimeSessionId: string;
  setRealTimeSessionId: React.Dispatch<React.SetStateAction<string>>;
}

const ResContext = createContext<ResContextProps | null>(null);

export const ResProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [resData, setResData] = useState<any>(undefined);
  const [trackingData, setTrackingData] = useState<any>(undefined);
  const [initializationSuccess, setInitializationSuccess] = useState(false);
  const [realTimeSessionId, setRealTimeSessionId] = useState<string>('');
  const [isAligned, setIsAligned] = useState(false);
  const [initialModal, setInitialModal] = useState(false);
  const [isLogin, setIsLogin] = useState<boolean>(false);
  const [loginResponse, setLoginResponse] = useState<boolean>(false);
  const [landMarkData, setLandMarkData] = useState<LandmarksResult | undefined>(
    undefined,
  );
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [useVideoFile, setUseVideoFile] = useState<boolean>(false);
  const [streaming, setStreaming] = useState<boolean>(false);
  const [startCapture, setStartCapture] = useState<boolean>(false);
  const [calibrationData, setCalibrationData] = useState<any>(null);
  const [combineResult, setCombineResult] = useState<CombineResult | undefined>(
    undefined,
  );

  // Manage showDetailedData, default to true
  const [showDetailedData, setShowDetailedData] = useState<boolean>(false);
  const [saveUploadVideo, setSaveUploadVideo] = useState<boolean>(true);
  useEffect(() => {
    // Assuming the appConfig is fetched via IPC
    window.electron.config
      .getAppConfig()
      .then((config): void => {
        if (config.showStat !== undefined) {
          setShowDetailedData(config.showStat); // Set showDetailedData based on appConfig
        }
        return null; // Explicitly return null to satisfy the ESLint rule
      })
      .catch((error) => {
        console.error('Error fetching appConfig:', error);
        throw error; // Re-throw the error to propagate it (satisfying the ESLint rule)
      });
  }, []);
  useEffect(() => {
    // Assuming the appConfig is fetched via IPC
    window.electron.config
      .getAppConfig()
      .then((config): void => {
        if (config.saveUploadVideo !== undefined) {
          setSaveUploadVideo(config.saveUploadVideo); // Set showDetailedData based on appConfig
        }
        return null; // Explicitly return null to satisfy the ESLint rule
      })
      .catch((error) => {
        console.error('Error fetching appConfig:', error);
        throw error; // Re-throw the error to propagate it (satisfying the ESLint rule)
      });
  }, []);

  const debugData = useMemo(() => {
    if (resData) {
      return { ...resData } as unknown as DebugData;
    }
    return undefined;
  }, [resData]);

  const webcamRef = useRef<HTMLVideoElement>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);

  const [renderSettings, setRenderSettings] = useState(false);

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
      loginResponse,
      setLoginResponse,
      isLogin,
      setIsLogin,
      showDetailedData,
      setShowDetailedData,
      webcamRef,
      videoStreamRef,
      renderSettings,
      setRenderSettings,
      trackingData,
      setTrackingData,
      isAligned,
      setIsAligned,
      initializationSuccess,
      setInitializationSuccess,
      initialModal,
      setInitialModal,
      saveUploadVideo,
      setSaveUploadVideo,
      videoFile,
      setVideoFile,
      useVideoFile,
      setUseVideoFile,
      realTimeSessionId,
      setRealTimeSessionId,
    }),
    [
      resData,
      debugData,
      landMarkData,
      streaming,
      startCapture,
      calibrationData,
      combineResult,
      loginResponse,
      isLogin,
      showDetailedData,
      renderSettings,
      trackingData,
      isAligned,
      initializationSuccess,
      initialModal,
      saveUploadVideo,
      videoFile,
      useVideoFile,
      realTimeSessionId,
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
