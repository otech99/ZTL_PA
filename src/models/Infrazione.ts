import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Infrazione extends Model {
  public id!: number;
  public transitoId!: number;
  public importo!: number;
  public uuidPagamento!: string;
  public dataCreazione!: Date;
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
