import { TariffaStrategy } from './TariffaStrategy';

const COEFFICIENTE_FESTIVO = 1.5;

// tariffa delle domeniche e delle festività nazionali: come la feriale, aumentata del coefficiente festivo
export class TariffaFestivaStrategy implements TariffaStrategy {
  // importo = tariffa base × maggiorazione × coefficiente festivo
  calcola(tariffaBase: number, maggiorazione: number): number {
    return tariffaBase * maggiorazione * COEFFICIENTE_FESTIVO;
  }
}
