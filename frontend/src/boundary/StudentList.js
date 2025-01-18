import React, { useState } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Stack,
  CircularProgress,
  Typography
} from '@mui/material';  
import { Download } from 'lucide-react';
import { PROGRAMS, EVALUATION_TYPES } from '../utils/constants';
import { useDashboard } from '../context/DashboardContext';

function StudentList() {
  const { students = [], setStudents, staff = [], loading, error } = useDashboard();
  const [open, setOpen] = useState(false);
  const [filterPostponedFSE, setFilterPostponedFSE] = useState(false);
  const [currentStudent, setCurrentStudent] = useState({
    id: '',
    name: '',
    researchTitle: '', // Added research title
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
    lockNomination: false, 
  });

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setCurrentStudent({
      id: '',
      name: '',
      researchTitle: '',
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
      lockNomination: false, 
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

  const filteredStudents = filterPostponedFSE
    ? students.filter(student => student.postponeFSE)
    : students;

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

  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(students.map(student => ({
      'Name': student.name,
      'Research Title': student.researchTitle,
      'Program': student.program,
      'Evaluation Type': student.evaluationType,
      'Current Semester': student.currentSemester,
      'Main Supervisor': student.mainSupervisor,
      'Co-Supervisor': student.coSupervisor,
      'Examiner 1': student.examiner1,
      'Examiner 2': student.examiner2,
      'Examiner 3': student.examiner3,
      'Chairperson': student.chairperson,
      'Postpone FSE': student.postponeFSE ? 'Yes' : 'No',
      'Lock Nomination': student.lockNomination ? 'Yes' : 'No'
    })));
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    
    XLSX.writeFile(workbook, 'students_list.xlsx');
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">Error: {error}</Typography>;
  }

  return (
    <>
      <Stack direction="row" spacing={2} mb={2}>
        <Button variant="contained" color="primary" onClick={handleOpen}>
          Add Student
        </Button>
        <Button 
          variant="outlined" 
          startIcon={<Download />}
          onClick={handleDownloadExcel}
        >
          Download Excel
        </Button>
      </Stack>
      <FormControlLabel
        control={
          <Checkbox
            checked={filterPostponedFSE}
            onChange={(e) => setFilterPostponedFSE(e.target.checked)}
          />
        }
        label="Show only postponed FSE"
      />
      
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Research Title</TableCell>
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
            {filteredStudents.map((student) => (
              <TableRow key={student.id}>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.researchTitle}</TableCell>
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
                  <FormControlLabel
                    control={<Checkbox checked={student.postponeFSE} onChange={() => handlePostponeChange(student.id)} />}
                    label="Postpone"
                  />
                </TableCell>
                <TableCell>
                  <FormControlLabel
                    control={<Checkbox checked={student.lockNomination} onChange={() => handleLockNominationChange(student.id)} />}
                    label="Lock"
                  />
                </TableCell>
                <TableCell>
                  <Button 
                    onClick={() => handleEdit(student)} 
                    disabled={student.lockNomination} 
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

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{currentStudent.id ? 'Edit Student' : 'Add Student'}</DialogTitle>
        <DialogContent>
          <TextField
            name="name"
            label="Student Name"
            fullWidth
            value={currentStudent.name}
            onChange={handleInputChange}
            margin="normal"
          />
          
          <TextField
            name="researchTitle"
            label="Research Title"
            fullWidth
            value={currentStudent.researchTitle}
            onChange={handleInputChange}
            margin="normal"
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Program</InputLabel>
            <Select
              name="program"
              value={currentStudent.program}
              onChange={handleInputChange}
              label="Program"
            >
              {PROGRAMS.map((program) => (
                <MenuItem key={program} value={program}>
                  {program}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Evaluation Type</InputLabel>
            <Select
              name="evaluationType"
              value={currentStudent.evaluationType}
              onChange={handleInputChange}
              label="Evaluation Type"
            >
              {EVALUATION_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            name="currentSemester"
            label="Current Semester"
            fullWidth
            value={currentStudent.currentSemester}
            onChange={handleInputChange}
            margin="normal"
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Main Supervisor</InputLabel>
            <Select
              name="mainSupervisor"
              value={currentStudent.mainSupervisor}
              onChange={handleInputChange}
              label="Main Supervisor"
            >
              {staff && staff.length > 0 ? (
                staff.map((staffMember) => (
                  <MenuItem key={staffMember.id} value={staffMember.name}>
                    {staffMember.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No staff available</MenuItem>
              )}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Co-Supervisor</InputLabel>
            <Select
              name="coSupervisor"
              value={currentStudent.coSupervisor}
              onChange={handleInputChange}
              label="Co-Supervisor"
            >
              {staff && staff.length > 0 ? (
                staff.map((staffMember) => (
                  <MenuItem key={staffMember.id} value={staffMember.name}>
                    {staffMember.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No staff available</MenuItem>
              )}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Examiner 1</InputLabel>
            <Select
              name="examiner1"
              value={currentStudent.examiner1}
              onChange={handleInputChange}
              label="Examiner 1"
            >
              {staff && staff.length > 0 ? (
                staff.map((staffMember) => (
                  <MenuItem key={staffMember.id} value={staffMember.name}>
                    {staffMember.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No staff available</MenuItem>
              )}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Examiner 2</InputLabel>
            <Select
              name="examiner2"
              value={currentStudent.examiner2}
              onChange={handleInputChange}
              label="Examiner 2"
            >
              {staff && staff.length > 0 ? (
                staff.map((staffMember) => (
                  <MenuItem key={staffMember.id} value={staffMember.name}>
                    {staffMember.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No staff available</MenuItem>
              )}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Examiner 3</InputLabel>
            <Select
              name="examiner3"
              value={currentStudent.examiner3}
              onChange={handleInputChange}
              label="Examiner 3"
            >
              {staff && staff.length > 0 ? (
                staff.map((staffMember) => (
                  <MenuItem key={staffMember.id} value={staffMember.name}>
                    {staffMember.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No staff available</MenuItem>
              )}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Chairperson</InputLabel>
            <Select
              name="chairperson"
              value={currentStudent.chairperson}
              onChange={handleInputChange}
              label="Chairperson"
            >
              {staff && staff.length > 0 ? (
                staff.map((staffMember) => (
                  <MenuItem key={staffMember.id} value={staffMember.name}>
                    {staffMember.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No staff available</MenuItem>
              )}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {currentStudent.id ? 'Save' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default StudentList;

