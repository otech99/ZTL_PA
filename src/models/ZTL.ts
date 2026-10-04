import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

// zona a traffico limitato di una città, a cui appartengono uno o più varchi
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
    // nella stessa città non possono esistere due ZTL con lo stesso nome
    indexes: [{ unique: true, fields: ['nome', 'citta'] }],
  }
);

export default ZTL;
