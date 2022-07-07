module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('categories', 'exclude', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  async down(queryInterface) {
    return queryInterface.removeColumn('categories', 'exclude');
  },
};
