import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

// veicolo identificato dalla targa, con il suo proprietario a cui vengono intestate le multe
class Veicolo extends Model {
  declare targa: string;
  declare tipoVeicoloId: number;
  declare proprietarioId: number;
  declare inWhiteList: boolean; // se true il veicolo non viene mai multato
}

Veicolo.init(
  {
    // la targa è già univoca, quindi fa da chiave primaria
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
