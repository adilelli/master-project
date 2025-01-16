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
import { DEPARTMENTS, FACULTIES } from '../utils/constants';
import { useDashboard } from '../context/DashboardContext';
import ApiService from '../controller/apiservice';

function StaffList() {
  const { staff, setStaff } = useDashboard();
  const [open, setOpen] = useState(false);
  const [currentStaff, setCurrentStaff] = useState({
    name: '',
    title: 'Dr',
    role: '',
    level: '',
    department: '',
    faculty: '',
    sessionCount: 0,
    university: 'Universiti Teknologi Malaysia',
  });
  const [selectedRole, setSelectedRole] = useState('');  // State for role filter

  useEffect(() => {
    const fetchData = async () => {
      try {
        const staffList = await ApiService.viewStaff();
        console.log('Staff List:', staffList);
        setStaff(staffList || []); // Ensure staffList is always an array
      } catch (error) {
        console.error('Error fetching staff:', error);
      }
    };

    fetchData();
  }, [setStaff]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setCurrentStaff({
      name: '',
      title: 'Dr',
      role: '',
      level: '',
      department: '',
      faculty: '',
      sessionCount: 0,
      university: 'Universiti Teknologi Malaysia',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentStaff({ ...currentStaff, [name]: value });
  };

  const handleSubmit = () => {
    if (currentStaff.id) {
      setStaff(staff.map((s) => (s.id === currentStaff.id ? currentStaff : s)));
    } else {
      // Add to the top of the array to ensure new data appears at the top of the table
      setStaff([currentStaff, ...staff]);
    }
    handleClose();
  };

  const handleEdit = (staffMember) => {
    setCurrentStaff(staffMember);
    handleOpen();
  };

  const handleDelete = (id) => {
    setStaff(staff.filter((s) => s.id !== id));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const binaryStr = event.target.result;
        const workbook = XLSX.read(binaryStr, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);

        // Process Excel data and add to staff list
        const importedStaff = data.map((row, index) => ({
          id: Date.now() + index, // Generate unique IDs
          name: row.Name || '',
          title: row.Title || 'Dr', // Default to 'Dr' if not provided
          role: row.Role || '',
          level: row.Level || '',
          sessionCount: row['Session Count'] || 0,
          department: row.Department || '',
          faculty: row.Faculty || '',
          university: row.University || 'Universiti Teknologi Malaysia',
        }));

        // Add the imported staff data to the top of the list
        setStaff([...importedStaff, ...staff]); // Ensures new data goes to the top
      };
      reader.readAsBinaryString(file);
    }
  };

  // Filter staff based on the selected role
  const filteredStaff = selectedRole ? staff.filter((s) => s.role === selectedRole) : staff;

  return (
    <>
      {/* Role Filter Dropdown */}
      <FormControl fullWidth margin="dense">
        <InputLabel>Filter by Role</InputLabel>
        <Select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          label="Filter by Role"
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="Supervisor">Supervisor</MenuItem>
          <MenuItem value="Examiner">Examiner</MenuItem>
          <MenuItem value="Chairperson">Chairperson</MenuItem>
          {/* Add more roles as needed */}
        </Select>
      </FormControl>

      {/* Add Staff and Import Excel Buttons */}
      <Button variant="contained" color="primary" onClick={handleOpen}>
        Add Staff
      </Button>
      <Button
        variant="contained"
        color="secondary"
        component="label"
        sx={{ ml: 2 }}
      >
        Import Excel
        <input
          type="file"
          accept=".xlsx, .xls"
          hidden
          onChange={handleFileUpload}
        />
      </Button>

      {/* Staff Table */}
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Level</TableCell>
              <TableCell>Session Count</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Faculty</TableCell>
              <TableCell>University</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStaff?.length > 0 ? (
              filteredStaff.map((staffMember) => (
                <TableRow key={staffMember.id}>
                  <TableCell>{staffMember.name}</TableCell>
                  <TableCell>{staffMember.title}</TableCell>
                  <TableCell>{staffMember.role}</TableCell>
                  <TableCell>{staffMember.level}</TableCell>
                  <TableCell>{staffMember.sessionCount}</TableCell>
                  <TableCell>{staffMember.department}</TableCell>
                  <TableCell>{staffMember.faculty}</TableCell>
                  <TableCell>{staffMember.university}</TableCell>
                  <TableCell>
                    <Button onClick={() => handleEdit(staffMember)}>Edit</Button>
                    <Button onClick={() => handleDelete(staffMember.id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  No staff data available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Staff Dialog (Add/Edit) */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{currentStaff.id ? 'Edit Staff' : 'Add Staff'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Staff Name"
            fullWidth
            value={currentStaff.name}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="title"
            label="Title"
            fullWidth
            value={currentStaff.title}
            disabled
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Role</InputLabel>
            <Select
              name="role"
              value={currentStaff.role}
              onChange={handleInputChange}
            >
              <MenuItem value="Supervisor">Supervisor</MenuItem>
              <MenuItem value="Examiner">Examiner</MenuItem>
              <MenuItem value="Chairperson">Chairperson</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Level</InputLabel>
            <Select
              name="level"
              value={currentStaff.level}
              onChange={handleInputChange}
            >
              <MenuItem value="Professor">Professor</MenuItem>
              <MenuItem value="Associate Professor">Associate Professor</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            name="sessionCount"
            label="Session Count"
            type="number"
            fullWidth
            value={currentStaff.sessionCount}
            onChange={handleInputChange}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Department</InputLabel>
            <Select
              name="department"
              value={currentStaff.department}
              onChange={handleInputChange}
            >
              {DEPARTMENTS.map((dept) => (
                <MenuItem key={dept} value={dept}>{dept}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Faculty</InputLabel>
            <Select
              name="faculty"
              value={currentStaff.faculty}
              onChange={handleInputChange}
            >
              {FACULTIES.map((faculty) => (
                <MenuItem key={faculty} value={faculty}>{faculty}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary">
            {currentStaff.id ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default StaffList;
