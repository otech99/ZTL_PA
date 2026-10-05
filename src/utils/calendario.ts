// tutte le valutazioni su giorni e orari avvengono nel fuso di Roma, non in UTC
const FUSO_ORARIO = 'Europe/Rome';

const GIORNI: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };

export const DOMENICA = 7;

// data e ora di un istante, espresse nel fuso di Roma
export interface DataLocale {
  anno: number;
  mese: number;
  giorno: number;
  giornoSettimana: number; // 1 = lunedì ... 7 = domenica
  ora: string; // HH:MM
  chiaveGiorno: string; // AAAA-MM-GG, per confrontare due istanti della stessa giornata
}

// hourCycle h23: la mezzanotte è 00, non 24
const formato = new Intl.DateTimeFormat('en-GB', {
  timeZone: FUSO_ORARIO,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

// converte un istante nella data e ora di Roma, tenendo conto dell'ora legale
export function dataLocaleRoma(data: Date): DataLocale {
  const parti: Record<string, string> = {};
  for (const parte of formato.formatToParts(data)) {
    parti[parte.type] = parte.value;
  }

  return {
    anno: Number(parti.year),
    mese: Number(parti.month),
    giorno: Number(parti.day),
    giornoSettimana: GIORNI[parti.weekday],
    ora: `${parti.hour}:${parti.minute}`,
    chiaveGiorno: `${parti.year}-${parti.month}-${parti.day}`,
  };
}

// data e ora in formato italiano nel fuso di Roma, es. 01/10/2026, 08:30
export function formattaDataOraRoma(data: Date): string {
  return data.toLocaleString('it-IT', {
    timeZone: FUSO_ORARIO,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
