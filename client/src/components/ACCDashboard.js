import React, { useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Button, CircularProgress } from '@mui/material';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const ACCDashboard = () => {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check if we have a token in localStorage
        const storedToken = localStorage.getItem('acc_token');
        if (storedToken) {
            try {
                // Decode the JWT to get the Forge access token
                const decoded = jwtDecode(storedToken);
                if (decoded && decoded.access_token) {
                    setIsAuthenticated(true);
                    fetchProjects(decoded.access_token);
                } else {
                    // Token is invalid or doesn't contain access_token
                    localStorage.removeItem('acc_token');
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error('Error decoding token:', error);
                localStorage.removeItem('acc_token');
                setIsAuthenticated(false);
            }
        }
    }, []);

    const handleLogin = () => {
        window.location.href = 'http://localhost:5001/api/auth/login';
    };

    const fetchProjects = async (accessToken) => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get('http://localhost:5001/api/acc/projects', {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            setProjects(response.data);
        } catch (error) {
            console.error('Error fetching projects:', error);
            setError('Failed to fetch projects. Please try logging in again.');
            if (error.response?.status === 401) {
                // Token expired or invalid
                localStorage.removeItem('acc_token');
                setIsAuthenticated(false);
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchProjectFiles = async (projectId) => {
        try {
            const storedToken = localStorage.getItem('acc_token');
            if (!storedToken) {
                setError('Not authenticated');
                return;
            }

            const decoded = jwtDecode(storedToken);
            if (!decoded || !decoded.access_token) {
                setError('Invalid token');
                return;
            }

            setLoading(true);
            setError(null);
            const response = await axios.get(`http://localhost:5001/api/acc/projects/${projectId}/files`, {
                headers: {
                    Authorization: `Bearer ${decoded.access_token}`
                }
            });
            setFiles(response.data);
        } catch (error) {
            console.error('Error fetching project files:', error);
            setError('Failed to fetch project files');
        } finally {
            setLoading(false);
        }
    };

    const handleProjectSelect = (project) => {
        setSelectedProject(project);
        fetchProjectFiles(project.id);
    };

    if (!isAuthenticated) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h5" gutterBottom>
                    Please log in to access ACC projects
                </Typography>
                <Button variant="contained" color="primary" onClick={handleLogin}>
                    Log in with Autodesk
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                ACC Projects
            </Typography>

            {loading && <CircularProgress />}
            {error && (
                <Typography color="error" gutterBottom>
                    {error}
                </Typography>
            )}

            <Box sx={{ display: 'flex', gap: 4 }}>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" gutterBottom>
                        Projects
                    </Typography>
                    <List>
                        {projects.map((project) => (
                            <ListItem
                                key={project.id}
                                button
                                onClick={() => handleProjectSelect(project)}
                                selected={selectedProject?.id === project.id}
                            >
                                <ListItemText
                                    primary={project.name}
                                    secondary={project.description}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Box>

                <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" gutterBottom>
                        Files
                    </Typography>
                    <List>
                        {files.map((file) => (
                            <ListItem key={file.id}>
                                <ListItemText
                                    primary={file.name}
                                    secondary={file.type}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Box>
        </Box>
    );
};

export default ACCDashboard; 