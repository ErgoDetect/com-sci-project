/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import { UserOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Dropdown, Space, Avatar } from 'antd';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utility/axiosInstance';
import useAuth from '../../hooks/useAuth';

const AccountButton: React.FC = () => {
  // Calling `useAuth()` within the component
  const { getDeviceIdentifier } = useAuth();
  const navigate = useNavigate();

  // Menu items with logout handling
  const items: MenuProps['items'] = [
    {
      label: <a href="/profile">Profile</a>,
      key: '0',
    },
    {
      label: <a href="/settings">Settings</a>,
      key: '1',
    },
    {
      type: 'divider',
    },
    {
      label: 'Log Out',
      key: '3',
      onClick: async () => {
        try {
          // Ensure the device identifier is fetched properly
          const deviceIdentifier = await getDeviceIdentifier();
          console.log(deviceIdentifier.toString());

          // Perform the logout request with the correct options format
          const response = await axiosInstance.post(
            '/auth/logout/', // Ensure the URL is correct
            {}, // Empty body if no payload is needed
            {
              headers: { 'Device-Identifier': deviceIdentifier.toString() },
            },
          );
          if (response.status === 200) {
            navigate('/login');
          }
          // Optionally, handle redirection or additional logic after logout
        } catch (error) {
          console.error('Logout failed:', error);
        }
      },
    },
  ];

  return (
    <Dropdown menu={{ items }} trigger={['click']}>
      <a onClick={(e) => e.preventDefault()}>
        <Space>
          <Avatar icon={<UserOutlined />} />
        </Space>
      </a>
    </Dropdown>
  );
};

export default AccountButton;
