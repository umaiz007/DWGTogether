import React from 'react';
import { Typography, Container, Box } from '@mui/material';

function Home() {
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome to DWG Together
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          Your Collaborative DWG File Viewer
        </Typography>
        <Typography variant="body1" paragraph>
          Please login to view and collaborate on DWG files.
        </Typography>
      </Box>
    </Container>
  );
}

export default Home; 