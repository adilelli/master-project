import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2'; // Import Line chart from react-chartjs-2
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function ProgramChart({ students }) {
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    // Get unique semesters
    const semesters = [...new Set(students.map(student => student.currentSemester))];

    // Prepare the data for each program with color assignments
    const programGroupedData = ['PhD', 'MPhil', 'DSE'].map(program => {
      const programStudents = students.filter(student => student.program === program);
      const semesterCount = semesters.map(semester =>
        programStudents.filter(student => student.currentSemester === semester).length
      );

      return {
        name: program,
        color: program === 'PhD' ? 'green' : program === 'MPhil' ? 'orange' : 'yellow', // Assign colors
        counts: semesterCount,
      };
    });

    setChartData({
      labels: semesters,
      datasets: programGroupedData.map((programData) => ({
        label: programData.name,
        data: programData.counts,
        borderColor: programData.color, // Color of the line
        backgroundColor: programData.color, // Background color for points
        tension: 0.4, // Line tension for smoother curves
      })),
    });
  }, [students]);

  return (
    <div>
      <h2>Students by Program</h2>
      <Line data={chartData} />
    </div>
  );
}

export default ProgramChart;
