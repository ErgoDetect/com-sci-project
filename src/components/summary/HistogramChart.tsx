import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

// Define the props for the component
interface HistogramChartProps {
  data: number[];
  color?: string;
}

const HistogramChart: React.FC<HistogramChartProps> = ({ data, color }) => {
  if (data.length === 0) {
    return null; // or display a message, e.g., <p>No data available</p>
  }

  // Function to calculate bins
  const getBins = (data: number[], binSize: number): number[] => {
    // const min = Math.min(...data);
    const min = 0;
    const max = Math.max(...data);
    const numBins = Math.ceil((max - min) / binSize);
    const bins = Array(numBins).fill(0);

    data.forEach((value) => {
      const binIndex = Math.floor((value - min) / binSize);
      bins[binIndex] += 1;
    });

    return bins;
  };

  // Define bin size and calculate bins
  const binSize = 5; // Adjust based on your needs
  const bins = getBins(data, binSize);
  const labels = bins.map((_, i) => `${i * binSize}-${(i + 1) * binSize}`);

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: 'Frequency',
        data: bins,
        backgroundColor: color,
        borderColor: color,
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Duration Histogram',
      },
    },
    scales: {
      x: {
        title: { display: true, text: 'Duration' },
      },
      y: {
        title: { display: true, text: 'Frequency' },
        ticks: {
          stepSize: 1,
          callback: function (value: any, index: any, ticks: any) {
            return Number.isInteger(value) ? value : '';
          },
        },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export default HistogramChart;
