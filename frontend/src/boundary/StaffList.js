import React, { useState, useRef } from 'react';
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
  Stack,
  Typography,
  Alert,
  Snackbar
} from '@mui/material';
import { Download, Upload } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

function StaffList() {
  const { staff = [], setStaff } = useDashboard();
  const [open, setOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const fileInputRef = useRef(null);
  const [currentStaff, setCurrentStaff] = useState({
    id: '',
    name: '',
    title: '',
    role: '',
    level: '',
    department: '',
    faculty: '',
    sessionCount: 0,
    university: ''
  });

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setCurrentStaff({
      id: '',
      name: '',
      title: '',
      role: '',
      level: '',
      department: '',
      faculty: '',
      sessionCount: 0,
      university: ''
    });
  };

  const handleInputChange = (e) => {
    setCurrentStaff({ ...currentStaff, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (currentStaff.id) {
      setStaff(staff.map(s => 
        s.id === currentStaff.id ? currentStaff : s
      ));
    } else {
      setStaff([...staff, { ...currentStaff, id: Date.now() }]);
    }
    handleClose();
  };

  const handleEdit = (staffMember) => {
    setCurrentStaff(staffMember);
    handleOpen();
  };

  const handleDelete = (id) => {
    setStaff(staff.filter(s => s.id !== id));
  };

  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(staff.map(staffMember => ({
      'Name': staffMember.name,
      'Title': staffMember.title,
      'Role': staffMember.role,
      'Level': staffMember.level,
      'Department': staffMember.department,
      'Faculty': staffMember.faculty,
      'Session Count': staffMember.sessionCount,
      'University': staffMember.university
    })));
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Staff');
    XLSX.writeFile(workbook, 'staff_list.xlsx');
  };

  const handleImportExcel = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const formattedData = jsonData.map((row, index) => ({
          id: Date.now() + index,
          name: row['Name'] || '',
          title: row['Title'] || '',
          role: row['Role'] || '',
          level: row['Level'] || '',
          department: row['Department'] || '',
          faculty: row['Faculty'] || '',
          sessionCount: row['Session Count'] || 0,
          university: row['University'] || ''
        }));

        setStaff(prevStaff => [...prevStaff, ...formattedData]);
        setSnackbar({
          open: true,
          message: `Successfully imported ${formattedData.length} staff members`,
          severity: 'success'
        });
      } catch (error) {
        console.error('Error importing Excel file:', error);
        setSnackbar({
          open: true,
          message: 'Error importing Excel file. Please check the file format.',
          severity: 'error'
        });
      }
    };
    reader.readAsArrayBuffer(file);
    // Reset file input
    event.target.value = '';
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <Stack direction="row" spacing={2} mb={2}>
        <Button variant="contained" color="primary" onClick={handleOpen}>
          Add Staff
        </Button>
        <Button 
          variant="outlined" 
          startIcon={<Upload />}
          onClick={handleImportClick}
        >
          Import Excel
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          hidden
          accept=".xlsx, .xls"
          onChange={handleImportExcel}
        />
        <Button 
          variant="outlined" 
          startIcon={<Download />}
          onClick={handleDownloadExcel}
        >
          Download Excel
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Level</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Faculty</TableCell>
              <TableCell>Session Count</TableCell>
              <TableCell>University</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {staff.map((staffMember) => (
              <TableRow key={staffMember.id}>
                <TableCell>{staffMember.name}</TableCell>
                <TableCell>{staffMember.title}</TableCell>
                <TableCell>{staffMember.role}</TableCell>
                <TableCell>{staffMember.level}</TableCell>
                <TableCell>{staffMember.department}</TableCell>
                <TableCell>{staffMember.faculty}</TableCell>
                <TableCell>{staffMember.sessionCount}</TableCell>
                <TableCell>{staffMember.university}</TableCell>
                <TableCell>
                  <Button onClick={() => handleEdit(staffMember)}>Edit</Button>
                  <Button onClick={() => handleDelete(staffMember.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{currentStaff.id ? 'Edit Staff' : 'Add Staff'}</DialogTitle>
        <DialogContent>
          <TextField
            name="name"
            label="Name"
            fullWidth
            value={currentStaff.name}
            onChange={handleInputChange}
            margin="normal"
          />
          <TextField
            name="title"
            label="Title"
            fullWidth
            value={currentStaff.title}
            onChange={handleInputChange}
            margin="normal"
          />
          <TextField
            name="role"
            label="Role"
            fullWidth
            value={currentStaff.role}
            onChange={handleInputChange}
            margin="normal"
          />
          <TextField
            name="level"
            label="Level"
            fullWidth
            value={currentStaff.level}
            onChange={handleInputChange}
            margin="normal"
          />
          <TextField
            name="department"
            label="Department"
            fullWidth
            value={currentStaff.department}
            onChange={handleInputChange}
            margin="normal"
          />
          <TextField
            name="faculty"
            label="Faculty"
            fullWidth
            value={currentStaff.faculty}
            onChange={handleInputChange}
            margin="normal"
          />
          <TextField
            name="sessionCount"
            label="Session Count"
            type="number"
            fullWidth
            value={currentStaff.sessionCount}
            onChange={handleInputChange}
            margin="normal"
          />
          <TextField
            name="university"
            label="University"
            fullWidth
            value={currentStaff.university}
            onChange={handleInputChange}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {currentStaff.id ? 'Save' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default StaffList;

