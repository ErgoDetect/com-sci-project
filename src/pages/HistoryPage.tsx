import React, { useCallback, useEffect, useState } from 'react';
import {
  List,
  Tag,
  Image,
  message,
  Button,
  Dropdown,
  Checkbox,
  MenuProps,
  Spin,
  Modal,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import buddhistEra from 'dayjs/plugin/buddhistEra';
import {
  CloseOutlined,
  FilterOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import axiosInstance from '../utility/axiosInstance';
import { Container } from '../styles/styles';

dayjs.extend(buddhistEra);

const { confirm } = Modal;

const HistoryPage = () => {
  interface DataType {
    session_title: string;
    date: string;
    file_name: string;
    thumbnail: string;
    session_type: string;
    isFallback?: boolean; // Add a flag to track fallback status for each item
  }

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DataType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({
    date_asc: false,
    stream: false,
    video: false,
  });

  // Toggle checked state
  const toggleCheck = (key: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Prepare menu items with checkboxes
  const items: MenuProps['items'] = [
    {
      label: (
        <Checkbox
          checked={checkedItems.date_asc}
          onChange={() => toggleCheck('date_asc')}
        >
          เรียงจากวันที่ เก่า {'->'} ใหม่
        </Checkbox>
      ),
      key: 'date_asc',
    },
    {
      label: (
        <Checkbox
          checked={checkedItems.stream}
          onChange={() => toggleCheck('stream')}
        >
          เรียลไทม์
        </Checkbox>
      ),
      key: 'stream',
    },
    {
      label: (
        <Checkbox
          checked={checkedItems.video}
          onChange={() => toggleCheck('video')}
        >
          วิดีโอ
        </Checkbox>
      ),
      key: 'video',
    },
  ];

  const handleItemClick = (sessionTitle: string) => {
    const sessionId = sessionTitle.replace('Session ID: ', '');
    navigate(`/summary?session_id=${sessionId}`);
  };

  const fetchUserHistory = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `/user/history?date_asc=${checkedItems.date_asc}&stream=${checkedItems.stream}&video=${checkedItems.video}`,
      );
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
            isFallback: false,
          };
        }),
      );
      setData(newSessions);
    } catch (errors) {
      console.error('Error fetching user history:', errors);
      setError('Failed to fetch user history');
      message.error('Failed to fetch user history');
    } finally {
      setLoading(false);
    }
  }, [checkedItems]);

  const deleteHistory = async (sessionTitle: string) => {
    const sessionId = sessionTitle.replace('Session ID: ', '');
    try {
      await axiosInstance.delete(
        `/delete/session/history?session_id=${sessionId}`,
      );
      fetchUserHistory();
    } catch (deleteError) {
      message.error('Failed to delete history');
    }
  };

  const showDeleteConfirm = (sessionTitle: any) => {
    confirm({
      title: 'Are you sure delete this history?',
      icon: <ExclamationCircleOutlined />,
      content: sessionTitle,
      async onOk() {
        await deleteHistory(sessionTitle);
        message.success('History deleted successfully');
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };

  useEffect(() => {
    fetchUserHistory();
  }, [fetchUserHistory]);

  const handleImageError = (index: number) => {
    // Update the specific item to indicate it needs a fallback
    setData((prevData) =>
      prevData.map((item, idx) =>
        idx === index ? { ...item, isFallback: true } : item,
      ),
    );
  };

  return (
    <Container>
      <h1>ประวัติ</h1>
      {error ? (
        <Spin />
      ) : (
        <>
          <div
            style={{ display: 'flex', justifyContent: 'end', marginBottom: 25 }}
          >
            <Dropdown
              menu={{ items }}
              trigger={['click']}
              open={visible}
              overlayStyle={{
                minWidth: '200px',
              }}
            >
              <Button
                type="text"
                icon={<FilterOutlined />}
                onClick={() => {
                  setVisible(!visible);
                }}
              >
                ตัวกรอง
              </Button>
            </Dropdown>
          </div>
          <List
            loading={loading}
            dataSource={data}
            renderItem={(item, index) => (
              <List.Item
                onClick={() => handleItemClick(item.session_title)}
                style={{
                  cursor: 'pointer',
                  padding: '35px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                  marginBottom: '8px',
                  borderRadius: '12px',
                  position: 'relative', // Add this line
                  overflow: 'hidden', // Optional, ensures nothing spills over
                }}
              >
                <Image
                  src={item.thumbnail}
                  alt="Thumbnail"
                  width={item.isFallback ? 150 : 200}
                  height={item.isFallback ? 150 : 'auto'}
                  style={{
                    borderRadius: '8px',
                    ...(item.isFallback && {
                      border: '1px solid #ccc',
                    }),
                  }}
                  preview={false}
                  fallback="data:image/png;base64,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"
                  onError={() => handleImageError(index)}
                />
                <List.Item.Meta
                  title={
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '18px',
                        gap: '20px',
                        marginLeft: item.isFallback ? '50px' : '0',
                      }}
                    >
                      <span>{dayjs(item.date).format('DD-MM-BBBB')}</span>
                      <span>{dayjs(item.date).format('HH:mm')}</span>
                    </div>
                  }
                  description={
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '18px',
                        gap: '16px',
                        marginLeft: item.isFallback ? '50px' : '0',
                      }}
                    >
                      {item.session_title}
                    </div>
                  }
                  style={{ marginLeft: '32px' }}
                />
                <div
                  style={{ position: 'absolute', top: '10px', right: '10px' }}
                >
                  <Button
                    type="text"
                    shape="circle"
                    size="large"
                    icon={<CloseOutlined />}
                    onClick={(event) => {
                      event.stopPropagation();
                      showDeleteConfirm(item.session_title);
                    }}
                  />
                </div>
                <Tag
                  color={item.session_type === 'stream' ? '#1E90FF' : '#FF9248'}
                >
                  {item.session_type}
                </Tag>
              </List.Item>
            )}
          />
        </>
      )}
    </Container>
  );
};

export default HistoryPage;
