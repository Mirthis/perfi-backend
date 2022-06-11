module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sessions', {
      sid: {
        type: Sequelize.STRING(36),
        allowNull: false,
        primaryKey: true,
      },
      expires: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      data: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },
  async down(queryInterface, _Sequelize) {
    await queryInterface.dropTable('sessions');
  },
};
