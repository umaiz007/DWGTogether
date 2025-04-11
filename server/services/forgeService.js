const axios = require('axios');
const querystring = require('querystring');

class ForgeService {
  constructor() {
    this.clientId = process.env.APS_CLIENT_ID;
    this.clientSecret = process.env.APS_CLIENT_SECRET;
    this.baseUrl = 'https://developer.api.autodesk.com';
  }

  async getAccessToken() {
    try {
      const response = await axios.post(
        `${this.baseUrl}/authentication/v1/authenticate`,
        querystring.stringify({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'client_credentials',
          scope: 'data:read data:write bucket:create bucket:read'
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      return response.data.access_token;
    } catch (error) {
      console.error('Error getting access token:', error);
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
      return response.data.data;
    } catch (error) {
      console.error('Error getting projects:', error);
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