import React, { useState, useEffect } from 'react';
import { Paper, Grid, Typography, Container, AppBar, Toolbar, IconButton, Tabs, Tab, Box, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Book } from '@mui/icons-material';
import Chart from './Chart'; // Assuming Chart component is created as discussed
import StudentList from './StudentList'; // Assuming StudentList component is already created
import StaffList from './StaffList'; // Importing StaffList component
import { useDashboard } from '../context/DashboardContext'; // Assuming context is set

// TabPanel component to manage the tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function Dashboard() {
  const theme = useTheme();
  const { students, staffList } = useDashboard();
  const [tabValue, setTabValue] = useState(0);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Prepare program data for the chart
  const programs = Array.from(new Set(students.map(student => student.program))); // Unique programs
  const semesterData = Array.from(new Set(students.map(student => student.currentSemester))); // Unique semesters
  
  const programData = programs.map((program) => {
    const programStudents = students.filter(student => student.program === program);
    const semesterCounts = semesterData.reduce((acc, semester) => {
      acc[semester] = programStudents.filter(student => student.currentSemester === semester).length;
      return acc;
    }, {});
    return { name: program, ...semesterCounts };
  });

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
            <Book />
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
            {programData && semesterData ? (
              <Chart programData={programData} semesterData={semesterData} theme={theme} />
            ) : (
              <CircularProgress />
            )}
          </Paper>
        </Grid>

        {/* Tabs for Student and Staff Lists */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ padding: 3, backgroundColor: theme.palette.background.paper, marginBottom: 3 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              textColor="primary"
              indicatorColor="primary"
              aria-label="student and staff tabs"
            >
              <Tab label="Student List" id="tab-0" aria-controls="tabpanel-0" />
              <Tab label="Staff List" id="tab-1" aria-controls="tabpanel-1" />
            </Tabs>

            {/* Tab Panels */}
            <TabPanel value={tabValue} index={0}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Student List
              </Typography>
              <StudentList />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Staff List
              </Typography>
              <StaffList />
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard;
