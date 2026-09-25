import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class FasciaOraria extends Model {
  public id!: number;
  public varcoId!: number;
  public tipoGiorno!: 'feriale' | 'festivo';
  public oraApertura!: string;
  public oraChiusura!: string;
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
    tipoGiorno: {
      type: DataTypes.ENUM('feriale', 'festivo'),
      allowNull: false,
    },
    oraApertura: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    oraChiusura: {
      type: DataTypes.TIME,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'FasciaOraria',
    tableName: 'fasce_orarie',
  }
);

export default FasciaOraria;
