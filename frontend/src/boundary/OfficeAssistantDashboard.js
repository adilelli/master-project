import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Tabs, 
  Tab,
  Grid,
  Paper
} from '@mui/material';
import StudentList from './StudentList';
import StaffList from './StaffList';
import { DashboardProvider, useDashboard } from '../context/DashboardContext';

function Dashboard() {
  const { students, staff } = useDashboard();
  
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Students Overview</Typography>
          <Typography>Total Students: {students.length}</Typography>
          <Typography>PhD Students: {students.filter(s => s.program === 'PhD').length}</Typography>
          <Typography>MPhil Students: {students.filter(s => s.program === 'MPhil').length}</Typography>
          <Typography>DSE Students: {students.filter(s => s.program === 'DSE').length}</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Staff Overview</Typography>
          <Typography>Total Staff: {staff.length}</Typography>
          <Typography>Main Supervisors: {staff.filter(s => s.role === 'Main Supervisor').length}</Typography>
          <Typography>Co-Supervisors: {staff.filter(s => s.role === 'Co-Supervisor').length}</Typography>
          <Typography>Examiners: {staff.filter(s => s.role === 'Examiner').length}</Typography>
          <Typography>Chairpersons: {staff.filter(s => s.role === 'Chairperson').length}</Typography>
        </Paper>
      </Grid>
    </Grid>
  );
}

function OfficeAssistantDashboard() {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <DashboardProvider>
      <Container maxWidth="lg">
        <Typography variant="h4" component="h1" gutterBottom>
          Office Assistant Dashboard
        </Typography>
        <Dashboard />
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, mt: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Student List" />
            <Tab label="Staff List" />
          </Tabs>
        </Box>
        {activeTab === 0 && <StudentList />}
        {activeTab === 1 && <StaffList />}
      </Container>
    </DashboardProvider>
  );
}

export default OfficeAssistantDashboard;

