const axios = require('axios');

const BASE_URL = 'http://localhost:5001';

async function testServer() {
  try {
    console.log('Testing server endpoints...');

    // Test authentication
    console.log('\nTesting authentication...');
    const authResponse = await axios.get(`${BASE_URL}/auth/token`);
    console.log('Auth token received:', authResponse.data ? 'Success' : 'Failed');

    // Test ACC projects
    console.log('\nTesting ACC projects...');
    const projectsResponse = await axios.get(`${BASE_URL}/acc/projects`);
    console.log('Projects received:', projectsResponse.data.length);

    if (projectsResponse.data.length > 0) {
      // Test project files
      console.log('\nTesting project files...');
      const filesResponse = await axios.get(`${BASE_URL}/acc/projects/${projectsResponse.data[0].id}/files`);
      console.log('Files received:', filesResponse.data.length);
    }

    console.log('\nAll tests completed!');
  } catch (error) {
    console.error('Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testServer(); 