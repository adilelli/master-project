import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from '@mui/material';

const StaffTable = ({ staff = [], handleEdit, handleDelete }) => {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Level</TableCell>
            <TableCell>Title</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Department</TableCell>
            <TableCell>Faculty</TableCell>
            <TableCell>University</TableCell>
            <TableCell>No of Sessions</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {staff.map((staffMember) => (
            <TableRow key={staffMember.id}>
              <TableCell>{staffMember.level}</TableCell>
              <TableCell>{staffMember.title}</TableCell>
              <TableCell>{staffMember.name}</TableCell>
              <TableCell>{staffMember.role}</TableCell>
              <TableCell>{staffMember.department}</TableCell>
              <TableCell>{staffMember.faculty}</TableCell>
              <TableCell>{staffMember.university}</TableCell>
              <TableCell>{staffMember.noOfSessions}</TableCell>
              <TableCell>
                <Button onClick={() => handleEdit(staffMember)}>Edit</Button>
                <Button onClick={() => handleDelete(staffMember.id)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default StaffTable;

