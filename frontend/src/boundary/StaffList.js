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
import { DEPARTMENTS, FACULTIES } from '../utils/constants';
import { useDashboard } from '../context/DashboardContext';

function StaffList() {
  const { staff, setStaff } = useDashboard();
  const [open, setOpen] = useState(false);
  const [currentStaff, setCurrentStaff] = useState({
    name: '',
    role: '',
    department: '',
    faculty: '',
    university: 'Universiti Teknologi Malaysia'
  });

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setCurrentStaff({
      name: '',
      role: '',
      department: '',
      faculty: '',
      university: 'Universiti Teknologi Malaysia'
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

  return (
    <>
      <Button variant="contained" color="primary" onClick={handleOpen}>
        Add Staff
      </Button>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Faculty</TableCell>
              <TableCell>University</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {staff.map((staffMember) => (
              <TableRow key={staffMember.id}>
                <TableCell>{staffMember.name}</TableCell>
                <TableCell>{staffMember.role}</TableCell>
                <TableCell>{staffMember.department}</TableCell>
                <TableCell>{staffMember.faculty}</TableCell>
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
          <FormControl fullWidth margin="dense">
            <InputLabel>Role</InputLabel>
            <Select
              name="role"
              value={currentStaff.role}
              onChange={handleInputChange}
            >
              <MenuItem value="Main Supervisor">Main Supervisor</MenuItem>
              <MenuItem value="Co-Supervisor">Co-Supervisor</MenuItem>
              <MenuItem value="Examiner">Examiner</MenuItem>
              <MenuItem value="Chairperson">Chairperson</MenuItem>
            </Select>
          </FormControl>
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
          <TextField
            margin="dense"
            name="university"
            label="University/Organization"
            fullWidth
            value={currentStaff.university}
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

export default StaffList;

