import React, { useState, useEffect } from 'react';
import { Box, Button, List, ListItem, ListItemText, Typography, CircularProgress } from '@mui/material';
import axios from 'axios';

const ACCDashboard = () => {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        console.log('ACCDashboard: Component mounted');
        console.log('ACCDashboard: API URL:', process.env.REACT_APP_API_URL || 'http://localhost:5001');

        const checkAuth = async () => {
            try {
                const token = localStorage.getItem('token');
                console.log('ACCDashboard: Checking authentication');
                console.log('ACCDashboard: Token in localStorage:', !!token);

                if (token) {
                    console.log('ACCDashboard: Token found, verifying...');
                    const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/auth/session`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });

                    if (response.data.isAuthenticated) {
                        console.log('ACCDashboard: User authenticated');
                        setIsAuthenticated(true);
                        fetchProjects();
                    } else {
                        console.log('ACCDashboard: Session invalid');
                        localStorage.removeItem('token');
                        setIsAuthenticated(false);
                    }
                } else {
                    console.log('ACCDashboard: No token found');
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error('ACCDashboard: Auth check failed:', error);
                localStorage.removeItem('token');
                setIsAuthenticated(false);
            }
        };

        checkAuth();
    }, []);

    const handleLogin = () => {
        window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/auth/login`;
    };

    const fetchProjects = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            console.log('ACCDashboard: Fetching projects with token:', !!token);

            const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/acc/projects`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            console.log('ACCDashboard: Projects response:', response.data);
            setProjects(response.data);
        } catch (error) {
            console.error('ACCDashboard: Error fetching projects:', error);
            setError('Failed to fetch projects');
        } finally {
            setLoading(false);
        }
    };

    const fetchProjectFiles = async (projectId) => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            console.log('ACCDashboard: Fetching files for project:', projectId);

            const response = await axios.get(
                `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/acc/projects/${projectId}/files`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            console.log('ACCDashboard: Files response:', response.data);
            setFiles(response.data);
        } catch (error) {
            console.error('ACCDashboard: Error fetching files:', error);
            setError('Failed to fetch project files');
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) {
        console.log('ACCDashboard: User not authenticated, showing login button');
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <Button variant="contained" color="primary" onClick={handleLogin}>
                    Login with Autodesk
                </Button>
            </Box>
        );
    }

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>
                ACC Projects
            </Typography>

            {loading && <CircularProgress />}
            {error && <Typography color="error">{error}</Typography>}

            <Box display="flex" gap={2}>
                <Box flex={1}>
                    <Typography variant="h6" gutterBottom>
                        Projects
                    </Typography>
                    <List>
                        {projects.map((project) => (
                            <ListItem
                                key={project.id}
                                button
                                onClick={() => {
                                    setSelectedProject(project);
                                    fetchProjectFiles(project.id);
                                }}
                                selected={selectedProject?.id === project.id}
                            >
                                <ListItemText primary={project.name} secondary={project.id} />
                            </ListItem>
                        ))}
                    </List>
                </Box>

                <Box flex={1}>
                    <Typography variant="h6" gutterBottom>
                        Files
                    </Typography>
                    <List>
                        {files.map((file) => (
                            <ListItem key={file.id}>
                                <ListItemText primary={file.name} secondary={file.type} />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Box>
        </Box>
    );
};

export default ACCDashboard; 