require('dotenv').config();

const {
  DEV_DATABASE_URI,
  SANDBOX_DATABASE_URI,
  TEST_DATABASE_URI,
  PROD_DATABASE_URI,
  PLAID_ENV,
} = process.env;
const dialect = 'postgres';
const migrationStorageTableName = 'migrations';

module.exports = {
  development: {
    url: PLAID_ENV === 'sandbox' ? SANDBOX_DATABASE_URI : DEV_DATABASE_URI,
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
