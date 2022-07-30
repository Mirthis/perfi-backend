import { CountryCode, Products } from 'plaid';

require('dotenv').config();

// General configuration
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
if (!process.env.SESSION_SECRET) {
  console.log('SESSION_SECRET environment variable is required');
  process.exit(1);
}

const PLAID_ENV = process.env.PLAID_ENV || 'sandbox';

const { SESSION_SECRET } = process.env;

// Database confiruation
let DATABASE_URI;

switch (NODE_ENV) {
  case 'development':
    if (PLAID_ENV === 'sandbox') {
      DATABASE_URI = process.env.SANDBOX_DATABASE_URI;
    } else {
      DATABASE_URI = process.env.DEV_DATABASE_URI;
    }
    break;
  case 'prod':
    DATABASE_URI = process.env.DEV_DATABASE_URI;
    break;
  case 'test':
    DATABASE_URI = process.env.TEST_DATABASE_URI;
    break;
  default:
    DATABASE_URI = '';
    break;
}

console.log(DATABASE_URI);

if (!DATABASE_URI) {
  throw Error(`${DATABASE_URI} need to be defined`);
}

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
