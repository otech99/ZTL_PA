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

// RESTRICT: il database rifiuta l'eliminazione se esistono righe collegate,
// così lo storico di transiti e multe non può essere cancellato a cascata

ZTL.hasMany(Varco, { foreignKey: 'ztlId', onDelete: 'RESTRICT' });
Varco.belongsTo(ZTL, { foreignKey: 'ztlId', onDelete: 'RESTRICT' });

// le fasce sono solo configurazione del varco: si eliminano con lui
Varco.hasMany(FasciaOraria, { foreignKey: 'varcoId', as: 'fasce', onDelete: 'CASCADE' });
FasciaOraria.belongsTo(Varco, { foreignKey: 'varcoId', onDelete: 'CASCADE' });

TipoVeicolo.hasMany(Veicolo, { foreignKey: 'tipoVeicoloId', onDelete: 'RESTRICT' });
Veicolo.belongsTo(TipoVeicolo, { foreignKey: 'tipoVeicoloId', onDelete: 'RESTRICT' });

Utente.hasMany(Veicolo, { foreignKey: 'proprietarioId', as: 'veicoli', onDelete: 'RESTRICT' });
Veicolo.belongsTo(Utente, { foreignKey: 'proprietarioId', as: 'proprietario', onDelete: 'RESTRICT' });

// targa (non id) è la PK di Veicolo, va specificato esplicitamente
Veicolo.hasMany(Transito, { foreignKey: 'veicoloTarga', sourceKey: 'targa', onDelete: 'RESTRICT' });
Transito.belongsTo(Veicolo, { foreignKey: 'veicoloTarga', targetKey: 'targa', onDelete: 'RESTRICT' });

Varco.hasMany(Transito, { foreignKey: 'varcoId', onDelete: 'RESTRICT' });
Transito.belongsTo(Varco, { foreignKey: 'varcoId', onDelete: 'RESTRICT' });

Transito.hasOne(Infrazione, { foreignKey: 'transitoId', onDelete: 'RESTRICT' });
Infrazione.belongsTo(Transito, { foreignKey: 'transitoId', onDelete: 'RESTRICT' });

// utente con ruolo=varco collegato al varco fisico; se il varco sparisce il collegamento si azzera
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
