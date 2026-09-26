import dotenv from 'dotenv';
import { SignOptions } from 'jsonwebtoken';

dotenv.config();

// legge una variabile obbligatoria, ferma l'avvio se manca
function richiesta(nome: string): string {
  const valore = process.env[nome];
  if (!valore) {
    throw new Error(`Variabile d'ambiente mancante: ${nome}`);
  }
  return valore;
}

// nel .env le chiavi sono su una riga sola, con \n al posto degli a capo
function chiave(nome: string): string {
  return richiesta(nome).replace(/\\n/g, '\n');
}

export const env = {
  porta: Number(process.env.PORT ?? 3000),
  db: {
    host: richiesta('DB_HOST'),
    porta: Number(richiesta('DB_PORT')),
    nome: richiesta('DB_NAME'),
    utente: richiesta('DB_USER'),
    password: richiesta('DB_PASSWORD'),
  },
  jwt: {
    chiavePrivata: chiave('JWT_PRIVATE_KEY'),
    chiavePubblica: chiave('JWT_PUBLIC_KEY'),
    scadenza: richiesta('JWT_EXPIRES_IN') as SignOptions['expiresIn'],
  },
};
