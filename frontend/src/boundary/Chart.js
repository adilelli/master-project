// src/boundary/Chart.js

import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';


// Register required Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Chart = ({ programData, semesterData, theme }) => {
  // Format the data for the chart
  const labels = semesterData || [];
  const datasets = programData.map(program => ({
    label: program.name,
    data: labels.map(label => program[label] || 0), // Fill data or 0 for missing semesters
    backgroundColor: theme.palette.primary.main,
    borderColor: theme.palette.primary.dark,
    borderWidth: 1,
  }));

  const data = {
    labels,
    datasets,
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Student Distribution by Program and Semester',
      },
      legend: {
        position: 'top',
      },
    },
  };

  return <Bar data={data} options={options} />;
};

export default Chart;
