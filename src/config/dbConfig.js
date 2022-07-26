require('dotenv').config();

const { DEV_DATABASE_URI, TEST_DATABASE_URI, PROD_DATABASE_URI } = process.env;
const dialect = 'postgres';
const migrationStorageTableName = 'migrations';

module.exports = {
  development: {
    url: DEV_DATABASE_URI,
    dialect,
    migrationStorageTableName,
  },
  test: {
    url: TEST_DATABASE_URI,
    dialect,
    migrationStorageTableName,
  },
  production: {
    url: PROD_DATABASE_URI,
    dialect,
    migrationStorageTableName,
  },
};
