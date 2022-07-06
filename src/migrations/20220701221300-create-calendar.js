module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('calendar', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      calendar_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        unique: true,
      },
      year: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      month: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      week: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      day: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      week_day: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      week_day_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('calendar');
  },
};
