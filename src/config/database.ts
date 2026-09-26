import { Sequelize } from 'sequelize';
import { env } from './env';

// connessione unica condivisa da tutta l'app
const sequelize = new Sequelize(env.db.nome, env.db.utente, env.db.password, {
  host: env.db.host,
  port: env.db.porta,
  dialect: 'postgres',
  logging: false,
});

export default sequelize;
