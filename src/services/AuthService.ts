import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { Utente } from '../models';
import { IAuthService, JwtPayload, isRuolo } from '../interfaces/IAuthService';
import { UnauthorizedError } from '../errors/AppError';

const SALT_ROUNDS = 10;

// autenticazione con password cifrate bcrypt e token JWT firmati RS256
export class AuthService implements IAuthService {
  // riceve le chiavi e la durata del token, lette dal .env nel container
  constructor(
    private readonly privateKey: string,
    private readonly publicKey: string,
    private readonly expiresIn: SignOptions['expiresIn'],
  ) {}

  // verifica email e password e restituisce un token firmato con la chiave privata
  async login(email: string, password: string): Promise<string> {
    const utente = await Utente.findOne({ where: { email } });

    // stesso messaggio per email o password errata, non si rivela quale dei due è sbagliato
    if (!utente) {
      throw new UnauthorizedError('Credenziali non valide');
    }

    const passwordCorretta = await bcrypt.compare(password, utente.passwordHash);
    if (!passwordCorretta) {
      throw new UnauthorizedError('Credenziali non valide');
    }

    const payload: JwtPayload = { id: utente.id, ruolo: utente.ruolo };

    return jwt.sign(payload, this.privateKey, {
      algorithm: 'RS256',
      expiresIn: this.expiresIn,
    });
  }

  // verifica il token con la chiave pubblica, accettando solo RS256, e ne restituisce il contenuto
  verificaToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, this.publicKey, { algorithms: ['RS256'] });

      if (typeof decoded === 'string' || typeof decoded.id !== 'number' || !isRuolo(decoded.ruolo)) {
        throw new UnauthorizedError('Token non valido');
      }

      return { id: decoded.id, ruolo: decoded.ruolo };
    } catch {
      // gli errori della libreria (firma errata, token scaduto) diventano un 401
      throw new UnauthorizedError('Token non valido o scaduto');
    }
  }

  // calcola l'hash bcrypt della password, con salt casuale
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }
}
