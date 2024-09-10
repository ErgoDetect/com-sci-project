import React, { useState } from 'react';
import { Button, Checkbox, Divider, Form, Input } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import GoogleButton from '../components/Login/GoogleButton';
import { useResData } from '../context';

const Login = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const { url } = useResData();

  const togglePasswordVisibility = () => {
    setPasswordVisible((prev) => !prev);
  };

  const onFinish = async (values: any) => {
    console.log('Form submitted with values:', values);

    try {
      const response = await fetch(`http://${url}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.username,
          password: values.password,
        }),
        credentials: 'include',
      });

      // Check if the response is okay
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data:', data); // Log the entire response data

      if (data) {
        console.log('Login successful:', data.message);
        try {
          const cookies = await window.electron.ipcRenderer.getCookie();
          console.log('Cookies:', cookies);
        } catch (error) {
          console.error('Error fetching cookies:', error);
        }
      } else {
        console.error('Login failed:', data.message);
      }
    } catch (error) {
      console.error('Error during fetch:', error);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100dvh',
        margin: 0,
        position: 'relative',
        backgroundColor: '#f0f2f5',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          maxWidth: 500,
          maxHeight: 600,
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h1>Log in</h1>
          <h4>
            Don&apos;t have an account? <a href="signup">Sign up</a>
          </h4>
        </div>

        <GoogleButton />

        <Divider
          style={{ borderColor: 'grey', color: 'grey', marginBottom: '20px' }}
        >
          Or continue with email
        </Divider>

        <Form
          name="login"
          initialValues={{ remember: true }}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            label="Email address or user name"
            name="username"
            rules={[{ required: true, message: 'Please input your Username!' }]}
          >
            <Input prefix={<UserOutlined />} />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please input your Password!' }]}
          >
            <Input
              prefix={<LockOutlined />}
              type={passwordVisible ? 'text' : 'password'}
              suffix={
                <Button
                  type="link"
                  onClick={togglePasswordVisibility}
                  style={{ padding: 0 }}
                >
                  {passwordVisible ? 'Hide' : 'Show'}
                </Button>
              }
            />
          </Form.Item>

          <Form.Item>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>Remember me</Checkbox>
              </Form.Item>
              <a href="repass">Forgot password</a>
            </div>
          </Form.Item>

          <Form.Item>
            <Button block type="primary" htmlType="submit">
              Log in
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Login;
