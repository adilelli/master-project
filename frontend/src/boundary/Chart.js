import React, { useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import { Button, Stack } from '@mui/material';
import { Download } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Chart({ programData, semesterData, theme }) {
  const chartRef = useRef(null);

  const colors = {
    PhD: 'green',
    MPhil: 'orange',
    DSE: 'yellow',
  };

  const datasets = programData.map((program) => ({
    label: program.name,
    data: semesterData.map((semester) => program[semester] || 0),
    backgroundColor: colors[program.name] || theme.palette.primary.main,
  }));

  const data = {
    labels: semesterData,
    datasets,
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Student Overview by Program and Semester',
      },
    },
  };

  const handleDownloadChart = () => {
    const link = document.createElement('a');
    link.download = 'student-overview-chart.png';
    link.href = chartRef.current.canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <>
      <Stack direction="row" justifyContent="flex-end" mb={2}>
        <Button 
          variant="outlined" 
          startIcon={<Download />}
          onClick={handleDownloadChart}
        >
          Download Chart
        </Button>
      </Stack>
      <Bar ref={chartRef} data={data} options={options} />
    </>
  );
}

export default Chart;

