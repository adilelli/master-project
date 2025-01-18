import React, { useState, useEffect } from 'react';
import { Paper, Grid, Typography, Container, AppBar, Toolbar, IconButton, Tabs, Tab, Box, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Book } from '@mui/icons-material';
import StudentOverviewChart from '../Component/StudentOverviewChart';
import StudentList from './StudentList';
import StaffList from './StaffList';
import { useDashboard } from '../context/DashboardContext';

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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    if (!staffList || staffList.length === 0) {
      console.warn('Staff list is not available yet.');
    }
  }, [staffList]);

  return (
    <Container maxWidth="lg">
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
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ padding: 3, backgroundColor: theme.palette.background.paper }}>
            {students ? (
              <StudentOverviewChart students={students} />
            ) : (
              <CircularProgress />
            )}
          </Paper>
        </Grid>

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

