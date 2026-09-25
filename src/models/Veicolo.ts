import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Veicolo extends Model {
  public targa!: string;
  public tipoVeicoloId!: number;
  public proprietarioId!: number;
  public inWhiteList!: boolean;
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
