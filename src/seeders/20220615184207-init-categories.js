const data = require('./data/categories.json');

const categories = data.map((d) => ({
  ...d,
  userId: -1,
  createdAt: new Date(),
  updatedAt: new Date(),
}));

module.exports = {
  async up(queryInterface) {
    return queryInterface.bulkInsert('categories', categories);
  },

  async down(queryInterface) {
    return queryInterface.bulkDelete('categories', null, {});
  },
};
