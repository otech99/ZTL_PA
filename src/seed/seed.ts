import { sequelize, Utente, Festivita, ZTL, Varco, FasciaOraria, TipoVeicolo, Veicolo } from '../models';
import { authService } from '../container';

// ricrea il database da zero e lo popola con i dati iniziali: una ZTL con un varco e i suoi orari,
// un utente per ruolo con il credito iniziale, tipi di veicolo e veicoli, festività nazionali
async function seed() {
  // force: elimina e ricrea tutte le tabelle
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

  const utenti = await Utente.bulkCreate([
    { email: 'operatore@ztl.it', passwordHash, ruolo: 'operatore', credito: 10 },
    // il dispositivo del varco è collegato al varco fisico che rappresenta
    { email: 'varco@ztl.it', passwordHash, ruolo: 'varco', credito: 10, varcoId: varco.id },
    { email: 'automobilista@ztl.it', passwordHash, ruolo: 'automobilista', credito: 10 },
    { email: 'admin@ztl.it', passwordHash, ruolo: 'admin', credito: 100 },
  ]);

  const automobilista = utenti.find((utente) => utente.ruolo === 'automobilista');
  if (!automobilista) {
    throw new Error('Automobilista non creato');
  }

  const [auto, moto, camion] = await TipoVeicolo.bulkCreate([
    { nome: 'auto', tariffaBase: 80 },
    { nome: 'moto', tariffaBase: 50 },
    { nome: 'camion', tariffaBase: 120 },
  ]);

  await Veicolo.bulkCreate([
    { targa: 'AB123CD', tipoVeicoloId: auto.id, proprietarioId: automobilista.id },
    { targa: 'EF456GH', tipoVeicoloId: moto.id, proprietarioId: automobilista.id },
    { targa: 'IL789MN', tipoVeicoloId: camion.id, proprietarioId: automobilista.id },
    // veicolo in white list: i suoi transiti non generano mai multe
    { targa: 'WL000AA', tipoVeicoloId: auto.id, proprietarioId: automobilista.id, inWhiteList: true },
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
