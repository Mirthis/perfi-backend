module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('plaid_categories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
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
      code: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      name_lvl1: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      name_lvl2: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      name_lvl3: {
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
    await queryInterface.dropTable('plaid_categories');
  },
};
