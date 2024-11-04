// src/pages/Login.tsx
import React, { useState } from 'react';
import { Button, Divider, Flex, Form, Input, Space } from 'antd';
import {
  UserOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  LockOutlined,
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import GoogleButton from '../components/Login/GoogleButton';
import useAuth from '../hooks/useAuth';

const Login: React.FC = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const { loading, loginWithEmail } = useAuth(); // Use the centralized hook
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setPasswordVisible((prev) => !prev);
  };

  // Handle form submission
  const onFinish = (values: { email: string; password: string }) => {
    const { email, password } = values;
    loginWithEmail(email, password); // Call the centralized login logic
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
          <h1 style={{ textAlign: 'center' }}>Log in</h1>
          <Form name="login" layout="vertical" onFinish={onFinish}>
            <Form.Item
              name="email"
              rules={[{ required: true, message: '* email require' }]}
            >
              <Input prefix={<UserOutlined />} style={{ height: 38 }} />
            </Form.Item>

            <Form.Item
              name="password"
              // label="Password"
              rules={[{ required: true, message: '* password require' }]}
            >
              <Input
                prefix={<LockOutlined />}
                type={passwordVisible ? 'text' : 'password'}
                style={{ height: 38 }}
                suffix={
                  <Button
                    type="link"
                    color="primary"
                    onClick={togglePasswordVisibility}
                    icon={
                      passwordVisible ? (
                        <EyeTwoTone />
                      ) : (
                        <EyeInvisibleOutlined />
                      )
                    }
                  />
                }
              />
            </Form.Item>
            <Form.Item>
              <Flex justify="end" align="center">
                <Form.Item name="remember" valuePropName="checked" noStyle />
                <Button type="text" onClick={() => navigate('/request-reset')}>
                  Forgot password
                </Button>
              </Flex>
            </Form.Item>

            <Form.Item>
              <Button block type="primary" htmlType="submit" loading={loading}>
                Continue
              </Button>
            </Form.Item>
          </Form>

          <h4 style={{ textAlign: 'center' }}>
            Don&apos;t have an account?{' '}
            <Link
              to="/signup"
              style={{
                color: '#1890ff',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Sign up
            </Link>
          </h4>
        </div>

        <Divider>OR</Divider>

        <GoogleButton />
      </div>
    </div>
  );
};

export default Login;
