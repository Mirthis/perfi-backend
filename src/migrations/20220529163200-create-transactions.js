module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('transactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      pladiTransactionId: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      accountId: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'accounts',
          },
          key: 'id',
        },
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      amount: {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      transactionDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      pending: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      pladiCategoryId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      category: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      subCategory: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      paymentChannel: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      address: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      city: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      country: {
        type: Sequelize.STRING,
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
      merchantName: {
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
    await queryInterface.dropTable('transactions');
  },
};
