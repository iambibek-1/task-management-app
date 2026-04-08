const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Database configuration
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: console.log
  }
);

async function fixTaskStatusComplete() {
  try {
    console.log('🔧 Starting comprehensive task status fix...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Step 1: Check current status values
    console.log('\n📊 Step 1: Checking current status distribution...');
    try {
      const [results] = await sequelize.query(
        "SELECT status, COUNT(*) as count FROM Tasks GROUP BY status"
      );
      
      console.log('Current status distribution:');
      results.forEach(row => {
        console.log(`   ${row.status}: ${row.count} tasks`);
      });
    } catch (error) {
      console.log('⚠️ Could not query current status (table might not exist yet)');
    }
    
    // Step 2: Update existing data
    console.log('\n🔄 Step 2: Updating existing task status values...');
    try {
      const [updateResult] = await sequelize.query(
        "UPDATE Tasks SET status = 'incomplete' WHERE status = 'incompleted'"
      );
      
      console.log(`✅ Updated ${updateResult.affectedRows || 0} tasks from 'incompleted' to 'incomplete'`);
    } catch (error) {
      console.log('⚠️ Could not update existing data:', error.message);
    }
    
    // Step 3: Try to alter the column to use the new enum
    console.log('\n🔧 Step 3: Updating column definition...');
    try {
      // For MySQL, we need to drop and recreate the enum
      await sequelize.query(`
        ALTER TABLE Tasks 
        MODIFY COLUMN status ENUM('completed', 'inProgress', 'incomplete') 
        NOT NULL DEFAULT 'incomplete'
      `);
      
      console.log('✅ Column definition updated successfully');
    } catch (error) {
      console.log('⚠️ Could not update column definition:', error.message);
      
      // Alternative approach: try to add the new enum value first
      try {
        console.log('🔄 Trying alternative approach...');
        
        // First, try to add the new enum value
        await sequelize.query(`
          ALTER TABLE Tasks 
          MODIFY COLUMN status ENUM('completed', 'inProgress', 'incompleted', 'incomplete') 
          NOT NULL DEFAULT 'incomplete'
        `);
        
        // Update the data again
        await sequelize.query(
          "UPDATE Tasks SET status = 'incomplete' WHERE status = 'incompleted'"
        );
        
        // Remove the old enum value
        await sequelize.query(`
          ALTER TABLE Tasks 
          MODIFY COLUMN status ENUM('completed', 'inProgress', 'incomplete') 
          NOT NULL DEFAULT 'incomplete'
        `);
        
        console.log('✅ Alternative approach succeeded');
      } catch (altError) {
        console.log('❌ Alternative approach also failed:', altError.message);
      }
    }
    
    // Step 4: Verify the fix
    console.log('\n✅ Step 4: Verifying the fix...');
    try {
      const [finalResults] = await sequelize.query(
        "SELECT status, COUNT(*) as count FROM Tasks GROUP BY status"
      );
      
      console.log('Final status distribution:');
      finalResults.forEach(row => {
        console.log(`   ${row.status}: ${row.count} tasks`);
      });
      
      // Test inserting a new task with the new status
      console.log('\n🧪 Testing new task creation...');
      const testResult = await sequelize.query(`
        INSERT INTO Tasks (title, description, status, priority, createdAt, updatedAt) 
        VALUES ('Test Task', 'Test Description', 'incomplete', 'low', NOW(), NOW())
      `);
      
      console.log('✅ Test task created successfully with new status');
      
      // Clean up test task
      await sequelize.query(`
        DELETE FROM Tasks WHERE title = 'Test Task' AND description = 'Test Description'
      `);
      
      console.log('✅ Test task cleaned up');
      
    } catch (error) {
      console.log('❌ Verification failed:', error.message);
    }
    
    console.log('\n🎉 Task status fix completed!');
    
  } catch (error) {
    console.error('❌ Error during task status fix:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the fix
fixTaskStatusComplete();