// Signup.tsx

import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../utility/axiosInstance';
import { SignUpFormValues } from '../interface/propsType';

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
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const onFinish = async (values: SignUpFormValues) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/auth/signup/', {
        email: values.email,
        password: values.password,
        display_name: values.display_name,
      });

      if (response.status === 201) {
        message.success('Signup successful! Please verify your email.');
        navigate('/wait-verify');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          message.error('Email already registered.');
        } else {
          message.error('An error occurred. Please try again.');
        }
      } else {
        message.error('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    message.error('Failed to submit. Please check your input.');
    console.error('Failed:', errorInfo);
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
        layout="vertical"
      >
        <Form.Item
          label="Display Name"
          name="display_name"
          rules={[
            { required: true, message: 'Please input your Display Name!' },
            { min: 3, message: 'Display Name must be at least 3 characters.' },
          ]}
        >
          <Input placeholder="Display Name" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Please input your Email!' },
            { type: 'email', message: 'Please enter a valid email!' },
          ]}
        >
          <Input placeholder="Email" />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[
            { required: true, message: 'Please input your Password!' },
            { min: 6, message: 'Password must be at least 6 characters.' },
          ]}
          hasFeedback
        >
          <Input.Password placeholder="Password" />
        </Form.Item>

        <Form.Item
          label="Confirm Password"
          name="confirm"
          dependencies={['password']}
          hasFeedback
          rules={[
            { required: true, message: 'Please confirm your password!' },
            ({ getFieldValue }) => ({
              validator(_: any, value: string) {
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
            Already have an account?{' '}
            {/* Use react-router's Link component for client-side routing */}
            <Link to="/login">Login</Link>
          </p>
        </div>
      </Form>
    </div>
  );
};

export default Signup;
