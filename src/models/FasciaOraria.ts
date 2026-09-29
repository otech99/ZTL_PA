import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class FasciaOraria extends Model {
  declare id: number;
  declare varcoId: number;
  declare giornoSettimana: number; // 1 = lunedì ... 7 = domenica (vale anche per i festivi)
  declare oraInizio: string;
  declare oraFine: string;
  declare maggiorazione: number;
}

FasciaOraria.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    varcoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    giornoSettimana: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 7 },
    },
    oraInizio: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    oraFine: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    maggiorazione: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: false,
      defaultValue: 1,
      validate: { min: 0.01 },
      // postgres restituisce i DECIMAL come stringhe, qui li riportiamo a numero
      get() {
        return Number(this.getDataValue('maggiorazione'));
      },
    },
  },
  {
    sequelize,
    modelName: 'FasciaOraria',
    tableName: 'fasce_orarie',
  }
);

export default FasciaOraria;
