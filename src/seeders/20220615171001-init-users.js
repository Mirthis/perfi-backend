module.exports = {
  async up(queryInterface) {
    return queryInterface.bulkInsert('users', [
      {
        id: -1,
        email: 'dummy@perfi.com',
        password:
          '|3ce30$fjFas4N8sxX2iyC/M73HYOXUiowAVe^NO01adLQAQzUssVQO9sjJS',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    return queryInterface.bulkDelete('users', { id: -1 }, {});
  },
};
