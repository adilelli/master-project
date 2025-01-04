import React, { createContext, useState, useEffect, useContext } from 'react';

export const DashboardContext = createContext();

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

export const DashboardProvider = ({ children }) => {
  const [students, setStudents] = useState([]);
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    const storedStudents = JSON.parse(localStorage.getItem('students') || '[]');
    const storedStaff = JSON.parse(localStorage.getItem('staff') || '[]');
    setStudents(storedStudents);
    setStaff(storedStaff);
  }, []);

  useEffect(() => {
    localStorage.setItem('students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('staff', JSON.stringify(staff));
  }, [staff]);

  const value = {
    students,
    setStudents,
    staff,
    setStaff,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

