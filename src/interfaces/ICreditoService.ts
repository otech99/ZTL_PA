export interface ICreditoService {
  verificaCredito(utenteId: number, costo: number): Promise<void>;
  addebita(utenteId: number, costo: number): Promise<boolean>;
  ricarica(email: string, importo: number): Promise<{ email: string; credito: number }>;
}
