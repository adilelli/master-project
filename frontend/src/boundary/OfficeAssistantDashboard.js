import React, { useState, useEffect } from 'react';
import {
  Paper,
  Grid,
  Typography,
  Container,
  AppBar,
  Toolbar,
  IconButton,
  Tabs,
  Tab,
  Box,
  CircularProgress,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Book } from '@mui/icons-material';
import StudentOverviewChart from '../Component/StudentOverviewChart';
import StudentList from './StudentList';
import StaffList from './StaffList';
import { useDashboard } from '../context/DashboardContext';
import ApiService from '../controller/apiservice';

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

const Dashboard = () => {
  const theme = useTheme();
  const { students, setStudents } = useDashboard();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const role = localStorage.getItem('userRole');
  const username = localStorage.getItem('userName');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        let response = [];
        if (role === '1' || role === '2') {
          // Fetch all evaluations
          response = await ApiService.viewEvaluations();
        } else if (role === '3' || role === '4') {
          // Fetch evaluations supervised by the user
          response = await ApiService.viewSupervisedEvaluations(username);
        }

        // Update the students state
        setStudents(response);
      } catch (error) {
        console.error('Error fetching evaluations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [setStudents]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg">
      <AppBar position="sticky" sx={{ bgcolor: theme.palette.primary.main }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {/* Left Section: Icon and Title */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
              <Book />
            </IconButton>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              FIRST STAGE EVALUATION
            </Typography>
          </Box>

          {/* Right Section: Username */}
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {username}
          </Typography>
        </Toolbar>
    </AppBar>


      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ padding: 3, backgroundColor: theme.palette.background.paper }}>
            {loading ? (
              <CircularProgress />
            ) : (
              <StudentOverviewChart students={students} />
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
                Student Evaluation List
              </Typography>
              <StudentList students={students} />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Staff List
              </Typography>
              <div>
                {role === "1" ? <StaffList /> : <p>You do not have access to the staff list.</p>}
              </div>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
