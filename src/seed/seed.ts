import { sequelize, Utente } from '../models';
import { authService } from '../container';

async function seed() {
  // ricrea tutte le tabelle da zero
  await sequelize.sync({ force: true });

  const passwordHash = await authService.hashPassword('password123');

  await Utente.bulkCreate([
    { email: 'operatore@ztl.it', passwordHash, ruolo: 'operatore', credito: 10 },
    { email: 'varco@ztl.it', passwordHash, ruolo: 'varco', credito: 10 },
    { email: 'automobilista@ztl.it', passwordHash, ruolo: 'automobilista', credito: 10 },
    { email: 'admin@ztl.it', passwordHash, ruolo: 'admin', credito: 100 },
  ]);

  console.log('Seed completato');
  await sequelize.close();
}

seed().catch((err) => {
  console.error('Errore durante il seed:', err);
  process.exit(1);
});
