import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Utente extends Model {
  declare id: number;
  declare email: string;
  declare passwordHash: string;
  declare ruolo: 'operatore' | 'varco' | 'automobilista' | 'admin';
  declare credito: number;
  declare varcoId: number | null; // solo per ruolo=varco
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
