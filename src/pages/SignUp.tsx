import React from 'react';
import { Form, Input, Button } from 'antd';
import { useResData } from '../context';

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
  const { setIsLogin } = useResData();
  const onFinish = (values: {
    email: string;
    password: string;
    confirm: string;
  }) => {};

  const onFinishFailed = (errorInfo: any) => {};

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
          name="email"
          rules={[{ required: true, message: 'Please input your Email!' }]}
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
          <Button type="primary" htmlType="submit" block>
            Sign Up
          </Button>
        </Form.Item>

        <div style={styles.footerText}>
          <p>
            Already have an account?{' '}
            <span onClick={() => setIsLogin(true)} style={styles.link}>
              Login
            </span>
          </p>
        </div>
      </Form>
    </div>
  );
};

export default Signup;
