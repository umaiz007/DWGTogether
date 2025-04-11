const express = require('express');
const router = express.Router();
const ACCService = require('../services/acc');
const forgeService = require('../services/forgeService');
const jwt = require('jsonwebtoken');

// Middleware to create ACC service instance
router.use((req, res, next) => {
    if (!req.session.accessToken) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    req.accService = new ACCService(req.session.accessToken);
    next();
});

// Middleware to extract and verify the JWT token
const auth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        // Verify and decode the JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded || !decoded.access_token) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        // Add the Forge access token to the request
        req.forgeToken = decoded.access_token;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Mock data for ACC projects
const mockProjects = [
  {
    id: '1',
    name: 'Project A',
    description: 'Residential Building Project'
  },
  {
    id: '2',
    name: 'Project B',
    description: 'Commercial Complex'
  },
  {
    id: '3',
    name: 'Project C',
    description: 'Infrastructure Development'
  }
];

// Mock data for project files
const mockFiles = {
  '1': [
    {
      id: '1-1',
      name: 'Floor Plan.dwg',
      type: 'DWG',
      lastModified: '2023-04-01T10:00:00Z'
    },
    {
      id: '1-2',
      name: 'Elevation.dwg',
      type: 'DWG',
      lastModified: '2023-04-02T11:00:00Z'
    }
  ],
  '2': [
    {
      id: '2-1',
      name: 'Site Plan.dwg',
      type: 'DWG',
      lastModified: '2023-04-03T12:00:00Z'
    },
    {
      id: '2-2',
      name: 'Structural.dwg',
      type: 'DWG',
      lastModified: '2023-04-04T13:00:00Z'
    }
  ],
  '3': [
    {
      id: '3-1',
      name: 'Road Layout.dwg',
      type: 'DWG',
      lastModified: '2023-04-05T14:00:00Z'
    },
    {
      id: '3-2',
      name: 'Drainage.dwg',
      type: 'DWG',
      lastModified: '2023-04-06T15:00:00Z'
    }
  ]
};

// Get all ACC projects
router.get('/projects', auth, async (req, res) => {
    try {
        console.log('Fetching projects with token:', req.forgeToken);
        const projects = await forgeService.getProjects(req.forgeToken);
        console.log('Successfully retrieved projects:', projects);
        res.json(projects);
    } catch (error) {
        console.error('Error in /projects route:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        res.status(error.response?.status || 500).json({
            error: error.response?.data?.message || 'Failed to fetch projects',
            details: error.response?.data || error.message
        });
    }
});

// Get project files
router.get('/projects/:projectId/files', auth, async (req, res) => {
    try {
        const files = await forgeService.getProjectFiles(req.params.projectId, req.forgeToken);
        res.json(files);
    } catch (error) {
        console.error('Error in /projects/:projectId/files route:', error);
        res.status(error.response?.status || 500).json({
            error: 'Failed to fetch project files',
            details: error.response?.data || error.message
        });
    }
});

// Get project details
router.get('/projects/:projectId', async (req, res) => {
    try {
        const project = await req.accService.getProject(req.params.projectId);
        res.json(project);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get project details' });
    }
});

// Get file details
router.get('/projects/:projectId/files/:fileId', async (req, res) => {
    try {
        const file = await req.accService.getFileDetails(
            req.params.projectId,
            req.params.fileId
        );
        res.json(file);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get file details' });
    }
});

// Get file versions
router.get('/projects/:projectId/files/:fileId/versions', async (req, res) => {
    try {
        const versions = await req.accService.getFileVersions(
            req.params.projectId,
            req.params.fileId
        );
        res.json(versions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get file versions' });
    }
});

module.exports = router; 