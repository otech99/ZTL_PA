import { TariffaStrategy } from './TariffaStrategy';

// tariffa dei giorni feriali: tariffa base per la maggiorazione della fascia
export class TariffaFerialeStrategy implements TariffaStrategy {
  // importo = tariffa base × maggiorazione
  calcola(tariffaBase: number, maggiorazione: number): number {
    return tariffaBase * maggiorazione;
  }
}
