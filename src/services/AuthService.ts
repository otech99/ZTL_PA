import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { Utente } from '../models';
import { IAuthService, JwtPayload, isRuolo } from '../interfaces/IAuthService';
import { UnauthorizedError } from '../errors/AppError';

const SALT_ROUNDS = 10;

export class AuthService implements IAuthService {
  constructor(
    private readonly privateKey: string,
    private readonly publicKey: string,
    private readonly expiresIn: SignOptions['expiresIn'],
  ) {}

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

  verificaToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, this.publicKey, { algorithms: ['RS256'] });

      if (typeof decoded === 'string' || typeof decoded.id !== 'number' || !isRuolo(decoded.ruolo)) {
        throw new UnauthorizedError('Token non valido');
      }

      return { id: decoded.id, ruolo: decoded.ruolo };
    } catch {
      throw new UnauthorizedError('Token non valido o scaduto');
    }
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }
}
