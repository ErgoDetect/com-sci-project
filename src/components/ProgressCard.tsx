import React from 'react';
import { Card, Typography } from 'antd';
import { UpOutlined, DownOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

// Define EventType here or import it if defined elsewhere
type EventType = 'blink' | 'proximity' | 'hunchback' | 'sitting';

interface ProgressCardProps {
  title: string;
  type: EventType;
  expanded: EventType | null;
  onExpandToggle: (type: EventType) => void;
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
  const isExpanded = expanded === type;

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
          color: themeStyles.textColor,
        }}
      >
        {title}
        {isExpanded ? <UpOutlined /> : <DownOutlined />}
      </Title>
      <div
        style={{ position: 'relative', height: '10px', marginBottom: '8px' }}
      >
        {progressBar}
      </div>
      {isExpanded && (
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
