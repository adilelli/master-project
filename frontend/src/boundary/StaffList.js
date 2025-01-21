import React, { useState, useEffect, useRef } from 'react';
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
  Snackbar,
  Box
} from '@mui/material';
import { Download, Upload } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';
import { ROLES } from '../utils/constants';
import ApiService from '../controller/apiservice';  // Assuming ApiService is here

function StaffList() {
  const { staff = [], setStaff } = useDashboard();
  const [open, setOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [selectedRole, setSelectedRole] = useState('all');
  const fileInputRef = useRef(null);
  const [currentStaff, setCurrentStaff] = useState({
    userName: '',
    userRole: '',
    email:''
  });

  // Fetching the user data when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await ApiService.viewStaff(); // Assuming it fetches the staff data
        setStaff(response); // Set the staff data in context or local state
      } catch (error) {
        console.error("Error fetching staff data:", error);
        setSnackbar({
          open: true,
          message: 'Error fetching staff data. Please try again later.',
          severity: 'error'
        });
      }
    };

    fetchData(); // Call fetch function on mount
  }, [setStaff]); // Empty dependency array ensures this runs only once on mount

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setCurrentStaff({
      userName: '',
      userRole: '',
      email:''
    });
  };

  const handleInputChange = (e) => {
    setCurrentStaff({ ...currentStaff, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (currentStaff._id) {
      await ApiService.updateUser(currentStaff)
      const response = await ApiService.viewStaff(); // Assuming it fetches the staff data
      setStaff(response);
    } else {
      await ApiService.createUser(currentStaff.userName, currentStaff.userName, currentStaff.userRole, currentStaff.email)
      setStaff([...staff, { ...currentStaff, id: Date.now() }]);
    }
    handleClose();
  };

  const handleEdit = (staffMember) => {
    setCurrentStaff(staffMember);
    handleOpen();
  };

  // const handleDelete = (id) => {
  //   setStaff(staff.filter(s => s.id !== id));
  // };

  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value);
  };

  const filteredStaff = selectedRole === 'all' 
    ? staff 
    : staff.filter(s => s.role === selectedRole);

  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredStaff.map(staffMember => ({
      'Name': staffMember.userName,
      'Role': staffMember.userRole,
      'Email': staffMember.email
    })));
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Staff');
    XLSX.writeFile(workbook, 'staff_list.xlsx');
  };

  const handleImportExcel = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const formattedData = jsonData.map((row, index) => ({
          id: Date.now() + index,
          userName: row['Name'] || '',
          userRole: row['Role'] || 0,
          email: row['Email']|| ''
        }));

        const createData = jsonData.map((row, index) => ({
          userName: row['Name'] || '',
          userRole: row['Role'] || 0,
          email: row['Email']|| '',
          password: row['Email']|| '',
        }));

        console.log(JSON.stringify(createData))
        const created = await ApiService.createUsers(JSON.stringify(createData))
        const response = await ApiService.viewStaff(); // Assuming it fetches the staff data
        setStaff(response);

        let errorMsg = ""

        for(let i=0; i < created.errors.length; i++){
          errorMsg = errorMsg + created.errors[i].error + " | "
        }

        // setStaff(prevStaff => [...prevStaff, ...formattedData]);
        setSnackbar({
          open: true,
          message: `Created ${created.viewModel.length} users and error create ${created.errors.length} users. ${errorMsg}`,
          severity: 'info'
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

      {/* <Box sx={{ mb: 2 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Role</InputLabel>
          <Select
            value={selectedRole}
            onChange={handleRoleChange}
            label="Filter by Role"
          >
            <MenuItem value="all">All Roles</MenuItem>
            {ROLES.map((role) => (
              <MenuItem key={role} value={role}>
                {role}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box> */}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Email</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStaff.map((staffMember) => (
              <TableRow key={staffMember._id}>
                <TableCell>{staffMember.userName}</TableCell>
                <TableCell>{staffMember.userRole}</TableCell>
                <TableCell>{staffMember.email}</TableCell>
                <TableCell>
                  <Button onClick={() => handleEdit(staffMember)}>Edit</Button>
                  {/* <Button onClick={() => handleDelete(staffMember.id)}>Delete</Button> */}
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
            name="userName" // Update to match state key
            label="Name"
            fullWidth
            value={currentStaff.userName}
            onChange={handleInputChange}
            margin="normal"
          />
          <TextField
            name="userRole" // Update to match state key
            label="Role"
            fullWidth
            value={currentStaff.userRole}
            onChange={handleInputChange}
            margin="normal"
          />
          <TextField
            name="email" // Update to match state key
            label="Email"
            fullWidth
            value={currentStaff.email}
            onChange={handleInputChange}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Save</Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default StaffList;
