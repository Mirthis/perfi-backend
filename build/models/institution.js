"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrUpdateInstitution = void 0;
/* eslint-disable import/no-cycle */
/* eslint-disable @typescript-eslint/indent */
/* eslint-disable no-param-reassign */
const sequelize_1 = require("sequelize");
const db_1 = require("../utils/db");
// TODO: Sync validation with front-end
class Institution extends sequelize_1.Model {
}
Institution.init({
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: sequelize_1.DataTypes.INTEGER,
    },
    plaidInstitutionId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    color: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    logo: {
        get() {
            // TODO: solve ts-ignore
            // @ts-ignore
            return this.getDataValue('logo').toString('base64');
        },
        set(value) {
            // @ts-ignore
            this.setDataValue('logo', Buffer.from(value, 'base64'));
        },
        type: sequelize_1.DataTypes.BLOB('tiny'),
        allowNull: true,
    },
    url: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
    },
}, {
    sequelize: db_1.sequelize,
    tableName: 'institutions',
    modelName: 'institution',
});
const createOrUpdateInstitution = async (institutionData) => {
    const values = {
        name: institutionData.name,
        color: institutionData.primary_color,
        logo: institutionData.logo || null,
        url: institutionData.url,
        plaidInstitutionId: institutionData.institution_id,
    };
    const [institution] = await Institution.upsert(values);
    return institution;
};
exports.createOrUpdateInstitution = createOrUpdateInstitution;
exports.default = Institution;
