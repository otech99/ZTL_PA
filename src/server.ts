import app from './app';
import { sequelize } from './models';
import { env } from './config/env';

// avvia il server: connessione al database, creazione delle tabelle mancanti, ascolto sulla porta
async function start() {
  try {
    await sequelize.authenticate();
    console.log('Connessione al database riuscita');

    // crea le tabelle se non esistono, senza modificare quelle già presenti
    await sequelize.sync();
    console.log('Modelli sincronizzati con il database');

    app.listen(env.porta, () => {
      console.log(`Server in ascolto sulla porta ${env.porta}`);
    });
  } catch (error) {
    console.error('Errore in fase di avvio:', error);
    process.exit(1);
  }
}

start();
