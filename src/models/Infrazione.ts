import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

// multa generata automaticamente da un transito in un orario in cui il varco è attivo
class Infrazione extends Model {
  declare id: number;
  declare transitoId: number;
  declare importo: number;
  declare uuidPagamento: string; // identificativo del pagamento riportato nel QR-code del bollettino
  declare dataCreazione: Date;
}

Infrazione.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    // unique: un transito genera al massimo una multa
    transitoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    importo: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0 },
      // postgres restituisce i DECIMAL come stringhe, qui li riportiamo a numero
      get() {
        return Number(this.getDataValue('importo'));
      },
    },
    // generato automaticamente alla creazione della multa
    uuidPagamento: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },
    dataCreazione: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Infrazione',
    tableName: 'infrazioni',
  }
);

export default Infrazione;
