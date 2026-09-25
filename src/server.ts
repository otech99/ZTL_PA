import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { sequelize } from './models';

const PORT = Number(process.env.PORT) || 3000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Connessione al database riuscita');

    await sequelize.sync();
    console.log('Modelli sincronizzati con il database');

    app.listen(PORT, () => {
      console.log(`Server in ascolto sulla porta ${PORT}`);
    });
  } catch (error) {
    console.error('Errore in fase di avvio:', error);
    process.exit(1);
  }
}

start();
