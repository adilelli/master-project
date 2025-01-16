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

  const [programData, setProgramData] = useState([]);
  const [semesterData, setSemesterData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!staffList || staffList.length === 0) {
      console.warn('Staff list is not available yet.');
    }

    console.log('Students Data:', students);

    // Extract unique semesters from students
    const semesters = [...new Set(students.map(student => student.currentSemester))];
    console.log('Semesters:', semesters);

    // Group students by program
    const programGroupedData = ['PhD', 'MPhil', 'DSE'].map(program => {
      const programStudents = students.filter(s => s.program === program);
      const semesterCount = semesters.map(semester => 
        programStudents.filter(s => s.currentSemester === semester).length
      );

      return {
        name: program,
        ...semesters.reduce((acc, semester, index) => {
          acc[semester] = semesterCount[index] || 0; // Default to 0 if no students for the semester
          return acc;
        }, {}),
      };
    });

    setProgramData(programGroupedData);
    setSemesterData(semesters);
  }, [students, staffList]); // Re-run when students or staff list changes

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
    const updatedStudents = students.map(student => 
      student.id === id ? { ...student, lockNomination: !student.lockNomination } : student
    );
    
    console.log(updatedStudents); // Log to check if lockNomination is toggled
    setStudents(updatedStudents);
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

  // Function to import Excel data
  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLoading(true); // Start loading
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
        setLoading(false); // End loading
      };
      reader.readAsBinaryString(file);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <Input
        value={searchTerm}
        onChange={handleSearchChange}
        placeholder="Search for students"
        sx={{ mt: 2 }}
      />
      
      {loading && <div>Loading...</div>} {/* Show loading text while loading */}
  
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
            {filteredStudents.map((student) => (
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
                <MenuItem key={program} value={program}>
                  {program}
                </MenuItem>
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
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
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
          <TextField
            margin="dense"
            name="examiner1"
            label="Examiner 1"
            fullWidth
            value={currentStudent.examiner1}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="examiner2"
            label="Examiner 2"
            fullWidth
            value={currentStudent.examiner2}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="examiner3"
            label="Examiner 3"
            fullWidth
            value={currentStudent.examiner3}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="chairperson"
            label="Chairperson"
            fullWidth
            value={currentStudent.chairperson}
            onChange={handleInputChange}
          />
  
          <FormControl fullWidth margin="dense">
            <InputLabel>Postpone FSE</InputLabel>
            <Select
              name="postponeFSE"
              value={currentStudent.postponeFSE}
              onChange={handleInputChange}
            >
              <MenuItem value={false}>No</MenuItem>
              <MenuItem value={true}>Yes</MenuItem>
            </Select>
          </FormControl>
  
          <FormControl fullWidth margin="dense">
            <InputLabel>Lock Nomination</InputLabel>
            <Select
              name="lockNomination"
              value={currentStudent.lockNomination}
              onChange={handleInputChange}
            >
              <MenuItem value={false}>No</MenuItem>
              <MenuItem value={true}>Yes</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
  
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default StudentList;
