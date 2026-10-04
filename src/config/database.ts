import { Sequelize } from 'sequelize';
import { env } from './env';

// connessione unica al database, condivisa da tutta l'applicazione (pattern Singleton):
// viene creata al primo import e ogni altro import riceve la stessa istanza
const sequelize = new Sequelize(env.db.nome, env.db.utente, env.db.password, {
  host: env.db.host,
  port: env.db.porta,
  dialect: 'postgres',
  logging: false,
});

export default sequelize;
