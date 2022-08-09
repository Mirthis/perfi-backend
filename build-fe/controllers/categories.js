"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middleware_1 = require("../utils/middleware");
const category_queries_1 = require("../models/category-queries");
const requestParamParser_1 = require("../utils/requestParamParser");
const router = express_1.default.Router();
const toExcludeCategoryReq = ({ exclude, }) => {
    const requestParameters = {
        exclude: (0, requestParamParser_1.parseBoolean)(exclude, 'exclude'),
    };
    return requestParameters;
};
// const toDeleteCategoryReq = ({
//   categoryId,
// }: {
//   categoryId: unknown;
// }): DeleteCategoryReq => {
//   const requestParameters = {
//     categoryId: parseNumber(categoryId, 'categoryId'),
//   };
//   return requestParameters;
// };
const toCreateCategoryReq = ({ name, iconName, iconColor, exclude, }) => {
    const requestParameters = {
        name: (0, requestParamParser_1.parseString)(name, 'categoryId'),
        iconName: (0, requestParamParser_1.parseString)(iconName, 'categoryId'),
        iconColor: (0, requestParamParser_1.parseString)(iconColor, 'categoryId'),
        exclude: (0, requestParamParser_1.parseBoolean)(exclude, 'exclude'),
    };
    return requestParameters;
};
router.get('/', middleware_1.isAuthenticated, async (req, res) => {
    if (!req.user)
        throw Error('Unauthorized');
    const categories = await (0, category_queries_1.getCategories)(req.user.id);
    res.json(categories);
});
router.put('/:categoryId/exclude/', middleware_1.isAuthenticated, async (req, res) => {
    if (!req.user)
        throw Error('Unauthorized');
    const { exclude } = toExcludeCategoryReq(req.body);
    const category = await (0, category_queries_1.setCategoryExcludeFlag)(req.user.id, Number(req.params.categoryId), exclude);
    if (!category) {
        res.status(400).json('category not found');
    }
    else {
        res.json(category);
    }
});
router.post('/create', middleware_1.isAuthenticated, async (req, res) => {
    if (!req.user)
        throw Error('Unauthorized');
    const createCategoryParams = toCreateCategoryReq(req.body);
    const newCategory = await (0, category_queries_1.createCategory)(req.user.id, createCategoryParams);
    res.json(newCategory);
});
router.put('/:categoryId/update', middleware_1.isAuthenticated, async (req, res) => {
    if (!req.user)
        throw Error('Unauthorized');
    const createCategoryParams = toCreateCategoryReq(req.body);
    const newCategory = await (0, category_queries_1.updateCategory)(req.user.id, Number(req.params.categoryId), createCategoryParams);
    if (!newCategory) {
        res.status(400).json('category not found');
    }
    else {
        res.json(newCategory);
    }
});
router.delete('/:categoryId/delete', middleware_1.isAuthenticated, async (req, res) => {
    if (!req.user)
        throw Error('Unauthorized');
    const result = await (0, category_queries_1.deleteCategory)(req.user.id, Number(req.params.categoryId));
    if (!result) {
        res.status(400).json('category not found');
    }
    else {
        res.json();
    }
});
router.get('/userdefined', middleware_1.isAuthenticated, async (req, res) => {
    const categories = await (0, category_queries_1.getUserCategories)(req.user.id);
    res.json(categories);
});
exports.default = router;
