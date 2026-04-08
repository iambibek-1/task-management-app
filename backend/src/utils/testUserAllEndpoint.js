const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api/v1';

async function testUserAllEndpoint() {
  try {
    console.log('🧪 Testing /user/all endpoint...');
    
    // First, test without authentication
    console.log('\n❌ Testing without authentication (should fail)...');
    try {
      const noAuthResponse = await axios.get(`${API_BASE_URL}/user/all`);
      console.log('❌ Unexpected success without auth:', noAuthResponse.data);
    } catch (error) {
      if (error.response) {
        console.log(`✅ Expected failure without auth: ${error.response.status} - ${error.response.data.message || error.response.data}`);
      } else {
        console.log('❌ Network error:', error.message);
      }
    }
    
    // Login as admin
    console.log('\n🔐 Logging in as admin...');
    
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@example.com', // Adjust based on your admin user
      password: 'admin123' // Adjust based on your admin password
    });
    
    if (!loginResponse.data.success) {
      console.log('❌ Admin login failed:', loginResponse.data);
      return;
    }
    
    const adminToken = loginResponse.data.token;
    console.log('✅ Admin login successful');
    
    // Test with admin authentication
    console.log('\n✅ Testing with admin authentication...');
    
    const adminResponse = await axios.get(`${API_BASE_URL}/user/all`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    if (adminResponse.data.success) {
      console.log('✅ /user/all endpoint works with admin auth!');
      console.log(`   Found ${adminResponse.data.data.length} users`);
      console.log('   Users:', adminResponse.data.data.map(u => `${u.firstName} ${u.lastName} (${u.role})`));
    } else {
      console.log('❌ Unexpected response:', adminResponse.data);
    }
    
    // Test with regular user (should fail)
    console.log('\n❌ Testing with regular user (should fail)...');
    
    const userLoginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'user@example.com', // Adjust based on your regular user
      password: 'user123' // Adjust based on your user password
    });
    
    if (userLoginResponse.data.success) {
      const userToken = userLoginResponse.data.token;
      
      try {
        const userResponse = await axios.get(`${API_BASE_URL}/user/all`, {
          headers: {
            'Authorization': `Bearer ${userToken}`
          }
        });
        console.log('❌ Unexpected success with user auth:', userResponse.data);
      } catch (error) {
        if (error.response) {
          console.log(`✅ Expected failure with user auth: ${error.response.status} - ${error.response.data.message}`);
        } else {
          console.log('❌ Network error:', error.message);
        }
      }
    } else {
      console.log('⚠️ Could not test with regular user (login failed)');
    }
    
    console.log('\n🎉 /user/all endpoint test completed!');
    
  } catch (error) {
    if (error.response) {
      console.error('❌ API Error:', error.response.status, error.response.data);
    } else {
      console.error('❌ Network Error:', error.message);
    }
  }
}

// Run the test
testUserAllEndpoint();