module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('transactions', 'personal_finance_primary', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn(
      'transactions',
      'personal_finance_detailed',
      {
        type: Sequelize.STRING,
        allowNull: true,
      },
    );
  },

  async down(queryInterface) {
    await queryInterface.removeColumn(
      'transactions',
      'personal_finance_primary',
    );
    await queryInterface.removeColumn(
      'transactions',
      'personal_finance_detailed',
    );
  },
};
