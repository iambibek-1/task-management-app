'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create TaskAssignments junction table for multiple user assignments
    await queryInterface.createTable('TaskAssignments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      taskId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Tasks',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add unique constraint to prevent duplicate assignments
    await queryInterface.addConstraint('TaskAssignments', {
      fields: ['taskId', 'userId'],
      type: 'unique',
      name: 'unique_task_user_assignment'
    });

    // Keep assignedTo column - don't remove it
    // This allows both single assignment (assignedTo) and multiple assignments (TaskAssignments)
  },

  async down(queryInterface, Sequelize) {
    // Drop the junction table
    await queryInterface.dropTable('TaskAssignments');
  }
};
