import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class TipoVeicolo extends Model {
  public id!: number;
  public nome!: string;
  public tariffaBase!: number;
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
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'TipoVeicolo',
    tableName: 'tipi_veicolo',
  }
);

export default TipoVeicolo;
