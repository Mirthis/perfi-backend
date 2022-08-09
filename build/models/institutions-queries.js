"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isExistingInstitution = exports.getInstitutionByPlaidId = void 0;
const institution_1 = __importDefault(require("./institution"));
const item_1 = __importDefault(require("./item"));
const getInstitutionByPlaidId = async (userId, plaidInstitutionId) => {
    const institution = await institution_1.default.findOne({
        where: { plaidInstitutionId },
        include: { model: item_1.default, where: { userId } },
    });
    return institution;
};
exports.getInstitutionByPlaidId = getInstitutionByPlaidId;
const isExistingInstitution = async (userId, plaidInstitutionId) => {
    const institution = await (0, exports.getInstitutionByPlaidId)(userId, plaidInstitutionId);
    return institution !== null;
};
exports.isExistingInstitution = isExistingInstitution;
