// src/boundary/Dashboard.js

import React, { useState, useEffect } from 'react';
import { Paper, Button, Grid, Typography, Container, AppBar, Toolbar, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Book } from '@mui/icons-material';  // Book icon import
import Chart from './Chart';  // Assuming Chart component is created as discussed
import StudentList from './StudentList';  // Assuming StudentList component is already created
import StaffList from './StaffList'; // Importing StaffList component
import { useDashboard } from '../context/DashboardContext'; // Assuming context is set

function Dashboard() {
  const theme = useTheme();
  const { students, staffList } = useDashboard(); // Get staffList and students from context

  // Prepare program data for the chart
  const programs = Array.from(new Set(students.map(student => student.program)));  // Unique programs
  const semesterData = Array.from(new Set(students.map(student => student.currentSemester)));  // Unique semesters
  
  const programData = programs.map((program) => {
    const programStudents = students.filter(student => student.program === program);
    const semesterCounts = semesterData.reduce((acc, semester) => {
      acc[semester] = programStudents.filter(student => student.currentSemester === semester).length;
      return acc;
    }, {});
    return { name: program, ...semesterCounts };
  });

  // Get the staff by role
  const getStaffByRole = (role) => {
    if (!staffList || staffList.length === 0) {
      return [];
    }
    return staffList.filter(staff => staff.role === role);
  };

  useEffect(() => {
    if (!staffList || staffList.length === 0) {
      console.warn('Staff list is not available yet.');
    }
  }, [staffList]);

  return (
    <Container maxWidth="lg">
      {/* AppBar Header with Title and Icon */}
      <AppBar position="sticky" sx={{ bgcolor: theme.palette.primary.main }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
            <Book /> {/* Displaying Book icon */}
          </IconButton>
          <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            FIRST STAGE EVALUATION
          </Typography>
        </Toolbar>
      </AppBar>

      <Grid container spacing={3} sx={{ mt: 3 }}>
        {/* Student Overview Graph */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ padding: 3, backgroundColor: theme.palette.background.paper }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.primary.dark }}>
              Student Overview
            </Typography>
            <Chart programData={programData} semesterData={semesterData} theme={theme} />
          </Paper>
        </Grid>

        {/* Student List and Staff List Side by Side */}
        <Grid container spacing={3}>
          {/* Student List */}
          <Grid item xs={12} sm={6}>
            <Paper elevation={3} sx={{ padding: 3, backgroundColor: theme.palette.background.paper }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Student List
              </Typography>
              <StudentList /> {/* Assuming the StudentList component already handles student details and editing */}
            </Paper>
          </Grid>

          {/* Staff List */}
          <Grid item xs={12} sm={6}>
            <Paper elevation={3} sx={{ padding: 3, backgroundColor: theme.palette.background.paper }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Staff List
              </Typography>
              <StaffList /> {/* StaffList component integrated */}
            </Paper>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard;
