import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Istanza Sequelize condivisa in tutta l'applicazione (pattern Singleton).
 * Viene creata una sola volta al primo import e riutilizzata ovunque,
 * evitando connessioni multiple non necessarie al database.
 */
const sequelize = new Sequelize(
  process.env.DB_NAME as string,
  process.env.DB_USER as string,
  process.env.DB_PASSWORD as string,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: 'postgres',
    logging: false,
  }
);

export default sequelize;
