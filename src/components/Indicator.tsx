import React from 'react';

interface IndicatorProps {
  isGood: boolean;
  children: React.ReactNode;
}

const Indicator: React.FC<IndicatorProps> = ({ isGood, children }) => {
  const indicatorStyle = {
    padding: '2px 0',
    borderRadius: '4px',
    backgroundColor: isGood ? '#52c41a' : '#ff4d4f',
    display: 'flex',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 500,
    fontSize: '24px',
  };

  return <div style={indicatorStyle}>{children}</div>;
};

export default Indicator;
