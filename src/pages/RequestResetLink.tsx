import React, { useState } from 'react';
import { Form, Input, Button, Typography, message } from 'antd';
import axiosInstance from '../utility/axiosInstance';

const { Title } = Typography;

const RequestResetLink: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { email: string }) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post(
        '/auth/request/reset-password',
        { email: values.email },
      );
      if (response.status === 200)
        message.success('A password reset link has been sent to your email.');
    } catch (error) {
      message.error('Failed to send the reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: '50px auto',
        padding: '20px',
        border: '1px solid #f0f0f0',
        borderRadius: '8px',
      }}
    >
      <Title level={3}>Request Password Reset</Title>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Email Address"
          name="email"
          rules={[
            { required: true, message: 'Please input your email address!' },
            { type: 'email', message: 'Please enter a valid email address!' },
          ]}
        >
          <Input placeholder="Enter your email" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Send Reset Link
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default RequestResetLink;
