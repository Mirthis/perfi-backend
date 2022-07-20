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
      allowNull: true,
    });

    await queryInterface.sequelize.query(
      `UPDATE transactions SET "ogCategoryId" = "categoryId"`,
    );

    await queryInterface.sequelize.query(
      'ALTER TABLE transactions ALTER COLUMN "ogCategoryId" SET NOT NULL;',
    );
  },

  async down(queryInterface) {
    return queryInterface.removeColumn('transactions', 'ogCategoryId');
  },
};
