import React from 'react';
import { Modal, Button } from 'antd';
import { ModalProps } from '../../interface/propsType';

const ReusableModal: React.FC<ModalProps> = ({
  visible,
  title,
  onConfirm,
  onCancel,
  onClose,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  children,
}) => {
  return (
    <Modal
      visible={visible}
      title={title}
      onCancel={onClose}
      footer={[
        onCancel && (
          <Button key="cancel" onClick={onCancel}>
            {cancelText}
          </Button>
        ),
        onConfirm && (
          <Button key="confirm" type="primary" onClick={onConfirm}>
            {confirmText}
          </Button>
        ),
      ]}
    >
      {children}
    </Modal>
  );
};

export default ReusableModal;
