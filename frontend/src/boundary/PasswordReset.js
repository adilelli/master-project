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

function PasswordReset({ onBack }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validatePassword(newPassword)) {
      setError('Password must be 8-16 characters long and contain both letters and numbers.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    // Here you would typically call an API to reset the password
    setSuccess(true);
  };

  if (success) {
    return (
      <Card sx={{ maxWidth: 400, width: '100%' }}>
        <CardContent>
          <Alert severity="success">
            Your password has been reset successfully.
          </Alert>
          <Button 
            onClick={onBack} 
            fullWidth 
            variant="contained" 
            sx={{ mt: 2 }}
          >
            Back to Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ maxWidth: 400, width: '100%' }}>
      <CardContent>
        <Typography variant="h5" component="h1" gutterBottom>
          Reset Password
        </Typography>
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
            sx={{ mt: 3, mb: 2 }}
          >
            Reset Password
          </Button>
        </form>
        <Button
          fullWidth
          onClick={onBack}
        >
          Back to Login
        </Button>
      </CardContent>
    </Card>
  );
}

export default PasswordReset;

