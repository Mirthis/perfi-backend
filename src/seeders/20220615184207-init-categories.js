const data = require('./data/categories.json');

const categories = data.map((d) => ({
  userId: -1,
  name: d.name,
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
