module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('items', 'lastSynced', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('items', 'lastSynced');
  },
};
