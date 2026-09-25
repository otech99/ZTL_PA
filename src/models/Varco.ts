import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Varco extends Model {
  public id!: number;
  public posizione!: string;
  public ztlId!: number;
}

Varco.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    posizione: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ztlId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Varco',
    tableName: 'varchi',
  }
);

export default Varco;