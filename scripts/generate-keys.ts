import { generateKeyPairSync } from 'crypto';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const RADICE = resolve(__dirname, '..');
const FILE_ENV = resolve(RADICE, '.env');
const FILE_ESEMPIO = resolve(RADICE, '.env.example');

// Legge il .env esistente oppure parte dal template .env.example
function leggiEnv(): string {
  if (existsSync(FILE_ENV)) {
    return readFileSync(FILE_ENV, 'utf8');
  }
  if (!existsSync(FILE_ESEMPIO)) {
    throw new Error('File .env.example non trovato');
  }
  console.log('.env non presente, lo creo a partire da .env.example');
  return readFileSync(FILE_ESEMPIO, 'utf8');
}

// Porta la chiave PEM su una sola riga, con \n scritti come testo
function inUnaRiga(chiave: string): string {
  return `"${chiave.replace(/\r?\n/g, '\\n')}"`;
}

// Sostituisce la riga della variabile, oppure la aggiunge in fondo se manca
function impostaVariabile(contenuto: string, nome: string, valore: string): string {
  const riga = `${nome}=${valore}`;
  const regex = new RegExp(`^${nome}=.*$`, 'm');
  if (regex.test(contenuto)) {
    return contenuto.replace(regex, () => riga);
  }
  const separatore = contenuto.endsWith('\n') || contenuto === '' ? '' : '\n';
  return `${contenuto}${separatore}${riga}\n`;
}

// Genera la coppia RSA 2048 per RS256 e la salva nel .env
function generaChiavi(): void {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });

  let contenuto = leggiEnv().replace(/\r\n/g, '\n');
  contenuto = impostaVariabile(contenuto, 'JWT_PRIVATE_KEY', inUnaRiga(privateKey));
  contenuto = impostaVariabile(contenuto, 'JWT_PUBLIC_KEY', inUnaRiga(publicKey));

  writeFileSync(FILE_ENV, contenuto);
  console.log('Chiavi RS256 generate e salvate nel file .env');
}

generaChiavi();
