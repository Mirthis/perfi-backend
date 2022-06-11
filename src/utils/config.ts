import { CountryCode, Products } from 'plaid';

require('dotenv').config();

// General configuration
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
if (!process.env.SESSION_SECRET) {
  console.log('SESSION_SECRET environment variable is required');
  process.exit(1);
}

const { SESSION_SECRET } = process.env;

// Database confiruation
const DATABASE_URI =
  (process.env.NODE_ENV === 'test'
    ? process.env.TEST_DATABASE_URI
    : process.env.DATABASE_URI) || '';

const DB_OPTIONS = {
  dialectOptions: {
    ssl: {
      require: false,
      rejectUnauthorized: false,
    },
  },
};

// Plaid configuration
const { PLAID_CLIENT_ID } = process.env;
const PLAID_ENV = process.env.PLAID_ENV || 'sandbox';
const PLAID_SECRET =
  PLAID_ENV === 'development'
    ? process.env.DEV_PLAID_SECRET
    : process.env.SANDBOX_PLAID_SECRET;
const PLAID_PRODUCTS = (process.env.PLAID_PRODUCTS || 'transactions').split(
  ',',
) as Products[];

const PLAID_COUNTRY_CODES = (process.env.PLAID_COUNTRY_CODES || 'UK').split(
  ',',
) as CountryCode[];

export default {
  PORT,
  NODE_ENV,
  DATABASE_URI,
  PLAID_CLIENT_ID,
  PLAID_SECRET,
  PLAID_ENV,
  PLAID_PRODUCTS,
  PLAID_COUNTRY_CODES,
  DB_OPTIONS,
  SESSION_SECRET,
};
