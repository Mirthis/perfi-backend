const data = require('./data/categories.json');

const categories = data.map((d) => ({
  ...d,
  userId: -1,
  createdAt: new Date(),
  updatedAt: new Date(),
}));

module.exports = {
  async up(queryInterface) {
    categories.map(async (c) => {
      console.log(
        `UPDATE categories SET "iconColor"='${c.iconColor}' WHERE name='${c.name}'`,
      );
      await queryInterface.sequelize.query(
        `UPDATE categories SET "iconColor"='${c.iconColor}' WHERE name='${c.name}'`,
      );
    });
  },

  async down(queryInterface) {
    return queryInterface.bulkDelete('categories', null, {});
  },
};
