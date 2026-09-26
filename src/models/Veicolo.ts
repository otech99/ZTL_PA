import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Veicolo extends Model {
  declare targa: string;
  declare tipoVeicoloId: number;
  declare proprietarioId: number;
  declare inWhiteList: boolean;
}

Veicolo.init(
  {
    targa: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    tipoVeicoloId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    proprietarioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    inWhiteList: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'Veicolo',
    tableName: 'veicoli',
  }
);

export default Veicolo;
