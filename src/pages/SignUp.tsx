import React, { useState, useRef, useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import axiosInstance from '../utility/axiosInstance';
import { SignUpFormValues } from '../interface/propsType';

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  form: {
    width: '100%', // Make the form width responsive
    maxWidth: '400px', // Increased max width for better readability on larger screens
    padding: '20px',
    borderRadius: '12px', // Rounded corners for modern look
  },
  footerText: {},
  link: {
    color: '#1890ff',
    cursor: 'pointer',
    fontWeight: 'bold', // Bold for better visibility
  },
};

const Signup: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const displayNameRef = useRef(null);

  useEffect(() => {
    displayNameRef.current?.focus();
  }, []);

  const onFinish = async (values: SignUpFormValues) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/auth/signup/', values);
      if (response.status === 201) {
        message.success('Signup successful! Please verify your email.');
        navigate(`/wait-verify?email=${values.email}`);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        message.error(
          error.response.data.message || 'An error occurred. Please try again.',
        );
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
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <div
        style={{
          // textAlign: 'center',
          maxWidth: '350px',
          padding: '20px',
          width: '350px',
          margin: '0 auto',
        }}
      >
        <div>
          <h1 style={{ textAlign: 'center' }}>Sign Up</h1>

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
                {
                  min: 3,
                  message: 'Display Name must be at least 3 characters.',
                },
              ]}
            >
              <Input placeholder="Display Name" ref={displayNameRef} />
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

            <div
              style={{
                textAlign: 'center',
                marginTop: '20px',
                fontSize: '16px',
              }}
            >
              <p>
                Already have an account?{' '}
                <Link
                  to="/login"
                  style={{
                    color: '#1890ff',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  Login
                </Link>
              </p>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
