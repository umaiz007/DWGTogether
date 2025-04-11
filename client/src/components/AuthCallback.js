import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CircularProgress, Box, Typography } from '@mui/material';

function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      // Store the token in localStorage
      localStorage.setItem('acc_token', token);
      navigate('/acc');
    } else {
      // If no token, redirect to ACC dashboard
      navigate('/acc');
    }
  }, [searchParams, navigate]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
    >
      <CircularProgress />
      <Typography variant="h6" sx={{ mt: 2 }}>
        Authenticating with Autodesk...
      </Typography>
    </Box>
  );
}

export default AuthCallback; 