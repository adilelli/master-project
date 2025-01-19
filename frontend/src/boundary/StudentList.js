import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Button, 
  FormControlLabel, 
  Checkbox, 
  CircularProgress, 
  Typography,
  TextField
} from '@mui/material';  
import { useDashboard } from '../context/DashboardContext';

function StudentList() {
  const { students = [], setStudents, loading, error } = useDashboard();
  const [open, setOpen] = useState(false);
  const [filterPostponedFSE, setFilterPostponedFSE] = useState(false);

  // Fetch evaluations when the component mounts
  useEffect(() => {
    fetchEvaluations();
  }, []);

  const fetchEvaluations = async () => {
    try {
      const response = await fetch('/api/evaluations'); // Replace with your API endpoint
      const data = await response.json();
      setStudents(data);  // Update the students state with the fetched data
    } catch (error) {
      console.error('Error fetching evaluations:', error);
    }
  };

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });

      // Assuming the first sheet contains the student data
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);

      // Adding the new rows to the students state
      setStudents((prevStudents) => [...prevStudents, ...json]);
    };
    
    reader.readAsBinaryString(file);
  };

  const filteredStudents = filterPostponedFSE
    ? students.filter(student => student.postponeFSE)
    : students;

  return (
    <>
      <Button variant="outlined" component="label">
        Upload Excel
        <input
          type="file"
          accept=".xlsx,.xls"
          hidden
          onChange={handleExcelUpload}
        />
      </Button>
      
      <FormControlLabel
        control={
          <Checkbox
            checked={filterPostponedFSE}
            onChange={(e) => setFilterPostponedFSE(e.target.checked)}
          />
        }
        label="Show only postponed FSE"
      />
      
      {loading && <CircularProgress />}
      {error && <Typography color="error">Error: {error}</Typography>}

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Research Title</TableCell>
              <TableCell>Program</TableCell>
              <TableCell>Evaluation Type</TableCell>
              <TableCell>Postpone FSE</TableCell>
              <TableCell>Supervisor</TableCell>
              <TableCell>Co Supervisor</TableCell>
              <TableCell>Examiner1</TableCell>
              <TableCell>Chairperson</TableCell>
              <TableCell>Lock Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStudents.map((student, index) => (
              <TableRow key={index}>
                <TableCell>{student.studentId}</TableCell>
                <TableCell>{student.researchTitle}</TableCell>
                <TableCell>{student.programType}</TableCell>
                <TableCell>{student.evaluationType}</TableCell>
                <TableCell>
                  <FormControlLabel
                    control={<Checkbox checked={student.postponeStatus} />}
                    label="Postpone"
                  />
                </TableCell>
                <TableCell>{student.supervisorId}</TableCell>
                <TableCell>{student.coSupervisorId}</TableCell>
                <TableCell>{student.examinerId1}</TableCell>
                <TableCell>{student.chairpersonId}</TableCell>
                <TableCell>{student.lockStatus}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

export default StudentList;
