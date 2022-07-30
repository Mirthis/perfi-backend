/* eslint-disable import/no-cycle */
import User from './user';
import Session from './session';
import Item from './item';
import Institution from './institution';
import Account from './account';
import Transaction from './transaction';
import PlaidCategory from './plaidCategory';
import Category from './category';
import Calendar from './calendar';
import AuthToken from './authToken';

User.hasMany(Item);
Item.belongsTo(User);

Institution.hasMany(Item);
Item.belongsTo(Institution);

Account.belongsTo(Item);
Item.hasMany(Account);

Account.hasMany(Transaction);
Transaction.belongsTo(Account);

PlaidCategory.hasMany(Transaction);
Transaction.belongsTo(PlaidCategory);

Category.hasMany(Transaction);
Transaction.belongsTo(Category);

Category.hasMany(Transaction, { foreignKey: 'ogCategoryId' });

Category.hasMany(PlaidCategory);
PlaidCategory.belongsTo(Category);

User.hasMany(Category);
Category.belongsTo(User);

Calendar.hasMany(Transaction);
Transaction.belongsTo(Calendar);

Calendar.hasMany(Transaction);
Transaction.belongsTo(Calendar);

User.hasMany(AuthToken);
AuthToken.belongsTo(User);

// CategoryExclusion.belongsTo(Category);
// CategoryExclusion.belongsTo(User);

export {
  User,
  Session,
  Item,
  Institution,
  Account,
  Transaction,
  Category,
  PlaidCategory,
  Calendar,
};
