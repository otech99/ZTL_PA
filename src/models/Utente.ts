import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

// utente del sistema: operatore, dispositivo varco, automobilista o admin
class Utente extends Model {
  declare id: number;
  declare email: string;
  declare passwordHash: string; // hash bcrypt, la password in chiaro non viene mai salvata
  declare ruolo: 'operatore' | 'varco' | 'automobilista' | 'admin';
  declare credito: number; // token disponibili per le richieste autenticate
  declare varcoId: number | null; // solo per ruolo=varco: il varco fisico che il dispositivo rappresenta
}

Utente.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ruolo: {
      type: DataTypes.ENUM('operatore', 'varco', 'automobilista', 'admin'),
      allowNull: false,
    },
    credito: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0 },
      // postgres restituisce i DECIMAL come stringhe, qui li riportiamo a numero
      get() {
        return Number(this.getDataValue('credito'));
      },
    },
    varcoId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Utente',
    tableName: 'utenti',
  }
);

export default Utente;
