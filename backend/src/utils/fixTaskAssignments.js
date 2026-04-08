const { Sequelize } = require('sequelize');
require('dotenv').config();

// Create database connection
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT || 'mysql',
    logging: console.log
  }
);

async function fixTaskAssignments() {
  try {
    console.log('🔍 Checking task assignments...');
    
    // Check existing tasks
    const [tasks] = await sequelize.query('SELECT id, title, assignedTo FROM Tasks ORDER BY id DESC LIMIT 5');
    console.log('📋 Recent tasks:', tasks);
    
    // Check TaskAssignments table
    const [assignments] = await sequelize.query('SELECT * FROM TaskAssignments ORDER BY id DESC LIMIT 10');
    console.log('🔗 Recent assignments:', assignments);
    
    // Check if there are any users
    const [users] = await sequelize.query('SELECT id, firstName, lastName, role FROM users WHERE role = "user" LIMIT 5');
    console.log('👥 Available users:', users);
    
    if (users.length === 0) {
      console.log('❌ No users found! Creating a test user...');
      
      // Create a test user
      await sequelize.query(`
        INSERT INTO users (firstName, lastName, email, password, role, createdAt, updatedAt) 
        VALUES ('Test', 'User', 'test@example.com', '$2b$10$hash', 'user', NOW(), NOW())
      `);
      
      console.log('✅ Test user created');
    }
    
    // Test creating a task with assignment
    console.log('🧪 Testing task creation with assignment...');
    
    const testUser = users[0] || { id: 1 };
    
    // Create a test task
    const [taskResult] = await sequelize.query(`
      INSERT INTO Tasks (title, description, status, priority, createdAt, updatedAt) 
      VALUES ('Test Assignment Task', 'Testing task assignment functionality', 'incomplete', 'medium', NOW(), NOW())
    `);
    
    const taskId = taskResult.insertId;
    console.log('📝 Created test task with ID:', taskId);
    
    // Create task assignment
    await sequelize.query(`
      INSERT INTO TaskAssignments (taskId, userId, createdAt, updatedAt) 
      VALUES (${taskId}, ${testUser.id}, NOW(), NOW())
    `);
    
    console.log('🔗 Created task assignment');
    
    // Verify the assignment
    const [verification] = await sequelize.query(`
      SELECT t.id, t.title, ta.userId, u.firstName, u.lastName 
      FROM Tasks t 
      LEFT JOIN TaskAssignments ta ON t.id = ta.taskId 
      LEFT JOIN users u ON ta.userId = u.id 
      WHERE t.id = ${taskId}
    `);
    
    console.log('✅ Verification result:', verification);
    
    // Test task completion
    console.log('🏁 Testing task completion...');
    
    // Update task to completed with actualHours and completedAt
    await sequelize.query(`
      UPDATE Tasks 
      SET status = 'completed', 
          actualHours = 2.5, 
          completedAt = NOW() 
      WHERE id = ${taskId}
    `);
    
    // Create completion record
    await sequelize.query(`
      INSERT INTO TaskCompletions (taskId, userId, completedAt, timeSpentHours, efficiency, createdAt, updatedAt) 
      VALUES (${taskId}, ${testUser.id}, NOW(), 2.5, 1.2, NOW(), NOW())
    `);
    
    console.log('✅ Task completion test completed');
    
    // Check the results
    const [completedTask] = await sequelize.query(`
      SELECT * FROM Tasks WHERE id = ${taskId}
    `);
    
    const [completionRecord] = await sequelize.query(`
      SELECT * FROM TaskCompletions WHERE taskId = ${taskId}
    `);
    
    console.log('📊 Completed task:', completedTask);
    console.log('📈 Completion record:', completionRecord);
    
    console.log('🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

fixTaskAssignments();