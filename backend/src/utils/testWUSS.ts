import Models from "../models";
import { UserRecommendationService } from "../services/userRecommendationService";

/**
 * Test script to verify WUSS algorithm is working correctly
 * This creates some test completion data and then tests recommendations
 */
export async function testWUSSAlgorithm() {
  console.log('🧪 Testing WUSS Algorithm...');
  
  try {
    // Get some users
    const users = await Models.User.findAll({
      where: { role: 'user' },
      limit: 3
    });
    
    if (users.length < 2) {
      console.log('❌ Need at least 2 users to test WUSS algorithm');
      return;
    }
    
    console.log(`📊 Found ${users.length} users for testing`);
    
    // Create some test task completions to simulate different performance levels
    const testTask1 = await Models.Task.create({
      title: 'Test Task 1 - Database Integration',
      description: 'Implement database integration with complex queries and optimization',
      status: 'completed' as any,
      priority: 'high' as any
    });
    
    const testTask2 = await Models.Task.create({
      title: 'Test Task 2 - Simple UI Update',
      description: 'Update button colors and text',
      status: 'completed' as any,
      priority: 'low' as any
    });
    
    // Create task assignments manually
    await Models.TaskAssignment.create({
      taskId: testTask1.id,
      userId: users[0].id
    });
    
    await Models.TaskAssignment.create({
      taskId: testTask2.id,
      userId: users[1].id
    });
    
    // Create completion records with different efficiency levels
    // User 1: High performer (efficiency > 1.0)
    await Models.TaskCompletion.create({
      taskId: testTask1.id,
      userId: users[0].id,
      completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      timeSpentHours: 6,
      efficiency: 1.5, // Completed faster than expected
      notes: 'Completed efficiently with good quality'
    });
    
    // User 2: Lower performer (efficiency < 1.0)
    await Models.TaskCompletion.create({
      taskId: testTask2.id,
      userId: users[1].id,
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      timeSpentHours: 4,
      efficiency: 0.6, // Took longer than expected
      notes: 'Took longer due to some issues'
    });
    
    console.log('✅ Created test completion data');
    
    // Now test the WUSS algorithm
    const userRecommendationService = new UserRecommendationService();
    const recommendations = await userRecommendationService.calculateUserSuitabilityScores({
      title: 'New Complex Database Task',
      description: 'Implement advanced database features with API integration and complex algorithms',
      priority: 'high'
    });
    
    console.log('\n🎯 WUSS Algorithm Results:');
    console.log('='.repeat(50));
    
    recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec.user.firstName} ${rec.user.lastName}`);
      console.log(`   Score: ${rec.score}% (${rec.recommendation})`);
      console.log(`   Performance: ${rec.factors.performanceScore}`);
      console.log(`   Workload: ${rec.factors.workloadScore}`);
      console.log(`   Availability: ${rec.factors.availabilityScore}`);
      console.log(`   Skill Match: ${rec.factors.skillMatchScore}`);
      console.log(`   Priority Handling: ${rec.factors.priorityHandlingScore}`);
      console.log(`   Reason: ${rec.reasonText}`);
      console.log('');
    });
    
    // Cleanup test data
    await Models.TaskCompletion.destroy({
      where: {
        taskId: { [require('sequelize').Op.in]: [testTask1.id, testTask2.id] }
      }
    });
    
    await Models.TaskAssignment.destroy({
      where: {
        taskId: { [require('sequelize').Op.in]: [testTask1.id, testTask2.id] }
      }
    });
    
    await testTask1.destroy();
    await testTask2.destroy();
    
    console.log('🧹 Cleaned up test data');
    console.log('✅ WUSS Algorithm test completed!');
    
  } catch (error) {
    console.error('❌ Error testing WUSS algorithm:', error);
  }
}