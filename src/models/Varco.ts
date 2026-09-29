import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Varco extends Model {
  declare id: number;
  declare posizione: string;
  declare ztlId: number;
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
    // nella stessa ZTL non possono esistere due varchi nella stessa posizione
    indexes: [{ unique: true, fields: ['ztlId', 'posizione'] }],
  }
);

export default Varco;
