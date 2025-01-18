import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';

function StudentSummaryTable({ students }) {
  // Get unique programs and semesters
  const programs = [...new Set(students.map(student => student.program))].sort();
  const semesters = [...new Set(students.map(student => student.currentSemester))].sort();

  // Create data for the table
  const tableData = semesters.map(semester => {
    const row = { semester };
    programs.forEach(program => {
      row[program] = students.filter(s => 
        s.program === program && 
        s.currentSemester === semester
      ).length;
    });
    return row;
  });

  // Calculate totals
  const totals = programs.reduce((acc, program) => {
    acc[program] = students.filter(s => s.program === program).length;
    return acc;
  }, {});

  return (
    <TableContainer component={Paper} sx={{ mt: 4, mb: 4 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell><strong>Semester</strong></TableCell>
            {programs.map(program => (
              <TableCell key={program} align="center">
                <strong>{program}</strong>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {tableData.map((row) => (
            <TableRow key={row.semester}>
              <TableCell>Semester {row.semester}</TableCell>
              {programs.map(program => (
                <TableCell key={`${row.semester}-${program}`} align="center">
                  {row[program]}
                </TableCell>
              ))}
            </TableRow>
          ))}
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
            {programs.map(program => (
              <TableCell key={`total-${program}`} align="center" sx={{ fontWeight: 'bold' }}>
                {totals[program]}
              </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default StudentSummaryTable;

