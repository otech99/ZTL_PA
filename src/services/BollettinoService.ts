import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { Infrazione, Transito, Varco, Veicolo, ZTL } from '../models';
import { BollettinoPdf, IBollettinoService } from '../interfaces/IBollettinoService';
import { JwtPayload } from '../interfaces/IAuthService';
import { NotFoundError } from '../errors/AppError';
import { formattaDataOraRoma } from '../utils/calendario';

// stesso messaggio per bollettino inesistente e bollettino di un altro utente: non si rivela nulla dei dati altrui
const NON_TROVATO = 'Bollettino non trovato';

// dati da stampare nel bollettino
interface DatiBollettino {
  idBollettino: string;
  targa: string;
  importo: string;
  dataOra: string;
  luogo: string;
  qrCode: Buffer;
}

// generazione del bollettino di pagamento in PDF, con QR-code
export class BollettinoService implements IBollettinoService {
  // cerca la multa del bollettino, controlla che l'utente possa vederla e genera il PDF
  async genera(idBollettino: string, utente: JwtPayload): Promise<BollettinoPdf> {
    const transito = await Transito.findOne({
      include: [
        { model: Infrazione, as: 'multa', required: true, where: { idBollettino } },
        { model: Veicolo, as: 'veicolo', attributes: ['proprietarioId'] },
        {
          model: Varco,
          as: 'varco',
          attributes: ['posizione'],
          include: [{ model: ZTL, as: 'ztl', attributes: ['nome'] }],
        },
      ],
    });

    if (!transito || !transito.multa) {
      throw new NotFoundError(NON_TROVATO);
    }

    // l'operatore vede tutti i bollettini, l'automobilista solo quelli dei propri veicoli
    if (utente.ruolo === 'automobilista' && transito.veicolo?.proprietarioId !== utente.id) {
      throw new NotFoundError(NON_TROVATO);
    }

    const multa = transito.multa;
    const importo = multa.importo.toFixed(2);

    // stringa richiesta dalla traccia: <uuid pagamento>|<multa id>|<targa>|<importo>
    const qrCode = await QRCode.toBuffer(`${multa.uuidPagamento}|${multa.id}|${transito.veicoloTarga}|${importo}`, {
      width: 200,
    });

    const contenuto = await this.creaPdf({
      idBollettino,
      targa: transito.veicoloTarga,
      importo,
      dataOra: formattaDataOraRoma(transito.dataOra),
      luogo: `${transito.varco?.posizione ?? ''} (ZTL ${transito.varco?.ztl?.nome ?? ''})`,
      qrCode,
    });

    return { nomeFile: `bollettino-${idBollettino}.pdf`, contenuto };
  }

  // costruisce il PDF interamente in memoria: se la generazione fallisce, al client non è ancora
  // arrivato nulla, e il middleware del credito non addebita un download mai completato
  private creaPdf(dati: DatiBollettino): Promise<Buffer> {
    const documento = new PDFDocument({ size: 'A4', margin: 50 });
    const parti: Buffer[] = [];

    const completato = new Promise<Buffer>((resolve, reject) => {
      documento.on('data', (parte: Buffer) => parti.push(parte));
      documento.on('end', () => resolve(Buffer.concat(parti)));
      documento.on('error', reject);
    });

    documento.fontSize(20).text('Bollettino di pagamento', { align: 'center' });
    documento.moveDown(2);

    documento.fontSize(12);
    documento.text(`Codice bollettino: ${dati.idBollettino}`);
    documento.moveDown(0.5);
    documento.text(`Targa: ${dati.targa}`);
    documento.text(`Importo: € ${dati.importo}`);
    documento.moveDown(0.5);
    documento.text(`Passaggio del ${dati.dataOra}`);
    documento.text(`Varco: ${dati.luogo}`);
    documento.moveDown(2);

    documento.image(dati.qrCode, { fit: [200, 200], align: 'center' });

    documento.end();
    return completato;
  }
}
