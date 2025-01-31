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
import PasswordReset from './PasswordReset';
import FirstTimeLogin from './FirstTimeLogin';
import ApiService from '../controller/apiservice';
import { jwtDecode } from "jwt-decode";
import { ApiOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';


function LoginPage() {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [attempts, setAttempts] = useState(3);
  const [error, setError] = useState('');
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [isFirstTimeLogin, setIsFirstTimeLogin] = useState(false);
  const navigate = useNavigate();
  

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const login = await ApiService.login(id, password);
      
      if (login.viewModel != null) {
        const decoded = jwtDecode(login.viewModel.access_token);
        localStorage.setItem('accessToken', login.viewModel.access_token);
        localStorage.setItem('userName', id);
        localStorage.setItem('userRole', decoded.role);
        localStorage.setItem('exp', decoded.exp);
  
        // const accessToken = localStorage.getItem('accessToken');
        alert("Success Login");
  
        if (login.viewModel.access_token) {
          const response = await ApiService.viewProfile();
          if(response[0].firstTimer === true){
            setIsFirstTimeLogin(true);
          }else{
            navigate('/dashboard');
          }
          
        } else {
          handleInvalidLogin();
        }
      } else {
        handleInvalidLogin();
      }
    } catch (error) {
      console.error("An error occurred during login:", error);
      setError("An error occurred during login:", error);
    }
  };
  
  const handleInvalidLogin = () => {
    setAttempts(attempts - 1);
    if (attempts > 1) {
      setError(`Invalid credentials. ${attempts - 1} attempts remaining.`);
    } else {
      setError('No more attempts. Please use the "Forgot Password" option.');
    }
  };
  

  if (isFirstTimeLogin) {
    return <FirstTimeLogin id={id} />;
  }

  if (showPasswordReset) {
    return <PasswordReset onBack={() => setShowPasswordReset(false)} />;
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
            Login
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              margin="normal"
              label="Staff ID"
              value={id}
              onChange={(e) => setId(e.target.value)}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              color="secondary"
              sx={{ mt: 3, mb: 2 }}
              disabled={attempts === 0}
            >
              Log In
            </Button>
          </form>
          <Button
            fullWidth
            onClick={() => setShowPasswordReset(true)}
          >
            Forgot Password?
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}

export default LoginPage;

