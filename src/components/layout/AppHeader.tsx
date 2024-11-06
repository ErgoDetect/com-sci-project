import React from 'react';
import { Layout, Menu, Space } from 'antd';
import type { MenuProps } from 'antd';
import Avatar from '../account/Avatar';

interface AppHeaderProps {
  items: MenuProps['items'];
}

const { Header } = Layout;

const AppHeader: React.FC<AppHeaderProps> = ({ items }) => (
  <Header
    style={{
      position: 'sticky',
      top: 0,
      zIndex: 1,
      display: 'flex',
      padding: 0,
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
      <div className="logo" />
      <Menu
        theme="dark"
        mode="horizontal"
        items={items}
        style={{
          flexGrow: 1,
          minWidth: '350px',
        }}
      />
    </div>

    <div>
      <Avatar />
    </div>
  </Header>
);

export default AppHeader;
