import React from 'react';
import { Card, Typography } from 'antd';
import { UpOutlined, DownOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface ProgressCardProps {
  title: string;
  type: string;
  expanded: string | null;
  onExpandToggle: (type: string) => void;
  progressBar: React.ReactNode;
  description: string;
  themeStyles: {
    cardBackground: string;
    textColor: string;
  };
}

const ProgressCard: React.FC<ProgressCardProps> = ({
  title,
  type,
  expanded,
  onExpandToggle,
  progressBar,
  description,
  themeStyles,
}) => {
  return (
    <Card
      style={{
        marginBottom: '24px',
        backgroundColor: themeStyles.cardBackground,
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        cursor: 'pointer',
      }}
      onClick={() => onExpandToggle(type)}
    >
      <Title
        level={4}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {title}
        {expanded === type ? <UpOutlined /> : <DownOutlined />}
      </Title>
      {progressBar}
      {expanded === type && (
        <div style={{ paddingTop: '12px' }}>
          <Text type="secondary" style={{ color: themeStyles.textColor }}>
            {description}
          </Text>
        </div>
      )}
    </Card>
  );
};

export default ProgressCard;
