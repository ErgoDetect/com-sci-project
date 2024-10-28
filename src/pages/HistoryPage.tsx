import React, { useEffect, useState } from 'react';
import { List, Tag, Image, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utility/axiosInstance';
import { Container } from '../styles/styles';

const HistoryPage = () => {
  interface DataType {
    session_title: string;
    date: string;
    file_name: string;
    thumbnail: string;
    session_type: string;
  }

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DataType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleItemClick = (sessionTitle: string) => {
    const sessionId = sessionTitle.replace('Session ID: ', '');
    navigate(`/summary?session_title=${sessionId}`);
  };

  const fetchUserHistory = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/user/history');
      const newSessions = await Promise.all(
        response.data.map(async (session: any) => {
          const thumbnail = session.thumbnail
            ? await window.electron.video.getThumbnail(session.thumbnail)
            : 'No Thumbnail';
          return {
            session_title: `Session ID: ${session.sitting_session_id}`,
            date: new Date(session.date).toLocaleString(),
            file_name: session.file_name || 'No Files',
            thumbnail,
            session_type: session.session_type,
          };
        }),
      );
      setData(newSessions);
      console.log(newSessions); // Log the fetched data
    } catch (errors) {
      console.error('Error fetching user history:', errors);
      setError('Failed to fetch user history');
      message.error('Failed to fetch user history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserHistory();
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
        {error ? (
          <p>{error}</p>
        ) : (
          <List
            loading={loading}
            dataSource={data}
            renderItem={(item: DataType) => (
              <List.Item
                onClick={() => handleItemClick(item.session_title)}
                style={{ cursor: 'pointer' }}
              >
                <Image
                  src={item.thumbnail}
                  alt="Thumbnail"
                  width={200}
                  style={{ borderRadius: '8px' }}
                  preview={false}
                />
                <List.Item.Meta
                  title={`Date: ${item.date}`}
                  description={item.session_title}
                  style={{ marginLeft: '32px' }}
                />
                <Tag color="#f50">{item.session_type}</Tag>
              </List.Item>
            )}
          />
        )}
      </div>
    </Container>
  );
};

export default HistoryPage;
