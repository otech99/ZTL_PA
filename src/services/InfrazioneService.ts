import { Op, Transaction } from 'sequelize';
import { FasciaOraria, Festivita, Infrazione, TipoVeicolo, Transito, Varco, Veicolo, ZTL } from '../models';
import { IInfrazioneService, MultaAutomobilista } from '../interfaces/IInfrazioneService';
import { TariffaStrategy } from '../strategies/TariffaStrategy';
import { DataLocale, DOMENICA, dataLocaleRoma } from '../utils/calendario';

// finestra di ricerca dei transiti della stessa giornata: abbondante, il confronto vero avviene sul giorno di Roma
const FINESTRA_STESSA_GIORNATA_MS = 36 * 60 * 60 * 1000;

// valutazione e creazione delle multe (solo all'atto dell'inserimento di un transito) e loro consultazione
export class InfrazioneService implements IInfrazioneService {
  // riceve le due strategie della tariffa, create nel container
  constructor(
    private readonly tariffaFeriale: TariffaStrategy,
    private readonly tariffaFestiva: TariffaStrategy,
  ) {}

  // genera una multa se: è un ingresso, il veicolo non è in white list, il passaggio cade in una
  // fascia attiva del varco e il veicolo non ha già una multa su quel varco nella stessa giornata
  async valutaTransito(transito: Transito, veicolo: Veicolo, transaction: Transaction): Promise<Infrazione | null> {
    if (transito.tipo !== 'ingresso' || veicolo.inWhiteList) {
      return null;
    }

    const locale = dataLocaleRoma(transito.dataOra);
    const festivo = await this.isFestivo(locale, transaction);

    // nei festivi valgono gli orari della domenica; inizio incluso, fine esclusa
    const fascia = await FasciaOraria.findOne({
      where: {
        varcoId: transito.varcoId,
        giornoSettimana: festivo ? DOMENICA : locale.giornoSettimana,
        oraInizio: { [Op.lte]: locale.ora },
        oraFine: { [Op.gt]: locale.ora },
      },
      transaction,
    });
    if (!fascia) {
      return null;
    }

    if (await this.multaGiaEmessa(transito, locale.chiaveGiorno, transaction)) {
      return null;
    }

    const tipo = await TipoVeicolo.findByPk(veicolo.tipoVeicoloId, { transaction });
    if (!tipo) {
      throw new Error(`Tipo di veicolo ${veicolo.tipoVeicoloId} non trovato`);
    }

    // il service sceglie la strategia, poi la usa senza sapere quale sia
    const strategia = festivo ? this.tariffaFestiva : this.tariffaFeriale;
    const importo = this.arrotondaAlCentesimo(strategia.calcola(tipo.tariffaBase, fascia.maggiorazione));

    return Infrazione.create({ transitoId: transito.id, importo }, { transaction });
  }

  // multe dei veicoli dell'utente, partendo dai transiti che le hanno generate, dalla più recente
  async multeDelProprietario(proprietarioId: number): Promise<MultaAutomobilista[]> {
    const transiti = await Transito.findAll({
      include: [
        { model: Infrazione, as: 'multa', required: true, attributes: ['id', 'idBollettino', 'importo'] },
        { model: Veicolo, as: 'veicolo', required: true, attributes: [], where: { proprietarioId } },
        {
          model: Varco,
          as: 'varco',
          attributes: ['posizione'],
          include: [{ model: ZTL, as: 'ztl', attributes: ['nome'] }],
        },
      ],
      order: [['dataOra', 'DESC']],
    });

    // solo i campi pensati per l'automobilista, senza dati tecnici o di altri utenti
    return transiti.flatMap((transito) =>
      transito.multa
        ? [
            {
              id: transito.multa.id,
              idBollettino: transito.multa.idBollettino,
              importo: transito.multa.importo,
              targa: transito.veicoloTarga,
              dataOra: transito.dataOra,
              varco: transito.varco?.posizione ?? '',
              ztl: transito.varco?.ztl?.nome ?? '',
            },
          ]
        : [],
    );
  }

  // festivo = domenica oppure festività nazionale presente nella tabella
  private async isFestivo(locale: DataLocale, transaction: Transaction): Promise<boolean> {
    if (locale.giornoSettimana === DOMENICA) {
      return true;
    }
    const festivita = await Festivita.count({ where: { giorno: locale.giorno, mese: locale.mese }, transaction });
    return festivita > 0;
  }

  // indica se il veicolo ha già una multa sullo stesso varco nella stessa giornata (di Roma)
  private async multaGiaEmessa(transito: Transito, chiaveGiorno: string, transaction: Transaction): Promise<boolean> {
    const istante = transito.dataOra.getTime();

    const transitiConMulta = await Transito.findAll({
      where: {
        veicoloTarga: transito.veicoloTarga,
        varcoId: transito.varcoId,
        id: { [Op.ne]: transito.id },
        dataOra: {
          [Op.between]: [new Date(istante - FINESTRA_STESSA_GIORNATA_MS), new Date(istante + FINESTRA_STESSA_GIORNATA_MS)],
        },
      },
      include: [{ model: Infrazione, as: 'multa', required: true, attributes: ['id'] }],
      transaction,
    });

    return transitiConMulta.some((altro) => dataLocaleRoma(altro.dataOra).chiaveGiorno === chiaveGiorno);
  }

  // evita risultati come 88.00000000000001 dovuti ai calcoli con i decimali
  private arrotondaAlCentesimo(valore: number): number {
    return Math.round(valore * 100) / 100;
  }
}
