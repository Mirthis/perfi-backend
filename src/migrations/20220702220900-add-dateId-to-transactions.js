module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('transactions', 'calendarId', {
      type: Sequelize.INTEGER,
      references: {
        model: {
          tableName: 'calendar',
        },
        key: 'id',
      },
      allowNull: false,
      defaultValue: 20220101,
    });

    await queryInterface.sequelize.query(`
    UPDATE transactions 
    SET "calendarId" = (extract('year' from "txDate")*10000+extract('month' from "txDate")*100+extract('day' from "txDate"));`);
  },

  async down(queryInterface) {
    return queryInterface.removeColumn('transactions', 'calendarId');
  },
};
