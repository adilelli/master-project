import React, { useState, useEffect } from 'react';
import ApiService from '../controller/apiservice';
import * as XLSX from 'xlsx';
import { PROGRAMS, EVALUATION_TYPES } from '../utils/constants';
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
import { useDashboard } from '../context/DashboardContext';
import { Download, Upload } from 'lucide-react';

function StudentList() {
  const { students = [], setStudents, loading, error } = useDashboard();
  const [open, setOpen] = useState(false);
  const [filterPostponedFSE, setFilterPostponedFSE] = useState(false);
  const role = localStorage.getItem('userRole')
  const name = localStorage.getItem('userName')
    const [staff, setCurrentStaff] = useState({
      userName: '',
      userRole: '',
    });
  const [currentStudent, setCurrentStudent] = useState({
    _id: '',
    studentId: '',
    researchTitle: '', // Added research title
    programType: '',
    evaluationType: '',
    semester: '',
    supervisorId: '',
    coSupervisorId: '',
    examinerId1: '',
    examinerId2: '',
    examinerId3: '',
    chairpersonId: '',
    postponeStatus: 'ONGOING', 
    lockStatus: 'UNLOCK', 
  });

  // Fetch evaluations when the component mounts
  useEffect(() => {
    fetchEvaluations();
    fetchProf();
  }, []);

  const fetchEvaluations = async () => {
    if (role === '1' || role === '2') {
      // Fetch all evaluations
      let response = await ApiService.viewEvaluations();
      setStudents(response)
    } else if (role === '3' || role === '4') {
      // Fetch evaluations supervised by the user
      let response = await ApiService.viewSupervisedEvaluations(name);
      setStudents(response)
    }
  };

  const fetchProf = async () => {
    try {
      const response = await ApiService.viewUser(3); // Assuming it fetches the staff data
      setCurrentStaff(response); // Set the staff data in context or local state
    } catch (error) {
      console.error("Error fetching staff data:", error);
    }
  };

  const handleOpenUpdate = async (id) => {
    const dataForUpdate = await ApiService.viewEvaluationsbyId(id)
      // Check if the response is an array and has at least one item
  if (dataForUpdate && dataForUpdate.length > 0) {
    const studentData = dataForUpdate[0]; // Access the first element
    console.log(studentData.studentId)
    // Map the API response data to the currentStudent state
    setCurrentStudent({
      _id: studentData._id,
      studentId: studentData.studentId || '', // Example mapping
      researchTitle: studentData.researchTitle || '',
      programType: studentData.programType || '',
      evaluationType: studentData.evaluationType || '',
      semester: studentData.semester || '',
      supervisorId: studentData.supervisorId || '',
      coSupervisorId: studentData.coSupervisorId || '',
      examinerId1: studentData.examinerId1 || '',
      examinerId2: studentData.examinerId2 || '',
      examinerId3: studentData.examinerId3 || '',
      chairpersonId: studentData.chairpersonId || '',
      postponeStatus: studentData.postponeStatus || 'ONGOING',
      lockStatus: studentData.lockStatus || 'UNLOCK',
    });
  }
    setOpen(true)
  }

  const handleOpen = () => {
    setOpen(true)
  }
  const handleClose = () => {
    setOpen(false);
    setCurrentStudent({
      _id: '',
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
      postponeFSE: 'ONGOING', 
      lockStatus: 'UNLOCK', 
    });
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

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setCurrentStudent((prevStudent) => ({
      ...prevStudent,
      [name]: value,
    }));
  };
  

  const handleSubmit = async () => {
    console.log(role)
    if (role === '1') {
      if(currentStudent._id){
        await ApiService.updateEvaluation(currentStudent._id, currentStudent); 
      }else{
        await ApiService.prepareEvaluation(currentStudent);
      }
    } else if (role === '2') {
      console.log(JSON.stringify(currentStudent))
      await ApiService.addOrUpdateChairperson(currentStudent._id, currentStudent)
    }else if (role === '3' || role === '4') {
      await ApiService.addOrUpdateExaminer(currentStudent._id, currentStudent);
    }

    fetchEvaluations();
    // else {
    //   setStudents([...students, { ...currentStudent, id: Date.now() }]);
    // }
    handleClose();
  };

  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(students.map(student => ({
      'Name': student.studentId,
      'Research Title': student.researchTitle,
      'Program': student.programType,
      'Semester': student.semester,
      'Evaluation Type': student.evaluationType,
      'Postpone FSE': student.postponeStatus,
      'Supervisor': student.supervisorId,
      'Co Supervisor': student.coSupervisorId,
      'Examiner1': student.examinerId1,
      'Examiner2': student.examinerId2,
      'Examiner3': student.examinerId3,
      'Chairperson': student.chairpersonId,
      'Lock Status': student.lockStatus,
    })));
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Staff');
    XLSX.writeFile(workbook, 'student_list.xlsx');
  };

  const handleDownloadExaminer = async () => {
    const response = await ApiService.viewExaminerCount();
    const worksheet = XLSX.utils.json_to_sheet(
      Object.entries(response.viewModel).map(([name, count]) => ({ name, count }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Staff');
    XLSX.writeFile(workbook, 'examiner_list.xlsx');
  }

    const handleDownloadChairperson = async () => {
      const response = await ApiService.viewChairpersonCount();
      const worksheet = XLSX.utils.json_to_sheet(
        Object.entries(response.viewModel).map(([name, count]) => ({ name, count }))
      );
      
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Staff');
      XLSX.writeFile(workbook, 'chairperson_list.xlsx');
    };

  const filteredStudents = filterPostponedFSE
    ? students.filter(student => student.postponeFSE)
    : students;

  return (
    <>
     <Stack direction="row" spacing={2} mb={2}>
        <Button variant="contained" color="primary" onClick={handleOpen}>
          Add Evaluation
        </Button>
        <Button variant="outlined" startIcon={<Upload />} component="label">
          Upload Excel
          <input
            type="file"
            accept=".xlsx,.xls"
            hidden
            onChange={handleExcelUpload}
          />
        </Button>
        {role === "2" && (
          <>
            <Button 
              variant="outlined" 
              startIcon={<Download />}
              onClick={handleDownloadExcel}
            >
              Download Evaluation
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<Download />}
              onClick={handleDownloadExaminer}
            >
              Download Examiner
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<Download />}
              onClick={handleDownloadChairperson}
            >
              Download Chairperson
            </Button>
          </>
        )}
        {/* <FormControlLabel
          control={
            <Checkbox
              checked={filterPostponedFSE}
              onChange={(e) => setFilterPostponedFSE(e.target.checked)}
            />
          }
          label="Show only postponed FSE"
        /> */}
      </Stack>


      
      {loading && <CircularProgress />}
      {error && <Typography color="error">Error: {error}</Typography>}

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Research Title</TableCell>
              <TableCell>Program</TableCell>
              <TableCell>Semester</TableCell>
              <TableCell>Evaluation Type</TableCell>
              <TableCell>Postpone FSE</TableCell>
              <TableCell>Supervisor</TableCell>
              <TableCell>Co Supervisor</TableCell>
              <TableCell>Examiner1</TableCell>
              <TableCell>Examiner2</TableCell>
              <TableCell>Examiner3</TableCell>
              <TableCell>Chairperson</TableCell>
              <TableCell>Lock Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStudents.map((student, index) => (
              <TableRow key={student._id}>
                <TableCell onClick={() => handleOpenUpdate(student._id)}>{student.studentId}</TableCell>
                <TableCell onClick={() => handleOpenUpdate(student._id)}>{student.researchTitle}</TableCell>
                <TableCell>{student.programType}</TableCell>
                <TableCell>{student.semester}</TableCell>
                <TableCell>{student.evaluationType}</TableCell>
                {/* <TableCell>
                  <FormControlLabel
                    control={<Checkbox checked={student.postponeStatus} />}
                    label="Postpone"
                  />
                </TableCell> */}
                <TableCell>{student.postponeStatus}</TableCell>
                <TableCell>{student.supervisorId}</TableCell>
                <TableCell>{student.coSupervisorId}</TableCell>
                <TableCell>{student.examinerId1}</TableCell>
                <TableCell>{student.examinerId2}</TableCell>
                <TableCell>{student.examinerId3}</TableCell>
                <TableCell>{student.chairpersonId}</TableCell>
                <TableCell>{student.lockStatus}</TableCell>
                <TableCell>
                  <Button onClick={() => handleOpenUpdate(student._id)}>Edit</Button>
                  {/* <Button onClick={() => handleDelete(staffMember.id)}>Delete</Button> */}
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
            name="studentId"
            label="Student Name"
            fullWidth
            value={currentStudent.studentId}
            onChange={handleInputChange}
            margin="normal"
            disabled={role !== '1' }
          />
          
          <TextField
            name="researchTitle"
            label="Research Title"
            fullWidth
            value={currentStudent.researchTitle}
            onChange={handleInputChange}
            margin="normal"
            disabled={role === '1' || role === '2'}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Program</InputLabel>
            <Select
              name="programType"
              value={currentStudent.programType || ''}
              onChange={handleInputChange}
              label="Program"
              disabled={role !== '1' }
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
              value={currentStudent.evaluationType || ''}
              onChange={handleInputChange}
              label="Evaluation Type"
              disabled={role !== '1' }
            >
              {EVALUATION_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            name="semester"
            label="Current Semester"
            fullWidth
            value={currentStudent.semester || ''}
            onChange={handleInputChange}
            margin="normal"
            disabled={role !== '1' }
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Main Supervisor</InputLabel>
            <Select
              name="supervisorId"
              value={currentStudent.supervisorId || ''}
              onChange={handleInputChange}
              label="Main Supervisor"
              disabled={role !== '1' }
            >
              {staff && staff.length > 0 ? (
                staff.map((staffMember) => (
                  <MenuItem key={staffMember._id} value={staffMember.userName}>
                    {staffMember.userName}
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
              name="coSupervisorId"
              value={currentStudent.coSupervisorId || ''}
              onChange={handleInputChange}
              label="Co-Supervisor"
              disabled={role !== '1' }
            >
              {staff && staff.length > 0 ? (
                staff.map((staffMember) => (
                  <MenuItem key={staffMember.id} value={staffMember.userName}>
                    {staffMember.userName}
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
              name="examinerId1"
              value={currentStudent.examinerId1 || ''}
              onChange={handleInputChange}
              label="Examiner 1"
              disabled={role === '1' || role === '2' || currentStudent.lockStatus === "LOCK"} // Disable if role is not AP or P
            >
              {staff && staff.length > 0 ? (
                staff.map((staffMember) => (
                  <MenuItem key={staffMember.id} value={staffMember.userName}>
                    {staffMember.userName}
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
              name="examinerId2"
              value={currentStudent.examinerId2 || ''}
              onChange={handleInputChange}
              label="Examiner 2"
              disabled={role === '1' || role === '2' || currentStudent.lockStatus === "LOCK"} // Disable if role is not AP or P
            >
              {staff && staff.length > 0 ? (
                staff.map((staffMember) => (
                  <MenuItem key={staffMember.id} value={staffMember.userName}>
                    {staffMember.userName}
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
              name="examinerId3"
              value={currentStudent.examinerId3 || ''}
              onChange={handleInputChange}
              label="Examiner 3"
              disabled={role === '1' || role === '2' || currentStudent.lockStatus === "LOCK"} // Disable if role is not AP or P
            >
              {staff && staff.length > 0 ? (
                staff.map((staffMember) => (
                  <MenuItem key={staffMember.id} value={staffMember.userName}>
                    {staffMember.userName}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No staff available</MenuItem>
              )}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Postpone FSE</InputLabel>
            <Select
              name="postponeStatus"
              value={currentStudent.postponeStatus} // Explicitly handle undefined
              onChange={handleInputChange}
              label="Co-Supervisor"
              disabled={role === '1' || role === '2'} 
            >
              <MenuItem value="ONGOING">ONGOING</MenuItem>
              <MenuItem value="POSTPONED">POSTPONED</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Chairperson</InputLabel>
            <Select
              name="chairpersonId"
              value={currentStudent.chairpersonId || ''}
              onChange={handleInputChange}
              label="Chairperson"
              disabled={role !== '2' } // Disable if role is not AP or P
            >
              {staff && staff.length > 0 ? (
                staff.map((staffMember) => (
                  <MenuItem key={staffMember.id} value={staffMember.userName}>
                    {staffMember.userName}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No staff available</MenuItem>
              )}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Lock Nomination</InputLabel>
            <Select
              name="lockStatus"
              value={currentStudent.lockStatus}
              onChange={handleInputChange}
              label="Co-Supervisor"
              disabled={role !== '2' } 
            >
              <MenuItem value="UNLOCK">UNLOCK</MenuItem>
              <MenuItem value="LOCK">LOCK</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {currentStudent._id ? 'Save' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default StudentList;
