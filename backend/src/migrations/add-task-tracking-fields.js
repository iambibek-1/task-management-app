'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add new fields to Tasks table
    await queryInterface.addColumn('Tasks', 'estimatedHours', {
      type: Sequelize.FLOAT,
      allowNull: true,
      defaultValue: null,
    });

    await queryInterface.addColumn('Tasks', 'actualHours', {
      type: Sequelize.FLOAT,
      allowNull: true,
      defaultValue: null,
    });

    await queryInterface.addColumn('Tasks', 'startedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('Tasks', 'completedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('Tasks', 'createdAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    });

    await queryInterface.addColumn('Tasks', 'updatedAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    });

    // Create TaskCompletions table
    await queryInterface.createTable('TaskCompletions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      taskId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Tasks',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      completedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      timeSpentHours: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      efficiency: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 1.0,
        comment: 'Ratio of estimated vs actual time (estimated/actual)',
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // Add indexes for better performance
    await queryInterface.addIndex('TaskCompletions', ['taskId']);
    await queryInterface.addIndex('TaskCompletions', ['userId']);
    await queryInterface.addIndex('TaskCompletions', ['completedAt']);
  },

  down: async (queryInterface, Sequelize) => {
    // Drop TaskCompletions table
    await queryInterface.dropTable('TaskCompletions');

    // Remove added columns from Tasks table
    await queryInterface.removeColumn('Tasks', 'estimatedHours');
    await queryInterface.removeColumn('Tasks', 'actualHours');
    await queryInterface.removeColumn('Tasks', 'startedAt');
    await queryInterface.removeColumn('Tasks', 'completedAt');
    await queryInterface.removeColumn('Tasks', 'createdAt');
    await queryInterface.removeColumn('Tasks', 'updatedAt');
  }
};