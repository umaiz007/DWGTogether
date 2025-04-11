import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import ACCDashboard from './components/ACCDashboard';
import TestViewer from './components/TestViewer';
import AuthCallback from './components/AuthCallback';
import './App.css';

function Navigation() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          DWG Together
        </Typography>
        <Button color="inherit" component={Link} to="/">
          Home
        </Button>
        {!isAuthenticated ? (
          <>
            <Button color="inherit" component={Link} to="/login">
              Login
            </Button>
            <Button color="inherit" component={Link} to="/register">
              Register
            </Button>
          </>
        ) : (
          <>
            <Typography variant="body1" sx={{ mr: 2 }}>
              Welcome, {user?.name}
            </Typography>
            <Button color="inherit" component={Link} to="/acc">
              ACC Projects
            </Button>
            <Button color="inherit" onClick={logout}>
              Logout
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navigation />
        <Container sx={{ mt: 4 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/acc" element={<ACCDashboard />} />
            <Route path="/test" element={<TestViewer />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
          </Routes>
        </Container>
      </Router>
    </AuthProvider>
  );
}

export default App;
