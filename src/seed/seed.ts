import { sequelize, Utente, Festivita, ZTL, Varco, FasciaOraria } from '../models';
import { authService } from '../container';

async function seed() {
  // ricrea tutte le tabelle da zero
  await sequelize.sync({ force: true });

  const ztl = await ZTL.create({ nome: 'Centro Storico', citta: 'Ancona' });
  const varco = await Varco.create({ posizione: 'Piazza Cavour', ztlId: ztl.id });

  // lunedì-venerdì 7:30-19:30, sabato 10:00-14:00, domenica e festivi non attiva
  await FasciaOraria.bulkCreate([
    ...[1, 2, 3, 4, 5].map((giornoSettimana) => ({
      varcoId: varco.id,
      giornoSettimana,
      oraInizio: '07:30',
      oraFine: '19:30',
      maggiorazione: 1,
    })),
    { varcoId: varco.id, giornoSettimana: 6, oraInizio: '10:00', oraFine: '14:00', maggiorazione: 1 },
  ]);

  const passwordHash = await authService.hashPassword('password123');

  await Utente.bulkCreate([
    { email: 'operatore@ztl.it', passwordHash, ruolo: 'operatore', credito: 10 },
    // il dispositivo del varco è collegato al varco fisico che rappresenta
    { email: 'varco@ztl.it', passwordHash, ruolo: 'varco', credito: 10, varcoId: varco.id },
    { email: 'automobilista@ztl.it', passwordHash, ruolo: 'automobilista', credito: 10 },
    { email: 'admin@ztl.it', passwordHash, ruolo: 'admin', credito: 100 },
  ]);

  await Festivita.bulkCreate([
    { giorno: 1, mese: 1, descrizione: 'Capodanno' },
    { giorno: 6, mese: 1, descrizione: 'Epifania' },
    { giorno: 25, mese: 4, descrizione: 'Festa della Liberazione' },
    { giorno: 1, mese: 5, descrizione: 'Festa del Lavoro' },
    { giorno: 2, mese: 6, descrizione: 'Festa della Repubblica' },
    { giorno: 15, mese: 8, descrizione: 'Ferragosto' },
    { giorno: 1, mese: 11, descrizione: 'Ognissanti' },
    { giorno: 8, mese: 12, descrizione: 'Immacolata Concezione' },
    { giorno: 25, mese: 12, descrizione: 'Natale' },
    { giorno: 26, mese: 12, descrizione: 'Santo Stefano' },
  ]);

  console.log('Seed completato');
  await sequelize.close();
}

seed().catch((err) => {
  console.error('Errore durante il seed:', err);
  process.exit(1);
});
