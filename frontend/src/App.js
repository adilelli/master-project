
import LoginPage from './boundary/loginpage';
import { BrowserRouter, Route, Routes } from "react-router-dom"
import OfficeAssistantDashboard from './boundary/OfficeAssistantDashboard';
import StaffList from './boundary/StaffList';
import StudentList from './boundary/StudentList';
import { DashboardProvider } from './context/DashboardContext';

function App() {
  return (
    <DashboardProvider> 
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<LoginPage />} />
        <Route path='/dashboard' element={<OfficeAssistantDashboard />} />
        <Route path='/stafflist' element={<StaffList />} />
        <Route path='/studentlist' element={<StudentList />} />
      </Routes>
    </BrowserRouter>
    </DashboardProvider>
  );
}

export default App;
