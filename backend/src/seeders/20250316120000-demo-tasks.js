'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Get the first user ID to assign tasks
    const users = await queryInterface.sequelize.query(
      'SELECT id FROM users LIMIT 1;',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const userId = users.length > 0 ? users[0].id : null;

    // Add demo tasks with future due dates
    await queryInterface.bulkInsert('Tasks', [
      {
        title: 'Complete project documentation',
        description: 'Write comprehensive API documentation for the task management system',
        status: 'inProgress',
        priority: 'high',
        assignedTo: userId,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      },
      {
        title: 'Review pull requests',
        description: 'Review and merge pending pull requests from team members',
        status: 'incompleted',
        priority: 'medium',
        assignedTo: userId,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      },
      {
        title: 'Team meeting preparation',
        description: 'Prepare slides and agenda for weekly team meeting',
        status: 'incompleted',
        priority: 'low',
        assignedTo: userId,
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
      },
      {
        title: 'Bug fixes',
        description: 'Fix critical bugs reported in production environment',
        status: 'inProgress',
        priority: 'high',
        assignedTo: userId,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      },
      {
        title: 'Code refactoring',
        description: 'Refactor authentication module for better maintainability',
        status: 'incompleted',
        priority: 'medium',
        assignedTo: userId,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      },
      {
        title: 'Database optimization',
        description: 'Optimize database queries and add proper indexes',
        status: 'incompleted',
        priority: 'medium',
        assignedTo: userId,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      },
      {
        title: 'Security audit',
        description: 'Perform security audit and fix vulnerabilities',
        status: 'incompleted',
        priority: 'high',
        assignedTo: userId,
        dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
      },
      {
        title: 'UI improvements',
        description: 'Implement user feedback for UI enhancements',
        status: 'incompleted',
        priority: 'low',
        assignedTo: userId,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Tasks', null, {});
  }
};
