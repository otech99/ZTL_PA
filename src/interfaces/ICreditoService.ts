// contratto del servizio di gestione del credito, usato dal middleware del credito e dalla ricarica
export interface ICreditoService {
  // lancia 401 se il credito dell'utente non copre il costo dell'operazione
  verificaCredito(utenteId: number, costo: number): Promise<void>;
  // scala il costo dal credito; restituisce false se nel frattempo non era più sufficiente
  addebita(utenteId: number, costo: number): Promise<boolean>;
  // somma l'importo al credito dell'utente indicato e restituisce il nuovo saldo
  ricarica(email: string, importo: number): Promise<{ email: string; credito: number }>;
}
