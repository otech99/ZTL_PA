import sequelize from '../config/database';
import Utente from './Utente';
import ZTL from './ZTL';
import Varco from './Varco';
import FasciaOraria from './FasciaOraria';
import TipoVeicolo from './TipoVeicolo';
import Veicolo from './Veicolo';
import Transito from './Transito';
import Infrazione from './Infrazione';

ZTL.hasMany(Varco, { foreignKey: 'ztlId' });
Varco.belongsTo(ZTL, { foreignKey: 'ztlId' });

Varco.hasMany(FasciaOraria, { foreignKey: 'varcoId' });
FasciaOraria.belongsTo(Varco, { foreignKey: 'varcoId' });

TipoVeicolo.hasMany(Veicolo, { foreignKey: 'tipoVeicoloId' });
Veicolo.belongsTo(TipoVeicolo, { foreignKey: 'tipoVeicoloId' });

Utente.hasMany(Veicolo, { foreignKey: 'proprietarioId', as: 'veicoli' });
Veicolo.belongsTo(Utente, { foreignKey: 'proprietarioId', as: 'proprietario' });

Veicolo.hasMany(Transito, { foreignKey: 'veicoloTarga', sourceKey: 'targa' });
Transito.belongsTo(Veicolo, { foreignKey: 'veicoloTarga', targetKey: 'targa' });

Varco.hasMany(Transito, { foreignKey: 'varcoId' });
Transito.belongsTo(Varco, { foreignKey: 'varcoId' });

Transito.hasOne(Infrazione, { foreignKey: 'transitoId' });
Infrazione.belongsTo(Transito, { foreignKey: 'transitoId' });

Varco.hasOne(Utente, { foreignKey: 'varcoId', as: 'utenteVarco' });
Utente.belongsTo(Varco, { foreignKey: 'varcoId', as: 'varco' });

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
};
