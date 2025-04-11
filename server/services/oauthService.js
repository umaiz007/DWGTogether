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
    console.log('OAuthService: Generating authorization URL');
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.callbackUrl,
      scope: 'data:read data:write data:create bucket:read viewables:read account:read'
    });

    const authUrl = `${this.baseUrl}/authentication/v2/authorize?${params.toString()}`;
    console.log('OAuthService: Generated auth URL:', authUrl);
    return authUrl;
  }

  async getToken(code) {
    try {
      console.log('OAuthService: Getting token with code:', code);
      console.log('OAuthService: Using callback URL:', this.callbackUrl);
      
      const authHeader = `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`;
      
      const requestBody = querystring.stringify({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: this.callbackUrl
      });

      console.log('OAuthService: Making token request with:', {
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

      console.log('OAuthService: Token response:', {
        hasAccessToken: !!response.data.access_token,
        hasRefreshToken: !!response.data.refresh_token,
        expiresIn: response.data.expires_in,
        status: response.status,
        statusText: response.statusText
      });
      return response.data;
    } catch (error) {
      console.error('OAuthService: Error getting token:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
        stack: error.stack
      });
      throw error;
    }
  }

  async refreshToken(refreshToken) {
    try {
      console.log('OAuthService: Refreshing token');
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
      console.error('OAuthService: Error refreshing token:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = new OAuthService(); 