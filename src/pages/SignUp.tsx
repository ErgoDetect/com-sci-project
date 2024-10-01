import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import axios from 'axios';
import axiosInstance from '../utility/axiosInstance';

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    width: '300px',
    margin: '100px auto',
    textAlign: 'center',
  },
  form: {
    maxWidth: '300px',
  },
  footerText: {
    marginTop: '10px',
  },
  link: {
    color: '#1890ff',
    cursor: 'pointer',
  },
};

const Signup: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: {
    email: string;
    password: string;
    display_name: string;
  }) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/auth/signup/', {
        email: values.email,
        password: values.password,
        display_name: values.display_name,
      });
      message.success(
        'User created successfully! Please check your email to verify your account.',
      );
    } catch (error) {
      // Use axios.isAxiosError to check if the error is from Axios
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        message.error('Email already registered.');
      } else {
        message.error('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    message.error('Failed to submit. Please check your input.');
  };

  return (
    <div style={styles.container}>
      <h2>Sign Up</h2>
      <Form
        name="signup"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        style={styles.form}
      >
        <Form.Item
          name="display_name"
          rules={[
            { required: true, message: 'Please input your Display Name!' },
          ]}
        >
          <Input placeholder="Display Name" />
        </Form.Item>
        <Form.Item
          name="email"
          rules={[
            { required: true, message: 'Please input your Email!' },
            { type: 'email', message: 'Please enter a valid email!' },
          ]}
        >
          <Input placeholder="Email" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Please input your Password!' }]}
          hasFeedback
        >
          <Input.Password placeholder="Password" />
        </Form.Item>

        <Form.Item
          name="confirm"
          dependencies={['password']}
          hasFeedback
          rules={[
            { required: true, message: 'Please confirm your password!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error('The two passwords do not match!'),
                );
              },
            }),
          ]}
        >
          <Input.Password placeholder="Confirm Password" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Sign Up
          </Button>
        </Form.Item>

        <div style={styles.footerText}>
          <p>
            Already have an account? <a href="/login">Login</a>
          </p>
        </div>
      </Form>
    </div>
  );
};

export default Signup;
