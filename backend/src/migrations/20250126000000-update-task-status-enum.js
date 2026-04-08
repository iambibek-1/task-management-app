'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First, update all existing 'incompleted' values to 'incomplete'
    await queryInterface.sequelize.query(
      "UPDATE Tasks SET status = 'incomplete' WHERE status = 'incompleted'"
    );

    // Drop the old enum type and create a new one
    // Note: This approach works for MySQL. For PostgreSQL, you'd need a different approach.
    await queryInterface.changeColumn('Tasks', 'status', {
      type: Sequelize.ENUM('completed', 'inProgress', 'incomplete'),
      allowNull: false,
      defaultValue: 'incomplete'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert back to the old enum values
    await queryInterface.sequelize.query(
      "UPDATE Tasks SET status = 'incompleted' WHERE status = 'incomplete'"
    );

    await queryInterface.changeColumn('Tasks', 'status', {
      type: Sequelize.ENUM('completed', 'inProgress', 'incompleted'),
      allowNull: false,
      defaultValue: 'incompleted'
    });
  }
};