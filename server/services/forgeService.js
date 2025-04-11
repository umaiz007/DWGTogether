const axios = require('axios');
const querystring = require('querystring');

class ForgeService {
  constructor() {
    this.clientId = process.env.APS_CLIENT_ID;
    this.clientSecret = process.env.APS_CLIENT_SECRET;
    this.callbackUrl = process.env.APS_CALLBACK_URL;
    this.baseUrl = 'https://developer.api.autodesk.com';
    
    console.log('ForgeService: Initialized with config:', {
      clientId: this.clientId ? 'present' : 'missing',
      clientSecret: this.clientSecret ? 'present' : 'missing',
      callbackUrl: this.callbackUrl ? 'present' : 'missing',
      baseUrl: this.baseUrl
    });
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

  async exchangeCodeForToken(code) {
    try {
      console.log('ForgeService: Starting code exchange');
      console.log('ForgeService: Input code:', code ? 'present' : 'missing');
      
      const requestData = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: process.env.APS_CLIENT_ID,
        client_secret: process.env.APS_CLIENT_SECRET,
        redirect_uri: process.env.APS_CALLBACK_URL
      });

      console.log('ForgeService: Prepared request data:', {
        grant_type: 'authorization_code',
        code: code ? 'present' : 'missing',
        client_id: process.env.APS_CLIENT_ID ? 'present' : 'missing',
        client_secret: process.env.APS_CLIENT_SECRET ? 'present' : 'missing',
        redirect_uri: process.env.APS_CALLBACK_URL ? 'present' : 'missing'
      });

      console.log('ForgeService: Making POST request to Autodesk token endpoint');
      const response = await axios.post(
        'https://developer.api.autodesk.com/authentication/v2/token',
        requestData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      console.log('ForgeService: Autodesk response:', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: {
          access_token: response.data.access_token ? 'present' : 'missing',
          token_type: response.data.token_type,
          expires_in: response.data.expires_in
        }
      });

      if (!response.data.access_token) {
        throw new Error('No access token received from Autodesk');
      }

      return {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        expires_in: response.data.expires_in
      };
    } catch (error) {
      console.error('ForgeService: Error in code exchange:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        request: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          data: error.config?.data
        },
        stack: error.stack
      });
      throw error;
    }
  }

  async getProjects(accessToken) {
    try {
      console.log('ForgeService: Getting projects');
      console.log('ForgeService: Using access token:', accessToken ? 'present' : 'missing');

      // Get all projects
      const response = await axios.get(
        'https://developer.api.autodesk.com/project/v1/hubs/a.YnVzaW5lc3M6Y2N0ZWNoOQ/projects',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('ForgeService: Projects response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });

      // Find the DWGTogether project
      const projects = response.data.data;
      const dwgTogetherProject = projects.find(p => p.attributes.name === 'DWGTogether');
      
      if (dwgTogetherProject) {
        console.log('ForgeService: Found DWGTogether project:', {
          id: dwgTogetherProject.id,
          name: dwgTogetherProject.attributes.name,
          rootFolderId: dwgTogetherProject.relationships.rootFolder.data.id
        });
      } else {
        console.log('ForgeService: DWGTogether project not found in response');
      }

      return projects;
    } catch (error) {
      console.error('ForgeService: Error getting projects:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack
      });
      throw error;
    }
  }

  async getProjectFiles(projectId, accessToken) {
    try {
      console.log('ForgeService: Getting project files');
      console.log('ForgeService: Looking for file: ACAD_Objects.dwg');
      console.log('ForgeService: Project ID:', projectId);
      console.log('ForgeService: Using access token:', accessToken ? 'present' : 'missing');

      // First get the project details to get the root folder ID
      const projectResponse = await axios.get(
        `https://developer.api.autodesk.com/project/v1/hubs/a.YnVzaW5lc3M6Y2N0ZWNoOQ/projects/${projectId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('ForgeService: Project details response:', {
        status: projectResponse.status,
        statusText: projectResponse.statusText,
        data: projectResponse.data
      });

      const rootFolderId = projectResponse.data.data.relationships.rootFolder.data.id;
      console.log('ForgeService: Root folder ID:', rootFolderId);

      // Get items from the root folder
      const itemsResponse = await axios.get(
        `https://developer.api.autodesk.com/data/v1/projects/${projectId}/folders/${rootFolderId}/contents`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('ForgeService: Files response:', {
        status: itemsResponse.status,
        statusText: itemsResponse.statusText,
        data: itemsResponse.data
      });

      // Find the ACAD_Objects.dwg file
      const files = itemsResponse.data.data;
      const acadObjectsFile = files.find(f => f.attributes.displayName === 'ACAD_Objects.dwg');
      
      if (acadObjectsFile) {
        console.log('ForgeService: Found ACAD_Objects.dwg file:', {
          id: acadObjectsFile.id,
          name: acadObjectsFile.attributes.displayName
        });
      } else {
        console.log('ForgeService: ACAD_Objects.dwg file not found in response');
      }

      return files;
    } catch (error) {
      console.error('ForgeService: Error getting project files:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack
      });
      throw error;
    }
  }
}

module.exports = new ForgeService(); 