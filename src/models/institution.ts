/* eslint-disable import/no-cycle */
/* eslint-disable @typescript-eslint/indent */
/* eslint-disable no-param-reassign */
import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  NonAttribute,
} from 'sequelize';
import { Institution as PlaidInstitution } from 'plaid';
import { sequelize } from '../utils/db';
import Item from './item';

// TODO: Sync validation with front-end
class Institution extends Model<
  InferAttributes<Institution>,
  InferCreationAttributes<Institution>
> {
  declare id: CreationOptional<number>;

  declare plaidInstitutionId: string;

  declare name: string;

  declare color: string | null;

  declare logo: string | null;

  declare url: string | null;

  declare item: NonAttribute<Item>;

  declare createdAt: CreationOptional<Date>;

  declare updatedAt: CreationOptional<Date>;
}

Institution.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    plaidInstitutionId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    logo: {
      get(this: Institution): string {
        // TODO: solve ts-ignore
        // @ts-ignore
        return this.getDataValue('logo').toString('base64');
      },
      set(this: Institution, value: string) {
        // @ts-ignore
        this.setDataValue('logo', Buffer.from(value, 'base64'));
      },
      type: DataTypes.BLOB('tiny'),
      allowNull: true,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
    },
    updatedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    tableName: 'institutions',
    modelName: 'institution',
  },
);

export const createOrUpdateInstitution = async (
  institutionData: PlaidInstitution,
) => {
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

export default Institution;
