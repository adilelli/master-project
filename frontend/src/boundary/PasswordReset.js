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
import ApiService from '../controller/apiservice';

function PasswordReset({ onBack }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await ApiService.initiatePasswordReset(email);
      setSuccess(true);
    } catch (error) {
      setError('Failed to initiate password reset. Please try again.');
    }
  };

  if (success) {
    return (
      <Card sx={{ maxWidth: 400, width: '100%' }}>
        <CardContent>
          <Alert severity="success">
            A password reset link has been sent to your email. Please check your inbox and follow the instructions.
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
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            Send Reset Link
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

