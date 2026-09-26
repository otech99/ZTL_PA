import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class ZTL extends Model {
  declare id: number;
  declare nome: string;
  declare citta: string;
}

ZTL.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    citta: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'ZTL',
    tableName: 'ztl',
  }
);

export default ZTL;
