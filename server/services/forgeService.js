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
      console.log('Getting access token with client ID:', this.clientId);
      const response = await axios.post(
        `${this.baseUrl}/authentication/v1/authenticate`,
        querystring.stringify({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'client_credentials',
          scope: 'data:read data:write bucket:create bucket:read account:read project:read viewables:read'
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      console.log('Successfully obtained access token');
      return response.data.access_token;
    } catch (error) {
      console.error('Error getting access token:', error.response?.data || error.message);
      throw error;
    }
  }

  async getProjects(accessToken) {
    try {
      console.log('Fetching projects with token:', accessToken);
      
      // First get the account ID
      console.log('Fetching ACC accounts...');
      const accountResponse = await axios.get(
        `${this.baseUrl}/hq/v1/accounts`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      
      console.log('Account response:', accountResponse.data);
      
      if (!accountResponse.data || !accountResponse.data.data || accountResponse.data.data.length === 0) {
        console.error('No ACC account found in response:', accountResponse.data);
        throw new Error('No ACC account found');
      }

      const accountId = accountResponse.data.data[0].id;
      console.log('Found account ID:', accountId);

      // Then get projects for the account
      console.log('Fetching projects for account:', accountId);
      const projectsResponse = await axios.get(
        `${this.baseUrl}/hq/v1/accounts/${accountId}/projects`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      console.log('Projects response:', projectsResponse.data);
      return projectsResponse.data.data;
    } catch (error) {
      console.error('Error getting projects:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      throw error;
    }
  }

  async getProjectFiles(projectId, accessToken) {
    try {
      console.log('Fetching files for project:', projectId);
      const response = await axios.get(
        `${this.baseUrl}/hq/v1/projects/${projectId}/items`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      console.log('Project files response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('Error getting project files:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  }
}

module.exports = new ForgeService(); 