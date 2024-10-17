/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import { UserOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Dropdown, Space, Avatar } from 'antd';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utility/axiosInstance';
import useAuth from '../../hooks/useAuth';
import { useResData } from '../../context';
import '../../styles/styles.css';

const AccountButton: React.FC = () => {
  const { setRenderSettings } = useResData();
  const navigate = useNavigate();

  // Menu items with logout handling
  const items: MenuProps['items'] = [
    {
      label: <a href="/profile">Profile</a>,
      key: '0',
    },
    {
      label: <span onClick={() => setRenderSettings(true)}>Settings</span>,
      key: '/setting',
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

          // Perform the logout request with the correct options format
          const response = await axiosInstance.post(
            '/auth/logout', // Ensure the URL is correct
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
    <Dropdown
      menu={{ items }}
      trigger={['click']}
      overlayStyle={{
        minWidth: '200px',
        marginRight: '16px',
      }}
      overlayClassName="custom-dropdown-menu"
    >
      <a onClick={(e) => e.preventDefault()}>
        <div style={{ marginRight: '10px' }}>
          <Avatar
            icon={<UserOutlined />}
            size="large"
            shape="circle"
            style={{ backgroundColor: '#87d068' }}
          />
        </div>
      </a>
    </Dropdown>
  );
};

export default AccountButton;
