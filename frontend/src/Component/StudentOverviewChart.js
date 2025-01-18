import React, { useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import { 
  Button, 
  Stack,
  Card,
  CardContent,
  Typography
} from '@mui/material';
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Define 20 distinct colors for different semesters
const semesterColors = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
  '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF9F40',
  '#7C4DFF', '#FF8A80', '#82B1FF', '#B39DDB', '#69F0AE',
  '#FFD180', '#FF80AB', '#EA80FC', '#8C9EFF', '#84FFFF'
];

function StudentOverviewChart({ students }) {
  const chartRef = useRef(null);

  // Get unique programs and semesters
  const programs = [...new Set(students.map(student => student.program))];
  const semesters = [...new Set(students.map(student => student.currentSemester))].sort();

  // Prepare data for the chart
  const data = {
    labels: programs,
    datasets: semesters.map((semester, index) => ({
      label: `Semester ${semester}`,
      data: programs.map(program => {
        return students.filter(student => 
          student.program === program && 
          student.currentSemester === semester
        ).length;
      }),
      backgroundColor: semesterColors[index % semesterColors.length],
      borderColor: semesterColors[index % semesterColors.length],
      borderWidth: 1
    }))
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Program',
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Students',
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        title: {
          display: true,
          text: 'Semester',
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      },
      title: {
        display: true,
        text: 'Student Overview by Program',
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    }
  };

  const handleDownload = () => {
    if (chartRef.current) {
      // Set temporary white background
      const ctx = chartRef.current.canvas.getContext('2d');
      const originalFill = ctx.fillStyle;
      ctx.save();
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, chartRef.current.canvas.width, chartRef.current.canvas.height);
      ctx.restore();
      
      // Create download link
      const link = document.createElement('a');
      link.download = 'student-overview.png';
      link.href = chartRef.current.canvas.toDataURL('image/png');
      link.click();
      
      // Restore original background
      ctx.fillStyle = originalFill;
    }
  };

  return (
    <Card sx={{ p: 2, mb: 3 }}>
      <Stack direction="row" alignItems="center" spacing={2} mb={2}>
        <Typography variant="h6" component="h2">
          Student Overview
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<Download />}
          onClick={handleDownload}
          sx={{ ml: 'auto' }}
        >
          Download Chart
        </Button>
      </Stack>
      <CardContent>
        <div style={{ height: '400px', width: '100%' }}>
          <Bar
            ref={chartRef}
            data={data}
            options={options}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default StudentOverviewChart;

