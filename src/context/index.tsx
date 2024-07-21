import React, { ReactNode, useContext, useMemo, useState } from 'react';
import { PositionData, ResContextType } from '../interface/propsType';
import useWebSocket from '../utility/webSocketConfig';

const ResContext = React.createContext<ResContextType | undefined>(undefined);

export const useData = () => {
  return useContext(ResContext);
};

export const ResProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [resData, setResData] = useState<PositionData | undefined>(undefined);

  const handleMessage = (data: any) => {
    setResData(data); // Update context with WebSocket data
  };

  useWebSocket('ws://localhost:8000/ws', handleMessage);

  const value = useMemo(() => ({ resData, setResData }), [resData]);

  return <ResContext.Provider value={value}>{children}</ResContext.Provider>;
};
