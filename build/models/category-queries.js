"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCategory = exports.deleteCategory = exports.setCategoryExcludeFlag = exports.createCategory = exports.getUserCategories = exports.getCategories = exports.getCategory = void 0;
const sequelize_1 = require("sequelize");
const db_1 = require("../utils/db");
const category_1 = __importDefault(require("./category"));
const transaction_1 = __importDefault(require("./transaction"));
const getCategory = async (categoryId) => {
    const category = category_1.default.findOne({ where: { id: categoryId } });
    return category;
};
exports.getCategory = getCategory;
const getCategories = async (userId) => {
    const categories = category_1.default.findAll({
        where: { userId: { [sequelize_1.Op.in]: [userId, -1] } },
        order: ['name'],
    });
    return categories;
};
exports.getCategories = getCategories;
const getUserCategories = async (userId) => {
    const categories = await category_1.default.findAll({
        attributes: [
            'category.id',
            'category.name',
            'iconName',
            'iconColor',
            'category.exclude',
            [db_1.sequelize.fn('count', db_1.sequelize.col('transactions.id')), 'txCount'],
        ],
        where: { userId },
        include: {
            model: transaction_1.default,
            attributes: [],
            required: false,
        },
        group: [
            'category.id',
            'category.name',
            'iconName',
            'iconColor',
            'category.exclude',
        ],
        raw: true,
    });
    return categories;
};
exports.getUserCategories = getUserCategories;
const createCategory = async (userId, categoryData) => {
    const newCategoryData = { ...categoryData, userId };
    const newCategory = await category_1.default.create(newCategoryData);
    return newCategory;
};
exports.createCategory = createCategory;
const setCategoryExcludeFlag = async (userId, categoryId, exclude) => {
    const category = await (0, exports.getCategory)(categoryId);
    if (!category || category.userId !== userId) {
        return null;
    }
    category.exclude = exclude;
    await category.save();
    return category;
};
exports.setCategoryExcludeFlag = setCategoryExcludeFlag;
const deleteCategory = async (userId, categoryId) => {
    const category = await (0, exports.getCategory)(categoryId);
    if (!category || category.userId !== userId) {
        return false;
    }
    await transaction_1.default.update({ categoryId: sequelize_1.Sequelize.literal('"ogCategoryId"') }, { where: { categoryId } });
    await category.destroy();
    return true;
};
exports.deleteCategory = deleteCategory;
const updateCategory = async (userId, categoryId, categoryData) => {
    const category = await (0, exports.getCategory)(categoryId);
    if (!category || category.userId !== userId) {
        return false;
    }
    category.name = categoryData.name;
    category.iconColor = categoryData.iconColor;
    category.iconName = categoryData.iconName;
    category.exclude = categoryData.exclude;
    await category.save();
    return category;
};
exports.updateCategory = updateCategory;
