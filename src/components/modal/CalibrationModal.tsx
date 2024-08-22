import React, { useState, useCallback } from 'react';
import { Modal, Button, Steps, message } from 'antd';
import WebcamDisplay from '../camera/webcamDisplay';

const { Step } = Steps;

const CalibrationModal: React.FC = () => {
  const [isCalibrationModalVisible, setIsCalibrationModalVisible] =
    useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Step 1',
      key: 'step-1',
      content: (
        <div>
          <p>Make sure your camera is properly connected.</p>
          <p>Adjust your camera to fit your face within the frame.</p>
        </div>
      ),
    },
    {
      title: 'Step 2',
      key: 'step-2',
      content: (
        <div>
          <p>Look straight into the camera.</p>
          <p>Ensure that the lighting is adequate.</p>
        </div>
      ),
    },
    {
      title: 'Calibration',
      key: 'calibration',
      content: (
        <WebcamDisplay
          deviceId="your-device-id"
          width="100%"
          showBlendShapes={false}
        />
      ),
    },
  ];

  const startCalibration = useCallback(() => {
    setIsCalibrationModalVisible(true);
    setCurrentStep(0); // Reset to the first step
  }, []);

  const handleCancelCalibration = useCallback(() => {
    setIsCalibrationModalVisible(false);
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      message.success('Calibration complete!');
      handleCancelCalibration();
    }
  }, [currentStep, steps.length, handleCancelCalibration]);

  const handlePrev = useCallback(() => {
    setCurrentStep((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  return (
    <div>
      <Button
        type="primary"
        onClick={startCalibration}
        size="large"
        style={{
          backgroundColor: '#1890ff',
          borderColor: '#1890ff',
          borderRadius: '8px',
        }}
      >
        Start Calibration
      </Button>

      <Modal
        title="Camera Calibration"
        open={isCalibrationModalVisible}
        onCancel={handleCancelCalibration}
        footer={null}
        width="55%"
        centered
        destroyOnClose
      >
        <Steps current={currentStep} style={{ marginBottom: '24px' }}>
          {steps.map((step) => (
            <Step key={step.key} title={step.title} />
          ))}
        </Steps>
        <div>{steps[currentStep].content}</div>
        <div style={{ marginTop: '24px', textAlign: 'right' }}>
          {currentStep > 0 && (
            <Button style={{ margin: '0 8px' }} onClick={handlePrev}>
              Previous
            </Button>
          )}
          <Button type="primary" onClick={handleNext}>
            {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default CalibrationModal;
