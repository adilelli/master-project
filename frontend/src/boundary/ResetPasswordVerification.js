import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  Alert, 
  Box 
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { validatePassword } from '../utils/validation';
import ApiService from '../controller/apiservice';

function ResetPasswordVerification() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Verify the token when the component mounts
    const verifyToken = async () => {
      try {
        await ApiService.verifyResetToken(token);
      } catch (error) {
        setError('Invalid or expired token. Please try resetting your password again.');
      }
    };
    verifyToken();
  }, [token]);

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
    try {
      await ApiService.resetPassword(token, newPassword);
      setSuccess(true);
    } catch (error) {
      setError('Failed to reset password. Please try again.');
    }
  };

  if (success) {
    return (
      <Card sx={{ maxWidth: 400, width: '100%', margin: 'auto', mt: 4 }}>
        <CardContent>
          <Alert severity="success">
            Your password has been reset successfully.
          </Alert>
          <Button 
            onClick={() => navigate('/')} 
            fullWidth 
            variant="contained" 
            sx={{ mt: 2 }}
          >
            Go to Login
          </Button>
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
              sx={{ mt: 3 }}
            >
              Reset Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}

export default ResetPasswordVerification;

