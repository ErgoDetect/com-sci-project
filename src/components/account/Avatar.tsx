import React from 'react';
import { UserOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Dropdown, Avatar } from 'antd';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utility/axiosInstance';

import '../../styles/styles.css';

const AccountButton: React.FC = () => {
  const navigate = useNavigate();

  // Menu items with logout handling
  const items: MenuProps['items'] = [
    {
      label: <span>Settings</span>,
      key: '/setting',
      onClick: () => {
        navigate('/setting');
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
