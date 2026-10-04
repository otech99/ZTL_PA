// strategia di calcolo dell'importo della multa (pattern Strategy): ogni implementazione
// applica una regola diversa agli stessi dati, e il service sceglie quale usare in base al giorno
export interface TariffaStrategy {
  // calcola l'importo dalla tariffa base del tipo di veicolo e dalla maggiorazione della fascia oraria
  calcola(tariffaBase: number, maggiorazione: number): number;
}
