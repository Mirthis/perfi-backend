// const categories = require('./categories.json');
const data = require('./data/plaid_categories.json');

module.exports = {
  async up(queryInterface) {
    const categories = (
      await queryInterface.sequelize.query(`SELECT id, name from categories;`)
    )[0];
    const categoriesMapping = categories.reduce(
      (prev, curr) => ({ ...prev, [curr.name]: curr.id }),
      {},
    );
    console.log(categoriesMapping);

    const plaidCategories = data.map((d) => {
      const categoryId = categoriesMapping[d.perficategory];

      if (!categoryId) {
        console.log(d);
      }
      return {
        code: d.plaidcategoryid,
        categoryId,
        name_lvl1: d.plaidcategory,
        name_lvl2: d.plaidsubcategory,
        name_lvl3: d.plaidsubcategory2,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

    plaidCategories.push({
      code: '0',
      categoryId: categoriesMapping.Misc,
      name_lvl1: null,
      name_lvl2: null,
      name_lvl3: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await queryInterface.sequelize.query(
      `UPDATE plaid_categories SET id = -1 WHERE code='0';`,
    );

    return queryInterface.bulkInsert('plaid_categories', plaidCategories);
  },

  async down(queryInterface) {
    return queryInterface.bulkDelete('plaid_categories', null, {});
  },
};
