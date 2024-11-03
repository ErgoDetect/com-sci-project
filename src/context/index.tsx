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
  CalibrationData,
  CombineResult,
  DebugData,
  LandmarksResult,
} from '../interface/propsType';

interface ResContextProps {
  resData: any;
  setResData: React.Dispatch<React.SetStateAction<any>>;
  contextLoading: boolean;
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
  saveSessionVideo: boolean;
  setSaveSessionVideo: React.Dispatch<React.SetStateAction<boolean>>;
  videoFile: File | null;
  setVideoFile: React.Dispatch<React.SetStateAction<File | null>>;
  useVideoFile: boolean;
  setUseVideoFile: React.Dispatch<React.SetStateAction<boolean>>;
  realTimeSessionId: string;
  setRealTimeSessionId: React.Dispatch<React.SetStateAction<string>>;
  calibrationData: CalibrationData | null;
  setCalibrationData: React.Dispatch<
    React.SetStateAction<CalibrationData | null>
  >;
  useFocalLength: boolean;
  setUseFocalLength: React.Dispatch<React.SetStateAction<boolean>>;
  showNotification: boolean;
  setShowNotification: React.Dispatch<React.SetStateAction<boolean>>;
}

const ResContext = createContext<ResContextProps | null>(null);

export const ResProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [resData, setResData] = useState<any>(undefined);
  const [contextLoading, setContextLoading] = useState(true); // New loading state
  const [trackingData, setTrackingData] = useState<any>(undefined);
  const [initializationSuccess, setInitializationSuccess] = useState(false);
  const [realTimeSessionId, setRealTimeSessionId] = useState('');
  const [isAligned, setIsAligned] = useState(false);
  const [useFocalLength, setUseFocalLength] = useState(false);
  const [initialModal, setInitialModal] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [loginResponse, setLoginResponse] = useState(false);
  const [landMarkData, setLandMarkData] = useState<LandmarksResult | undefined>(
    undefined,
  );
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [useVideoFile, setUseVideoFile] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [calibrationData, setCalibrationData] =
    useState<CalibrationData | null>(null);
  const [combineResult, setCombineResult] = useState<CombineResult | undefined>(
    undefined,
  );
  const [showDetailedData, setShowDetailedData] = useState(false);
  const [saveUploadVideo, setSaveUploadVideo] = useState(true);
  const [saveSessionVideo, setSaveSessionVideo] = useState(true);
  const [renderSettings, setRenderSettings] = useState(false);
  const [showNotification, setShowNotification] = useState(true);

  const webcamRef = useRef<HTMLVideoElement>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const fetchConfigData = async () => {
      try {
        const config = await window.electron.config.getAppConfig();

        // Update states based on config
        if (config.showStat !== undefined) setShowDetailedData(config.showStat);
        if (config.saveUploadVideo !== undefined)
          setSaveUploadVideo(config.saveUploadVideo);
        if (config.useFocalLength !== undefined)
          setUseFocalLength(config.useFocalLength);
        if (config.calibrationData !== undefined)
          setCalibrationData(config.calibrationData);
        if (config.saveSessionVideo !== undefined)
          setSaveSessionVideo(config.saveSessionVideo);
        if (config.showNotification !== undefined)
          setSaveSessionVideo(config.showNotification);
      } catch (error) {
        console.error('Error fetching appConfig:', error);
      } finally {
        setContextLoading(false); // Set loading to false after fetch completes
      }
    };

    fetchConfigData();
  }, []);

  const contextValue = useMemo(
    () => ({
      resData,
      setResData,
      contextLoading, // Include contextLoading state in the value
      isLogin,
      setIsLogin,
      loginResponse,
      setLoginResponse,
      debugData: resData ? ({ ...resData } as DebugData) : undefined,
      landMarkData,
      setLandMarkData,
      streaming,
      setStreaming,
      calibrationData,
      setCalibrationData,
      combineResult,
      setCombineResult,
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
      useFocalLength,
      setUseFocalLength,
      saveSessionVideo,
      setSaveSessionVideo,
      showNotification,
      setShowNotification,
    }),
    [
      resData,
      contextLoading,
      isLogin,
      loginResponse,
      landMarkData,
      streaming,
      calibrationData,
      combineResult,
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
      useFocalLength,
      saveSessionVideo,
      showNotification,
    ],
  );

  return (
    <ResContext.Provider value={contextValue}>{children}</ResContext.Provider>
  );
};

export const useResData = (): ResContextProps => {
  const context = useContext(ResContext);
  if (!context) throw new Error('useResData must be used within a ResProvider');
  return context;
};
