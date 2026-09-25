import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Transito extends Model {
  public id!: number;
  public veicoloTarga!: string;
  public varcoId!: number;
  public dataOra!: Date;
  public tipo!: 'ingresso' | 'uscita';
}

Transito.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    veicoloTarga: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    varcoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    dataOra: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    tipo: {
      type: DataTypes.ENUM('ingresso', 'uscita'),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Transito',
    tableName: 'transiti',
  }
);

export default Transito;
