import sequelize from '../config/database';
import Utente from './Utente';
import ZTL from './ZTL';
import Varco from './Varco';
import FasciaOraria from './FasciaOraria';
import TipoVeicolo from './TipoVeicolo';
import Veicolo from './Veicolo';
import Transito from './Transito';
import Infrazione from './Infrazione';
import Festivita from './Festivita';

// relazioni tra le tabelle. RESTRICT: il database rifiuta l'eliminazione se esistono
// righe collegate, così lo storico di transiti e multe non può essere cancellato a cascata

// una ZTL ha più varchi
ZTL.hasMany(Varco, { foreignKey: 'ztlId', onDelete: 'RESTRICT' });
Varco.belongsTo(ZTL, { foreignKey: 'ztlId', as: 'ztl', onDelete: 'RESTRICT' });

// un varco ha più fasce orarie; sono solo configurazione del varco, quindi si eliminano con lui
Varco.hasMany(FasciaOraria, { foreignKey: 'varcoId', as: 'fasce', onDelete: 'CASCADE' });
FasciaOraria.belongsTo(Varco, { foreignKey: 'varcoId', onDelete: 'CASCADE' });

// un tipo di veicolo raggruppa più veicoli
TipoVeicolo.hasMany(Veicolo, { foreignKey: 'tipoVeicoloId', onDelete: 'RESTRICT' });
Veicolo.belongsTo(TipoVeicolo, { foreignKey: 'tipoVeicoloId', onDelete: 'RESTRICT' });

// un utente possiede più veicoli
Utente.hasMany(Veicolo, { foreignKey: 'proprietarioId', as: 'veicoli', onDelete: 'RESTRICT' });
Veicolo.belongsTo(Utente, { foreignKey: 'proprietarioId', as: 'proprietario', onDelete: 'RESTRICT' });

// un veicolo ha più transiti; targa (non id) è la chiave primaria di Veicolo, va indicata esplicitamente
Veicolo.hasMany(Transito, { foreignKey: 'veicoloTarga', sourceKey: 'targa', onDelete: 'RESTRICT' });
Transito.belongsTo(Veicolo, { foreignKey: 'veicoloTarga', targetKey: 'targa', as: 'veicolo', onDelete: 'RESTRICT' });

// un varco registra più transiti
Varco.hasMany(Transito, { foreignKey: 'varcoId', onDelete: 'RESTRICT' });
Transito.belongsTo(Varco, { foreignKey: 'varcoId', as: 'varco', onDelete: 'RESTRICT' });

// un transito genera al massimo una multa
Transito.hasOne(Infrazione, { foreignKey: 'transitoId', as: 'multa', onDelete: 'RESTRICT' });
Infrazione.belongsTo(Transito, { foreignKey: 'transitoId', onDelete: 'RESTRICT' });

// l'utente con ruolo=varco è collegato al varco fisico; se il varco viene eliminato il collegamento si azzera
Varco.hasOne(Utente, { foreignKey: 'varcoId', as: 'utenteVarco', onDelete: 'SET NULL' });
Utente.belongsTo(Varco, { foreignKey: 'varcoId', as: 'varco', onDelete: 'SET NULL' });

export {
  sequelize,
  Utente,
  ZTL,
  Varco,
  FasciaOraria,
  TipoVeicolo,
  Veicolo,
  Transito,
  Infrazione,
  Festivita,
};
