const express = require('express');
const router = express.Router();
const forgeService = require('../services/forgeService');
const jwt = require('jsonwebtoken');

// Middleware to extract and verify JWT token
const auth = async (req, res, next) => {
  try {
    console.log('ACC route: Auth middleware - Checking authorization header');
    const authHeader = req.headers.authorization;
    console.log('ACC route: Auth header present:', !!authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('ACC route: No or invalid authorization header');
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    console.log('ACC route: Token extracted from header');

    // Verify the token and extract the Forge access token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('ACC route: Token verified successfully');
    console.log('ACC route: Decoded token:', {
      hasAccessToken: !!decoded.access_token,
      expiresAt: decoded.expires_at
    });

    if (!decoded || !decoded.access_token) {
      console.error('ACC route: Invalid token structure');
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Add the Forge access token to the request
    req.forgeToken = decoded.access_token;
    console.log('ACC route: Forge token added to request');
    next();
  } catch (error) {
    console.error('ACC route: Auth middleware error:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    return res.status(401).json({ error: 'Invalid token' });
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

// Get all projects
router.get('/projects', auth, async (req, res) => {
  try {
    console.log('ACC route: /projects - Request received');
    console.log('ACC route: Using Forge token:', req.forgeToken ? 'present' : 'missing');

    const projects = await forgeService.getProjects(req.forgeToken);
    console.log('ACC route: Successfully retrieved projects:', {
      count: projects?.length,
      projects: projects?.map(p => ({ id: p.id, name: p.name }))
    });

    res.json(projects);
  } catch (error) {
    console.error('ACC route: Error in /projects:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      stack: error.stack
    });
    res.status(500).json({ 
      error: 'Failed to fetch projects',
      details: error.response?.data || error.message
    });
  }
});

// Get files for a specific project
router.get('/projects/:projectId/files', auth, async (req, res) => {
  try {
    console.log('ACC route: /projects/:projectId/files - Request received');
    console.log('ACC route: Project ID:', req.params.projectId);
    console.log('ACC route: Using Forge token:', req.forgeToken ? 'present' : 'missing');

    const files = await forgeService.getProjectFiles(req.params.projectId, req.forgeToken);
    console.log('ACC route: Successfully retrieved files:', {
      count: files?.length,
      files: files?.map(f => ({ id: f.id, name: f.name }))
    });

    res.json(files);
  } catch (error) {
    console.error('ACC route: Error in /projects/:projectId/files:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      stack: error.stack
    });
    res.status(500).json({ 
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