import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import type Infrazione from './Infrazione';
import type Varco from './Varco';
import type Veicolo from './Veicolo';

// passaggio di un veicolo attraverso un varco, in ingresso o in uscita
class Transito extends Model {
  declare id: number;
  declare veicoloTarga: string;
  declare varcoId: number;
  declare dataOra: Date;
  declare tipo: 'ingresso' | 'uscita';

  // dati collegati, presenti solo quando inclusi nell'interrogazione
  declare multa?: Infrazione | null;
  declare varco?: Varco;
  declare veicolo?: Veicolo;
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
