'use client';

import { sileo } from 'sileo';

/**
 * Envoltura fina sobre sileo.
 *
 * Existe por dos motivos: fijar en un solo punto la duracion y la posicion por
 * defecto, y exponer una API en espanol que no obligue a cada pantalla a
 * importar la libreria y a repetir el objeto de opciones.
 *
 * Los avisos de EXITO y de ERROR DE PERSISTENCIA se emiten aqui. Los errores
 * de validacion de formulario NO deben pasar por aqui: se muestran junto al
 * campo, donde el usuario esta mirando, y un toast obliga a mover la atencion
 * hacia la esquina de la pantalla.
 */

const DURACION = 4500;

/** Normaliza lo que devuelve un catch a un mensaje presentable. */
export function mensajeDeError(error: unknown, porDefecto: string): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string' && error.trim()) return error;
  return porDefecto;
}

export const notificar = {
  exito: (titulo: string, descripcion?: string) =>
    sileo.success({ title: titulo, description: descripcion, duration: DURACION }),

  error: (titulo: string, descripcion?: string) =>
    sileo.error({ title: titulo, description: descripcion, duration: DURACION }),

  aviso: (titulo: string, descripcion?: string) =>
    sileo.warning({ title: titulo, description: descripcion, duration: DURACION }),

  info: (titulo: string, descripcion?: string) =>
    sileo.info({ title: titulo, description: descripcion, duration: DURACION }),

  /**
   * Para errores de servidor cuyo texto ya viene listo desde la API: muestra el
   * mensaje real como descripcion y un titulo generico como encabezado.
   */
  fallo: (titulo: string, detalle?: string, porDefecto = 'Ocurrio un error inesperado.') =>
    sileo.error({ title: titulo, description: detalle || porDefecto, duration: DURACION }),
};
