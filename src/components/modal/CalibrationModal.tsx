import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Steps, message } from 'antd';
import WebcamDisplay from '../camera/webcamDisplay';
import useDevices from '../../hooks/useDevices';
import useCaptureImage from '../../hooks/useCaptureImages';
import { useResData } from '../../context';

const { Step } = Steps;

const CalibrationModal: React.FC = () => {
  const [isCalibrationModalOpen, setCalibrationModalOpen] = useState(false);
  const [isPreviewModalOpen, setPreviewModalOpen] = useState(false);
  const [isConfirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [isStartClicked, setStartClicked] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const { webcamRef } = useResData();
  const { deviceId } = useDevices();
  const { startImageCapture, captureCompleted, resetCapture } =
    useCaptureImage(webcamRef);

  const calibrationSteps = [
    {
      title: 'Step 1',
      content: (
        <>
          <p>Make sure your camera is properly connected.</p>
          <p>Adjust your camera to fit your face within the frame.</p>
        </>
      ),
    },
    {
      title: 'Step 2',
      content: (
        <>
          <p>Look straight into the camera.</p>
          <p>Ensure that the lighting is adequate.</p>
        </>
      ),
    },
  ];

  const toggleModal = useCallback(
    (
      modalSetter: React.Dispatch<React.SetStateAction<boolean>>,
      resetStep = false,
      resetStart = false,
    ) =>
      () => {
        modalSetter((prev) => {
          if (resetStep && !prev) setCurrentStep(0);
          if (resetStart && prev) setStartClicked(false);
          return !prev;
        });
      },
    [],
  );

  useEffect(() => {
    if (captureCompleted && isPreviewModalOpen) {
      setPreviewModalOpen(false);
      resetCapture();
    }
  }, [captureCompleted, isPreviewModalOpen, resetCapture]);

  const startCalibrationSession = () => {
    startImageCapture();
    message.info('Start Calibration');
    setConfirmationModalOpen(false);
  };

  const goToNextStep = () => {
    if (currentStep < calibrationSteps.length - 1) {
      setCurrentStep((prevStep) => prevStep + 1);
    } else {
      setPreviewModalOpen(true);
      setCalibrationModalOpen(false);
    }
  };

  return (
    <div>
      <Button
        type="primary"
        onClick={toggleModal(setCalibrationModalOpen, true)}
        size="large"
      >
        Start Calibration
      </Button>

      <Modal
        title="Camera Calibration"
        open={isCalibrationModalOpen}
        onCancel={toggleModal(setCalibrationModalOpen)}
        footer={null}
        width="500px"
        centered
        destroyOnClose
      >
        <Steps current={currentStep} style={{ marginBottom: '24px' }}>
          {calibrationSteps.map((step) => (
            <Step key={step.title} title={step.title} />
          ))}
        </Steps>
        <div>{calibrationSteps[currentStep].content}</div>
        <div style={{ textAlign: 'right', marginTop: '24px' }}>
          {currentStep > 0 && (
            <Button
              style={{ margin: '0 8px' }}
              onClick={() => setCurrentStep((prev) => prev - 1)}
            >
              Previous
            </Button>
          )}
          <Button type="primary" onClick={goToNextStep}>
            {currentStep === calibrationSteps.length - 1
              ? 'Open Preview'
              : 'Next'}
          </Button>
        </div>
      </Modal>

      <Modal
        open={isPreviewModalOpen}
        onCancel={toggleModal(setPreviewModalOpen, false, true)}
        title="Calibration Preview"
        width="60%"
        centered
        destroyOnClose
        footer={
          <Button
            type="primary"
            onClick={() => {
              setStartClicked(true);
              setConfirmationModalOpen(true);
            }}
            size="large"
            disabled={isStartClicked}
          >
            Start
          </Button>
        }
      >
        <WebcamDisplay
          deviceId={deviceId}
          width="100%"
          showBlendShapes={false}
          canShowDetail={!isPreviewModalOpen}
        />
      </Modal>

      <Modal
        open={isConfirmationModalOpen}
        onCancel={toggleModal(setConfirmationModalOpen)}
        footer={
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Button
              size="large"
              onClick={toggleModal(setConfirmationModalOpen)}
              style={{ width: '100%' }}
            >
              No
            </Button>
            <Button
              type="primary"
              size="large"
              onClick={startCalibrationSession}
              style={{ width: '100%' }}
            >
              Yes
            </Button>
          </div>
        }
        width="300px"
        centered
        destroyOnClose
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          Continue to Camera Calibration?
        </div>
      </Modal>
    </div>
  );
};

export default CalibrationModal;
