import React, { useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import { 
  Button, 
  Stack,
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { Download } from 'lucide-react';
import html2canvas from 'html2canvas';
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
  const containerRef = useRef(null);

  // Unique programs and semesters
  const programs = [...new Set(students.map(student => student.programType))].sort();
// Filter and process semesters
  const semesters = [...new Set(students
    .map(student => student.semester)
    .filter(semester => semester))] // Remove empty or invalid semesters
    .sort();


  // Program totals
  const programTotals = programs.map(program =>
    students.filter(student => student.programType === program).length
  );

  // Prepare data for the chart
  const data = {
    labels: programs,
    datasets: semesters.map((semester, index) => ({
      label: `Semester ${semester}`, // Format the label properly
      data: programs.map(programType => {
        return students.filter(student => 
          student.programType === programType && 
          student.semester === semester // Match the correct semester field
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
        },
        stacked: true,
      },
      y: {
        beginAtZero: true,
        stacked: true,
        title: {
          display: true,
          text: 'Number of Students',
        },
      },
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Student Overview by Program',
      },
      tooltip: {
        callbacks: {
          footer: tooltipItems => {
            const programIndex = tooltipItems[0].dataIndex;
            return `Total: ${programTotals[programIndex]}`;
          },
        },
      },
    },
  };

  const totalLabelsPlugin = {
    id: 'totalLabels',
    afterDatasetsDraw(chart) {
      const { ctx, data, scales } = chart;
      ctx.save();
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillStyle = '#000';

      programTotals.forEach((total, index) => {
        const xPos = scales.x.getPixelForValue(data.labels[index]);
        const yPos = scales.y.getPixelForValue(total);
        ctx.fillText(total, xPos, yPos - 5);
      });
      ctx.restore();
    },
  };

  const handleDownload = async () => {
    if (containerRef.current) {
      try {
        const canvas = await html2canvas(containerRef.current, {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true,
        });
        const link = document.createElement('a');
        link.download = 'student-overview.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (error) {
        console.error('Error generating image:', error);
      }
    }
  };

  return (
    <Box ref={containerRef}>
      <Card>
        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
          <Typography variant="h6">Student Overview</Typography>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleDownload}
            sx={{ ml: 'auto' }}
          >
            Download Overview
          </Button>
        </Stack>
        <CardContent>
          <div style={{ height: '400px', width: '100%' }}>
            <Bar ref={chartRef} data={data} options={options} plugins={[totalLabelsPlugin]} />
          </div>
        </CardContent>
      </Card>
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Semester</strong></TableCell>
                {programs.map(program => (
                  <TableCell key={program} align="center">
                    <strong>{program}</strong>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {semesters.map(semester => (
                <TableRow key={semester}>
                  <TableCell>Semester {semester}</TableCell>
                  {programs.map(program => (
                    <TableCell key={`${semester}-${program}`} align="center">
                      {students.filter(student =>
                        student.programType === program &&
                        student.semester === semester
                      ).length}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              <TableRow>
                <TableCell><strong>Total</strong></TableCell>
                {programs.map((program, index) => (
                  <TableCell key={program} align="center">
                    {programTotals[index]}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}

export default StudentOverviewChart;