const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testServer() {
  console.log('Testing server connectivity...');
  
  try {
    // Test main API endpoint
    const mainResponse = await axios.get(`${BASE_URL}/test`);
    console.log('Main API test:', mainResponse.data);
    
    // Test admin routes
    const adminResponse = await axios.get(`${BASE_URL}/admin/test`);
    console.log('Admin API test:', adminResponse.data);
    
    console.log('Server is running and routes are accessible!');
  } catch (error) {
    console.error('Server test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('No response received. Is the server running?');
    } else {
      console.error('Error:', error.message);
    }
  }
}

testServer();