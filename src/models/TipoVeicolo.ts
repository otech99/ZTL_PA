import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

// categoria di veicolo (es. auto, moto), da cui dipende la tariffa base della multa
class TipoVeicolo extends Model {
  declare id: number;
  declare nome: string;
  declare tariffaBase: number;
}

TipoVeicolo.init(
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
    tariffaBase: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0 },
      // postgres restituisce i DECIMAL come stringhe, qui li riportiamo a numero
      get() {
        return Number(this.getDataValue('tariffaBase'));
      },
    },
  },
  {
    sequelize,
    modelName: 'TipoVeicolo',
    tableName: 'tipi_veicolo',
  }
);

export default TipoVeicolo;
