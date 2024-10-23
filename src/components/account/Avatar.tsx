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
  const { renderSettings, setRenderSettings } = useResData();
  const navigate = useNavigate();

  // Menu items with logout handling
  const items: MenuProps['items'] = [
    {
      label: <a href="/profile">Profile</a>,
      key: '0',
      onClick: () => {
        console.log('Profile clicked'); // Log the click action
      },
    },
    {
      label: <span>Settings</span>,
      key: '/setting',
      onClick: () => {
        setRenderSettings((prev) => {
          return !prev; // Correctly return the updated value
        });
        console.log(renderSettings);

        console.log('Settings clicked'); // Log the click action
      },
    },
    {
      type: 'divider',
    },
    {
      label: 'Log Out',
      key: '3',
      onClick: async () => {
        console.log('Log Out clicked'); // Log the click action
        try {
          const response = await axiosInstance.post('/auth/logout');
          if (response.status === 200) {
            navigate('/login');
          }
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
      <button
        onClick={(e) => e.preventDefault()}
        type="button"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <div style={{ marginRight: '10px' }}>
          <Avatar
            icon={<UserOutlined />}
            size="large"
            shape="circle"
            style={{ backgroundColor: '#87d068' }}
          />
        </div>
      </button>
    </Dropdown>
  );
};

export default AccountButton;
