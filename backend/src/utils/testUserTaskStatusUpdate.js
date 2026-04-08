const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api/v1';

async function testUserTaskStatusUpdate() {
  try {
    console.log('🧪 Testing user task status update...');
    
    // First, login as a regular user (not admin)
    console.log('\n🔐 Logging in as regular user...');
    
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'user@example.com', // Adjust based on your regular user
      password: 'user123' // Adjust based on your user password
    });
    
    if (!loginResponse.data.success) {
      console.log('❌ User login failed. Please ensure you have a regular user account.');
      console.log('Response:', loginResponse.data);
      return;
    }
    
    const userToken = loginResponse.data.token;
    const userId = loginResponse.data.user.id;
    console.log(`✅ User login successful (ID: ${userId})`);
    
    // Get user's assigned tasks
    console.log('\n📋 Getting user tasks...');
    const tasksResponse = await axios.get(`${API_BASE_URL}/task`, {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });
    
    if (!tasksResponse.data.success || !tasksResponse.data.data.length) {
      console.log('❌ No tasks found for user. Creating a test task first...');
      
      // Login as admin to create a task
      const adminLoginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: 'admin@example.com',
        password: 'admin123'
      });
      
      if (adminLoginResponse.data.success) {
        const adminToken = adminLoginResponse.data.token;
        
        // Create a task assigned to the user
        const createTaskResponse = await axios.post(`${API_BASE_URL}/task`, {
          title: 'Test User Status Update',
          description: 'Testing user task status update functionality',
          priority: 'medium',
          assignedUserIds: [userId]
        }, {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (createTaskResponse.data.success) {
          console.log('✅ Test task created for user');
        }
      }
      
      // Get tasks again
      const newTasksResponse = await axios.get(`${API_BASE_URL}/task`, {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });
      
      if (!newTasksResponse.data.success || !newTasksResponse.data.data.length) {
        console.log('❌ Still no tasks found. Cannot proceed with test.');
        return;
      }
    }
    
    // Get the first incomplete task
    const tasks = tasksResponse.data.data;
    const incompleteTask = tasks.find(task => task.status === 'incomplete');
    
    if (!incompleteTask) {
      console.log('❌ No incomplete tasks found to test status update.');
      return;
    }
    
    console.log(`📝 Found incomplete task: "${incompleteTask.title}" (ID: ${incompleteTask.id})`);
    
    // Test updating task status to 'inProgress'
    console.log('\n🔄 Testing status update to "inProgress"...');
    
    const statusUpdateResponse = await axios.patch(`${API_BASE_URL}/task/${incompleteTask.id}/status`, {
      status: 'inProgress'
    }, {
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (statusUpdateResponse.data.success) {
      console.log('✅ Task status updated successfully!');
      console.log(`   Task: ${statusUpdateResponse.data.data.title}`);
      console.log(`   New Status: ${statusUpdateResponse.data.data.status}`);
    } else {
      console.log('❌ Task status update failed:', statusUpdateResponse.data.message);
    }
    
    // Test updating back to 'incomplete'
    console.log('\n🔄 Testing status update back to "incomplete"...');
    
    const revertStatusResponse = await axios.patch(`${API_BASE_URL}/task/${incompleteTask.id}/status`, {
      status: 'incomplete'
    }, {
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (revertStatusResponse.data.success) {
      console.log('✅ Task status reverted successfully!');
      console.log(`   New Status: ${revertStatusResponse.data.data.status}`);
    } else {
      console.log('❌ Task status revert failed:', revertStatusResponse.data.message);
    }
    
    console.log('\n🎉 User task status update test completed!');
    
  } catch (error) {
    if (error.response) {
      console.error('❌ API Error:', error.response.status, error.response.data);
    } else {
      console.error('❌ Network Error:', error.message);
    }
  }
}

// Run the test
testUserTaskStatusUpdate();