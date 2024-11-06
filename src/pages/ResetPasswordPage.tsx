import React, { useState } from 'react';
import { Form, Input, Button, Typography, message } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import axiosInstance from '../utility/axiosInstance';

const { Title } = Typography;

const ResetPassword: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Extract email from query parameters if present
  const params = new URLSearchParams(location.search);
  const email = params.get('email');

  const onFinish = async (values: {
    password: string;
    confirmPassword: string;
  }) => {
    if (values.password !== values.confirmPassword) {
      message.error('Passwords do not match!');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post('/auth/reset-password', {
        email,
        password: values.password,
      });
      if (response.status === 200) {
        message.success('Password reset successfully! Redirecting to login...');
        navigate('/login');
      }
    } catch (error: any) {
      if (error.response && error.response.status === 409) {
        message.error('New password must be different from the old password');
      } else {
        message.error('Failed to reset password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ padding: '24px' }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
        />
      </div>
      <div
        style={{
          maxWidth: 400,
          margin: '50px auto',
          padding: '20px',
          border: '1px solid #f0f0f0',
          borderRadius: '8px',
        }}
      >
        <Title level={3}>Reset Password</Title>
        {email && <Typography.Text>Your email: {email}</Typography.Text>}
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="New Password"
            name="password"
            rules={[
              { required: true, message: 'Please input your new password!' },
            ]}
          >
            <Input.Password placeholder="Enter new password" />
          </Form.Item>
          <Form.Item
            label="Confirm New Password"
            name="confirmPassword"
            rules={[
              { required: true, message: 'Please confirm your new password!' },
            ]}
          >
            <Input.Password placeholder="Confirm new password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Reset Password
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default ResetPassword;
