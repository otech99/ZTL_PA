import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

// festività nazionali a data fissa, valide ogni anno
class Festivita extends Model {
  declare id: number;
  declare giorno: number;
  declare mese: number;
  declare descrizione: string;
}

Festivita.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    giorno: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 31 },
    },
    mese: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 12 },
    },
    descrizione: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Festivita',
    tableName: 'festivita',
    indexes: [{ unique: true, fields: ['giorno', 'mese'] }],
  }
);

export default Festivita;
