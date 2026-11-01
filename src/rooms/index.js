import SalaPrecolombina from './SalaPrecolombina/SalaPrecolombina';
import SalaColonia from './SalaColonia/SalaColonia';
import SalaIndependencia from './SalaIndependencia/SalaIndependencia';
import SalaRepublica from './SalaRepublica/SalaRepublica';

/**
 * Registro de salas: relaciona el id de `data/rooms.js` con su componente 3D.
 * Para agregar una sala: crear su carpeta, registrarla aquí y en data/rooms.js.
 */
export const ROOM_COMPONENTS = {
  'sala-precolombina': SalaPrecolombina,
  'sala-colonia': SalaColonia,
  'sala-independencia': SalaIndependencia,
  'sala-republica': SalaRepublica,
};
