import React, { useState } from 'react';
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
  InputLabel
} from '@mui/material';
import { PROGRAMS, EVALUATION_TYPES } from '../utils/constants';
import { useDashboard } from '../context/DashboardContext';

function StudentList() {
  const { students, setStudents } = useDashboard();
  const [open, setOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState({
    name: '',
    program: '',
    evaluationType: '',
    currentSemester: '',
    mainSupervisor: '',
    coSupervisor: ''
  });

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setCurrentStudent({
      name: '',
      program: '',
      evaluationType: '',
      currentSemester: '',
      mainSupervisor: '',
      coSupervisor: ''
    });
  };

  const handleInputChange = (e) => {
    setCurrentStudent({ ...currentStudent, [e.target.name]: e.target.value });
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
    setCurrentStudent(student);
    handleOpen();
  };

  const handleDelete = (id) => {
    setStudents(students.filter(student => student.id !== id));
  };

  return (
    <>
      <Button variant="contained" color="primary" onClick={handleOpen}>
        Add Student
      </Button>
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
                <TableCell>
                  <Button onClick={() => handleEdit(student)}>Edit</Button>
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
          <TextField
            margin="dense"
            name="mainSupervisor"
            label="Main Supervisor"
            fullWidth
            value={currentStudent.mainSupervisor}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="coSupervisor"
            label="Co-Supervisor"
            fullWidth
            value={currentStudent.coSupervisor}
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

