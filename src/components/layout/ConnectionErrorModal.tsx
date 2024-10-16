import React from 'react';
import { Modal } from 'antd';

interface ConnectionErrorModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const ConnectionErrorModal: React.FC<ConnectionErrorModalProps> = ({
  isVisible,
  onClose,
}) => (
  <Modal
    title="Connection Error"
    open={isVisible}
    onOk={onClose}
    onCancel={onClose}
    okText="Retry"
    cancelText="Cancel"
  >
    <p>Unable to connect to the server. Please try again later.</p>
  </Modal>
);

export default ConnectionErrorModal;
