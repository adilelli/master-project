import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Button, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Input
} from '@mui/material';
import * as XLSX from 'xlsx';
import { PROGRAMS, EVALUATION_TYPES } from '../utils/constants';
import { useDashboard } from '../context/DashboardContext';

function StudentList() {
  const { students, setStudents, staffList } = useDashboard(); // Get staffList from context
  const [open, setOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState({
    name: '',
    program: '',
    evaluationType: '',
    currentSemester: '',
    mainSupervisor: '',
    coSupervisor: '',
    examiner1: '',
    examiner2: '',
    examiner3: '',
    chairperson: '',
    postponeFSE: false, 
    lockNomination: false, // New property for Lock Nomination
  });

  useEffect(() => {
    if (!staffList || staffList.length === 0) {
      console.warn('Staff list is not available yet.');
    }
  }, [staffList]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setCurrentStudent({
      name: '',
      program: '',
      evaluationType: '',
      currentSemester: '',
      mainSupervisor: '',
      coSupervisor: '',
      examiner1: '',
      examiner2: '',
      examiner3: '',
      chairperson: '',
      postponeFSE: false, 
      lockNomination: false, // Reset lockNomination state
    });
  };

  const handleInputChange = (e) => {
    setCurrentStudent({ ...currentStudent, [e.target.name]: e.target.value });
  };

  const handlePostponeChange = (id) => {
    setStudents(students.map(student => 
      student.id === id ? { ...student, postponeFSE: !student.postponeFSE } : student
    ));
  };

  const handleLockNominationChange = (id) => {
    setStudents(students.map(student => 
      student.id === id ? { ...student, lockNomination: !student.lockNomination } : student
    ));
  };

  const handleSubmit = () => {
    if (currentStudent.id) {
      setStudents(students.map(student => 
        student.id === currentStudent.id ? currentStudent : student
      ));
    } else {
      setStudents([...students, { ...currentStudent, id: Date.now() }]);
    }
    handleClose();
  };

  const handleEdit = (student) => {
    if (student.lockNomination) {
      return; // If the nomination is locked, prevent editing
    }
    setCurrentStudent(student);
    handleOpen();
  };

  const handleDelete = (id) => {
    setStudents(students.filter(student => student.id !== id));
  };

  const getStaffByRole = (role) => {
    if (!staffList || staffList.length === 0) {
      return [];
    }
    return staffList.filter(staff => staff.role === role);
  };

  // Function to import Excel data
  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const binaryStr = event.target.result;
        const workbook = XLSX.read(binaryStr, { type: 'binary' });
        const sheetName = workbook.SheetNames[0]; // Get the first sheet
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        // Process the imported data and add it to the student list
        const studentsFromExcel = data.map((student) => ({
          id: Date.now(),  
          name: student.Name,
          program: student.Program,
          evaluationType: student['Evaluation Type'],
          currentSemester: student['Current Semester'],
          mainSupervisor: student['Main Supervisor'],
          coSupervisor: student['Co Supervisor'],
          examiner1: student['Examiner 1'],
          examiner2: student['Examiner 2'],
          examiner3: student['Examiner 3'],
          chairperson: student['Chairperson'],
          postponeFSE: student['Postpone FSE'] === 'Yes' ? true : false, 
          lockNomination: student['Lock Nomination'] === 'Yes' ? true : false, // Set Lock Nomination
        }));

        setStudents([...students, ...studentsFromExcel]);
      };
      reader.readAsBinaryString(file);
    }
  };

  return (
    <>
      <Button variant="contained" color="primary" onClick={handleOpen}>
        Add Student
      </Button>
      <Input
        type="file"
        inputProps={{ accept: '.xlsx, .xls' }}
        onChange={handleExcelUpload}
        sx={{ mt: 2 }}
      />
  
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Program</TableCell>
              <TableCell>Evaluation Type</TableCell>
              <TableCell>Current Semester</TableCell>
              <TableCell>Main Supervisor</TableCell>
              <TableCell>Co-Supervisor</TableCell>
              <TableCell>Examiner 1</TableCell>
              <TableCell>Examiner 2</TableCell>
              <TableCell>Examiner 3</TableCell>
              <TableCell>Chairperson</TableCell>
              <TableCell>Postpone FSE</TableCell>
              <TableCell>Lock Nomination</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.program}</TableCell>
                <TableCell>{student.evaluationType}</TableCell>
                <TableCell>{student.currentSemester}</TableCell>
                <TableCell>{student.mainSupervisor}</TableCell>
                <TableCell>{student.coSupervisor}</TableCell>
                <TableCell>{student.examiner1}</TableCell>
                <TableCell>{student.examiner2}</TableCell>
                <TableCell>{student.examiner3}</TableCell>
                <TableCell>{student.chairperson}</TableCell>
                <TableCell>
                  <input 
                    type="checkbox" 
                    checked={student.postponeFSE} 
                    onChange={() => handlePostponeChange(student.id)} 
                  />
                </TableCell>
                <TableCell>
                  <input 
                    type="checkbox" 
                    checked={student.lockNomination} 
                    onChange={() => handleLockNominationChange(student.id)} 
                  />
                </TableCell>
                <TableCell>
                  <Button 
                    onClick={() => handleEdit(student)} 
                    disabled={student.lockNomination} // Disable Edit if Nomination is Locked
                  >
                    Edit
                  </Button>
                  <Button onClick={() => handleDelete(student.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
  
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{currentStudent.id ? 'Edit Student' : 'Add Student'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Student Name"
            fullWidth
            value={currentStudent.name}
            onChange={handleInputChange}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Program</InputLabel>
            <Select
              name="program"
              value={currentStudent.program}
              onChange={handleInputChange}
            >
              {PROGRAMS.map((program) => (
                <MenuItem key={program} value={program}>{program}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Evaluation Type</InputLabel>
            <Select
              name="evaluationType"
              value={currentStudent.evaluationType}
              onChange={handleInputChange}
            >
              {EVALUATION_TYPES.map((type) => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            name="currentSemester"
            label="Current Semester"
            fullWidth
            value={currentStudent.currentSemester}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default StudentList;
