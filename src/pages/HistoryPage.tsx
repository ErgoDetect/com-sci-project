import React, { useEffect, useState } from 'react';
import { Avatar, Divider, List, Skeleton } from 'antd';
import InfiniteScroll from 'react-infinite-scroll-component';
import axiosInstance from '../utility/axiosInstance';
import { Container } from '../styles/styles';

const HistoryPage = () => {
  interface DataType {
    session_title: string;
    date: string;
    blink: string;
    sitting: string;
    file_name: string;
  }

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DataType[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchUserHistory = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/user/history');
      console.log(response.data); // Log the response to understand its structure

      // Assuming response.data is an array of sessions
      const newSessions = response.data.map((session: any) => ({
        session_title: `Session ID: ${session.sitting_session_id}`, // You can make a more meaningful title here
        date: new Date(session.date).toLocaleString(), // Convert the date to a readable format
        file_name: session.file_name ? session.file_name : 'No Files', // Handle file names
        blink: session.blink.length
          ? `Blinks: ${session.blink.length}`
          : 'No Blink Data', // Add more data if needed
        sitting: session.sitting.length
          ? `Sitting Events: ${session.sitting.length}`
          : 'No Sitting Data',
      }));

      setData(newSessions); // Set the formatted session data
    } catch (errors) {
      console.error('Error fetching user history:', errors);
      setError('Failed to fetch user history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserHistory(); // Fetch history on component mount
  }, []);

  return (
    <Container>
      <div
        id="scrollableDiv"
        style={{
          height: '100%',
          overflow: 'auto',
          padding: '0 16px',
          border: '1px solid rgba(140, 140, 140, 0.35)',
          borderRadius: '8px',
        }}
      >
        <List
          dataSource={data}
          renderItem={(item: DataType) => (
            <List.Item>
              <List.Item.Meta
                title={item.session_title}
                description={`Date: ${item.date}`}
              />
              <div>
                <div>{item.blink}</div>
                <div>{item.sitting}</div>
                <div>Files: {item.file_name}</div>
              </div>
            </List.Item>
          )}
        />
      </div>
    </Container>
  );
};

export default HistoryPage;
