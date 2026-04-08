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

async function fixTaskStatus() {
  try {
    console.log('🔧 Fixing task status values...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Check current status values
    const [results] = await sequelize.query(
      "SELECT status, COUNT(*) as count FROM Tasks GROUP BY status"
    );
    
    console.log('📊 Current status distribution:');
    results.forEach(row => {
      console.log(`   ${row.status}: ${row.count} tasks`);
    });
    
    // Update 'incompleted' to 'incomplete'
    const [updateResult] = await sequelize.query(
      "UPDATE Tasks SET status = 'incomplete' WHERE status = 'incompleted'"
    );
    
    console.log(`✅ Updated ${updateResult.affectedRows || 0} tasks from 'incompleted' to 'incomplete'`);
    
    // Check updated status values
    const [updatedResults] = await sequelize.query(
      "SELECT status, COUNT(*) as count FROM Tasks GROUP BY status"
    );
    
    console.log('📊 Updated status distribution:');
    updatedResults.forEach(row => {
      console.log(`   ${row.status}: ${row.count} tasks`);
    });
    
    console.log('🎉 Task status fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing task status:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the fix
fixTaskStatus();