const express = require('express');
const router = express.Router();
const authService = require('../services/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const forgeService = require('../services/forgeService');
const oauthService = require('../services/oauthService');

// Redirect to Autodesk OAuth login page
router.get('/login', (req, res) => {
    const authUrl = oauthService.getAuthorizationUrl();
    res.redirect(authUrl);
});

// Handle OAuth callback
router.get('/callback', async (req, res) => {
    try {
        const { code } = req.query;
        if (!code) {
            return res.status(400).json({ error: 'Authorization code is required' });
        }

        console.log('Received authorization code:', code);
        const tokenData = await oauthService.getToken(code);
        console.log('Token data received:', tokenData);
        
        // Create JWT with user info
        const userToken = jwt.sign(
            { 
                access_token: tokenData.access_token,
                refresh_token: tokenData.refresh_token,
                expires_at: Date.now() + (tokenData.expires_in * 1000)
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Redirect to frontend with token
        res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${userToken}`);
    } catch (error) {
        console.error('Auth callback error:', error);
        console.error('Error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        res.status(500).json({ 
            error: 'Authentication failed',
            details: error.message,
            response: error.response?.data
        });
    }
});

// Session check route
router.get('/session', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ isAuthenticated: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ isAuthenticated: true, user: decoded.user });
  } catch (err) {
    res.status(401).json({ isAuthenticated: false });
  }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// Register route
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({
      name,
      email,
      password
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save user
    await user.save();

    // Create JWT token
    const payload = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: payload.user });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get APS access token
router.get('/token', async (req, res) => {
  try {
    const token = await forgeService.getAccessToken();
    res.json({ access_token: token });
  } catch (error) {
    console.error('Error getting APS token:', error);
    res.status(500).json({ error: 'Failed to get APS token' });
  }
});

// Generate JWT for user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // TODO: Implement proper user authentication
    // For now, we'll just generate a token for any user
    const token = jwt.sign(
      { 
        id: 'user-id', 
        email,
        name: 'Test User'
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    const tokens = await oauthService.refreshToken(refresh_token);
    res.json(tokens);
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

module.exports = router; 