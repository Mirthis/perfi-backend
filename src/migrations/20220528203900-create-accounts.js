module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('accounts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      itemId: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'items',
          },
          key: 'id',
        },
        allowNull: false,
      },
      plaidAccountId: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      officialName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      subType: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      mask: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      currentBalance: {
        type: Sequelize.DECIMAL,
        allowNull: true,
      },
      availableBalance: {
        type: Sequelize.DECIMAL,
        allowNull: true,
      },
      isoCurrencyCode: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      unofficialCurrencyCode: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable('accounts');
  },
};
