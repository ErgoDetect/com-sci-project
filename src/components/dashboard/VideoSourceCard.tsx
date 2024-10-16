// /* eslint-disable react-hooks/exhaustive-deps */
// import React, {
//   useEffect,
//   useMemo,
//   useCallback,
//   useRef,
//   useState,
// } from 'react';
// import { Switch, Upload, message, Progress } from 'antd';
// import { InboxOutlined } from '@ant-design/icons';

// import { VideoCard, VideoContainer, VideoContent } from '../../styles/styles';
// import {
//   LandmarksResult,
//   VideoSourceCardProps,
// } from '../../interface/propsType';
// import WebcamDisplay from '../camera/webcamDisplay';
// import useSendLandmarkData from '../../hooks/useSendLandMarkData';
// import { useResData } from '../../context';
// import { initializeFaceLandmarker } from '../../model/faceLandmark';
// import { initializePoseLandmarker } from '../../model/bodyLandmark';
// import axiosInstance from '../../utility/axiosInstance';

// const { Dragger } = Upload;

// const VideoSourceCard: React.FC<VideoSourceCardProps> = ({
//   useVideoFile,
//   setUseVideoFile,
//   videoFile,
//   setVideoFile,
//   deviceId,
// }) => {
//   const { setStreaming } = useResData();
//   const faceLandmarkerRef = useRef<any>(null);
//   const poseLandmarkerRef = useRef<any>(null);
//   const latestLandmarksResultRef = useRef<LandmarksResult | null>(null);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [processingProgress, setProcessingProgress] = useState(0);
//   const timeCounterRef = useRef(0);
//   const processResult = useRef<any[]>([]);

//   const videoElementRef = useRef<HTMLVideoElement | null>(null);
//   const animationFrameIdRef = useRef<number | null>(null); // Ref to store animation frame ID

//   const videoSrc = useMemo(
//     () => (videoFile ? URL.createObjectURL(videoFile) : ''),
//     [videoFile],
//   );

//   // Clean up object URL when component unmounts or videoFile changes
//   useEffect(() => {
//     return () => {
//       if (videoSrc) URL.revokeObjectURL(videoSrc);
//     };
//   }, [videoSrc]);

//   // Initialize landmarkers
//   const initializeLandmarkers = useCallback(async () => {
//     if (!faceLandmarkerRef.current) {
//       faceLandmarkerRef.current = await initializeFaceLandmarker();
//     }
//     if (!poseLandmarkerRef.current) {
//       poseLandmarkerRef.current = await initializePoseLandmarker();
//     }
//   }, []);

//   // Handle video processing
//   const processVideo = useCallback(async () => {
//     const videoElement = videoElementRef.current;
//     if (!videoElement) {
//       console.error('Video element is null, cannot process video.');
//       return;
//     }

//     console.log('Starting video processing.');

//     if (videoElement.readyState < 1) {
//       console.log('Waiting for video metadata to load...');
//       await new Promise<void>((resolve) => {
//         videoElement.addEventListener(
//           'loadedmetadata',
//           () => {
//             console.log('Video metadata loaded.');
//             resolve();
//           },
//           { once: true },
//         );
//       });
//     }

//     setIsProcessing(true);
//     console.log('Initializing landmarkers...');
//     await initializeLandmarkers();

//     // Set video properties for autoplay and faster playback
//     videoElement.muted = true; // Required for autoplay in some browsers
//     videoElement.playsInline = true; // Avoids fullscreen on iOS
//     videoElement.autoplay = true;
//     videoElement.playbackRate = 1; // Speed up video playback (adjust as needed)
//     videoElement.controls = false; // Hide controls if you don't want them
//     videoElement.poster = ''; // Remove poster image if any

//     const totalDuration = videoElement.duration;
//     console.log('Total video duration:', totalDuration);

//     let isProcessingFrame = false;

//     const processFrame = async () => {
//       if (isProcessingFrame) return; // Avoid overlapping frame processing
//       isProcessingFrame = true;

//       if (videoElement.currentTime >= totalDuration) {
//         console.log('Video processing completed.');
//         setIsProcessing(false);
//         console.log(processResult);
//         message.success('Video processing completed.');
//         return;
//       }

//       const frameInterval = 1 / 1;

//       // Adjust timeDelta or skip frames to process faster
//       const timeDelta = videoElement.currentTime - timeCounterRef.current;
//       if (timeDelta >= frameInterval) {
//         timeCounterRef.current = videoElement.currentTime;
//         const timestamp = videoElement.currentTime * 1000; // Convert to milliseconds

//         if (videoElement.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
//           try {
//             console.log('Detecting landmarks at timestamp:', timestamp);
//             const [faceResults, poseResults] = await Promise.all([
//               faceLandmarkerRef.current?.detectForVideo(
//                 videoElement,
//                 timestamp,
//               ),
//               poseLandmarkerRef.current?.detectForVideo(
//                 videoElement,
//                 timestamp,
//               ),
//             ]);
//             latestLandmarksResultRef.current = { faceResults, poseResults };
//             processResult.current.push(latestLandmarksResultRef.current);

//             setProcessingProgress(
//               (videoElement.currentTime / totalDuration) * 100,
//             );
//           } catch (error) {
//             console.error('Error processing frame:', error);
//             message.error('An error occurred during video processing.');
//           }
//         }
//       }

//       isProcessingFrame = false; // Reset after frame is processed
//       // Store the animation frame ID so we can cancel it later
//       animationFrameIdRef.current = requestAnimationFrame(processFrame); // Continue processing frames
//     };

//     // Start playing the video
//     try {
//       await videoElement.play();
//     } catch (err) {
//       console.error('Error starting video playback:', err);
//     }

//     // Reset time counter and start processing loop
//     timeCounterRef.current = 0;
//     console.log('Starting frame-by-frame processing.');
//     processFrame(); // Start manual processing loop
//   }, [initializeLandmarkers]);

//   // Handle file upload
//   const handleFileUpload = useCallback(
//     async (file: File): Promise<boolean> => {
//       try {
//         console.log('Uploading file:', file.name);
//         setVideoFile(file); // Store the file
//         message.success(`${file.name} uploaded successfully.`);
//         return true;
//       } catch (error) {
//         console.error('Error during file upload handling:', error);
//         message.error('Error during file upload handling.');
//         return false;
//       }
//     },
//     [setVideoFile],
//   );

//   useEffect(() => {
//     const videoElement = videoElementRef.current;
//     let handleLoadedData: (() => Promise<void>) | null = null;

//     if (videoFile && videoElement) {
//       handleLoadedData = async () => {
//         console.log('Video metadata loaded, starting processing.');
//         await processVideo();
//       };
//       videoElement.addEventListener('loadeddata', handleLoadedData);
//     }

//     return () => {
//       // Cleanup: Remove event listener and cancel any ongoing processing
//       if (handleLoadedData && videoElement) {
//         videoElement.removeEventListener('loadeddata', handleLoadedData);
//       }

//       // Cancel the animation frame loop
//       if (animationFrameIdRef.current) {
//         cancelAnimationFrame(animationFrameIdRef.current);
//       }

//       // Reset processing states
//       setIsProcessing(false);
//       timeCounterRef.current = 0;

//       // Reset video element
//       if (videoElement) {
//         videoElement.pause();
//         videoElement.currentTime = 0;
//       }
//     };
//   }, [videoFile, processVideo]);

//   // Custom hook for sending landmark data
//   useSendLandmarkData();

//   // Render video uploader
//   const renderVideoUploader = useMemo(
//     () => (
//       <VideoContainer>
//         {videoFile ? (
//           <div
//             style={{
//               position: 'relative',
//               display: 'flex',
//               flexDirection: 'column',
//               alignItems: 'center',
//               width: '100%',
//             }}
//           >
//             {isProcessing && (
//               <div
//                 style={{
//                   position: 'absolute',
//                   top: '10px',
//                   left: '10px',
//                   zIndex: 1,
//                 }}
//               >
//                 <Progress
//                   type="circle"
//                   percent={Math.round(processingProgress)}
//                   size={80}
//                 />
//               </div>
//             )}
//             <video
//               ref={videoElementRef}
//               src={videoSrc}
//               style={{
//                 width: '100%',
//                 borderRadius: '10px',
//               }}
//               controls={false} // Hide controls
//             />
//           </div>
//         ) : (
//           <Dragger
//             name="file"
//             multiple={false}
//             accept=".webm, .mp4, .mov"
//             beforeUpload={async (file) => {
//               await handleFileUpload(file);
//               return false; // Prevent automatic upload
//             }}
//             showUploadList={false}
//           >
//             <p className="ant-upload-drag-icon">
//               <InboxOutlined />
//             </p>
//             <p className="ant-upload-text">
//               Click or drag video file to this area to upload
//             </p>
//             <p className="ant-upload-hint">
//               Support for a single video file upload.
//             </p>
//           </Dragger>
//         )}
//       </VideoContainer>
//     ),
//     [videoFile, isProcessing, processingProgress, videoSrc, handleFileUpload],
//   );

//   // Render webcam display
//   const renderWebcamDisplay = useMemo(
//     () => (
//       <div>
//         <WebcamDisplay
//           deviceId={deviceId}
//           width="100%"
//           borderRadius={12}
//           showBlendShapes={false}
//         />
//       </div>
//     ),
//     [deviceId],
//   );

//   // Cleanup on component unmount
//   useEffect(() => {
//     const videoElement = videoElementRef.current; // Capture the ref value

//     return () => {
//       // Cancel the animation frame loop
//       if (animationFrameIdRef.current) {
//         cancelAnimationFrame(animationFrameIdRef.current);
//       }
//       if (videoElement) {
//         videoElement.pause();
//         videoElement.src = ''; // Clear the video source
//         videoElement.load(); // Reset the video element
//       }
//       // Reset refs and states
//       faceLandmarkerRef.current = null;
//       poseLandmarkerRef.current = null;
//       latestLandmarksResultRef.current = null;
//       timeCounterRef.current = 0;
//     };
//   }, []); // Empty dependency array

//   return (
//     <VideoCard
//       title="Video Source"
//       bordered={false}
//       extra={
//         <Switch
//           checkedChildren="Video File"
//           unCheckedChildren="Live Feed"
//           onChange={(checked) => {
//             setUseVideoFile(checked);
//             // Reset state when switching sources
//             setVideoFile(null);
//             setIsProcessing(false);
//             setProcessingProgress(0);
//             setStreaming(false);
//           }}
//           checked={useVideoFile}
//         />
//       }
//     >
//       <VideoContent>
//         {useVideoFile ? renderVideoUploader : renderWebcamDisplay}
//       </VideoContent>
//     </VideoCard>
//   );
// };

// export default VideoSourceCard;

import React, {
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useState,
} from 'react';
import { Switch, Upload, message, Progress, Button } from 'antd'; // Added Button component
import { InboxOutlined, DeleteOutlined } from '@ant-design/icons'; // Added Delete icon

import { VideoCard, VideoContainer, VideoContent } from '../../styles/styles';
import {
  LandmarksResult,
  VideoSourceCardProps,
} from '../../interface/propsType';
import WebcamDisplay from '../camera/webcamDisplay';
import useSendLandmarkData from '../../hooks/useSendLandMarkData';
import { useResData } from '../../context';
import { initializeFaceLandmarker } from '../../model/faceLandmark';
import { initializePoseLandmarker } from '../../model/bodyLandmark';
import axiosInstance from '../../utility/axiosInstance';

const { Dragger } = Upload;

const VideoSourceCard: React.FC<VideoSourceCardProps> = ({
  useVideoFile,
  setUseVideoFile,
  videoFile,
  setVideoFile,
  deviceId,
}) => {
  const { setStreaming } = useResData();
  const faceLandmarkerRef = useRef<any>(null);
  const poseLandmarkerRef = useRef<any>(null);
  const latestLandmarksResultRef = useRef<LandmarksResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const timeCounterRef = useRef(0);
  const processResult = useRef<any[]>([]);

  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const animationFrameIdRef = useRef<number | null>(null); // Ref to store animation frame ID

  const videoSrc = useMemo(
    () => (videoFile ? URL.createObjectURL(videoFile) : ''),
    [videoFile],
  );

  // Clean up object URL when component unmounts or videoFile changes
  useEffect(() => {
    return () => {
      if (videoSrc) URL.revokeObjectURL(videoSrc);
    };
  }, [videoSrc]);

  // Initialize landmarkers
  const initializeLandmarkers = useCallback(async () => {
    // Ensure that the previous graph is fully reset
    if (faceLandmarkerRef.current) {
      await faceLandmarkerRef.current.close();
      faceLandmarkerRef.current = null;
    }
    if (poseLandmarkerRef.current) {
      await poseLandmarkerRef.current.close();
      poseLandmarkerRef.current = null;
    }

    // Now initialize new landmarkers
    if (!faceLandmarkerRef.current) {
      faceLandmarkerRef.current = await initializeFaceLandmarker();
    }
    if (!poseLandmarkerRef.current) {
      poseLandmarkerRef.current = await initializePoseLandmarker();
    }
  }, []);

  // Handle video processing
  const processVideo = useCallback(async () => {
    const videoElement = videoElementRef.current;
    if (!videoElement) {
      console.error('Video element is null, cannot process video.');
      return;
    }

    console.log('Starting video processing.');

    if (videoElement.readyState < 1) {
      console.log('Waiting for video metadata to load...');
      await new Promise<void>((resolve) => {
        videoElement.addEventListener(
          'loadedmetadata',
          () => {
            console.log('Video metadata loaded.');
            resolve();
          },
          { once: true },
        );
      });
    }

    setIsProcessing(true);
    console.log('Initializing landmarkers...');
    await initializeLandmarkers();

    // Set video properties for autoplay and faster playback
    videoElement.muted = true; // Required for autoplay in some browsers
    videoElement.playsInline = true; // Avoids fullscreen on iOS
    videoElement.autoplay = true;
    videoElement.playbackRate = 1; // Speed up video playback (adjust as needed)
    videoElement.controls = false; // Hide controls if you don't want them
    videoElement.poster = ''; // Remove poster image if any

    const totalDuration = videoElement.duration;
    console.log('Total video duration:', totalDuration);

    let isProcessingFrame = false;

    const processFrame = async () => {
      if (isProcessingFrame) return; // Avoid overlapping frame processing
      isProcessingFrame = true;

      if (videoElement.currentTime >= totalDuration) {
        console.log('Video processing completed.');
        setIsProcessing(false);
        console.log(processResult);
        message.success('Video processing completed.');
        return;
      }

      const frameInterval = 1 / 1;

      // Adjust timeDelta or skip frames to process faster
      const timeDelta = videoElement.currentTime - timeCounterRef.current;
      if (timeDelta >= frameInterval) {
        timeCounterRef.current = videoElement.currentTime;
        const timestamp = videoElement.currentTime * 1000; // Convert to milliseconds

        if (videoElement.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
          try {
            console.log('Detecting landmarks at timestamp:', timestamp);
            const [faceResults, poseResults] = await Promise.all([
              faceLandmarkerRef.current?.detectForVideo(
                videoElement,
                timestamp,
              ),
              poseLandmarkerRef.current?.detectForVideo(
                videoElement,
                timestamp,
              ),
            ]);
            latestLandmarksResultRef.current = { faceResults, poseResults };
            processResult.current.push(latestLandmarksResultRef.current);

            setProcessingProgress(
              (videoElement.currentTime / totalDuration) * 100,
            );
          } catch (error) {
            console.error('Error processing frame:', error);
            message.error('An error occurred during video processing.');
          }
        }
      }

      isProcessingFrame = false; // Reset after frame is processed
      // Store the animation frame ID so we can cancel it later
      animationFrameIdRef.current = requestAnimationFrame(processFrame); // Continue processing frames
    };

    // Start playing the video
    try {
      await videoElement.play();
    } catch (err) {
      console.error('Error starting video playback:', err);
    }

    // Reset time counter and start processing loop
    timeCounterRef.current = 0;
    console.log('Starting frame-by-frame processing.');
    processFrame(); // Start manual processing loop
  }, [initializeLandmarkers]);

  // Handle file upload
  const handleFileUpload = useCallback(
    async (file: File): Promise<boolean> => {
      try {
        console.log('Uploading file:', file.name);
        setVideoFile(file); // Store the file
        message.success(`${file.name} uploaded successfully.`);
        return true;
      } catch (error) {
        console.error('Error during file upload handling:', error);
        message.error('Error during file upload handling.');
        return false;
      }
    },
    [setVideoFile],
  );

  // Delete uploaded video and reset states
  const handleDeleteVideo = useCallback(() => {
    // Stop video playback and processing
    if (videoElementRef.current) {
      videoElementRef.current.pause();
      videoElementRef.current.currentTime = 0;
    }
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
    }

    // Reset state variables
    setVideoFile(null);
    setIsProcessing(false);
    setProcessingProgress(0);
    processResult.current = []; // Clear the process results

    // Properly cleanup the landmarkers
    if (faceLandmarkerRef.current) {
      faceLandmarkerRef.current.close(); // Close or reset the MediaPipe graph
      faceLandmarkerRef.current = null;
    }
    if (poseLandmarkerRef.current) {
      poseLandmarkerRef.current.close(); // Close or reset the MediaPipe graph
      poseLandmarkerRef.current = null;
    }

    message.success('Uploaded video deleted and processing reset.');
  }, [setVideoFile, setIsProcessing, setProcessingProgress]);

  useEffect(() => {
    const videoElement = videoElementRef.current;
    let handleLoadedData: (() => Promise<void>) | null = null;

    if (videoFile && videoElement) {
      handleLoadedData = async () => {
        console.log('Video metadata loaded, starting processing.');
        await processVideo();
      };
      videoElement.addEventListener('loadeddata', handleLoadedData);
    }

    return () => {
      // Cleanup: Remove event listener and cancel any ongoing processing
      if (handleLoadedData && videoElement) {
        videoElement.removeEventListener('loadeddata', handleLoadedData);
      }

      // Cancel the animation frame loop
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }

      // Reset processing states
      setIsProcessing(false);
      timeCounterRef.current = 0;

      // Reset video element
      if (videoElement) {
        videoElement.pause();
        videoElement.currentTime = 0;
      }
    };
  }, [videoFile, processVideo]);

  // Custom hook for sending landmark data
  useSendLandmarkData();

  // Render video uploader
  const renderVideoUploader = useMemo(
    () => (
      <VideoContainer>
        {videoFile ? (
          <div
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
            }}
          >
            {isProcessing && (
              <div
                style={{
                  position: 'absolute',
                  top: '10px',
                  left: '10px',
                  zIndex: 1,
                }}
              >
                <Progress
                  type="circle"
                  percent={Math.round(processingProgress)}
                  size={80}
                />
              </div>
            )}
            <video
              ref={videoElementRef}
              src={videoSrc}
              style={{
                width: '100%',
                borderRadius: '10px',
              }}
              controls={false} // Hide controls
            />
            {/* Delete Button */}
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              onClick={handleDeleteVideo}
              style={{ marginTop: '10px' }}
            >
              Delete Video
            </Button>
          </div>
        ) : (
          <Dragger
            name="file"
            multiple={false}
            accept=".webm, .mp4, .mov"
            beforeUpload={async (file) => {
              await handleFileUpload(file);
              return false; // Prevent automatic upload
            }}
            showUploadList={false}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag video file to this area to upload
            </p>
            <p className="ant-upload-hint">
              Support for a single video file upload.
            </p>
          </Dragger>
        )}
      </VideoContainer>
    ),
    [
      videoFile,
      isProcessing,
      processingProgress,
      videoSrc,
      handleDeleteVideo,
      handleFileUpload,
    ],
  );

  // Render webcam display
  const renderWebcamDisplay = useMemo(
    () => (
      <div>
        <WebcamDisplay
          deviceId={deviceId}
          width="100%"
          borderRadius={12}
          showBlendShapes={false}
        />
      </div>
    ),
    [deviceId],
  );

  // Cleanup on component unmount
  useEffect(() => {
    const videoElement = videoElementRef.current; // Capture the ref value

    return () => {
      // Cancel the animation frame loop
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      if (videoElement) {
        videoElement.pause();
        videoElement.src = ''; // Clear the video source
        videoElement.load(); // Reset the video element
      }
      // Reset refs and states
      faceLandmarkerRef.current = null;
      poseLandmarkerRef.current = null;
      latestLandmarksResultRef.current = null;
      timeCounterRef.current = 0;
    };
  }, []); // Empty dependency array

  return (
    <VideoCard
      title="Video Source"
      bordered={false}
      extra={
        <Switch
          checkedChildren="Video File"
          unCheckedChildren="Live Feed"
          onChange={(checked) => {
            setUseVideoFile(checked);
            // Reset state when switching sources
            setVideoFile(null);
            setIsProcessing(false);
            setProcessingProgress(0);
            setStreaming(false);
          }}
          checked={useVideoFile}
        />
      }
    >
      <VideoContent>
        {useVideoFile ? renderVideoUploader : renderWebcamDisplay}
      </VideoContent>
    </VideoCard>
  );
};

export default VideoSourceCard;
