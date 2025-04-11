const express = require('express');
const router = express.Router();
const authService = require('../services/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const forgeService = require('../services/forgeService');
const oauthService = require('../services/oauthService');

// Verify session token
router.get('/session', async (req, res) => {
    try {
        console.log('Auth: Verifying session token');
        const authHeader = req.headers.authorization;
        console.log('Auth: Auth header present:', !!authHeader);

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.error('Auth: No or invalid authorization header');
            return res.status(401).json({ isAuthenticated: false });
        }

        const token = authHeader.split(' ')[1];
        console.log('Auth: Token extracted from header');

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Auth: Token verified successfully');
        console.log('Auth: Decoded token:', {
            hasAccessToken: !!decoded.access_token,
            expiresAt: decoded.expires_at
        });

        if (!decoded || !decoded.access_token) {
            console.error('Auth: Invalid token structure');
            return res.status(401).json({ isAuthenticated: false });
        }

        // Check if token is expired
        if (decoded.expires_at < Date.now()) {
            console.error('Auth: Token expired');
            return res.status(401).json({ isAuthenticated: false });
        }

        console.log('Auth: Session valid');
        res.json({ isAuthenticated: true });
    } catch (error) {
        console.error('Auth: Session verification error:', {
            message: error.message,
            name: error.name,
            stack: error.stack
        });
        res.status(401).json({ isAuthenticated: false });
    }
});

// Redirect to Autodesk OAuth login page
router.get('/login', (req, res) => {
    console.log('Auth: Redirecting to Autodesk login');
    const authUrl = oauthService.getAuthorizationUrl();
    console.log('Auth: Generated auth URL:', authUrl);
    res.redirect(authUrl);
});

// Handle OAuth callback
router.get('/callback', async (req, res) => {
    try {
        console.log('Auth: Received callback request');
        console.log('Auth: Request URL:', req.url);
        console.log('Auth: Query params:', req.query);
        console.log('Auth: Headers:', req.headers);
        
        const { code } = req.query;
        if (!code) {
            console.error('Auth: No authorization code received');
            return res.status(400).json({ error: 'Authorization code is required' });
        }

        console.log('Auth: Received authorization code');
        const tokenData = await oauthService.getToken(code);
        console.log('Auth: Received token data:', {
            hasAccessToken: !!tokenData.access_token,
            hasRefreshToken: !!tokenData.refresh_token,
            expiresIn: tokenData.expires_in
        });
        
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

        console.log('Auth: Created JWT token');
        res.json({ token: userToken });
    } catch (error) {
        console.error('Auth: Callback error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            stack: error.stack
        });
        res.status(500).json({ error: 'Authentication failed' });
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

// Handle OAuth callback
router.post('/callback', async (req, res) => {
  try {
    console.log('Auth route: Received callback request');
    console.log('Auth route: Request body:', req.body);
    console.log('Auth route: Request headers:', req.headers);
    
    const { code } = req.body;
    console.log('Auth route: Received authorization code:', code ? 'present' : 'missing');

    if (!code) {
      console.error('Auth route: No authorization code provided');
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    console.log('Auth route: Exchanging code for token...');
    console.log('Auth route: Environment variables:', {
      APS_CLIENT_ID: process.env.APS_CLIENT_ID ? 'present' : 'missing',
      APS_CLIENT_SECRET: process.env.APS_CLIENT_SECRET ? 'present' : 'missing',
      APS_CALLBACK_URL: process.env.APS_CALLBACK_URL ? 'present' : 'missing',
      JWT_SECRET: process.env.JWT_SECRET ? 'present' : 'missing'
    });

    const tokenData = await forgeService.exchangeCodeForToken(code);
    console.log('Auth route: Successfully obtained token data:', {
      hasAccessToken: !!tokenData.access_token,
      hasRefreshToken: !!tokenData.refresh_token,
      expiresIn: tokenData.expires_in
    });

    // Create a JWT token with the Forge token data
    const tokenPayload = { 
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: Date.now() + (tokenData.expires_in * 1000)
    };
    console.log('Auth route: Creating JWT with payload:', tokenPayload);

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('Auth route: Generated JWT token successfully');
    res.json({ token });
  } catch (error) {
    console.error('Auth route: Error in callback:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      stack: error.stack
    });
    res.status(500).json({ 
      error: 'Failed to exchange authorization code',
      details: error.response?.data || error.message
    });
  }
});

module.exports = router; 