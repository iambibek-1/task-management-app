'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if columns exist before adding
    const tableDescription = await queryInterface.describeTable('Tasks');
    
    // Add assignedTo if it doesn't exist
    if (!tableDescription.assignedTo) {
      await queryInterface.addColumn('Tasks', 'assignedTo', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
    }

    // Add dueDate if it doesn't exist
    if (!tableDescription.dueDate) {
      await queryInterface.addColumn('Tasks', 'dueDate', {
        type: Sequelize.DATE,
        allowNull: true
      });
    }

    // Modify description to TEXT if it's still STRING
    if (tableDescription.description && tableDescription.description.type !== 'TEXT') {
      await queryInterface.changeColumn('Tasks', 'description', {
        type: Sequelize.TEXT,
        allowNull: false
      });
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove columns if rolling back
    await queryInterface.removeColumn('Tasks', 'assignedTo');
    await queryInterface.removeColumn('Tasks', 'dueDate');
    
    // Revert description back to STRING
    await queryInterface.changeColumn('Tasks', 'description', {
      type: Sequelize.STRING,
      allowNull: false
    });
  }
};
