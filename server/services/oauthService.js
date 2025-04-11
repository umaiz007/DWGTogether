const axios = require('axios');
const querystring = require('querystring');

class OAuthService {
  constructor() {
    this.clientId = process.env.APS_CLIENT_ID;
    this.clientSecret = process.env.APS_CLIENT_SECRET;
    this.callbackUrl = process.env.APS_CALLBACK_URL;
    this.baseUrl = 'https://developer.api.autodesk.com';
    
    console.log('OAuthService initialized with:', {
      clientId: this.clientId,
      callbackUrl: this.callbackUrl,
      baseUrl: this.baseUrl
    });
  }

  getAuthorizationUrl() {
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.callbackUrl,
      scope: 'data:read data:write data:create bucket:read viewables:read account:read'
    });

    return `${this.baseUrl}/authentication/v2/authorize?${params.toString()}`;
  }

  async getToken(code) {
    try {
      console.log('Getting token with code:', code);
      const authHeader = `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`;
      
      const requestBody = querystring.stringify({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: this.callbackUrl
      });

      console.log('Making token request with:', {
        url: `${this.baseUrl}/authentication/v2/token`,
        headers: {
          'Authorization': 'Basic [REDACTED]',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: requestBody
      });

      const response = await axios.post(
        `${this.baseUrl}/authentication/v2/token`,
        requestBody,
        {
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      console.log('Token response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error getting token:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      throw error;
    }
  }

  async refreshToken(refreshToken) {
    try {
      console.log('Refreshing token with:', refreshToken);
      const authHeader = `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`;
      
      const response = await axios.post(
        `${this.baseUrl}/authentication/v2/token`,
        querystring.stringify({
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        }),
        {
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error refreshing token:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = new OAuthService(); 