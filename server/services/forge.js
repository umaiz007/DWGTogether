const axios = require('axios');

class ForgeService {
  constructor() {
    this.clientId = process.env.FORGE_CLIENT_ID;
    this.clientSecret = process.env.FORGE_CLIENT_SECRET;
    this.baseUrl = 'https://developer.api.autodesk.com';
    this.token = null;
    this.tokenExpiration = null;
  }

  async getAccessToken() {
    if (this.token && this.tokenExpiration && Date.now() < this.tokenExpiration) {
      return this.token;
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/authentication/v1/authenticate`,
        new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'client_credentials',
          scope: 'data:read data:write'
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.token = response.data.access_token;
      this.tokenExpiration = Date.now() + (response.data.expires_in * 1000);
      return this.token;
    } catch (error) {
      console.error('Error getting Forge access token:', error);
      throw error;
    }
  }

  async getProjects() {
    try {
      const token = await this.getAccessToken();
      const response = await axios.get(
        `${this.baseUrl}/project/v1/hubs`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Get projects from each hub
      const projects = [];
      for (const hub of response.data.data) {
        const hubProjects = await axios.get(
          `${this.baseUrl}/project/v1/hubs/${hub.id}/projects`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        projects.push(...hubProjects.data.data);
      }

      return projects;
    } catch (error) {
      console.error('Error getting ACC projects:', error);
      throw error;
    }
  }

  async getProjectFiles(projectId) {
    try {
      const token = await this.getAccessToken();
      const response = await axios.get(
        `${this.baseUrl}/data/v1/projects/${projectId}/items`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      return response.data.data;
    } catch (error) {
      console.error('Error getting project files:', error);
      throw error;
    }
  }
}

module.exports = new ForgeService(); 