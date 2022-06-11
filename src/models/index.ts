import User from './user';
import Session from './session';
import Item from './item';
import Institution from './institution';
import Account from './account';
import Transaction from './transaction';

User.hasMany(Item);
Item.belongsTo(User);

Institution.hasMany(Item);
Item.belongsTo(Institution);

Account.belongsTo(Item);
Item.hasMany(Account);

Account.hasMany(Transaction);
Transaction.belongsTo(Account);

export { User, Session, Item, Institution };
