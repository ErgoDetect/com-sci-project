import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { Layout, Card, Tooltip, Button, Spin, message } from 'antd';
import {
  ArrowLeftOutlined,
  DownloadOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import JsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useLocation, useNavigate } from 'react-router-dom';
import ProgressCard from '../components/ProgressCard';
import axiosInstance from '../utility/axiosInstance';
import SummaryComponent from '../components/summary/summary';

const Summary: React.FC = () => {
  const summaryRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState(null);
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const sessionId = queryParams.get('session_id');

  useEffect(() => {
    const fetchData = async () => {
      if (sessionId) {
        try {
          const response = await axiosInstance.get(
            `/user/summary?session_id=${sessionId}`,
          );
          if (response.data) {
            setData(response.data);
          } else {
            message.error('No data available for this session.');
          }
        } catch (error) {
          console.error('Error fetching summary data:', error);
          message.error('Failed to load session summary.');
        }
      }
    };

    if (sessionId) fetchData();
  }, [sessionId]);

  const handleExportPDF = useCallback(async () => {
    if (summaryRef.current) {
      const canvas = await html2canvas(summaryRef.current, { scale: 2 }); // Increase scale for better quality
      const imgData = canvas.toDataURL('image/png');

      const pdf = new JsPDF({
        orientation: 'portrait', // or 'landscape'
        unit: 'pt',
        format: 'a4', // or other formats like 'letter'
        putOnlyUsedFonts: true,
        floatPrecision: 16, // or other values for better precision
      });

      const imgWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Check if the content height exceeds the page height
      let position = 0;
      const pageHeight = pdf.internal.pageSize.getHeight();

      // If the content is taller than a page, add pages accordingly
      if (imgHeight > pageHeight) {
        while (position < imgHeight) {
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          position += pageHeight; // Move down by the page height for the next page
          if (position < imgHeight) {
            pdf.addPage(); // Add a new page if more content is available
          }
        }
      } else {
        // If the content fits on one page
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      }

      pdf.save('summary.pdf');
    }
  }, []);

  return (
    <>
      <div
        ref={summaryRef}
        style={{
          position: 'absolute',
          top: '-9999px', // Move off-screen
          left: '-9999px',
        }}
      >
        <SummaryComponent inputData={data} pdfVersion={true} />
      </div>
      {data ? (
        <SummaryComponent
          inputData={data}
          pdfVersion={false}
          handleExportPDF={handleExportPDF}
        />
      ) : null}
    </>
  );
  // return <></>;
};

export default Summary;
