module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('calendar', 'prev_12_month_start_date', {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });

    await queryInterface.addColumn('calendar', 'prev_12_month_end_date', {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });

    await queryInterface.sequelize.query(
      "UPDATE calendar SET prev_12_month_start_date = (date_trunc('month', calendar_date)- interval '12 month')::date",
    );

    await queryInterface.sequelize.query(
      "UPDATE calendar SET prev_12_month_end_date = (date_trunc('month', calendar_date)- interval '1 day')::date",
    );

    await queryInterface.sequelize.query(
      'ALTER TABLE calendar ALTER COLUMN prev_12_month_start_date SET NOT NULL;',
    );

    await queryInterface.sequelize.query(
      'ALTER TABLE calendar ALTER COLUMN prev_12_month_end_date SET NOT NULL;',
    );
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('calendar', 'prev_12_month_start_date');
    await queryInterface.removeColumn('calendar', 'prev_12_month_end_date');
  },
};
