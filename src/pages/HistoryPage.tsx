import React, { useCallback, useEffect, useState } from 'react';
import { Avatar, Divider, List, Skeleton } from 'antd';
import InfiniteScroll from 'react-infinite-scroll-component';
import axiosInstance from '../utility/axiosInstance';
import Summary from './SummaryPage';

const HistoryPage = () => {
  interface DataType {
    gender: string;
    name: {
      title: string;
      first: string;
      last: string;
    };
    email: string;
    picture: {
      large: string;
      medium: string;
      thumbnail: string;
    };
    nat: string;
  }

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchUserHistory = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/user/history');
      const newSessions = response.data.session_title.map(
        (title: string, index: number) => ({
          session_title: title,
          duration: response.data.duration[index],
        }),
      );
      setData(newSessions);
    } catch (errors) {
      console.error('Error fetching user history:', errors);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserHistory(); // Fetch history on component mount
  }, []);

  return (
    <div
      id="scrollableDiv"
      style={{
        height: 400,
        overflow: 'auto',
        padding: '0 16px',
        border: '1px solid rgba(140, 140, 140, 0.35)',
      }}
    >
      <InfiniteScroll
        dataLength={data.length}
        next={fetchUserHistory}
        hasMore={data.length < 50}
        loader={<Skeleton avatar paragraph={{ rows: 1 }} active />}
        endMessage={<Divider plain>It is all, nothing more 🤐</Divider>}
        scrollableTarget="scrollableDiv"
      >
        <List
          dataSource={data}
          renderItem={(item: any) => (
            <List.Item>
              <List.Item.Meta title={item.session_title} />
              <div>Content</div>
            </List.Item>
          )}
        />
      </InfiniteScroll>
    </div>
  );
};

export default HistoryPage;
