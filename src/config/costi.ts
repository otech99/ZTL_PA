// costo in token di ogni operazione autenticata (RF7)
// la ricarica del credito da parte dell'admin non ha costo e non compare qui
export const COSTI = {
  consultazioneZtl: 0.05,
  creazioneZtl: 0.5,
  modificaZtl: 0.1,
  eliminazioneZtl: 0.1,

  consultazioneVarco: 0.05,
  creazioneVarco: 0.5,
  modificaVarco: 0.1,
  eliminazioneVarco: 0.1,

  inserimentoTransito: 0.1,
  consultazioneTransiti: 0.05,
  modificaTransito: 0.1,
  eliminazioneTransito: 0.1,

  verificaMulte: 0.05,
  downloadBollettino: 0.15,
} as const;
