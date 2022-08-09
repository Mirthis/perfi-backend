"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrUpdateItem = exports.updateItemTransactionsCursor = exports.updateItem = exports.createItem = exports.getItem = exports.getItemByPlaidItemId = void 0;
/* eslint-disable import/no-cycle */
/* eslint-disable @typescript-eslint/indent */
/* eslint-disable no-param-reassign */
const sequelize_1 = require("sequelize");
const db_1 = require("../utils/db");
const institution_1 = __importDefault(require("./institution"));
// TODO: Sync validation with front-end
class Item extends sequelize_1.Model {
}
Item.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    accessToken: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    plaidItemId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    transactionCursor: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    lastSynced: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    consentExpirationTime: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    createdAt: sequelize_1.DataTypes.DATE,
    updatedAt: sequelize_1.DataTypes.DATE,
}, {
    sequelize: db_1.sequelize,
    tableName: 'items',
    modelName: 'item',
});
const getItemByPlaidItemId = async (plaidItemId) => {
    const item = await Item.findOne({
        where: { plaidItemId },
    });
    return item;
};
exports.getItemByPlaidItemId = getItemByPlaidItemId;
const getItem = async (userId, itemId) => {
    const item = await Item.findOne({
        where: { userId, id: itemId },
    });
    return item;
};
exports.getItem = getItem;
const createItem = async (itemData, access_token, userId) => {
    let institutionId = null;
    if (itemData.institution_id) {
        const inst = await institution_1.default.findOne({
            where: { plaidInstitutionId: itemData.institution_id },
            attributes: ['id'],
        });
        if (inst)
            institutionId = inst.id;
    }
    const newItem = await Item.create({
        accessToken: access_token,
        plaidItemId: itemData.item_id,
        userId,
        institutionId,
        status: 'good',
        consentExpirationTime: itemData.consent_expiration_time,
    });
    return newItem;
};
exports.createItem = createItem;
// TODO: check on refreshing status and expiration
const updateItem = async (item, itemData, access_token) => {
    const updItem = await item.update({
        accessToken: access_token,
        consentExpirationTime: itemData.consent_expiration_time,
    });
    return updItem;
};
exports.updateItem = updateItem;
const updateItemTransactionsCursor = async (plaidItemId, transactionsCursor) => {
    const item = await (0, exports.getItemByPlaidItemId)(plaidItemId);
    item?.set('transactionCursor', transactionsCursor);
    item?.set('lastSynced', new Date());
    item?.save();
};
exports.updateItemTransactionsCursor = updateItemTransactionsCursor;
const createOrUpdateItem = async (itemData, access_token, userId) => {
    const item = await Item.findOne({
        where: { plaidItemId: itemData.item_id },
    });
    if (item) {
        return (0, exports.updateItem)(item, itemData, access_token);
    }
    return (0, exports.createItem)(itemData, access_token, userId);
};
exports.createOrUpdateItem = createOrUpdateItem;
exports.default = Item;
