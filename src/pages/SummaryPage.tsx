import React, { useRef, useState, useEffect, useCallback } from 'react';
import { message } from 'antd';

import JsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useLocation } from 'react-router-dom';
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
      const canvas = await html2canvas(summaryRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new JsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4',
        putOnlyUsedFonts: true,
        floatPrecision: 16,
      });

      const imgWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pageHeight = pdf.internal.pageSize.getHeight();

      let position = 0;

      while (position < imgHeight) {
        // Add the portion of the image for the current page
        pdf.addImage(imgData, 'PNG', 0, -position, imgWidth, imgHeight);

        position += pageHeight;

        if (position < imgHeight) {
          pdf.addPage(); // Add a new page if more content is available
        }
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
        <SummaryComponent inputData={data} pdfVersion />
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
};

export default Summary;
