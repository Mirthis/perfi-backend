module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('transactions', 'ogCategoryId', {
      type: Sequelize.INTEGER,
      references: {
        model: {
          tableName: 'categories',
        },
        key: 'id',
      },
      allowNull: false,
    });
  },

  async down(queryInterface) {
    return queryInterface.removeColumn('transactions', 'ogCategoryId');
  },
};
