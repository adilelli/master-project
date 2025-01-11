import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  Alert, 
  Box 
} from '@mui/material';
import { validatePassword } from '../utils/validation';
import ApiService from '../controller/apiservice';

function FirstTimeLogin({ id }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validatePassword(newPassword)) {
      setError('Password must be 8-16 characters long and contain both letters and numbers.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    // Here you would typically call an API to change the password
    const updateUserData = {
      "userName":localStorage.getItem('userName'),
      "password": newPassword
    };

    console.log(updateUserData);

    const response = await ApiService.updateUser(updateUserData);
    setSuccess(true);

  };

  if (success) {
    return (
      <Card sx={{ maxWidth: 400, width: '100%' }}>
        <CardContent>
          <Alert severity="success">
            Your password has been changed successfully. You can now log in with your new password.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box 
      display="flex" 
      justifyContent="center" 
      alignItems="center" 
      minHeight="100vh"
      bgcolor="background.default"
    >
      <Card sx={{ maxWidth: 400, width: '100%' }}>
        <CardContent>
          <Typography variant="h5" component="h1" gutterBottom>
            Change Password
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            You must change your password before continuing.
          </Alert>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              margin="normal"
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3 }}
            >
              Change Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}

export default FirstTimeLogin;

