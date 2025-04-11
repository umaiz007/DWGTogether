import React, { useState, useEffect } from 'react';
import { Container, Typography, List, ListItem, ListItemText, Button, CircularProgress, Alert } from '@mui/material';
import api from '../api/axios';

function ACCDashboard() {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/acc/projects');
            setProjects(response.data);
        } catch (error) {
            console.error('Error fetching projects:', error);
            setError('Failed to fetch projects. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const fetchProjectFiles = async (projectId) => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get(`/acc/projects/${projectId}/files`);
            setFiles(response.data);
        } catch (error) {
            console.error('Error fetching project files:', error);
            setError('Failed to fetch project files. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleProjectSelect = (project) => {
        setSelectedProject(project);
        fetchProjectFiles(project.id);
    };

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" component="h1" gutterBottom>
                ACC Projects
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {loading ? (
                <CircularProgress />
            ) : (
                <div style={{ display: 'flex', gap: '2rem' }}>
                    <div style={{ flex: 1 }}>
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
                    </div>

                    <div style={{ flex: 1 }}>
                        <Typography variant="h6" gutterBottom>
                            Files
                        </Typography>
                        {selectedProject ? (
                            <List>
                                {files.map((file) => (
                                    <ListItem key={file.id}>
                                        <ListItemText
                                            primary={file.name}
                                            secondary={`Type: ${file.type} | Last Modified: ${new Date(
                                                file.lastModified
                                            ).toLocaleString()}`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <Typography>Select a project to view its files</Typography>
                        )}
                    </div>
                </div>
            )}
        </Container>
    );
}

export default ACCDashboard; 