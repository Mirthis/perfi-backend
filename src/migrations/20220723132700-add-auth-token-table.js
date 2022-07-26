module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      "CREATE TYPE token_type AS ENUM ('verify_email', 'reset_password')",
    );

    await queryInterface.createTable('auth_tokens', {
      token: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(64),
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'users',
          },
          key: 'id',
        },
        allowNull: false,
      },
      type: {
        type: 'token_type',
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      expireAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('auth_tokens');
    await queryInterface.sequelize.query('DROP TYPE token_type');
  },
};
