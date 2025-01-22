import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
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
  const [success] = useState(false);
  const [, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Make the API call
      const response = await ApiService.resetPasswordRequest(email);
      console.log(response.message)

      // Extract the token from the response message
      const token = response.message; // Assuming response.message contains the URL

      // Navigate to the reset-password page with the token
      navigate(`/reset-password/${token}`);
    } catch (err) {
      // Handle errors, e.g., show an error message
      setError(err.response?.data?.detail || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
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
      </Box>
    )
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
    </Box>
  );
}

export default PasswordReset;

