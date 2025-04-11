const axios = require('axios');

class ACCService {
    constructor(accessToken) {
        this.accessToken = accessToken;
        this.baseUrl = 'https://developer.api.autodesk.com/construction/acc/v1';
    }

    // Get all projects
    async getProjects() {
        try {
            const response = await axios.get(`${this.baseUrl}/projects`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error getting projects:', error.response?.data || error.message);
            throw error;
        }
    }

    // Get project details
    async getProject(projectId) {
        try {
            const response = await axios.get(`${this.baseUrl}/projects/${projectId}`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error getting project:', error.response?.data || error.message);
            throw error;
        }
    }

    // Get project files
    async getProjectFiles(projectId, folderId = 'root') {
        try {
            const response = await axios.get(`${this.baseUrl}/projects/${projectId}/folders/${folderId}/contents`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error getting project files:', error.response?.data || error.message);
            throw error;
        }
    }

    // Get file details
    async getFileDetails(projectId, fileId) {
        try {
            const response = await axios.get(`${this.baseUrl}/projects/${projectId}/files/${fileId}`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error getting file details:', error.response?.data || error.message);
            throw error;
        }
    }

    // Get file versions
    async getFileVersions(projectId, fileId) {
        try {
            const response = await axios.get(`${this.baseUrl}/projects/${projectId}/files/${fileId}/versions`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error getting file versions:', error.response?.data || error.message);
            throw error;
        }
    }
}

module.exports = ACCService; 