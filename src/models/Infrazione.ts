import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Infrazione extends Model {
  declare id: number;
  declare transitoId: number;
  declare importo: number;
  declare uuidPagamento: string;
  declare dataCreazione: Date;
}

Infrazione.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    transitoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    importo: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    uuidPagamento: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },
    dataCreazione: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Infrazione',
    tableName: 'infrazioni',
  }
);

export default Infrazione;
