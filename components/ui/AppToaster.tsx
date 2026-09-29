'use client';

import React from 'react';
import { Toaster, type SileoPosition } from 'sileo';

/**
 * Montor de notificaciones de la aplicacion.
 *
 * Se monta en el layout raiz y no dentro del dashboard a proposito: los avisos
 * de cierre de sesion y de errores de autenticacion ocurren justo cuando el
 * router reemplaza la pantalla, y un montador montado dentro del panel se
 * desmontaria antes de reacharse a verse.
 *
 * `theme` no significa lo que aparenta: en sileo describe la preferencia del
 * sistema y cada valor se mapea al relleno opuesto para mantener el contraste
 * del texto. La aplicacion es de tema claro fijo y no tiene modo oscuro, asi
 * que se fija "light" para obtener el relleno oscuro (#1a1a1a) con texto claro.
 * Ese fondo hace que el aviso destaque sobre las superficies claras y ademas
 * deja sitio a los tonos base por estado, que rinden 4,7:1-8,1:1; las
 * variantes *-text, calibradas sobre blanco, no serian legibles aqui.
 * El color de fondo real y los tonos por estado se ajustan en globals.css.
 */
export interface AppToasterProps {
  position?: SileoPosition;
}

export const AppToaster: React.FC<AppToasterProps> = ({ position = 'bottom-right' }) => (
  <Toaster
    position={position}
    theme="light"
    options={{ duration: 4500, roundness: 12 }}
  />
);
