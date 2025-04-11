const axios = require('axios');
const querystring = require('querystring');

const APS_CLIENT_ID = process.env.APS_CLIENT_ID;
const APS_CLIENT_SECRET = process.env.APS_CLIENT_SECRET;
const APS_CALLBACK_URL = process.env.APS_CALLBACK_URL;

// Generate a URL for the Autodesk OAuth login page
const getAuthorizationUrl = () => {
    const baseUrl = 'https://developer.api.autodesk.com/authentication/v2/authorize';
    const params = {
        response_type: 'code',
        client_id: APS_CLIENT_ID,
        redirect_uri: APS_CALLBACK_URL,
        scope: 'account:read account:write data:read data:write bucket:read bucket:create code:all viewables:read'
    };
    return `${baseUrl}?${querystring.stringify(params)}`;
};

// Exchange authorization code for access token
const getAccessToken = async (code) => {
    try {
        const response = await axios.post('https://developer.api.autodesk.com/authentication/v2/token', 
            querystring.stringify({
                grant_type: 'authorization_code',
                code: code,
                client_id: APS_CLIENT_ID,
                client_secret: APS_CLIENT_SECRET,
                redirect_uri: APS_CALLBACK_URL
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error getting access token:', error.response?.data || error.message);
        throw error;
    }
};

// Get user profile information
const getUserProfile = async (accessToken) => {
    try {
        const response = await axios.get('https://developer.api.autodesk.com/userprofile/v1/users/@me', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error getting user profile:', error.response?.data || error.message);
        throw error;
    }
};

module.exports = {
    getAuthorizationUrl,
    getAccessToken,
    getUserProfile
}; 