const { exec } = require('child_process');
const path = require('path');

// Change to the backend directory
process.chdir(path.join(__dirname, '../..'));

console.log('🚀 Running database migration...');

// Run the migration
exec('npx sequelize-cli db:migrate', (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Migration failed:', error);
    return;
  }
  
  if (stderr) {
    console.error('⚠️ Migration warnings:', stderr);
  }
  
  console.log('✅ Migration output:', stdout);
  console.log('🎉 Migration completed successfully!');
});