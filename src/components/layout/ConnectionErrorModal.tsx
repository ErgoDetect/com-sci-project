import React from 'react';
import { Modal } from 'antd';

interface ConnectionErrorModalProps {
  isVisible: boolean;
  onOk: () => void;
  onClose: () => void;
}

const ConnectionErrorModal: React.FC<ConnectionErrorModalProps> = ({
  isVisible,
  onOk,
  onClose,
}) => (
  <Modal
    title="Connection Error"
    open={isVisible}
    onOk={onOk}
    onCancel={onClose}
    okText="Retry"
    cancelText="Cancel"
  >
    <p>Unable to connect to the server. Try connect again ?</p>
  </Modal>
);

export default ConnectionErrorModal;
