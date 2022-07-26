module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('calendar', 'curr_month_start_date', {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });

    await queryInterface.addColumn('calendar', 'curr_month_end_date', {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });

    await queryInterface.addColumn('calendar', 'prev_month_start_date', {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });

    await queryInterface.addColumn('calendar', 'prev_month_end_date', {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });

    await queryInterface.addColumn('calendar', 'curr_year_start_date', {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });

    await queryInterface.addColumn('calendar', 'curr_year_end_date', {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });

    await queryInterface.addColumn('calendar', 'prev_year_start_date', {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });

    await queryInterface.addColumn('calendar', 'prev_year_end_date', {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });

    await queryInterface.sequelize.query(
      "UPDATE calendar SET curr_month_start_date = date_trunc('month', calendar_date)::date",
    );

    await queryInterface.sequelize.query(
      "UPDATE calendar SET curr_month_end_date = (date_trunc('month', calendar_date)+ interval '1 month - 1 day')::date",
    );

    await queryInterface.sequelize.query(
      "UPDATE calendar SET prev_month_start_date = (date_trunc('month', calendar_date)- interval '1 month')::date",
    );

    await queryInterface.sequelize.query(
      "UPDATE calendar SET prev_month_end_date = (date_trunc('month', calendar_date)- interval '1 day')::date",
    );

    await queryInterface.sequelize.query(
      "UPDATE calendar SET curr_year_start_date = date_trunc('year', calendar_date)::date",
    );

    await queryInterface.sequelize.query(
      "UPDATE calendar SET curr_year_end_date = (date_trunc('year', calendar_date) + interval '1 year - 1 day')::date",
    );

    await queryInterface.sequelize.query(
      "UPDATE calendar SET prev_year_start_date = (date_trunc('year', calendar_date) - interval '1 year')::date",
    );

    await queryInterface.sequelize.query(
      "UPDATE calendar SET prev_year_end_date = (date_trunc('year', calendar_date) - interval '1 day')::date",
    );

    await queryInterface.sequelize.query(
      'ALTER TABLE calendar ALTER COLUMN curr_month_start_date SET NOT NULL;',
    );

    await queryInterface.sequelize.query(
      'ALTER TABLE calendar ALTER COLUMN curr_month_end_date SET NOT NULL;',
    );

    await queryInterface.sequelize.query(
      'ALTER TABLE calendar ALTER COLUMN prev_month_start_date SET NOT NULL;',
    );

    await queryInterface.sequelize.query(
      'ALTER TABLE calendar ALTER COLUMN prev_month_end_date SET NOT NULL;',
    );

    await queryInterface.sequelize.query(
      'ALTER TABLE calendar ALTER COLUMN curr_year_start_date SET NOT NULL;',
    );

    await queryInterface.sequelize.query(
      'ALTER TABLE calendar ALTER COLUMN curr_year_end_date SET NOT NULL;',
    );

    await queryInterface.sequelize.query(
      'ALTER TABLE calendar ALTER COLUMN prev_year_start_date SET NOT NULL;',
    );

    await queryInterface.sequelize.query(
      'ALTER TABLE calendar ALTER COLUMN prev_year_end_date SET NOT NULL;',
    );
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('calendar', 'curr_month_start_date');
    await queryInterface.removeColumn('calendar', 'curr_month_end_date');
    await queryInterface.removeColumn('calendar', 'prev_month_start_date');
    await queryInterface.removeColumn('calendar', 'prev_month_start_date');
    await queryInterface.removeColumn('calendar', 'curr_year_start_date');
    await queryInterface.removeColumn('calendar', 'curr_year_start_date');
    await queryInterface.removeColumn('calendar', 'prev_year_start_date');
    await queryInterface.removeColumn('calendar', 'prev_year_start_date');
  },
};
