module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('transactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      plaidTransactionId: {
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
      txDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      txDatetime: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      pending: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      plaidCategoryId: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'plaid_categories',
          },
          key: 'id',
        },
        allowNull: false,
      },
      categoryId: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'categories',
          },
          key: 'id',
        },
        allowNull: false,
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
  async down(queryInterface) {
    await queryInterface.dropTable('transactions');
  },
};
