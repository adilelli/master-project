import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import LoginPage from './boundary/loginpage';
import OfficeAssistantDashboard from './boundary/OfficeAssistantDashboard';
import StaffList from './boundary/StaffList';
import StudentList from './boundary/StudentList';
import { DashboardProvider } from './context/DashboardContext';
import FirstTimeLogin from './boundary/FirstTimeLogin';
import ResetPasswordVerification from './boundary/ResetPasswordVerification';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DashboardProvider>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<LoginPage />} />
            <Route path='/dashboard' element={<OfficeAssistantDashboard />} />
            <Route path='/stafflist' element={<StaffList />} />
            <Route path='/studentlist' element={<StudentList />} />
            <Route path='/first-time-login' element={<FirstTimeLogin />} />
            <Route path='/reset-password/:token' element={<ResetPasswordVerification />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </DashboardProvider>
    </ThemeProvider>
  );
}

export default App;

